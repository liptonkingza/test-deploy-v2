const express = require('express');
const multer = require('multer');
const pool = require('../db');
const { legacyTables } = require('../lib/legacy/tableManager');
const { stringify } = require('csv-stringify/sync');
const { parse } = require('csv-parse/sync');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Configure multer for file upload
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// List of all tables that can be imported/exported
const exportableTables = [
  { name: 'users', label: 'Users', tableName: 'users' },
  { name: 'customers', label: 'Customers', tableName: 'customers' },
  { name: 'legacy_customers', label: 'Legacy Customers', tableName: 'legacy_customers' },
  { name: 'legacy_deliveries', label: 'Legacy Deliveries', tableName: 'legacy_deliveries' },
  { name: 'legacy_products', label: 'Legacy Products', tableName: 'legacy_products' },
  { name: 'shipments', label: 'Shipments', tableName: 'shipments' },
  { name: 'media', label: 'Media', tableName: 'media' },
  { name: 'payments', label: 'Payments', tableName: 'payments' },
  { name: 'invoices', label: 'Invoices', tableName: 'invoices' }
];

// Main page
router.get('/', async (req, res) => {
  try {
    // Get table statistics
    const tableStats = [];
    for (const table of exportableTables) {
      try {
        const [rows] = await pool.query(`SELECT COUNT(*) as count FROM \`${table.tableName}\``);
        tableStats.push({
          ...table,
          count: rows[0].count
        });
      } catch (err) {
        tableStats.push({
          ...table,
          count: 0,
          error: err.message
        });
      }
    }

    res.render('dataImportExport/index', {
      title: 'DATA IMPORT,EXPORT',
      tables: tableStats,
      user: req.session.user
    });
  } catch (err) {
    console.error('Data Import/Export page error:', err);
    res.status(500).render('error', { error: err });
  }
});

// Export CSV endpoint
router.get('/export/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    
    // Validate table name
    const table = exportableTables.find(t => t.tableName === tableName);
    if (!table) {
      return res.status(400).json({ error: 'Invalid table name' });
    }

    // Get all data from table
    const [rows] = await pool.query(`SELECT * FROM \`${tableName}\``);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No data found in table' });
    }

    // Convert to CSV
    const csvData = stringify(rows, {
      header: true,
      columns: Object.keys(rows[0])
    });

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${tableName}_${new Date().toISOString().split('T')[0]}.csv"`);
    
    // Add BOM for UTF-8 (helps with Excel)
    res.write('\ufeff');
    res.write(csvData);
    res.end();
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Import CSV endpoint
router.post('/import/:tableName', upload.single('csvFile'), async (req, res) => {
  let uploadedFilePath = null;
  
  try {
    const { tableName } = req.params;
    const { mode } = req.body; // 'append' or 'replace'
    
    // Validate table name
    const table = exportableTables.find(t => t.tableName === tableName);
    if (!table) {
      return res.status(400).json({ error: 'Invalid table name' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    uploadedFilePath = req.file.path;

    // Read and parse CSV file
    // Try to read as UTF-8 first, if fails try other encodings
    let csvContent = '';
    try {
      csvContent = fs.readFileSync(uploadedFilePath, 'utf-8');
    } catch (e) {
      // If UTF-8 fails, try Windows-1252 or TIS-620
      try {
        const iconv = require('iconv-lite');
        const buffer = fs.readFileSync(uploadedFilePath);
        // Try Windows-1252 first (common for Windows exports)
        csvContent = iconv.decode(buffer, 'windows-1252');
      } catch (e2) {
        // If that fails, try TIS-620 (Thai encoding)
        try {
          const iconv = require('iconv-lite');
          const buffer = fs.readFileSync(uploadedFilePath);
          csvContent = iconv.decode(buffer, 'tis-620');
        } catch (e3) {
          // Last resort: read as binary and hope for the best
          csvContent = fs.readFileSync(uploadedFilePath, 'binary');
        }
      }
    }

    // Parse CSV
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true
    });

    if (records.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty or has no valid data' });
    }

    // Get column names from first record
    const columns = Object.keys(records[0]);
    
    // Get table structure to validate columns
    const [tableColumns] = await pool.query(`SHOW COLUMNS FROM \`${tableName}\``);
    const validColumns = tableColumns.map(col => col.Field);
    
    // Filter out invalid columns
    const validDataColumns = columns.filter(col => validColumns.includes(col));
    
    if (validDataColumns.length === 0) {
      return res.status(400).json({ 
        error: 'No valid columns found in CSV',
        csvColumns: columns,
        tableColumns: validColumns
      });
    }

    // Handle replace mode
    if (mode === 'replace') {
      await pool.query(`TRUNCATE TABLE \`${tableName}\``);
    }

    // Prepare insert statement
    const placeholders = validDataColumns.map(() => '?').join(', ');
    const columnNames = validDataColumns.map(col => `\`${col}\``).join(', ');
    const insertSql = `INSERT INTO \`${tableName}\` (${columnNames}) VALUES (${placeholders})`;

    // Insert records in batches
    const batchSize = 100;
    let inserted = 0;
    let errors = [];

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      for (const record of batch) {
        try {
          const values = validDataColumns.map(col => {
            const value = record[col];
            // Handle empty strings as NULL for certain types
            if (value === '' || value === null || value === undefined) {
              return null;
            }
            return value;
          });

          await pool.query(insertSql, values);
          inserted++;
        } catch (err) {
          errors.push({
            row: i + batch.indexOf(record) + 1,
            error: err.message,
            data: record
          });
        }
      }
    }

    // Clean up uploaded file
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }

    res.json({
      success: true,
      message: `Imported ${inserted} records successfully`,
      inserted,
      total: records.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (err) {
    console.error('Import error:', err);
    
    // Clean up uploaded file on error
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      try {
        fs.unlinkSync(uploadedFilePath);
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    res.status(500).json({ 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Get table info endpoint
router.get('/table-info/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    
    // Validate table name
    const table = exportableTables.find(t => t.tableName === tableName);
    if (!table) {
      return res.status(400).json({ error: 'Invalid table name' });
    }

    // Get table structure
    const [columns] = await pool.query(`SHOW COLUMNS FROM \`${tableName}\``);
    const [count] = await pool.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);

    res.json({
      tableName,
      label: table.label,
      columns: columns.map(col => ({
        name: col.Field,
        type: col.Type,
        null: col.Null,
        key: col.Key,
        default: col.Default,
        extra: col.Extra
      })),
      recordCount: count[0].count
    });
  } catch (err) {
    console.error('Table info error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


const express = require('express');
const multer = require('multer');
const pool = require('../db');
const { legacyTables } = require('../lib/legacy/tableManager');
const { stringify } = require('csv-stringify/sync');
const { parse } = require('csv-parse/sync');
const fs = require('fs');
const path = require('path');
const os = require('os');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Created uploads directory');
  } catch (err) {
    console.error('❌ Failed to create uploads directory:', err);
    // Use system temp directory as fallback
    const tempDir = os.tmpdir();
    console.log(`⚠️  Using system temp directory: ${tempDir}`);
  }
}

// Configure multer for file upload
// Use system temp directory on Railway if uploads/ doesn't work
const multerDest = fs.existsSync(uploadsDir) ? uploadsDir : os.tmpdir();

const upload = multer({
  dest: multerDest,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || 
        file.originalname.endsWith('.csv') ||
        file.mimetype === 'application/vnd.ms-excel' ||
        file.mimetype === 'text/plain') {
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

// Multer error handler middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 50MB' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected file field. Please use "csvFile" as the field name.' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message} (code: ${err.code})` });
  }
  if (err) {
    console.error('Multer error:', err);
    return res.status(400).json({ error: err.message || 'File upload error' });
  }
  next();
};

// Import CSV endpoint with proper error handling
router.post('/import/:tableName', 
  // Log request
  (req, res, next) => {
    console.log('📥 Import request received:', {
      tableName: req.params.tableName,
      contentType: req.headers['content-type']
    });
    next();
  },
  // Multer upload middleware
  upload.single('csvFile'),
  // Error handler for multer (must be 4-parameter function)
  (err, req, res, next) => {
    if (err) {
      console.error('❌ Multer error:', err);
      return handleMulterError(err, req, res, next);
    }
    next();
  },
  // Main handler
  async (req, res) => {
  let uploadedFilePath = null;
  
  try {
    const { tableName } = req.params;
    const { mode } = req.body; // 'append' or 'replace'
    
    console.log('📥 Processing import:', { tableName, mode, hasFile: !!req.file, fileName: req.file?.originalname });
    
    // Validate table name
    const table = exportableTables.find(t => t.tableName === tableName);
    if (!table) {
      return res.status(400).json({ error: 'Invalid table name' });
    }

    if (!req.file) {
      console.error('❌ No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    uploadedFilePath = req.file.path;
    console.log('📁 File uploaded to:', uploadedFilePath);
    
    // Verify file exists
    if (!fs.existsSync(uploadedFilePath)) {
      console.error('❌ Uploaded file does not exist:', uploadedFilePath);
      return res.status(500).json({ error: 'Uploaded file not found' });
    }

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
    let records = [];
    try {
      records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
        relax_column_count: true,
        relax_quotes: true
      });
    } catch (parseError) {
      console.error('❌ CSV parse error:', parseError);
      // Clean up uploaded file
      if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
        try {
          fs.unlinkSync(uploadedFilePath);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      return res.status(400).json({ 
        error: 'Failed to parse CSV file',
        details: parseError.message 
      });
    }

    if (records.length === 0) {
      // Clean up uploaded file
      if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
        try {
          fs.unlinkSync(uploadedFilePath);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      return res.status(400).json({ error: 'CSV file is empty or has no valid data' });
    }
    
    console.log(`✅ Parsed ${records.length} records from CSV`);

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
    console.error('❌ Import error:', err);
    console.error('Error stack:', err.stack);
    
    // Clean up uploaded file on error
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      try {
        fs.unlinkSync(uploadedFilePath);
      } catch (e) {
        console.error('Failed to cleanup file:', e);
      }
    }

    // Return detailed error in development, generic in production
    const errorResponse = {
      error: 'Failed to import data',
      message: err.message
    };
    
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = err.stack;
      errorResponse.details = err.toString();
    }

    res.status(500).json(errorResponse);
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



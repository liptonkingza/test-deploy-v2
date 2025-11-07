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
    
    console.log(`📋 CSV columns: ${columns.length}`, columns);
    console.log(`📋 Table columns: ${validColumns.length}`, validColumns);
    
    // Filter out invalid columns
    const validDataColumns = columns.filter(col => validColumns.includes(col));
    
    if (validDataColumns.length < columns.length) {
      const invalidColumns = columns.filter(col => !validColumns.includes(col));
      console.warn(`⚠️  Invalid columns in CSV (will be ignored):`, invalidColumns);
    }
    
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
    // Use INSERT IGNORE to skip duplicate keys instead of failing
    const placeholders = validDataColumns.map(() => '?').join(', ');
    const columnNames = validDataColumns.map(col => `\`${col}\``).join(', ');
    const insertSql = `INSERT IGNORE INTO \`${tableName}\` (${columnNames}) VALUES (${placeholders})`;

    // Insert records in batches
    const batchSize = 100;
    let inserted = 0;
    let errors = [];
    let skipped = 0;

    console.log(`📊 Starting import: ${records.length} records, ${validDataColumns.length} columns`);

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      for (let j = 0; j < batch.length; j++) {
        const record = batch[j];
        const rowNumber = i + j + 1; // 1-based row number
        
        try {
          const values = validDataColumns.map((col, idx) => {
            let value = record[col];
            const columnInfo = tableColumns.find(c => c.Field === col);
            
            // Handle empty strings as NULL
            if (value === '' || value === null || value === undefined) {
              return null;
            }
            
            // Trim string values
            if (typeof value === 'string') {
              value = value.trim();
              if (value === '') return null;
            }
            
            // Handle date fields
            if (columnInfo && columnInfo.Type.includes('date')) {
              if (value === null || value === '') return null;
              
              // Try to parse date
              const dateStr = String(value);
              
              // Handle '0000-00-00' as NULL
              if (dateStr === '0000-00-00' || dateStr.startsWith('0000-')) {
                return null;
              }
              
              // Try to parse various date formats
              try {
                const date = new Date(dateStr);
                if (isNaN(date.getTime())) {
                  // Invalid date, return NULL
                  return null;
                }
                // Return in YYYY-MM-DD format
                return date.toISOString().split('T')[0];
              } catch (e) {
                // If parsing fails, return NULL
                return null;
              }
            }
            
            // Handle numeric fields
            if (columnInfo && (columnInfo.Type.includes('int') || columnInfo.Type.includes('decimal') || columnInfo.Type.includes('float'))) {
              if (value === null || value === '') return null;
              
              const num = Number(value);
              if (isNaN(num)) {
                // If not a valid number, return NULL
                return null;
              }
              return num;
            }
            
            return value;
          });

          const [result] = await pool.query(insertSql, values);
          
          if (result.affectedRows === 0) {
            // INSERT IGNORE returns 0 affected rows for duplicates
            skipped++;
            
            // Try to identify which key is duplicate
            let duplicateKey = 'unknown';
            try {
              // Check for unique constraints
              const uniqueColumns = tableColumns.filter(col => 
                col.Key === 'UNI' || col.Key === 'PRI'
              );
              
              // Try to find which unique key might be duplicate
              for (const col of uniqueColumns) {
                const colIdx = validDataColumns.indexOf(col.Field);
                if (colIdx >= 0 && values[colIdx] !== null) {
                  // Check if this value already exists
                  const [existing] = await pool.query(
                    `SELECT COUNT(*) as count FROM \`${tableName}\` WHERE \`${col.Field}\` = ?`,
                    [values[colIdx]]
                  );
                  if (existing[0].count > 0) {
                    duplicateKey = col.Field;
                    break;
                  }
                }
              }
            } catch (checkErr) {
              // Ignore check errors
            }
            
            errors.push({
              row: rowNumber,
              error: duplicateKey !== 'unknown' 
                ? `Duplicate key: ${duplicateKey} (skipped)`
                : 'Duplicate key or constraint violation (skipped)',
              duplicateKey: duplicateKey,
              data: Object.fromEntries(validDataColumns.map((col, idx) => [col, values[idx]]))
            });
          } else {
            inserted++;
          }
        } catch (err) {
          console.error(`❌ Error inserting row ${rowNumber}:`, err.message);
          errors.push({
            row: rowNumber,
            error: err.message,
            errorCode: err.code,
            sqlState: err.sqlState,
            data: Object.fromEntries(validDataColumns.map(col => [col, record[col]]))
          });
        }
      }
    }
    
    console.log(`✅ Import completed: ${inserted} inserted, ${skipped} skipped, ${errors.length - skipped} errors`);

    // Clean up uploaded file
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }

    res.json({
      success: true,
      message: `Imported ${inserted} records successfully`,
      inserted,
      skipped,
      total: records.length,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined, // Limit to first 10 errors
      errorCount: errors.length,
      errorSummary: errors.length > 0 ? {
        duplicateKeys: errors.filter(e => e.error.includes('Duplicate')).length,
        constraintViolations: errors.filter(e => e.error.includes('constraint') || e.error.includes('foreign key')).length,
        dataTypeErrors: errors.filter(e => e.error.includes('Incorrect') || e.error.includes('type')).length,
        otherErrors: errors.filter(e => !e.error.includes('Duplicate') && !e.error.includes('constraint') && !e.error.includes('Incorrect')).length
      } : undefined
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



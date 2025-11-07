const path = require('path');
const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');

dotenv.config();

const pool = require('./db');
const { ensureLegacyTables, legacyTables } = require('./lib/legacy/tableManager');
const { ensureAuthTables } = require('./lib/auth/usersTable');
const { seedOptionTablesFromDbf } = require('./lib/legacy/optionSeeder');
const { migrateAddNewFields } = require('./lib/legacy/migrateAddNewFields');
const productsRouter = require('./routes/products');
const authRouter = require('./routes/auth');
const customersRouter = require('./routes/customers');
const shipmentsRouter = require('./routes/shipments');
const mediaRouter = require('./routes/media');
const paymentsRouter = require('./routes/payments');
const invoicesRouter = require('./routes/invoices');
const legacyCustomersRouter = require('./routes/legacyCustomers');
const legacyDeliveriesRouter = require('./routes/legacyDeliveries');
const legacyProductsRouter = require('./routes/legacyProducts');
const workflowRouter = require('./routes/workflow');
const dashboardRouter = require('./routes/dashboard');

const app = express();

// View engine: EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve CSV export mapping summary file
app.get('/CSV_EXPORT_MAPPING_SUMMARY.md', (req, res) => {
  const filePath = path.join(__dirname, 'CSV_EXPORT_MAPPING_SUMMARY.md');
  
  // Set headers to force download with correct content type
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="CSV_EXPORT_MAPPING_SUMMARY.md"');
  
  // Send file with error handling
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error sending CSV_EXPORT_MAPPING_SUMMARY.md:', err);
      res.status(404).send('File not found');
    }
  });
});

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessions configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'change_this_dev_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    httpOnly: true, 
    secure: false, // Set to false for Railway deployment
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    sameSite: 'lax' // Add sameSite for better compatibility
  },
  name: 'siamdrug.sid' // Custom session name
};

// Use memory store for development, but warn in production
if (process.env.NODE_ENV === 'production') {
  console.log('⚠️  Warning: Using memory store for sessions in production');
  console.log('💡 Consider using Redis or another persistent store for production');
  console.log('🔧 Session config:', {
    secure: sessionConfig.cookie.secure,
    httpOnly: sessionConfig.cookie.httpOnly,
    maxAge: sessionConfig.cookie.maxAge,
    sameSite: sessionConfig.cookie.sameSite
  });
}

app.use(session(sessionConfig));

// Expose current user and error messages to views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  
  // Pass error message from query string to views
  if (req.query.error) {
    res.locals.error = req.query.error;
  }
  
  // Debug logging for session issues
  if (process.env.NODE_ENV === 'production') {
    console.log('🔍 Session debug:', {
      sessionID: req.sessionID,
      hasUser: !!req.session.user,
      user: req.session.user ? { id: req.session.user.id, operator: req.session.user.operator } : null,
      url: req.url,
      method: req.method
    });
  }
  
  next();
});

// Health check
app.get('/health', async (req, res) => {
  try {
    // Basic server health check
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      platform: process.env.RAILWAY_ENVIRONMENT ? 'railway' : 'local'
    };

    // Try database connection if available
    try {
      await pool.query('SELECT 1');
      healthData.database = 'connected';
    } catch (dbErr) {
      healthData.database = 'disconnected';
      healthData.dbError = dbErr.message;
    }

    res.json(healthData);
  } catch (err) {
    console.error('Health check error:', err);
    res.status(500).json({ 
      status: 'error', 
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API endpoint for dashboard deliveries
app.get('/api/deliveries', async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    
    // Get all deliveries from database
    const [deliveries] = await pool.execute(`
      SELECT 
        d.id,
        d.delivernum,
        d.operator as saleid,
        d.prename,
        d.firstname,
        d.lastname,
        d.apptdate,
        d.mediadesc,
        d.total,
        d.shipdesc,
        d.apptaddr,
        d.customerid,
        d.gender,
        d.age,
        d.weight,
        d.height,
        d.tag,
        d.disease1,
        d.disease2,
        d.lineid,
        d.symptoms,
        d.pain_level,
        d.keyword,
        d.followup,
        d.method,
        d.remark1,
        d.channel,
        d.datadesc,
        d.workdate,
        d.worktime,
        d.created_at,
        0 as previous_purchases
      FROM legacy_deliveries d
      WHERE DATE(d.apptdate) = ? OR ? = ''
      ORDER BY d.delivernum DESC
    `, [date, date]);

    // Get products for all deliveries
    const deliveryIds = deliveries.map(d => d.id);
    let products = [];
    if (deliveryIds.length > 0) {
      const [productRows] = await pool.execute(`
        SELECT 
          delivernum,
          code,
          title,
          price,
          qty,
          amount,
          datadesc
        FROM legacy_deliveries 
        WHERE id IN (${deliveryIds.map(() => '?').join(',')})
        ORDER BY delivernum, id
      `, deliveryIds);
      products = productRows;
    }

    res.json({
      deliveries,
      products
    });
  } catch (err) {
    console.error('Error fetching deliveries:', err);
    res.status(500).json({ error: 'Failed to fetch delivery data' });
  }
});

// API endpoint to get all deliveries without date filter
app.get('/api/deliveries/all', async (req, res) => {
  try {
    let deliveries = [];
    let products = [];
    
    try {
      // Try to get data from database
      const [deliveryRows] = await pool.execute(`
        SELECT 
          id,
          delivernum,
          operator as saleid,
          prename,
          firstname,
          lastname,
          apptdate,
          mediadesc,
          total,
          shipdesc,
          apptaddr,
          customerid,
          datadesc,
          0 as previous_purchases
        FROM legacy_deliveries
        ORDER BY delivernum DESC
      `);
      
      deliveries = deliveryRows;
      
      // Get products for all deliveries
      const deliveryIds = deliveries.map(d => d.id);
      if (deliveryIds.length > 0) {
        const [productRows] = await pool.execute(`
          SELECT 
            delivernum,
            code,
            title,
            price,
            qty,
            amount,
            datadesc
          FROM legacy_deliveries 
          WHERE id IN (${deliveryIds.map(() => '?').join(',')})
          ORDER BY delivernum, id
        `, deliveryIds);
        products = productRows;
      }
      
    } catch (dbError) {
      console.log('Database query failed, using sample data:', dbError.message);
      
      // Fallback to sample data
      deliveries = [
        {
          id: 1,
          delivernum: '0000170001',
          saleid: '1013',
          prename: 'คุณ',
          firstname: 'นัทวุฒิ',
          lastname: 'วงศ์สุภา',
          apptdate: '2025-09-22',
          mediadesc: 'SEM',
          total: 3600.00,
          shipdesc: 'E.M.S',
          apptaddr: '126/297 ม.2 บ้านของเรา ตำบลท่าตูม อำเภอศรีมหาโพธิ',
          customerid: '0000053232',
          previous_purchases: 0
        },
        {
          id: 2,
          delivernum: '0000170002',
          saleid: '0880',
          prename: 'คุณ',
          firstname: 'ทิพวรรณ',
          lastname: 'เสรีชัยทวีพงศ์',
          apptdate: '2025-09-22',
          mediadesc: 'Lazada',
          total: 1850.00,
          shipdesc: 'LEX EXP',
          apptaddr: '9/191-192 ถ.รามอินทรา แขวงอนุสาวรีย์ เขตบางเขน กท',
          customerid: '0000053233',
          previous_purchases: 3
        },
        {
          id: 3,
          delivernum: '0000170003',
          saleid: '1007',
          prename: 'คุณ',
          firstname: 'สมชาย',
          lastname: 'ใจดี',
          apptdate: '2025-09-22',
          mediadesc: 'Shopee',
          total: 4900.00,
          shipdesc: 'E.M.S',
          apptaddr: '123 ถนนสุขุมวิท แขวงคลองตัน เขตวัฒนา กรุงเทพฯ',
          customerid: '0000053234',
          previous_purchases: 2
        }
      ];
      
      products = [
        {
          delivernum: '0000170001',
          code: '67404',
          title: 'OVOCAL BOTT 4*30\'S FREE ACTIVA+K2 30\'',
          price: 5200.00,
          qty: 1,
          amount: 5200.00
        },
        {
          delivernum: '0000170002',
          code: '67416',
          title: 'COUPON NEW 0300 LINE:OVOSCIENCE',
          price: -300.00,
          qty: 1,
          amount: -300.00
        }
      ];
    }

    res.json({
      deliveries,
      products
    });
  } catch (err) {
    console.error('Error fetching all deliveries:', err);
    res.status(500).json({ error: 'Failed to fetch delivery data' });
  }
});

// API routes
app.use('/api/products', productsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/shipments', shipmentsRouter);
app.use('/api/media', mediaRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/legacy/customers', requireApiAuth, legacyCustomersRouter);
app.use('/api/legacy/deliveries', requireApiAuth, legacyDeliveriesRouter);
app.use('/api/legacy/products', requireApiAuth, legacyProductsRouter);

// Auth routes (register/login/logout)
app.use('/', authRouter);

// Simple auth guard
function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  // Redirect to home where they can login via header
  res.redirect('/');
}

// API auth guard - returns JSON error instead of redirect
function requireApiAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  res.status(401).json({ error: 'Authentication required' });
}

app.get('/', (req, res) => {
  // Redirect to workflow (home page)
  res.redirect('/workflow');
});

app.use('/workflow', workflowRouter);
app.use('/dashboard', requireAuth, dashboardRouter);

// Basic error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('=== ERROR HANDLER ===');
  console.error('Error:', err);
  console.error('Error message:', err.message);
  console.error('Error stack:', err.stack);
  console.error('Request URL:', req.url);
  console.error('Request method:', req.method);
  console.error('=====================');
  
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  } else {
    res.status(500).render('error', { error: err });
  }
});

// Bootstrap and start server
const DEFAULT_PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const MAX_PORT_RETRIES = Number(process.env.PORT_RETRY_LIMIT || 10);

// Railway environment detection
const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_STATIC_URL;

// Enhanced logging
console.log('🚀 Starting Siamdrug Application...');
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Platform: ${isRailway ? 'Railway' : 'Local'}`);
console.log(`Port: ${DEFAULT_PORT}`);
console.log(`Host: ${HOST}`);

async function bootstrap() {
  try {
    console.log('📊 Initializing database tables...');
    await ensureLegacyTables(pool);
    await ensureAuthTables(pool);
    
    console.log('🔄 Running database migrations...');
    await migrateAddNewFields(pool);
    
    console.log('🌱 Seeding option tables...');
    const optionSeedResults = await seedOptionTablesFromDbf(pool, console);
    optionSeedResults.forEach((result) => {
      if (result.skipped) {
        const extra = typeof result.existing === 'number' ? ' existing=' + result.existing : '';
        console.log(`Skipped seeding ${result.tableName} (${result.reason})${extra}`);
      } else {
        console.log(`Seeded ${result.tableName} with ${result.inserted} records`);
      }
    });
    
    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.log('⚠️  Continuing without database initialization...');
  }
}

function startServer(port, attemptsLeft) {
  const server = app.listen(port, HOST, () => {
    console.log(`✅ Server running on http://${HOST}:${port}`);
    if (isRailway) {
      console.log('🚂 Running on Railway platform');
    }
    console.log('🔍 Health check available at: /health');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && attemptsLeft > 0) {
      console.log(`⚠️  Port ${port} is in use, trying ${port + 1}...`);
      startServer(port + 1, attemptsLeft - 1);
    } else {
      console.error('❌ Failed to start server:', err);
      process.exit(1);
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
}

// Start the server
bootstrap()
  .then(() => {
    startServer(DEFAULT_PORT, MAX_PORT_RETRIES);
  })
  .catch((err) => {
    console.error('Bootstrap failed:', err);
    process.exit(1);
  });

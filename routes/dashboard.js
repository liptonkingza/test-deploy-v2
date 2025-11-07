const express = require('express');
const pool = require('../db');
const { legacyTables } = require('../lib/legacy/tableManager');

const router = express.Router();

// Get deliveries table reference
const deliveriesTable = legacyTables.find((t) => t.key === 'deliveries');

// Dashboard route
router.get('/', async (req, res, next) => {
  try {
    // Get deliveries data from legacy_deliveries table
    // Get ALL fields for CSV export (EgDeliver9 format)
    const [rows] = await pool.query(
      `SELECT * FROM \`${deliveriesTable.tableName}\` ORDER BY id DESC LIMIT 100`
    );
    
    // Count purchase frequency for each customer
    const [purchaseCounts] = await pool.query(
      `SELECT customerid, COUNT(*) as purchase_count 
       FROM \`${deliveriesTable.tableName}\` 
       GROUP BY customerid`
    );
    
    // Create a map for quick lookup
    const purchaseCountMap = {};
    purchaseCounts.forEach(row => {
      purchaseCountMap[row.customerid] = row.purchase_count;
    });
    
    // Add purchase count to each row
    rows.forEach(row => {
      row.purchase_count = purchaseCountMap[row.customerid] || 0;
    });
    
    // Calculate summary statistics
    const totalRecords = rows.length;
    const salesRecords = rows.filter(d => d.datadesc === 'ขาย').length;
    const shippingRecords = rows.filter(d => d.datadesc === 'ค่าส่ง').length;
    const freeRecords = rows.filter(d => d.datadesc === 'ของแถม').length;
    const totalAmount = rows.reduce((sum, d) => sum + parseFloat(d.total || 0), 0);
    
    res.render('dashboard/index', {
      title: 'Dashboard - ข้อมูลการจัดส่ง',
      deliveries: rows,
      summary: {
        total: totalRecords,
        sales: salesRecords,
        shipping: shippingRecords,
        free: freeRecords,
        totalAmount: totalAmount
      }
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    next(err);
  }
});

// API endpoint for dashboard data (for AJAX requests)
router.get('/api/data', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    
    // Get ALL fields for CSV export (EgDeliver9 format)
    const [rows] = await pool.query(
      `SELECT * FROM \`${deliveriesTable.tableName}\` ORDER BY id DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    
    // Get total count for pagination
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM \`${deliveriesTable.tableName}\``
    );
    
    res.json({
      success: true,
      data: rows,
      pagination: {
        total: countResult[0].total,
        limit: limit,
        offset: offset,
        hasMore: offset + limit < countResult[0].total
      }
    });
  } catch (err) {
    console.error('Dashboard API error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data',
      message: err.message
    });
  }
});

// API endpoint for related deliveries with same delivernum
router.get('/api/related-deliveries', async (req, res, next) => {
  try {
    const { delivernum } = req.query;
    
    if (!delivernum) {
      return res.status(400).json({
        success: false,
        error: 'delivernum parameter is required'
      });
    }
    
    // Get ALL fields for complete data
    const [rows] = await pool.query(
      `SELECT * FROM \`${deliveriesTable.tableName}\` WHERE delivernum = ? ORDER BY id ASC`,
      [delivernum]
    );
    
    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    console.error('Related deliveries API error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch related deliveries',
      message: err.message
    });
  }
});

// API endpoint for all deliveries (for CSV export)
router.get('/api/all-deliveries', async (req, res, next) => {
  try {
    // Get all fields from legacy_deliveries table
    const [rows] = await pool.query(
      `SELECT * FROM \`${deliveriesTable.tableName}\` ORDER BY id DESC`
    );
    
    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    console.error('All deliveries API error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch all deliveries',
      message: err.message
    });
  }
});

// API endpoint for customer details by customerid
router.get('/api/customer-details', async (req, res, next) => {
  try {
    const { customerid } = req.query;
    
    if (!customerid) {
      return res.status(400).json({
        success: false,
        error: 'customerid parameter is required'
      });
    }
    
    // Get customer table reference
    const customersTable = legacyTables.find((t) => t.key === 'customers');
    
    if (!customersTable) {
      return res.status(500).json({
        success: false,
        error: 'Customer table not found'
      });
    }
    
    const fields = [
      'customerid',
      'sex',
      'age',
      'weight',
      'height',
      'sickness1',
      'sickness2',
      'lineid'
    ];
    
    const [rows] = await pool.query(
      `SELECT ${fields.join(', ')} FROM \`${customersTable.tableName}\` WHERE customerid = ? LIMIT 1`,
      [customerid]
    );
    
    if (rows.length === 0) {
      return res.json({
        success: true,
        data: null,
        message: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (err) {
    console.error('Customer details API error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer details',
      message: err.message
    });
  }
});

module.exports = router;

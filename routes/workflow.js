const express = require('express');
const pool = require('../db');
const {
  legacyTables,
  sanitizePayload,
  buildInsertStatement,
  buildUpdateStatement,
} = require('../lib/legacy/tableManager');

const router = express.Router();

const customersTable = legacyTables.find((t) => t.key === 'customers');
const deliveriesTable = legacyTables.find((t) => t.key === 'deliveries');
const mediaTable = legacyTables.find((t) => t.key === 'media');
const productsTable = legacyTables.find((t) => t.key === 'products');
const financeTable = legacyTables.find((t) => t.key === 'finance');
const channelTable = legacyTables.find((t) => t.key === 'channels');
const shippingTable = legacyTables.find((t) => t.key === 'shipping');
const couponTable = legacyTables.find((t) => t.key === 'coupons');

function mapSalesRepOptions(rows) {
  return rows
    .map((row) => {
      if (!row) return null;
      const operator = row.operator ? String(row.operator).trim() : '';
      const pnId = row.pn_id ? String(row.pn_id).trim() : '';
      if (!operator || !pnId) return null;
      return { value: pnId, label: operator };
    })
    .filter(Boolean);
}

async function getCustomerLegacyRecord(id) {
  const [rows] = await pool.query(
    `SELECT id, customerid, firstname, lastname, mobiletel, addr1, addr2, addr3, addr4, addr5 FROM \`${customersTable.tableName}\` WHERE id = ? LIMIT 1`,
    [id]
  );
  if (!rows.length) return null;
  return rows[0];
}

function ensureDeliveryDefaults(req, customer, record, isUpdate) {
  if (!record || !customer) return record;
  // ใช้เวลาไทย (UTC+7) ด้วย toLocaleString
  const now = new Date();
  const thaiDate = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Bangkok"}));
  record.customerid = customer.customerid;
  if (!record.workdate) record.workdate = thaiDate.toISOString().slice(0, 10);
  if (!record.worktime) record.worktime = thaiDate.toTimeString().slice(0, 8);
  if (!record.day) record.day = thaiDate.toISOString().slice(0, 10);
  if (!record.timein) record.timein = thaiDate.toTimeString().slice(0, 5);
  if (!record.operator && req.session?.user?.operator) {
    record.operator = String(req.session.user.operator).trim();
  }
  return record;
}

const allowedDeliveryFields = new Set([
  'deliverto',
  'appttel',
  'addr1',
  'addr2',
  'homenum1',
  'mooban1',
  'building1',
  'soi1',
  'road1',
  'kwang1',
  'kate1',
  'province1',
  'zipcode1',
  'day',
  'timein',
]);

function filterDeliveryFields(record) {
  const data = { ...record };
  for (const key of Object.keys(data)) {
    if (!allowedDeliveryFields.has(key.toLowerCase())) {
      delete data[key];
    }
  }
  return data;
}

const allowedMediaFields = new Set(['mediaid', 'medianame', 'remark', 'created_at']);
const allowedChannelFields = new Set(['channelid', 'channelname', 'remark', 'created_at']);

function filterOptionFields(record, allowedSet) {
  const data = {};
  for (const [key, value] of Object.entries(record || {})) {
    const normalized = String(key || '').toLowerCase();
    if (allowedSet.has(normalized)) {
      data[normalized] = value;
    }
  }
  return data;
}

router.get('/', async (req, res, next) => {
  try {
    const [users] = await pool.query('SELECT operator, pn_id FROM users WHERE pn_id IS NOT NULL ORDER BY operator ASC');
    const salesRepOptions = mapSalesRepOptions(users);
    res.render('workflow/step_customers', {
      title: 'สร้างรายการใหม่ – เลือกข้อมูลลูกค้า',
      salesRepOptions,
    });
  } catch (err) {
    next(err);
  }
});


router.get('/step2', async (req, res, next) => {
  try {
    const customerId = typeof req.query.customerId === 'string' ? req.query.customerId : '';
    const [users] = await pool.query('SELECT operator, pn_id FROM users WHERE pn_id IS NOT NULL ORDER BY operator ASC');
    const salesRepOptions = mapSalesRepOptions(users);
    res.render('workflow/step2', {
      title: 'สร้างรายการใหม่ – กรอกข้อมูลจัดส่ง (ขั้นตอนที่ 2)',
      customerId,
      salesRepOptions,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/step3', async (req, res, next) => {
  try {
    const customerId = typeof req.query.customerId === 'string' ? req.query.customerId : '';
    const [users] = await pool.query('SELECT operator, pn_id FROM users WHERE pn_id IS NOT NULL ORDER BY operator ASC');
    const salesRepOptions = mapSalesRepOptions(users);
    res.render('workflow/step3', {
      title: 'สร้างรายการใหม่ – เลือกสื่อและช่องทาง (ขั้นตอนที่ 3)',
      customerId,
      salesRepOptions,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/step4', async (req, res, next) => {
  try {
    const customerId = typeof req.query.customerId === 'string' ? req.query.customerId : '';
    const [users] = await pool.query('SELECT operator, pn_id FROM users WHERE pn_id IS NOT NULL ORDER BY operator ASC');
    const salesRepOptions = mapSalesRepOptions(users);
    res.render('workflow/step4', {
      title: 'สร้างรายการใหม่ – เลือกสินค้าและการขนส่ง',
      customerId,
      salesRepOptions,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/step5', async (req, res, next) => {
  try {
    const customerId = typeof req.query.customerId === 'string' ? req.query.customerId : '';
    const [users] = await pool.query('SELECT operator, pn_id FROM users WHERE pn_id IS NOT NULL ORDER BY operator ASC');
    const salesRepOptions = mapSalesRepOptions(users);
    res.render('workflow/step5', {
      title: 'สร้างรายการใหม่ – ข้อมูลการชำระเงิน (ขั้นตอนที่ 5)',
      customerId,
      salesRepOptions,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/api/customers/:id/deliveries', async (req, res, next) => {
  try {
    const numericId = Number(req.params.id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      return res.status(400).json({ error: 'customer id ไม่ถูกต้อง' });
    }
    const customer = await getCustomerLegacyRecord(numericId);
    if (!customer) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลลูกค้า' });
    }
    
    // Fetch additional customer data from legacy_customers for editing
    const customerFields = [
      'homenum', 'moo', 'building', 'soi', 'road', 'kate', 'kwang', 'zipcode', 'province'
    ];
    const [customerRows] = await pool.query(
      `SELECT ${customerFields.join(', ')} FROM \`${customersTable.tableName}\` WHERE id = ? LIMIT 1`,
      [numericId]
    );
    const customerDetails = customerRows.length > 0 ? customerRows[0] : {};
    
    const fields = [
      'id',
      'workdate',
      'timein',
      'deliverto',
      'appttel',
      'addr1',
      'addr2',
      'homenum1',
      'mooban1',
      'soi1',
      'road1',
      'kwang1',
      'kate1',
      'province1',
      'zipcode1',
      'day',
    ];
    const [rows] = await pool.query(
      `SELECT ${fields.join(', ')} FROM \`${deliveriesTable.tableName}\` WHERE customerid = ? ORDER BY id DESC LIMIT 100`,
      [customer.customerid]
    );
    
    // Merge customer details with delivery records for editing
    const deliveriesWithCustomerData = rows.map(delivery => ({
      ...delivery,
      // Add customer data for auto-fill when editing
      homenum: customerDetails.homenum || '',
      moo: customerDetails.moo || '',
      building: customerDetails.building || '',
      soi: customerDetails.soi || '',
      road: customerDetails.road || '',
      kate: customerDetails.kate || '',
      kwang: customerDetails.kwang || '',
      zipcode: customerDetails.zipcode || '',
      province: customerDetails.province || ''
    }));
    
    // Debug: Log the customer details and delivery data
    console.log('Customer details from legacy_customers:', customerDetails);
    console.log('First delivery with customer data:', deliveriesWithCustomerData[0]);
    
    res.json({ 
      customer: {
        ...customer,
        // Include customer details for form auto-fill
        homenum: customerDetails.homenum || '',
        moo: customerDetails.moo || '',
        building: customerDetails.building || '',
        soi: customerDetails.soi || '',
        road: customerDetails.road || '',
        kate: customerDetails.kate || '',
        kwang: customerDetails.kwang || '',
        zipcode: customerDetails.zipcode || '',
        province: customerDetails.province || ''
      }, 
      deliveries: deliveriesWithCustomerData 
    });
  } catch (err) {
    next(err);
  }
});

router.post('/api/customers/:id/deliveries', async (req, res, next) => {
  try {
    const numericId = Number(req.params.id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      return res.status(400).json({ error: 'customer id ไม่ถูกต้อง' });
    }
    const customer = await getCustomerLegacyRecord(numericId);
    if (!customer) return res.status(404).json({ error: 'ไม่พบข้อมูลลูกค้า' });
    let sanitized = sanitizePayload(deliveriesTable, req.body);
    sanitized = filterDeliveryFields(sanitized);
    sanitized = ensureDeliveryDefaults(req, customer, sanitized, false);
    const { sql, values } = buildInsertStatement(deliveriesTable, sanitized);
    const [result] = await pool.query(sql, values);
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    if (err.message && err.message.startsWith('Invalid')) {
      return res.status(400).json({ error: err.message });
    }
    if (err.message === 'No valid fields provided for insert') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

router.put('/api/customers/:customerId/deliveries/:deliveryId', async (req, res, next) => {
  try {
    const customerNumericId = Number(req.params.customerId);
    const deliveryId = Number(req.params.deliveryId);
    if (!Number.isInteger(customerNumericId) || customerNumericId <= 0) {
      return res.status(400).json({ error: 'customer id ไม่ถูกต้อง' });
    }
    if (!Number.isInteger(deliveryId) || deliveryId <= 0) {
      return res.status(400).json({ error: 'delivery id ไม่ถูกต้อง' });
    }
    const customer = await getCustomerLegacyRecord(customerNumericId);
    if (!customer) return res.status(404).json({ error: 'ไม่พบข้อมูลลูกค้า' });
    let sanitized = sanitizePayload(deliveriesTable, req.body);
    sanitized = filterDeliveryFields(sanitized);
    sanitized = ensureDeliveryDefaults(req, customer, sanitized, true);
    const { sql, values } = buildUpdateStatement(deliveriesTable, sanitized, deliveryId);
    const [result] = await pool.query(sql, values);
    if (!result.affectedRows) return res.status(404).json({ error: 'ไม่พบข้อมูลการจัดส่งที่ต้องการลบ' });
    res.json({ id: deliveryId, updated: true });
  } catch (err) {
    if (err.message && err.message.startsWith('Invalid')) {
      return res.status(400).json({ error: err.message });
    }
    if (err.message === 'No valid fields provided for update') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

router.delete('/api/customers/:customerId/deliveries/:deliveryId', async (req, res, next) => {
  try {
    const deliveryId = Number(req.params.deliveryId);
    if (!Number.isInteger(deliveryId) || deliveryId <= 0) {
      return res.status(400).json({ error: 'delivery id ไม่ถูกต้อง' });
    }
    const [result] = await pool.query(
      `DELETE FROM \`${deliveriesTable.tableName}\` WHERE id = ?`,
      [deliveryId]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'เนเธกเนเธเธเธเนเธญเธกเธนเธฅเธเธฑเธ”เธชเนเธเธ—เธตเนเธ•เนเธญเธเธเธฒเธฃเธฅเธ' });
    res.json({ id: deliveryId, deleted: true });
  } catch (err) {
    next(err);
  }
});

router.get('/api/media-options', async (req, res, next) => {
  try {
    if (!mediaTable) {
      return res.status(500).json({ error: 'ตารางข้อมูลสื่อในระบบยังไม่พร้อมใช้งาน' });
    }
    const sql = "SELECT id, mediaid, medianame, remark, created_at FROM `" + mediaTable.tableName + "` ORDER BY COALESCE(NULLIF(medianame, ''), '') ASC, id DESC";
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/api/media-options', async (req, res, next) => {
  try {
    if (!mediaTable) {
      return res.status(500).json({ error: 'ตารางข้อมูลสื่อในระบบยังไม่พร้อมใช้งาน' });
    }
    let sanitized = sanitizePayload(mediaTable, req.body);
    sanitized = filterOptionFields(sanitized, allowedMediaFields);
    if (!sanitized.medianame) {
      return res.status(400).json({ error: 'กรุณาระบุชื่อสื่อ (medianame)' });
    }
    if (!sanitized.created_at) {
      sanitized.created_at = new Date().toISOString().slice(0, 10);
    }
    const { sql, values } = buildInsertStatement(mediaTable, sanitized);
    const [result] = await pool.query(sql, values);
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    if (err?.message && err.message.startsWith('Invalid')) {
      return res.status(400).json({ error: err.message });
    }
    if (err?.message === 'No valid fields provided for insert') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

router.delete('/api/media-options/:id', async (req, res, next) => {
  try {
    if (!mediaTable) {
      return res.status(500).json({ error: 'ตารางข้อมูลสื่อในระบบยังไม่พร้อมใช้งาน' });
    }
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'media id ไม่ถูกต้อง' });
    }
    const [result] = await pool.query('DELETE FROM `'+ mediaTable.tableName +'` WHERE id = ?', [id]);
    if (!result.affectedRows) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลสื่อที่ต้องการลบ' });
    }
    res.json({ id, deleted: true });
  } catch (err) {
    next(err);
  }
});


router.get('/api/product-options', async (req, res, next) => {
  try {
    if (!productsTable) {
      return res.status(500).json({ error: 'Legacy products table is not ready' });
    }
    const limitParam = Number(req.query.limit);
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 10000) : null;
    const searchRaw = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const fields = [
      'id',
      'code',
      'ebrandname',
      'title',
      'sig_name',
      'unitsale',
      'cost',
      'price',
      'sugprice',
      'wholesale',
      'scancode',
      'active',
    ];
    let sql = 'SELECT ' + fields.join(', ') + ' FROM `'+ productsTable.tableName + '`';
    const params = [];
    if (searchRaw) {
      const like = '%' + searchRaw + '%';
      sql += ' WHERE (CAST(`code` AS CHAR) LIKE ? OR `title` LIKE ? OR `scancode` LIKE ? OR `ebrandname` LIKE ? OR `sig_name` LIKE ?)';
      params.push(like);
      params.push(like);
      params.push(like);
      params.push(like);
      params.push(like);
    }
    sql += " ORDER BY COALESCE(NULLIF(`title`, ''), '') ASC, COALESCE(`code`, 0) ASC";
    if (limit !== null) {
      sql += ' LIMIT ?';
      params.push(limit);
    }
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/api/shipping-options', async (req, res, next) => {
  try {
    if (!shippingTable) {
      return res.status(500).json({ error: 'ตารางข้อมูลการจัดส่งยังไม่พร้อมใช้งาน' });
    }
    const sql = "SELECT id, shiptype, shipdesc, shipcode, shiptitle, shipprice, freecode, freetitle, freeprice, remark FROM " + shippingTable.tableName + " ORDER BY COALESCE(NULLIF(shipdesc, ''), NULLIF(shiptitle, ''), shipcode) ASC, id DESC";
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/api/coupon-options', async (req, res, next) => {
  try {
    if (!couponTable) {
      return res.status(500).json({ error: 'ตารางข้อมูลคูปองยังไม่พร้อมใช้งาน' });
    }
    const sql = "SELECT id, couponid, code, subcode, title, price, remark FROM " + couponTable.tableName + " ORDER BY COALESCE(NULLIF(title, ''), NULLIF(code, ''), couponid) ASC, id DESC";
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});
router.get('/api/channel-options', async (req, res, next) => {
  try {
    if (!channelTable) {
      return res.status(500).json({ error: 'ตารางข้อมูลช่องทางในระบบยังไม่พร้อมใช้งาน' });
    }
    const sql = "SELECT id, channelid, channelname, remark, created_at FROM `" + channelTable.tableName + "` ORDER BY COALESCE(NULLIF(channelname, ''), '') ASC, id DESC";
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/api/channel-options', async (req, res, next) => {
  try {
    if (!channelTable) {
      return res.status(500).json({ error: 'ตารางข้อมูลช่องทางในระบบยังไม่พร้อมใช้งาน' });
    }
    let sanitized = sanitizePayload(channelTable, req.body);
    sanitized = filterOptionFields(sanitized, allowedChannelFields);
    if (!sanitized.channelname) {
      return res.status(400).json({ error: 'กรุณาระบุชื่อช่องทาง (channelname)' });
    }
    if (!sanitized.created_at) {
      sanitized.created_at = new Date().toISOString().slice(0, 10);
    }
    const { sql, values } = buildInsertStatement(channelTable, sanitized);
    const [result] = await pool.query(sql, values);
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    if (err?.message && err.message.startsWith('Invalid')) {
      return res.status(400).json({ error: err.message });
    }
    if (err?.message === 'No valid fields provided for insert') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

router.delete('/api/channel-options/:id', async (req, res, next) => {
  try {
    if (!channelTable) {
      return res.status(500).json({ error: 'ตารางข้อมูลช่องทางในระบบยังไม่พร้อมใช้งาน' });
    }
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'channel id ไม่ถูกต้อง' });
    }
    const [result] = await pool.query('DELETE FROM `'+ channelTable.tableName +'` WHERE id = ?', [id]);
    if (!result.affectedRows) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลช่องทางที่ต้องการลบ' });
    }
    res.json({ id, deleted: true });
  } catch (err) {
    next(err);
  }
});

router.get('/api/finance-options', async (req, res, next) => {
  try {
    if (!financeTable) {
      return res.status(500).json({ error: 'ตารางข้อมูลการชำระเงินยังไม่พร้อมใช้งาน' });
    }
    const fields = [
      'id',
      'financetype',
      'financedes',
      'fingrptype',
      'fingrpdesc',
      'bankno',
      'bankna',
      'bankbr',
      'bankac'
    ];
    const sql = 'SELECT ' + fields.join(', ') + ' FROM `' + financeTable.tableName + '` ORDER BY COALESCE(`financetype`, 0) ASC, `id` ASC';
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Save complete workflow data to legacy_deliveries
router.post('/api/save-workflow', async (req, res, next) => {
  try {
      const { 
        customerData, 
        deliveryData, 
        mediaChannelData, 
        productData, 
        paymentData 
      } = req.body;

      const products = Array.isArray(productData?.products) ? productData.products : [];
      const shippingInfo = productData?.shipping || {};

      if (!deliveriesTable) {
        return res.status(500).json({ success: false, error: 'ไม่พบโครงสร้างตาราง legacy_deliveries' });
      }
      
      // Debug: Log received data
      console.log('Received customerData:', customerData);
      console.log('Customer prename:', customerData?.prename);
      console.log('Customer firstname:', customerData?.firstname);
      console.log('Customer lastname:', customerData?.lastname);
      console.log('Received productData:', productData);
      console.log('ProductData datadesc:', productData?.datadesc);

    // Generate unique delivery number - get next number from database
    // ใช้เวลาไทย (UTC+7) ด้วย toLocaleString
    const now = new Date();
    const thaiDate = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Bangkok"}));
    const workDate = thaiDate.toISOString().split('T')[0];
    const workTime = thaiDate.toTimeString().split(' ')[0].substring(0, 8);
    
    // Get next delivery number from database
    const [maxResult] = await pool.execute(
      'SELECT MAX(CAST(delivernum AS UNSIGNED)) as maxNum FROM legacy_deliveries WHERE delivernum REGEXP "^[0-9]+$"'
    );
    const nextNum = (maxResult[0]?.maxNum || 0) + 1;
    const deliverNum = nextNum.toString().padStart(10, '0'); // 10 หลักพร้อม 0 นำหน้า
    
    // Calculate totals
    const subtotal = products.reduce((sum, item) => 
      sum + (Number(item.price) || 0) * (Number(item.qty) || 0), 0);
    const discount = products.reduce((sum, item) => 
      sum + (Number(item.discount) || 0), 0);
    const shippingCost = shippingInfo.noCharge ? 0 : 
      (Number(shippingInfo.shippingCost) || 0);
    const total = Math.max(subtotal - discount + shippingCost, 0);

    // Prepare legacy_deliveries record
    const deliveryRecord = {
      workdate: workDate,
      worktime: workTime,
      operator: req.session.user?.operator || 'SYSTEM',
      chkminute: '', // เก็บเป็นค่าว่าง
      delivernum: deliverNum,
      tohomenum: '', // เก็บเป็นค่าว่าง
      timein: '', // เก็บเป็นค่าว่าง
      timeout: '', // เก็บเป็นค่าว่าง
      buy: false, // ตั้งให้เก็บข้อมูลทุกครั้งเป็น FALSE
      datatype: 1, // Default datatype for main record (will be overridden for individual products)
      datadesc: productData?.products?.[0]?.datadesc || productData?.datadesc || 'ขาย', // ใช้ข้อมูลจาก productData
      processtyp: 0, // ตั้งให้เก็บข้อมูลทุกครั้งเป็น 0
      processdes: '', // เก็บเป็นค่าว่าง
      mediatype: Number(mediaChannelData.mediaId) || 0, // เอาค่า mediaid
      mediadesc: mediaChannelData.mediaName || '', // เก็บค่า medianame
      channel: Number(mediaChannelData.channelId) || 0, // เก็บค่า channelid
      channeldes: mediaChannelData.channelName || '', // เก็บค่า channelname
      paytype: Number(paymentData.financeType) || 0, // เก็บค่า financetype
      paydesc: paymentData.financeDesc || '', // เก็บข้อมูลจาก ประเภทการชำระเงิน ที่เลือกใน step 5/5
      paytype1: Number(paymentData.payType1) || 0,
      subpay1: paymentData.subPay1 || '',
      subpay2: paymentData.subPay2 || '',
      payment: true,
      payday: workDate,
      cusbankno: Number(paymentData.cusBankNo) || 0,
      cusbankna: paymentData.cusBankNa || '',
      cusbankbr: paymentData.cusBankBr || '',
      cusbankac: paymentData.cusBankAc || '',
      cusbankref: paymentData.cusBankRef || '',
      credit: paymentData.credit || false,
      credittype: Number(paymentData.creditType) || 0,
      creditdesc: paymentData.creditDesc || '',
      creditno: Number(paymentData.creditNo) || 0,
      creditexpm: paymentData.creditExpM || '',
      creditexpy: paymentData.creditExpY || '',
      creditref: paymentData.creditRef || '',
      last3digit: paymentData.last3Digit || '',
      bankno: paymentData.bankNo || '',
      bankna: paymentData.bankNa || '',
      bankbr: paymentData.bankBr || '',
      bankac: paymentData.bankAc || '',
      bankref: paymentData.bankRef || '',
      shiptype: (() => {
        // Map shipping method to shiptype (1-15)
        const shippingOptions = [
          { id: 'BYHAND', shiptype: 1 },
          { id: 'EMS', shiptype: 2 },
          { id: 'EMS-1', shiptype: 3 },
          { id: 'KERRY EXPRESS', shiptype: 4 },
          { id: 'DHL', shiptype: 5 },
          { id: 'LineMan', shiptype: 6 },
          { id: 'Lalamove', shiptype: 7 },
          { id: 'Grab', shiptype: 8 },
          { id: 'Shopee', shiptype: 9 },
          { id: 'LEX EXPRESS', shiptype: 10 },
          { id: 'FLASH EXPRESS', shiptype: 11 },
          { id: 'J&T EXPRESS', shiptype: 12 },
          { id: 'Kerry COD', shiptype: 13 },
          { id: 'E.M.S. COD', shiptype: 14 },
          { id: 'J&T. COD', shiptype: 15 }
        ];
        const selectedOption = shippingOptions.find(option => option.id === productData.shipping.method);
        return selectedOption ? selectedOption.shiptype : 0;
      })(), // เก็บค่าของ shiptype จากตัวเลือกการเลือกขนส่ง (1-15)
      shipdesc: (() => {
        // Map shipping method to shipdesc (label)
        const shippingOptions = [
          { id: 'BYHAND', label: 'BYHAND' },
          { id: 'EMS', label: 'E.M.S' },
          { id: 'EMS-1', label: 'พกง.' },
          { id: 'KERRY EXPRESS', label: 'KERRY EXPRESS' },
          { id: 'DHL', label: 'DHL' },
          { id: 'LineMan', label: 'LineMan' },
          { id: 'Lalamove', label: 'Lalamove' },
          { id: 'Grab', label: 'Grab' },
          { id: 'Shopee', label: 'Shopee' },
          { id: 'LEX EXPRESS', label: 'LEX EXPRESS' },
          { id: 'FLASH EXPRESS', label: 'FLASH EXPRESS' },
          { id: 'J&T EXPRESS', label: 'J&T EXPRESS' },
          { id: 'Kerry COD', label: 'Kerry COD' },
          { id: 'E.M.S. COD', label: 'E.M.S. COD' },
          { id: 'J&T. COD', label: 'J&T. COD' }
        ];
        const selectedOption = shippingOptions.find(option => option.id === productData.shipping.method);
        return selectedOption ? selectedOption.label : '';
      })(), // เก็บค่าของตัวเลือกที่เลือกในการเลือกขนส่ง
      deliverto: '', // ค่าว่าง
      userid: req.session.user?.pn_id || 'SYSTEM', // เก็บค่า pn_id ของคนเข้าสู่ระบบ
      username: req.session.user?.operator || 'System', // เก็บค่า ชื่อ operator ของคนเข้าสู่ระบบ
      salerepid: (() => {
        // Debug: Log received data
        console.log('🔍 Debug - selectedSalesRep from req.body:', req.body.selectedSalesRep);
        console.log('🔍 Debug - salesRepOptions from req.body:', req.body.salesRepOptions);
        console.log('🔍 Debug - customerData.salerepid:', customerData.salerepid);
        
        // ดึงข้อมูลพนักงานขายที่เลือกไว้จาก localStorage
        const selectedSalesRep = req.body.selectedSalesRep;
        if (selectedSalesRep && selectedSalesRep !== '' && selectedSalesRep !== '0') {
          console.log('✅ Using selectedSalesRep from Tab:', selectedSalesRep);
          return Number(selectedSalesRep);
        }
        
        // ถ้าไม่มีข้อมูลจาก Tab ให้ใช้ค่าว่าง
        console.log('⚠️ No selectedSalesRep from Tab, using 0');
        return 0;
      })(), // เก็บค่า pn_id ของ พนักงานขายจาก Tab
      salename: (() => {
        // ดึงข้อมูลพนักงานขายที่เลือกไว้จาก localStorage
        const selectedSalesRep = req.body.selectedSalesRep;
        const salesRepOptions = req.body.salesRepOptions || [];
        
        if (selectedSalesRep && selectedSalesRep !== '' && salesRepOptions.length > 0) {
          const selectedRep = salesRepOptions.find(rep => rep.value === selectedSalesRep);
          if (selectedRep) {
            console.log('✅ Using salename from Tab:', selectedRep.label);
            return selectedRep.label;
          }
        }
        
        // ถ้าไม่มีข้อมูลจาก Tab ให้ใช้ค่าว่าง
        console.log('⚠️ No salename from Tab, using empty string');
        return '';
      })(), // เก็บค่า ชื่อ operator จาก Tab พนักงานขายที่ถูกเลือก
      ring: '', // ค่าว่าง
      ringdesc: '', // ค่าว่าง
      routerun: '', // ค่าว่าง
      routeno: 0, // เก็บค่า integer
      routedesc: '', // ค่าว่าง
      routedist: 0, // ค่า = 0
      routetimes: '', // ค่าว่าง
      milesp2p: 0, // ค่า = 0
      timesp2p: 0, // ค่า = 0
      msnid: 0, // เก็บค่า integer
      msnname: '', // ค่าว่าง
      handtimes: '', // ค่าว่าง
      day: now.toLocaleDateString('en-US', { weekday: 'long' }), // วันทำรายการแบบ monday, tuesday, etc.
      date: now.toISOString().slice(0, 10), // วันที่ทำรายการในรูปแบบ YYYY-MM-DD
      source: 5, // เก็บค่าทุกรายการคือ 5
      code: productData.products.length > 0 ? Number(productData.products[0].code) || 0 : 0, // code จากตารางของ product สินค้าที่เลือกไว้
      prdgroup: 0, // ค่า = 0
      title: productData.products.map(p => p.title).join(', ').substring(0, 40), // ดึง title ของสินค้าที่เลือก
      cost: productData.products.length > 0 ? Number(productData.products[0].cost) || 0 : 0, // ดึง cost ของสินค้าที่เลือก
      price: productData.products.length > 0 ? Number(productData.products[0].price) || 0 : 0, // ดึง price ของสินค้าที่เลือก
      salprice: 0, // ค่า = 0
      qty: productData.products.length > 0 ? Number(productData.products[0].qty) || 0 : 0, // จำนวนของสินค้าแรก (หรือสินค้าที่เลือก)
      amount: subtotal, // เหมือนเดิม
      postfee: shippingCost, // เหมือนเดิม
      total: total, // เหมือนเดิม
      freecode: 0, // ค่า = 0
      dscamt: 0, // ค่า = 0
      transno: 0, // เก็บค่า integer
      customerid: customerData.customerid || '', // ดึง customerid ของลูกค้าที่เลือก
      memcode: 0, // เก็บค่า = 0
      prename: customerData.prename || 'คุณ', // คำนำหน้าจาก step 1 หรือ "คุณ" ถ้าไม่มีข้อมูล
      firstname: customerData.firstname || '', // firstname ของลูกค้าที่สั่งซื้อจาก step1
      lastname: customerData.lastname || '', // lastname ของลูกค้าที่สั่งซื้อจาก step1
      addr1: deliveryData.addr2 || '', // ที่อยู่บรรทัดหลัก จาก step 2
      addr2: deliveryData.addr3 || '', // ที่อยู่บรรทัดเพิ่มเติม จาก step 2
      homenum1: '', // ค่าว่าง
      homenum2: deliveryData.homenum2 || '',
      precomnam1: deliveryData.prename || '', // prename ไปเก็บใน precomnam1
      precomnam2: deliveryData.precomnam2 || '',
      comname1: deliveryData.firstname || '', // firstname ไปเก็บใน comname1
      comname2: deliveryData.comname2 || '',
      lstcomnam1: deliveryData.lastname || '', // lastname ไปเก็บใน lstcomnam1
      lstcomnam2: deliveryData.lstcomnam2 || '',
      building1: deliveryData.building1 || '',
      building2: deliveryData.building2 || '',
      floor1: deliveryData.floor1 || '',
      floor2: deliveryData.floor2 || '',
      room1: deliveryData.room1 || '',
      room2: deliveryData.room2 || '',
      soi1: '', // เก็บค่าว่าง
      soi2: '', // เก็บค่าว่าง
      road1: '', // เก็บค่าว่าง
      road2: '', // เก็บค่าว่าง
      kate1: '', // เก็บค่าว่าง
      kate2: '', // เก็บค่าว่าง
      kwang1: '', // เก็บค่าว่าง
      kwang2: '', // เก็บค่าว่าง
      mooban1: '', // เก็บค่าว่าง
      mooban2: mediaChannelData.keyword || '', // เก็บค่าจากช่อง Keyword
      tumbon1: '', // ค่าว่าง
      tumbon2: '', // ค่าว่าง
      ampur1: '', // ค่าว่าง
      ampur2: '', // ค่าว่าง
      province1: '', // ค่าว่าง
      province2: '', // ค่าว่าง
      zipcode1: '', // ค่าว่าง
      zipcode2: '', // ค่าว่าง
      province: deliveryData.province || '',
      zipcode: deliveryData.zipcode || '',
      beforeaft: '',
            apptday: (() => {
              // ใช้ข้อมูลจาก Step 2 ถ้ามี
              if (deliveryData.day) {
                const deliveryDate = new Date(deliveryData.day);
                return deliveryDate.toLocaleDateString('en-US', { weekday: 'long' });
              }
              // ถ้าไม่มีข้อมูลจาก Step 2 ให้ใช้ +1 วัน
              const tomorrow = new Date(now);
              tomorrow.setDate(tomorrow.getDate() + 1);
              return tomorrow.toLocaleDateString('en-US', { weekday: 'long' });
            })(), // วันส่งจาก Step 2 หรือ +1 วันถ้าไม่มีข้อมูล
            apptdate: (() => {
              // ใช้ข้อมูลจาก Step 2 ถ้ามี
              if (deliveryData.day) {
                const deliveryDate = new Date(deliveryData.day);
                return deliveryDate.toISOString().slice(0, 10); // YYYY-MM-DD format
              }
              // ถ้าไม่มีข้อมูลจาก Step 2 ให้ใช้ +1 วัน
              const tomorrow = new Date(now);
              tomorrow.setDate(tomorrow.getDate() + 1);
              return tomorrow.toISOString().slice(0, 10); // YYYY-MM-DD format
            })(), // วันที่ส่งจาก Step 2 หรือ +1 วันถ้าไม่มีข้อมูล
            appttime: deliveryData.timein || '16:00', // เวลาส่งจาก Step 2 หรือ 16:00 ถ้าไม่มีข้อมูล
      appttime1: '',
      appttime2: '',
      apptperson: deliveryData.deliverto || '', // ชื่อผู้รับ จาก step 2
      appttel: deliveryData.appttel || '', // โทรศัพท์ จาก step 2
      apptaddr: (() => {
        const parts = [];
        if (deliveryData.addr2) parts.push(deliveryData.addr2); // ที่อยู่บรรทัดหลัก
        if (deliveryData.addr3) parts.push(deliveryData.addr3); // ที่อยู่บรรทัดเพิ่มเติม
        if (deliveryData.province1) parts.push(deliveryData.province1); // จังหวัด
        if (deliveryData.zipcode1) parts.push(deliveryData.zipcode1); // รหัสไปรษณีย์
        return parts.join(' ');
      })(), // ที่อยู่บรรทัดหลัก + ที่อยู่บรรทัดเพิ่มเติม + จังหวัด + รหัสไปรษณีย์ จาก step 2
      apptaddr1: (() => {
        const parts = [];
        if (deliveryData.homenum1) parts.push(deliveryData.homenum1); // บ้านเลขที่
        if (deliveryData.mooban1) parts.push(deliveryData.mooban1); // หมู่บ้าน/หมู่ที่
        return parts.join(' ');
      })(), // บ้านเลขที่ + หมู่บ้าน/หมู่ที่ จาก step 2
      apptaddr2: deliveryData.soi1 || '', // ซอย จาก step 2
      apptkwang: deliveryData.kwang1 || '', // แขวง/ตำบล จาก step 2
      apptkate: deliveryData.kate1 || '', // เขต/อำเภอ จาก step 2
      appttumbon: '', // ค่าว่าง
      apptampur: '', // ค่าว่าง
      apptprov: deliveryData.province1 || '', // province จังหวัด จาก step 2
      apptzip: deliveryData.zipcode1 || '', // zipcode รหัสไปรษณีย์ จาก step 2
      apptremk1: '',
      apptremk2: '',
      aftdelical: false,
      aftdeliti: '',
      aftdelida: null,
      autobrt9: false,
      autobrt9da: null,
      autobrt9ti: '',
      autobrt9by: '',
      deliver: false,
      deliverid: 0, // เก็บค่า integer
      deliverda: null,
      deliverti: '',
      deliverby: '',
      receive: false,
      receiveda: null,
      receiveti: '',
      receiveby: '',
      update: false,
      updateda: null,
      updateti: '',
      updateby: '',
      finance: false,
      financetyp: Number(paymentData.financeType) || 0,
      financedes: paymentData.financeDesc || '',
      financeda: workDate, // วันที่บันทึกข้อมูล
      financeti: workTime, // เวลาที่บันทึกข้อมูล
      financeby: paymentData.accode || '', // ค่า accode ของตัวเลือกที่เลือกใน ประเภทการชำระเงิน step5/5
      prnorder: false,
      prnorddate: null, // เก็บค่า null
      prnordtime: 0, // เก็บค่า integer
      prnpick: false,
      prnpicdate: null, // เก็บค่า null
      prnpictime: '',
      prnsticker: false,
      prnstidate: null, // เก็บค่า null
      prnstitime: '', // เก็บค่าว่าง
      prnfinan: 0, // เก็บค่า integer
      prnfindate: null, // เก็บค่า null
      prnfintime: '', // เก็บค่าว่าง
      payflag: 0, // เก็บค่า integer
      paydate: null, // เก็บค่า null
      paytime: '', // เก็บค่าว่าง
      delvflag: 0, // เก็บค่า integer
      delvdate: null, // เก็บค่า null
      delvtime: '', // เก็บค่าว่าง
      taxinv: '', // เก็บค่าว่าง
      transfer: false, // เก็บค่าเป็น false โดยตั้งไว้เป็น false ไว้ก่อน
      scanflag: 0, // เก็บค่า integer
      scandate: null, // เก็บค่า null
      scantime: '', // เก็บค่าว่าง
      scanby: '', // เก็บค่าว่าง
      feed: 0, // เก็บค่า integer
      feedno: 0, // เก็บค่า integer
      feedback: 0, // เก็บค่า integer
      feeddesc: 0, // เก็บค่า integer
      feeddate: null, // เก็บค่า null
      feedtime: '', // เก็บค่าว่าง
      feedid: 0, // เก็บค่า integer
      feedmemo: '',
      weightloss: 0, // เก็บค่า integer
      weight: 0, // เก็บค่า integer
      remark1: shippingInfo.notify1 || '', // เก็บข้อมูลจาก แจ้งจัดของ 1 ใน step 4/5
      remark2: shippingInfo.notify2 || '', // เก็บข้อมูลจาก แจ้งจัดของ 2 ใน step 4/5
      statusid: 0, // เก็บค่า integer
      statusdesc: 0, // เก็บค่า integer
      finish: 0, // เก็บค่า integer
      mapstat: 0, // เก็บค่า integer
      uniqueid: 0, // เก็บค่า integer
      accprint: 0, // เก็บค่า integer
      accprintd: null, // เก็บค่า null
      accprintt: 0, // เก็บค่า integer
      nkprint: 0, // เก็บค่า integer
      nkprintd: null, // เก็บค่า null
      nkprintt: 0, // เก็บค่า integer
      routedate: null, // เก็บค่า null
      editno: 0, // เก็บค่า integer
      editflag: false,
      cnflag: false,
      emailaddr: customerData.email || '', // เก็บข้อมูลจาก อีเมล จากหน้า step 1/5
      followup: 0, // เก็บค่า 0
      followupdays: (() => {
        // เก็บค่าจาก Step 3: ติดตามผลใน X วัน
        const days = mediaChannelData.followUpDays;
        if (days !== null && days !== undefined && days !== '') {
          return Number(days) || null;
        }
        return null;
      })(), // จำนวนวันติดตามผล จาก Step 3
      symptom: shippingInfo.symptom || '', // อาการ/หมายเหตุ จาก Step 4
      urgency: shippingInfo.urgency || 'normal' // ระดับความเร่งด่วน จาก Step 4 (normal, booster, maintain)
    };

    // Insert into legacy_deliveries
      // Debug: Log the values being saved to database
      console.log('Values being saved to database:');
      console.log('prename:', deliveryRecord.prename);
      console.log('firstname:', deliveryRecord.firstname);
      console.log('lastname:', deliveryRecord.lastname);
      console.log('customerid:', deliveryRecord.customerid);

      // Create multiple records based on products
      const recordsToInsert = [];
      
      // 1. Add records for each product
      if (products.length) {
        for (const product of products) {
          const productRecord = { ...deliveryRecord };
          
          // Determine datadesc and datatype based on price and title
          if (product.price === 0 || product.price === '0' || product.price === 0.00) {
            productRecord.datadesc = 'ของแถม';
            productRecord.datatype = 2; // ของแถม
          } else {
            productRecord.datadesc = 'ขาย';
            productRecord.datatype = 1; // ขาย
          }
          
          // Check for specific patterns in title
          if (product.title && (product.title.includes('(FREE)') || product.title.includes('FREE'))) {
            productRecord.datadesc = 'ของแถม';
            productRecord.datatype = 2; // ของแถม
          }
          
          // Set product-specific fields
          productRecord.code = product.code || '';
          productRecord.title = product.title || '';
          productRecord.cost = product.cost || 0;
          productRecord.price = product.price || 0;
          productRecord.qty = product.qty || 1; // ใช้ qty ของสินค้าแต่ละรายการ
          productRecord.amount = (product.price || 0) * (product.qty || 1);
          
          recordsToInsert.push(productRecord);
        }
      }
      
      // 2. Add shipping cost record if there are products and shipping cost > 0 and not marked as no charge
      const shippingCostAmount = parseFloat(shippingInfo.shippingCost || 0);
      const noCharge = shippingInfo.noCharge || false;
      console.log('Shipping cost amount:', shippingCostAmount);
      console.log('No charge flag:', noCharge);
      console.log('Shipping data:', shippingInfo);
      
      // Always add shipping record if there are products, regardless of cost
      if (recordsToInsert.length > 0) {
        const shippingRecord = { ...deliveryRecord };
        shippingRecord.datadesc = 'ค่าส่ง';
        shippingRecord.datatype = 11; // ค่าส่ง
        shippingRecord.code = '11344';
        shippingRecord.title = 'ไม่คิดค่าส่ง';
        shippingRecord.cost = 0.00;
        shippingRecord.price = 0.00;
        shippingRecord.amount = 0.00;
        
        recordsToInsert.push(shippingRecord);
        console.log('Added shipping record (always added when products exist)');
      } else {
        console.log('No shipping cost record added - no products found');
      }
      
      // If no products, create a default record
      if (recordsToInsert.length === 0) {
        recordsToInsert.push(deliveryRecord);
      }

      // Insert all records with schema-aware sanitization (avoids strict-mode errors)
      for (const record of recordsToInsert) {
        const sanitizedRecord = sanitizePayload(deliveriesTable, record);
        const { sql, values } = buildInsertStatement(deliveriesTable, sanitizedRecord);

        console.log('🔍 Debug - Sanitized record preview:', Object.entries(sanitizedRecord).slice(0, 10));

        await pool.execute(sql, values);
        console.log(`Inserted record with datadesc: ${record.datadesc}, code: ${record.code}, title: ${record.title}`);
      }

    res.json({ 
      success: true, 
      message: `บันทึกข้อมูลสำเร็จ - สร้าง ${recordsToInsert.length} รายการ`,
      deliverNum: deliverNum,
      total: total,
      recordsCreated: recordsToInsert.length,
      records: recordsToInsert.map(record => ({
        datadesc: record.datadesc,
        code: record.code,
        title: record.title,
        amount: record.amount
      }))
    });

  } catch (err) {
    console.error('Error saving workflow data:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save workflow data',
      details: err.message 
    });
  }
});

module.exports = router;




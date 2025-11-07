const express = require('express');
const pool = require('../db');

const router = express.Router();

// List customers (return rich fields; dashboard may use a subset)
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, customer_code, prefix, first_name, last_name, 
              CONCAT(COALESCE(prefix,''),' ',COALESCE(first_name,''),' ',COALESCE(last_name,'')) AS full_name,
              email, mobile, line_id, dob, addr1,
              house_no, village, building, alley, road, subdistrict, district, province, postal_code,
              gender, height_cm, weight_kg, disease1, disease2, tag,
              created_at
         FROM customers
        ORDER BY id DESC`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// Get by id (full fields)
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ? LIMIT 1', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// Create customer (simple create; addr1 auto-derives if not provided)
router.post('/', async (req, res, next) => {
  try {
    const {
      customer_code,
      prefix, first_name, last_name,
      email, mobile, line_id, dob,
      house_no, village, building, alley, road, subdistrict, district, province, postal_code,
      gender, height_cm, weight_kg, disease1, disease2, tag,
      addr1
    } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'first_name and last_name required' });
    }

    const addrParts = [house_no, village, building, alley, road, subdistrict, district, province, postal_code]
      .map(x => (x ? String(x).trim() : ''))
      .filter(Boolean);
    const addr1Value = addr1 ? String(addr1).trim() : addrParts.join(' ');

    const sql = `INSERT INTO customers (
      customer_code, prefix, first_name, last_name,
      email, mobile, line_id, dob,
      house_no, village, building, alley, road, subdistrict, district, province, postal_code,
      gender, height_cm, weight_kg, disease1, disease2, tag, addr1
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

    const params = [
      customer_code ? String(customer_code).trim() : null,
      prefix ? String(prefix).trim() : null,
      String(first_name).trim(),
      String(last_name).trim(),
      email ? String(email).trim() : null,
      mobile ? String(mobile).trim() : null,
      line_id ? String(line_id).trim() : null,
      dob ? String(dob) : null,
      house_no ? String(house_no).trim() : null,
      village ? String(village).trim() : null,
      building ? String(building).trim() : null,
      alley ? String(alley).trim() : null,
      road ? String(road).trim() : null,
      subdistrict ? String(subdistrict).trim() : null,
      district ? String(district).trim() : null,
      province ? String(province).trim() : null,
      postal_code ? String(postal_code).trim() : null,
      gender ? String(gender).trim() : null,
      height_cm != null ? Number(height_cm) : null,
      weight_kg != null ? Number(weight_kg) : null,
      disease1 ? String(disease1).trim() : null,
      disease2 ? String(disease2).trim() : null,
      tag ? String(tag).trim() : null,
      addr1Value || null
    ];

    const [r] = await pool.execute(sql, params);
    res.status(201).json({ id: r.insertId, first_name, last_name, mobile, email });
  } catch (err) { next(err); }
});

// Update customer (partial)
router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const allowed = [
      'customer_code','prefix','first_name','last_name','email','mobile','line_id','dob',
      'house_no','village','building','alley','road','subdistrict','district','province','postal_code',
      'gender','height_cm','weight_kg','disease1','disease2','tag','addr1'
    ];
    const fields = [];
    const values = [];
    // If addr1 omitted, rebuild from parts if any of parts provided
    let needAddr1FromParts = false;
    const parts = ['house_no','village','building','alley','road','subdistrict','district','province','postal_code'];
    for (const k of allowed) {
      if (req.body[k] !== undefined && k !== 'addr1') {
        let v = req.body[k];
        if (k === 'height_cm' || k === 'weight_kg') v = v === '' ? null : Number(v);
        fields.push(`${k} = ?`);
        values.push(v === '' ? null : v);
        if (parts.includes(k)) needAddr1FromParts = true;
      }
    }
    if (req.body.addr1 !== undefined) {
      fields.push('addr1 = ?');
      values.push(req.body.addr1 === '' ? null : String(req.body.addr1).trim());
    } else if (needAddr1FromParts) {
      const get = (k) => (req.body[k] ? String(req.body[k]).trim() : null);
      const addr1Value = [get('house_no'), get('village'), get('building'), get('alley'), get('road'), get('subdistrict'), get('district'), get('province'), get('postal_code')]
        .filter(Boolean).join(' ');
      if (addr1Value) { fields.push('addr1 = ?'); values.push(addr1Value); }
    }
    if (!fields.length) return res.status(400).json({ error: 'Nothing to update' });
    values.push(id);
    const [r] = await pool.execute(`UPDATE customers SET ${fields.join(', ')} WHERE id = ?`, values);
    if (!r.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ id, updated: true });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [r] = await pool.execute('DELETE FROM customers WHERE id = ?', [id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ id, deleted: true });
  } catch (err) { next(err); }
});

module.exports = router;

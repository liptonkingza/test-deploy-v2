const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, address, status, created_at FROM shipments ORDER BY id DESC');
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { address, status } = req.body;
    if (!address) return res.status(400).json({ error: 'address required' });
    const [r] = await pool.execute('INSERT INTO shipments (address, status) VALUES (?, ?)', [String(address).trim(), status ? String(status).trim() : 'pending']);
    res.status(201).json({ id: r.insertId, address, status: status || 'pending' });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [r] = await pool.execute('DELETE FROM shipments WHERE id = ?', [id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ id, deleted: true });
  } catch (err) { next(err); }
});

module.exports = router;


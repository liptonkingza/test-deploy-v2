const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, number, total, issued_at FROM invoices ORDER BY id DESC');
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { number, total } = req.body;
    const ttl = Number(total);
    if (!number || !Number.isFinite(ttl)) return res.status(400).json({ error: 'number and total required' });
    const [r] = await pool.execute('INSERT INTO invoices (number, total) VALUES (?, ?)', [String(number).trim(), ttl]);
    res.status(201).json({ id: r.insertId, number, total: ttl });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [r] = await pool.execute('DELETE FROM invoices WHERE id = ?', [id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ id, deleted: true });
  } catch (err) { next(err); }
});

module.exports = router;


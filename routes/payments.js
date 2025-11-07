const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, amount, method, created_at FROM payments ORDER BY id DESC');
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { amount, method } = req.body;
    const amt = Number(amount);
    if (!Number.isFinite(amt) || !method) return res.status(400).json({ error: 'amount and method required' });
    const [r] = await pool.execute('INSERT INTO payments (amount, method) VALUES (?, ?)', [amt, String(method).trim()]);
    res.status(201).json({ id: r.insertId, amount: amt, method });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [r] = await pool.execute('DELETE FROM payments WHERE id = ?', [id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ id, deleted: true });
  } catch (err) { next(err); }
});

module.exports = router;


const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, title, url, created_at FROM media ORDER BY id DESC');
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, url } = req.body;
    if (!title || !url) return res.status(400).json({ error: 'title and url required' });
    const [r] = await pool.execute('INSERT INTO media (title, url) VALUES (?, ?)', [String(title).trim(), String(url).trim()]);
    res.status(201).json({ id: r.insertId, title, url });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [r] = await pool.execute('DELETE FROM media WHERE id = ?', [id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ id, deleted: true });
  } catch (err) { next(err); }
});

module.exports = router;


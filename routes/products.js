const express = require('express');
const pool = require('../db');

const router = express.Router();

// List products
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, price, created_at FROM products ORDER BY id DESC'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Get product by id
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [rows] = await pool.execute(
      'SELECT id, name, price, created_at FROM products WHERE id = ? LIMIT 1',
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Create product
router.post('/', async (req, res, next) => {
  try {
    const { name, price } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Invalid name' });
    }
    const priceNum = Number(price);
    if (!Number.isFinite(priceNum)) {
      return res.status(400).json({ error: 'Invalid price' });
    }
    const [result] = await pool.execute(
      'INSERT INTO products (name, price) VALUES (?, ?)',
      [name.trim(), priceNum]
    );
    res.status(201).json({ id: result.insertId, name: name.trim(), price: priceNum });
  } catch (err) {
    next(err);
  }
});

// Update product
router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name, price } = req.body;
    const fields = [];
    const values = [];
    if (name !== undefined) { fields.push('name = ?'); values.push(String(name).trim()); }
    if (price !== undefined) {
      const priceNum = Number(price);
      if (!Number.isFinite(priceNum)) return res.status(400).json({ error: 'Invalid price' });
      fields.push('price = ?'); values.push(priceNum);
    }
    if (!fields.length) return res.status(400).json({ error: 'Nothing to update' });
    values.push(id);
    const [result] = await pool.execute(
      `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ id, updated: true });
  } catch (err) {
    next(err);
  }
});

// Delete product
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ id, deleted: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;


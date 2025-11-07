const express = require('express');
const pool = require('../db');
const {
  legacyTables,
  sanitizePayload,
  buildInsertStatement,
  buildUpdateStatement,
} = require('../lib/legacy/tableManager');

function getTableConfig(tableKey) {
  const table = legacyTables.find((t) => t.key === tableKey);
  if (!table) {
    throw new Error(`Legacy table config not found for key: ${tableKey}`);
  }
  return table;
}

function toSafeLimit(value, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return fallback;
  return Math.min(Math.floor(num), 500);
}

function getSessionOperator(req) {
  const operator = req?.session?.user?.operator;
  if (operator == null) return null;
  const trimmed = String(operator).trim();
  return trimmed || null;
}

async function generateNextCustomerId(tableName) {
  const [rows] = await pool.query(
    `SELECT customerid FROM \`${tableName}\` WHERE customerid REGEXP '^[0-9]+$' ORDER BY CAST(customerid AS UNSIGNED) DESC LIMIT 1`
  );
  const current = rows.length && rows[0].customerid != null ? String(rows[0].customerid).trim() : '';
  const currentNum = current && Number.isFinite(Number.parseInt(current, 10)) ? Number.parseInt(current, 10) : 0;
  const nextNum = currentNum + 1;
  // Use 10-digit padding for customerid
  return String(nextNum).padStart(10, '0');
}

async function prepareCustomerPayload(req, table, sanitized, options = {}) {
  if (!sanitized || table.key !== 'customers') return sanitized;

  if (Object.prototype.hasOwnProperty.call(sanitized, 'customerid')) {
    const raw = sanitized.customerid == null ? '' : String(sanitized.customerid).trim();
    if (raw) {
      sanitized.customerid = raw;
    } else {
      delete sanitized.customerid;
    }
  }

  const operator = getSessionOperator(req);
  if (operator) {
    sanitized.operator = operator;
  }

  sanitized.source = '5';
  // ใช้เวลาไทย (UTC+7) ด้วย toLocaleString
  const now = new Date();
  const thaiDate = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Bangkok"}));
  if (!('signdate' in sanitized)) {
    sanitized.signdate = thaiDate.toISOString().replace('T', ' ').slice(0, 19);
  }

  if (!options.isUpdate) {
    if (!('workdate' in sanitized)) sanitized.workdate = thaiDate.toISOString().slice(0, 10);
    if (!('worktime' in sanitized)) sanitized.worktime = thaiDate.toTimeString().slice(0, 8);
    if (!('customerid' in sanitized)) {
      sanitized.customerid = await generateNextCustomerId(table.tableName);
    }
  }

  if (options.isUpdate) {
    sanitized.signdate = thaiDate.toISOString().replace('T', ' ').slice(0, 19);
  }

  return sanitized;
}

function createLegacyRouter(tableKey) {
  const table = getTableConfig(tableKey);
  const router = express.Router();
  const selectColumns = Array.from(new Set(['id', ...(table.displayColumns || [])]));
  const selectList = selectColumns.map((col) => `\`${col}\``).join(', ');
  const orderClause = table.defaultOrder || '`id` DESC';

  router.get('/', async (req, res, next) => {
    try {
      const limit = toSafeLimit(req.query.limit, 50);
      const [rows] = await pool.query(
        `SELECT ${selectList} FROM \`${table.tableName}\` ORDER BY ${orderClause} LIMIT ?`,
        [limit]
      );
      res.json(rows);
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'Invalid id' });
      }
      const [rows] = await pool.query(`SELECT * FROM \`${table.tableName}\` WHERE \`id\` = ? LIMIT 1`, [id]);
      if (!rows.length) return res.status(404).json({ error: 'Not found' });
      res.json(rows[0]);
    } catch (err) {
      next(err);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const sanitized = sanitizePayload(table, req.body);
      await prepareCustomerPayload(req, table, sanitized, { isUpdate: false });
      const { sql, values } = buildInsertStatement(table, sanitized);
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

  router.put('/:id', async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'Invalid id' });
      }
      const sanitized = sanitizePayload(table, req.body);
      await prepareCustomerPayload(req, table, sanitized, { isUpdate: true });
      const { sql, values } = buildUpdateStatement(table, sanitized, id);
      const [result] = await pool.query(sql, values);
      if (!result.affectedRows) return res.status(404).json({ error: 'Not found' });
      res.json({ id, updated: true });
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

  router.delete('/:id', async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'Invalid id' });
      }
      const [result] = await pool.query(`DELETE FROM \`${table.tableName}\` WHERE \`id\` = ?`, [id]);
      if (!result.affectedRows) return res.status(404).json({ error: 'Not found' });
      res.json({ id, deleted: true });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = createLegacyRouter;


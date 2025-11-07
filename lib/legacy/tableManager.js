const { legacyTables } = require('./schema');

function normalizeNullish(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  return value;
}

function coerceValue(column, rawValue) {
  const value = normalizeNullish(rawValue);
  if (value === null) return null;
  switch (column.dbfType) {
    case 'Character':
    case 'Memo':
      return String(value).trim();
    case 'Numeric': {
      if (column.decimals > 0) {
        const num = Number(value);
        if (Number.isNaN(num)) throw new Error(`Invalid numeric value for ${column.name}`);
        return num;
      }
      const intVal = Number.parseInt(value, 10);
      if (Number.isNaN(intVal)) throw new Error(`Invalid integer value for ${column.name}`);
      return intVal;
    }
    case 'Logical': {
      if (typeof value === 'boolean') return value ? 1 : 0;
      if (typeof value === 'number') return value ? 1 : 0;
      const valStr = String(value).trim().toLowerCase();
      if (['1', 'y', 'yes', 'true', 't'].includes(valStr)) return 1;
      if (['0', 'n', 'no', 'false', 'f'].includes(valStr)) return 0;
      throw new Error(`Invalid logical value for ${column.name}`);
    }
    case 'Date':
      return String(value).slice(0, 10);
    case 'General':
      if (Buffer.isBuffer(value)) return value;
      throw new Error(`Binary value required for ${column.name}`);
    default:
      return value;
  }
}

function sanitizePayload(table, payload) {
  const sanitized = {};
  const input = payload || {};
  const columnMap = table.columnMap;
  for (const [key, value] of Object.entries(input)) {
    const normalizedKey = String(key || '');
    const column =
      columnMap.get(normalizedKey) ||
      columnMap.get(normalizedKey.toLowerCase()) ||
      columnMap.get(normalizedKey.toUpperCase());
    if (!column) continue;
    sanitized[column.name] = coerceValue(column, value);
  }
  return sanitized;
}

function buildInsertStatement(table, data) {
  const entries = Object.entries(data);
  if (!entries.length) {
    throw new Error('No valid fields provided for insert');
  }
  const columns = entries.map(([key]) => `\`${key}\``).join(', ');
  const placeholders = entries.map(() => '?').join(', ');
  const values = entries.map(([, value]) => value);
  const sql = `INSERT INTO \`${table.tableName}\` (${columns}) VALUES (${placeholders})`;
  return { sql, values };
}

function buildUpdateStatement(table, data, id) {
  const entries = Object.entries(data);
  if (!entries.length) {
    throw new Error('No valid fields provided for update');
  }
  const assignments = entries.map(([key]) => `\`${key}\` = ?`).join(', ');
  const values = entries.map(([, value]) => value);
  values.push(id);
  const sql = `UPDATE \`${table.tableName}\` SET ${assignments} WHERE \`id\` = ?`;
  return { sql, values };
}

async function ensureLegacyTables(pool) {
  for (const table of legacyTables) {
    await pool.query(table.createTableSql);
  }
}

module.exports = {
  legacyTables,
  ensureLegacyTables,
  sanitizePayload,
  buildInsertStatement,
  buildUpdateStatement,
};

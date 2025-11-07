const tableConfigs = require('./schemaData.json');

function buildCreateTableStatement(tableName, columns, uniqueKeys) {
  const columnSql = columns
    .map((col) => `  \`${col.name}\` ${col.mysqlType} ${col.allowNull === false ? 'NOT NULL' : 'DEFAULT NULL'}`)
    .join(',\n');
  const uniqueSql = (uniqueKeys || [])
    .map((key) => {
      const columnName = String(key).toLowerCase();
      return `  UNIQUE KEY \`uniq_${tableName}_${columnName}\` (\`${columnName}\`)`;
    })
    .join(',\n');
  const constraints = uniqueSql ? `,\n${uniqueSql}` : '';
  return `CREATE TABLE IF NOT EXISTS \`${tableName}\` (\n  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,\n${columnSql},\n  PRIMARY KEY (\`id\`)${constraints}\n\) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;
}

const legacyTables = tableConfigs.map((cfg) => {
  const columns = cfg.columns.map((col) => ({ ...col }));
  const columnMap = new Map();
  columns.forEach((col) => {
    columnMap.set(col.name, col);
    columnMap.set(col.name.toUpperCase(), col);
  });
  return {
    ...cfg,
    columns,
    columnMap,
    createTableSql: buildCreateTableStatement(cfg.tableName, columns, cfg.uniqueKeys),
  };
});

function getTableByKey(key) {
  return legacyTables.find((tbl) => tbl.key === key);
}

module.exports = {
  legacyTables,
  getTableByKey,
};

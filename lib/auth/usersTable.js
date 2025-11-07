const USERS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  operator VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  pn_id CHAR(4) NOT NULL UNIQUE,
  source DATE NOT NULL,
  level VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

async function ensureAuthTables(pool) {
  await pool.query(USERS_TABLE_SQL);
}

module.exports = {
  ensureAuthTables,
};


#!/usr/bin/env node

/**
 * Database Setup Script for Railway
 * This script helps set up the database tables and initial data
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function setupDatabase() {
  console.log('🔧 Setting up database...');
  
  // Database configuration
  const config = {
    host: process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
    port: process.env.DB_PORT || process.env.MYSQL_PORT || 3306,
    user: process.env.DB_USER || process.env.MYSQL_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'siamdrug',
    multipleStatements: true
  };

  console.log('📊 Database Configuration:');
  console.log(`Host: ${config.host}`);
  console.log(`Port: ${config.port}`);
  console.log(`User: ${config.user}`);
  console.log(`Database: ${config.database}`);

  try {
    // Test connection
    console.log('🔌 Testing database connection...');
    const connection = await mysql.createConnection(config);
    console.log('✅ Database connection successful!');

    // Create tables
    console.log('📋 Creating tables...');
    
    // Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        operator VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        pn_id CHAR(4) NOT NULL UNIQUE,
        source DATE NOT NULL,
        level VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Customers table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_code VARCHAR(20) UNIQUE,
        prefix VARCHAR(50),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        mobile VARCHAR(50),
        line_id VARCHAR(100),
        dob DATE,
        house_no VARCHAR(50),
        village VARCHAR(50),
        building VARCHAR(100),
        alley VARCHAR(100),
        road VARCHAR(100),
        subdistrict VARCHAR(100),
        district VARCHAR(100),
        province VARCHAR(100),
        postal_code VARCHAR(10),
        gender VARCHAR(10),
        height_cm DECIMAL(5,2),
        weight_kg DECIMAL(5,2),
        disease1 VARCHAR(255),
        disease2 VARCHAR(255),
        tag VARCHAR(255),
        addr1 VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Legacy customers table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS legacy_customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        CUSTOMERID VARCHAR(20) UNIQUE,
        PRENAME VARCHAR(50),
        FIRSTNAME VARCHAR(100),
        LASTNAME VARCHAR(100),
        MOBILETEL VARCHAR(50),
        EMAIL VARCHAR(255),
        LINEID VARCHAR(100),
        BIRTHDAY DATE,
        SEX VARCHAR(10),
        AGE INT,
        WEIGHT DECIMAL(5,2),
        HEIGHT DECIMAL(5,2),
        HOMENUM VARCHAR(50),
        MOO VARCHAR(50),
        BUILDING VARCHAR(100),
        SOI VARCHAR(100),
        ROAD VARCHAR(100),
        KWANG VARCHAR(100),
        KATE VARCHAR(100),
        PROVINCE VARCHAR(100),
        ZIPCODE VARCHAR(10),
        ADDR1 VARCHAR(255),
        ADDR2 VARCHAR(255),
        ADDR3 VARCHAR(255),
        ADDR4 VARCHAR(255),
        ADDR5 VARCHAR(255),
        OPERATOR VARCHAR(50),
        SALEREPID VARCHAR(50),
        SOURCE INT DEFAULT 5,
        SICKNESS1 VARCHAR(255),
        SICKNESS2 VARCHAR(255),
        CUSTTAG VARCHAR(255),
        BANED TINYINT(1) DEFAULT 0,
        BANREMARK TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Legacy deliveries table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS legacy_deliveries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        delivernum VARCHAR(20) UNIQUE,
        operator VARCHAR(50),
        prename VARCHAR(50),
        firstname VARCHAR(100),
        lastname VARCHAR(100),
        apptdate DATE,
        mediadesc VARCHAR(255),
        total DECIMAL(10,2),
        shipdesc VARCHAR(100),
        apptaddr TEXT,
        customerid VARCHAR(20),
        gender VARCHAR(10),
        age INT,
        weight DECIMAL(5,2),
        height DECIMAL(5,2),
        tag VARCHAR(255),
        disease1 VARCHAR(255),
        disease2 VARCHAR(255),
        lineid VARCHAR(100),
        symptoms TEXT,
        pain_level INT,
        keyword VARCHAR(255),
        followup TEXT,
        method VARCHAR(100),
        remark1 TEXT,
        channel VARCHAR(100),
        datadesc TEXT,
        workdate DATE,
        worktime TIME,
        code VARCHAR(50),
        title VARCHAR(255),
        price DECIMAL(10,2),
        qty INT,
        amount DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Other tables...
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS shipments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        address VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS media (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        url VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        amount DECIMAL(10,2) NOT NULL,
        method VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        number VARCHAR(50) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ All tables created successfully!');

    // Insert sample data
    console.log('🌱 Inserting sample data...');
    
    // Sample user
    await connection.execute(`
      INSERT IGNORE INTO users (operator, password_hash, pn_id, source, level) 
      VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0001', CURDATE(), 'admin')
    `);

    console.log('✅ Sample data inserted!');
    console.log('🎉 Database setup completed successfully!');
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('💡 Make sure your database credentials are correct');
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;

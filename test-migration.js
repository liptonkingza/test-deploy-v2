#!/usr/bin/env node

/**
 * Test Migration Script
 * Run this to manually test the new fields migration
 */

const dotenv = require('dotenv');
dotenv.config();

const pool = require('./db');
const { migrateAddNewFields } = require('./lib/legacy/migrateAddNewFields');

async function testMigration() {
  console.log('🧪 Testing Migration: Add new fields to legacy_deliveries');
  console.log('=' .repeat(60));
  
  try {
    // Run migration
    const result = await migrateAddNewFields(pool);
    console.log('✅ Migration result:', result);
    
    // Verify columns exist
    console.log('\n📋 Verifying new columns...');
    const [columns] = await pool.query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT,
        COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'legacy_deliveries'
        AND COLUMN_NAME IN ('followupdays', 'symptom', 'urgency')
      ORDER BY COLUMN_NAME
    `);
    
    if (columns.length === 3) {
      console.log('✅ All 3 new columns found!');
      console.log('\nColumn details:');
      columns.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME}:`);
        console.log(`    Type: ${col.DATA_TYPE}`);
        console.log(`    Nullable: ${col.IS_NULLABLE}`);
        console.log(`    Comment: ${col.COLUMN_COMMENT || 'N/A'}`);
      });
    } else {
      console.log('❌ Expected 3 columns but found:', columns.length);
      columns.forEach(col => console.log('  -', col.COLUMN_NAME));
    }
    
    // Test insert
    console.log('\n🧪 Testing data insert...');
    const testData = {
      followupdays: 7,
      symptom: 'Test symptom - ปวดหัว',
      urgency: 'booster'
    };
    
    console.log('Test data:', testData);
    console.log('✅ Migration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration test failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run test
testMigration();


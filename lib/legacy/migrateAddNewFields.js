/**
 * Migration Script: Add new fields to legacy_deliveries table
 * - followupdays: จำนวนวันติดตามผล (from Step 3)
 * - symptom: อาการ/หมายเหตุ (from Step 4)
 * - urgency: ระดับความเร่งด่วน (from Step 4)
 */

async function migrateAddNewFields(pool) {
  console.log('🔄 Checking for new fields in legacy_deliveries...');
  
  try {
    // Check if columns already exist
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'legacy_deliveries'
        AND COLUMN_NAME IN ('followupdays', 'symptom', 'urgency')
    `);
    
    const existingColumns = columns.map(row => row.COLUMN_NAME);
    console.log('📋 Existing new columns:', existingColumns);
    
    // Add followupdays if not exists
    if (!existingColumns.includes('followupdays')) {
      console.log('➕ Adding column: followupdays');
      await pool.query(`
        ALTER TABLE legacy_deliveries 
        ADD COLUMN followupdays INT DEFAULT NULL 
        COMMENT 'จำนวนวันติดตามผล (Step 3)'
      `);
      console.log('✅ Added followupdays column');
    } else {
      console.log('⏭️  Column followupdays already exists');
    }
    
    // Add symptom if not exists
    if (!existingColumns.includes('symptom')) {
      console.log('➕ Adding column: symptom');
      await pool.query(`
        ALTER TABLE legacy_deliveries 
        ADD COLUMN symptom TEXT DEFAULT NULL 
        COMMENT 'อาการ/หมายเหตุ (Step 4)'
      `);
      console.log('✅ Added symptom column');
    } else {
      console.log('⏭️  Column symptom already exists');
    }
    
    // Add urgency if not exists
    if (!existingColumns.includes('urgency')) {
      console.log('➕ Adding column: urgency');
      await pool.query(`
        ALTER TABLE legacy_deliveries 
        ADD COLUMN urgency VARCHAR(20) DEFAULT NULL 
        COMMENT 'ระดับความเร่งด่วน: normal, booster, maintain (Step 4)'
      `);
      console.log('✅ Added urgency column');
    } else {
      console.log('⏭️  Column urgency already exists');
    }
    
    console.log('✅ Migration completed successfully!');
    return { success: true, message: 'Migration completed' };
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

module.exports = { migrateAddNewFields };


/**
 * สคริปต์สำหรับแก้ไข SQL dump file
 * แทนที่ '0000-00-00' ด้วย NULL สำหรับคอลัมน์ date
 * 
 * วิธีใช้:
 * 1. Export database จาก XAMPP เป็น SQL file
 * 2. รันคำสั่ง: node fix-sql-dump.js input.sql output.sql
 */

const fs = require('fs');
const path = require('path');

// รับ arguments จาก command line
const inputFile = process.argv[2];
const outputFile = process.argv[3];

if (!inputFile || !outputFile) {
  console.error('Usage: node fix-sql-dump.js <input.sql> <output.sql>');
  console.error('');
  console.error('Example:');
  console.error('  node fix-sql-dump.js dump.sql dump-fixed.sql');
  process.exit(1);
}

if (!fs.existsSync(inputFile)) {
  console.error(`Error: File not found: ${inputFile}`);
  process.exit(1);
}

console.log('Reading SQL dump file...');
let sqlContent = fs.readFileSync(inputFile, 'utf8');

console.log('Fixing date values...');

// แทนที่ '0000-00-00' ด้วย NULL ใน INSERT statements
// รูปแบบ: '0000-00-00' -> NULL
sqlContent = sqlContent.replace(/'0000-00-00'/g, 'NULL');

// แทนที่ "0000-00-00" ด้วย NULL (กรณีใช้ double quotes)
sqlContent = sqlContent.replace(/"0000-00-00"/g, 'NULL');

// แทนที่ 0000-00-00 (ไม่มี quotes) ด้วย NULL
sqlContent = sqlContent.replace(/\b0000-00-00\b/g, 'NULL');

// แก้ไข DEFAULT '0000-00-00' ใน CREATE TABLE statements
sqlContent = sqlContent.replace(/DEFAULT\s+'0000-00-00'/gi, 'DEFAULT NULL');
sqlContent = sqlContent.replace(/DEFAULT\s+"0000-00-00"/gi, 'DEFAULT NULL');
sqlContent = sqlContent.replace(/DEFAULT\s+0000-00-00/gi, 'DEFAULT NULL');

// แก้ไขคอลัมน์ date ที่เป็น NOT NULL ให้เป็น NULL ได้
// สำหรับคอลัมน์ source ในตาราง users
sqlContent = sqlContent.replace(
  /`source`\s+DATE\s+NOT\s+NULL/gi,
  '`source` DATE NULL'
);

console.log('Writing fixed SQL dump file...');
fs.writeFileSync(outputFile, sqlContent, 'utf8');

console.log(`✅ Fixed SQL dump saved to: ${outputFile}`);
console.log('');
console.log('Next steps:');
console.log('1. เปิดไฟล์ output.sql ใน MySQL Workbench');
console.log('2. ตรวจสอบว่าค่า 0000-00-00 ถูกแทนที่ด้วย NULL แล้ว');
console.log('3. Import ไฟล์ที่แก้ไขแล้วเข้า Railway database');


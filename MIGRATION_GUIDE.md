# คู่มือการย้าย Database จาก XAMPP ไป Railway

## ปัญหาที่พบ
MySQL บน Railway ใช้ strict mode ซึ่งไม่อนุญาตค่า `'0000-00-00'` ในคอลัมน์ date

## วิธีแก้ไข

### วิธีที่ 1: แก้ไข SQL Dump ก่อน Import (แนะนำ)

1. **Export database จาก XAMPP**
   - เปิด phpMyAdmin หรือ MySQL Workbench
   - Export database เป็น SQL file

2. **แก้ไข SQL dump ด้วยสคริปต์**
   ```bash
   node fix-sql-dump.js your-dump.sql fixed-dump.sql
   ```

3. **Import ไฟล์ที่แก้ไขแล้ว**
   - เปิด MySQL Workbench
   - เชื่อมต่อกับ Railway database
   - Import ไฟล์ `fixed-dump.sql`

### วิธีที่ 2: แก้ไขด้วย MySQL Workbench

1. **Export จาก XAMPP**
   - Export database เป็น SQL file

2. **แก้ไข SQL file ด้วย text editor**
   - เปิดไฟล์ SQL ด้วย Notepad++ หรือ VS Code
   - ค้นหาและแทนที่:
     - `'0000-00-00'` → `NULL`
     - `"0000-00-00"` → `NULL`
     - `0000-00-00` → `NULL`
   - แก้ไข CREATE TABLE statement:
     - `source DATE NOT NULL` → `source DATE NULL`

3. **Import ไฟล์ที่แก้ไขแล้ว**

### วิธีที่ 3: แก้ไขหลัง Import (ถ้ายังมีปัญหา)

1. **Import ข้อมูลปกติ** (อาจจะมี error บางส่วน)

2. **รัน SQL script เพื่อแก้ไข**
   ```sql
   -- เปิด MySQL Workbench และเชื่อมต่อกับ Railway database
   -- รันคำสั่งจากไฟล์ fix-database-dates.sql
   ```

3. **อัปเดตข้อมูลที่เหลือ**
   ```sql
   UPDATE `users` SET `source` = NULL WHERE `source` = '0000-00-00';
   ```

## ขั้นตอนการ Import ใน MySQL Workbench

1. **เชื่อมต่อกับ Railway Database**
   - เปิด MySQL Workbench
   - สร้าง connection ใหม่:
     - Host: `containers-us-west-xxx.railway.app` (จาก Railway dashboard)
     - Port: `3306` (หรือ port ที่ Railway กำหนด)
     - Username: `root` (หรือ username จาก Railway)
     - Password: (password จาก Railway)

2. **Import ไฟล์ SQL (วิธีที่ถูกต้อง)**

   **วิธีที่ 1: ใช้ Server > Data Import (แนะนำ)**
   - ไปที่เมนู **Server** > **Data Import**
   - เลือก **Import from Self-Contained File**
   - คลิก **...** เพื่อเลือกไฟล์ SQL (`sql/users (1).sql`)
   - เลือก **Default Target Schema** เป็น `railway` (หรือชื่อ database ของคุณ)
   - คลิก **Start Import** ที่มุมล่างขวา
   - รอจนเสร็จ (จะเห็น progress bar)

   **วิธีที่ 2: เปิดไฟล์ SQL แล้วรัน**
   - ไปที่เมนู **File** > **Open SQL Script**
   - เลือกไฟล์ `sql/users (1).sql`
   - ตรวจสอบว่าเลือก schema `railway` ไว้ (ดูที่แถบด้านบน)
   - กด **Ctrl+Shift+Enter** หรือคลิกปุ่ม ⚡ (Execute) เพื่อรันสคริปต์
   - รอจนเสร็จ

   ⚠️ **หมายเหตุ**: อย่าใช้ "Table Data Import Wizard" เพราะมันรองรับเฉพาะ CSV/JSON ไม่รองรับไฟล์ SQL

## ตรวจสอบผลลัพธ์

```sql
-- ตรวจสอบว่ามีข้อมูลถูก import แล้ว
SELECT COUNT(*) FROM `users`;

-- ตรวจสอบว่ามีค่า NULL ในคอลัมน์ source
SELECT id, operator, pn_id, source, level 
FROM `users` 
WHERE `source` IS NULL;
```

## หมายเหตุ

- หลังจากแก้ไขแล้ว คอลัมน์ `source` จะเป็น `NULL` แทน `'0000-00-00'`
- ตรวจสอบว่า application code รองรับ `NULL` ในคอลัมน์ `source` หรือไม่
- ถ้า application ต้องการค่า date เสมอ อาจต้องตั้งค่า default เป็น `CURRENT_DATE` แทน


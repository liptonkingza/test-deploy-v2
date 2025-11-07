# คู่มือการย้ายข้อมูลจาก XAMPP ไปยัง Railway

## ปัญหาที่พบ
เมื่อย้ายข้อมูลจาก MySQL ใน XAMPP ไปยัง MySQL บน Railway โดยใช้ MySQL Workbench พบข้อผิดพลาด:
```
Incorrect date value: '0000-00-00' for column 'source' at row 1
```

## สาเหตุ
- MySQL บน Railway ใช้ strict mode ที่ไม่ยอมรับค่า date `'0000-00-00'`
- คอลัมน์ `source` ในตาราง `users` ถูกกำหนดเป็น `DATE NOT NULL` ซึ่งไม่สามารถรับค่า `'0000-00-00'` ได้

## วิธีแก้ไข

### ขั้นตอนที่ 1: แก้ไขโครงสร้างตารางบน Railway

1. เปิด **MySQL Workbench** และเชื่อมต่อกับ Railway database
2. เปิดไฟล์ `migrate-users-source-column.sql` 
3. รันคำสั่ง SQL เพื่อแก้ไขคอลัมน์ `source` ให้รองรับ `NULL`:

```sql
ALTER TABLE railway.users 
MODIFY COLUMN source DATE NULL;
```

4. ตรวจสอบว่าแก้ไขสำเร็จ:
```sql
DESCRIBE railway.users;
```

ควรเห็นว่า `source` column มี `Null` เป็น `YES`

### ขั้นตอนที่ 2: Export ข้อมูลจาก XAMPP

1. เปิด MySQL Workbench และเชื่อมต่อกับ XAMPP database
2. คลิกขวาที่ตาราง `users` > **Table Data Export Wizard**
3. เลือกไฟล์ที่ต้องการ export (แนะนำเป็น CSV หรือ SQL)
4. ตั้งค่า options:
   - ✅ Include Column Names
   - ✅ Include Create Table Statement (ถ้าเป็น SQL)

### ขั้นตอนที่ 3: Import ข้อมูลไปยัง Railway

#### วิธีที่ 1: ใช้ MySQL Workbench Import Wizard (แนะนำ)

1. เปิด MySQL Workbench และเชื่อมต่อกับ Railway database
2. คลิกขวาที่ตาราง `users` > **Table Data Import Wizard**
3. เลือกไฟล์ที่ export มาจาก XAMPP
4. ตรวจสอบ mapping ของคอลัมน์ให้ถูกต้อง
5. คลิก **Next** เพื่อเริ่ม import
6. MySQL จะแปลงค่า `'0000-00-00'` เป็น `NULL` อัตโนมัติ

#### วิธีที่ 2: ใช้ SQL Script

หากมีไฟล์ SQL จาก XAMPP:

1. เปิดไฟล์ SQL ใน text editor
2. ค้นหาและแทนที่ `'0000-00-00'` ด้วย `NULL`:
   ```sql
   -- แทนที่ '0000-00-00' ด้วย NULL
   -- ตัวอย่าง: source = '0000-00-00'  -> source = NULL
   ```
3. รัน SQL script ใน MySQL Workbench

#### วิธีที่ 3: ใช้ CSV และแก้ไขก่อน import

1. Export เป็น CSV จาก XAMPP
2. เปิดไฟล์ CSV ใน Excel หรือ text editor
3. ค้นหาและแทนที่ `0000-00-00` ด้วยค่าว่าง (empty cell)
4. Import CSV ใหม่ผ่าน MySQL Workbench

### ขั้นตอนที่ 4: ตรวจสอบข้อมูล

หลังจาก import เสร็จแล้ว ให้ตรวจสอบข้อมูล:

```sql
-- ตรวจสอบจำนวนแถว
SELECT COUNT(*) FROM railway.users;

-- ตรวจสอบข้อมูลที่มี source เป็น NULL
SELECT COUNT(*) FROM railway.users WHERE source IS NULL;

-- ดูตัวอย่างข้อมูล
SELECT * FROM railway.users LIMIT 10;
```

## หมายเหตุ

- หลังจากแก้ไขโครงสร้างตารางแล้ว คอลัมน์ `source` จะสามารถเป็น `NULL` ได้
- ข้อมูลที่มีค่า `'0000-00-00'` จะถูกแปลงเป็น `NULL` อัตโนมัติเมื่อ import
- โค้ดแอปพลิเคชันได้ถูกอัปเดตให้รองรับ `source` เป็น `NULL` แล้ว

## การแก้ไขปัญหาเพิ่มเติม

### ปัญหา: Encoding Error (`'charmap' codec can't decode byte`)

หากพบข้อผิดพลาดเกี่ยวกับ encoding ดูคู่มือในไฟล์ `fix-csv-encoding.md`

**วิธีแก้ไขเร็ว:**
1. ใน MySQL Workbench เปลี่ยน Encoding จาก `utf-8` เป็น `Windows-1252` หรือ `cp1252`
2. หรือแปลงไฟล์ CSV เป็น UTF-8 ก่อน import (ใช้ Notepad++ หรือ script `convert_csv_encoding.py`)

### ปัญหาอื่นๆ

1. **ตรวจสอบ SQL Mode**:
   ```sql
   SELECT @@sql_mode;
   ```

2. **ตั้งค่า SQL Mode ชั่วคราว** (ถ้าจำเป็น):
   ```sql
   SET SESSION sql_mode = 'ALLOW_INVALID_DATES';
   -- จากนั้นทำการ import
   ```

3. **ตรวจสอบข้อมูลก่อน import**:
   - ตรวจสอบว่าไฟล์ที่ export ไม่มีปัญหาการ encode
   - ตรวจสอบว่า date format ถูกต้อง (YYYY-MM-DD)


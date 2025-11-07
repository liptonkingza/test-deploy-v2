-- Migration Script: แก้ไขคอลัมน์ source ในตาราง users ให้รองรับ NULL
-- ใช้สำหรับแก้ไขปัญหาการ import ข้อมูลที่มี '0000-00-00' จาก XAMPP ไปยัง Railway

-- วิธีใช้:
-- 1. เปิด MySQL Workbench และเชื่อมต่อกับ Railway database
-- 2. เปิดไฟล์นี้และรันคำสั่ง SQL ด้านล่าง
-- 3. หลังจากรันเสร็จแล้ว ให้ลอง import ข้อมูลใหม่

-- แก้ไขคอลัมน์ source ให้รองรับ NULL
ALTER TABLE railway.users 
MODIFY COLUMN source DATE NULL;

-- ตรวจสอบโครงสร้างตารางหลังจากแก้ไข
DESCRIBE railway.users;

-- หมายเหตุ: หลังจากแก้ไขแล้ว MySQL จะแปลงค่า '0000-00-00' เป็น NULL อัตโนมัติเมื่อ import


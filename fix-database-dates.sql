-- SQL Script สำหรับแก้ไขข้อมูลที่มี '0000-00-00' ในฐานข้อมูล
-- ใช้สคริปต์นี้หลังจาก import ข้อมูลแล้ว (ถ้ายังมีปัญหา)

-- วิธีที่ 1: แก้ไขคอลัมน์ให้รองรับ NULL และอัปเดตข้อมูล
-- สำหรับตาราง users
ALTER TABLE `users` MODIFY COLUMN `source` DATE NULL;

-- อัปเดตค่า '0000-00-00' เป็น NULL (ถ้ายังมีอยู่)
UPDATE `users` SET `source` = NULL WHERE `source` = '0000-00-00' OR `source` = '0000-00-00';

-- วิธีที่ 2: ตั้งค่า default เป็น NULL แทน
ALTER TABLE `users` ALTER COLUMN `source` SET DEFAULT NULL;

-- ตรวจสอบข้อมูล
SELECT id, operator, pn_id, source, level FROM `users` WHERE `source` IS NULL;


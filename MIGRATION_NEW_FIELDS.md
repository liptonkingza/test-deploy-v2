# Migration: เพิ่มฟิลด์ใหม่ใน legacy_deliveries

## วัตถุประสงค์
เพิ่มฟิลด์ใหม่ 3 ฟิลด์ในตาราง `legacy_deliveries` เพื่อเก็บข้อมูลที่ไม่เคยจัดเก็บมาก่อน

## ฟิลด์ที่เพิ่ม

### 1. followupdays (INT)
- **คำอธิบาย**: จำนวนวันติดตามผล
- **แหล่งข้อมูล**: Step 3 - ช่อง "ติดตามผลใน X วัน"
- **ตัวอย่าง**: 7, 14, 30
- **ค่าเริ่มต้น**: NULL
- **MySQL Type**: `INT DEFAULT NULL`

### 2. symptom (TEXT)
- **คำอธิบาย**: อาการ/หมายเหตุของลูกค้า
- **แหล่งข้อมูล**: Step 4 - ช่อง "อาการ / หมายเหตุ"
- **ตัวอย่าง**: "ปวดหัว", "อ่อนเพลีย", "นอนไม่หลับ"
- **ค่าเริ่มต้น**: NULL
- **MySQL Type**: `TEXT DEFAULT NULL`

### 3. urgency (VARCHAR(20))
- **คำอธิบาย**: ระดับความเร่งด่วน/วิธีทาน
- **แหล่งข้อมูล**: Step 4 - ช่อง "ระดับ"
- **ค่าที่เป็นไปได้**:
  - `normal` - วิธีทาน ปกติ
  - `booster` - Booster
  - `maintain` - Maintain
- **ค่าเริ่มต้น**: NULL (แต่จะบันทึกเป็น 'normal' ถ้าไม่มีข้อมูล)
- **MySQL Type**: `VARCHAR(20) DEFAULT NULL`

## ไฟล์ที่แก้ไข

1. **lib/legacy/schemaData.json** - เพิ่มคำนิยาม schema สำหรับฟิลด์ใหม่
2. **lib/legacy/migrateAddNewFields.js** - Migration script ที่ตรวจสอบและเพิ่มคอลัมน์
3. **server.js** - เพิ่มการเรียก migration ใน bootstrap function
4. **routes/workflow.js** - อัพเดทการบันทึกข้อมูลให้รวมฟิลด์ใหม่

## วิธีการทำงาน

### อัตโนมัติ
เมื่อเริ่มต้น server (`npm start`):
1. Server จะเรียก `ensureLegacyTables()` เพื่อสร้างตารางที่จำเป็น
2. จากนั้นเรียก `migrateAddNewFields()` เพื่อเพิ่มคอลัมน์ใหม่ (ถ้ายังไม่มี)
3. Migration จะตรวจสอบว่าคอลัมน์มีอยู่แล้วหรือไม่
4. ถ้ายังไม่มี จะเพิ่มคอลัมน์พร้อม comment อธิบาย

### ทดสอบด้วยตัวเอง
```bash
node test-migration.js
```

## การบันทึกข้อมูล

เมื่อผู้ใช้กด "Finish" ใน Step 5:
1. ระบบจะรวบรวมข้อมูลจากทุก Step
2. บันทึกลง `legacy_deliveries` พร้อมฟิลด์ใหม่:
   - `followupdays`: ดึงจาก `mediaChannelData.followUpDays`
   - `symptom`: ดึงจาก `productData.shipping.symptom`
   - `urgency`: ดึงจาก `productData.shipping.urgency`

## ตัวอย่างข้อมูลที่บันทึก

```javascript
{
  delivernum: '0000000123',
  customerid: 'C001',
  // ... ฟิลด์อื่นๆ
  followupdays: 7,              // ติดตามผลใน 7 วัน
  symptom: 'ปวดหัว นอนไม่หลับ',  // อาการที่ลูกค้าแจ้ง
  urgency: 'booster'            // วิธีทานแบบ Booster
}
```

## SQL ที่ใช้ใน Migration

```sql
-- เพิ่ม followupdays
ALTER TABLE legacy_deliveries 
ADD COLUMN followupdays INT DEFAULT NULL 
COMMENT 'จำนวนวันติดตามผล (Step 3)';

-- เพิ่ม symptom
ALTER TABLE legacy_deliveries 
ADD COLUMN symptom TEXT DEFAULT NULL 
COMMENT 'อาการ/หมายเหตุ (Step 4)';

-- เพิ่ม urgency
ALTER TABLE legacy_deliveries 
ADD COLUMN urgency VARCHAR(20) DEFAULT NULL 
COMMENT 'ระดับความเร่งด่วน: normal, booster, maintain (Step 4)';
```

## หมายเหตุ

- Migration จะทำงานอัตโนมัติทุกครั้งที่เริ่ม server
- ถ้าคอลัมน์มีอยู่แล้ว migration จะข้ามไป (ไม่มีผลกระทบ)
- ข้อมูลเก่าที่มีอยู่จะไม่ได้รับผลกระทบ (ฟิลด์ใหม่จะเป็น NULL)
- ฟิลด์ทั้ง 3 นี้เป็น optional (ไม่บังคับกรอก)

## การตรวจสอบ

ตรวจสอบว่าคอลัมน์ถูกเพิ่มแล้ว:

```sql
DESCRIBE legacy_deliveries;
-- หรือ
SHOW COLUMNS FROM legacy_deliveries LIKE '%followup%';
SHOW COLUMNS FROM legacy_deliveries LIKE 'symptom';
SHOW COLUMNS FROM legacy_deliveries LIKE 'urgency';
```

## Rollback

ถ้าต้องการลบคอลัมน์เหล่านี้:

```sql
ALTER TABLE legacy_deliveries DROP COLUMN followupdays;
ALTER TABLE legacy_deliveries DROP COLUMN symptom;
ALTER TABLE legacy_deliveries DROP COLUMN urgency;
```

---

**วันที่สร้าง**: 2025-10-22  
**Version**: 1.0.0


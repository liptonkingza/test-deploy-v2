# Dashboard - ข้อมูลการจัดส่ง

## ภาพรวม
หน้า Dashboard ใหม่ที่แยกออกจากส่วน workflow ของโปรเจค โดยแสดงข้อมูลจากตาราง `legacy_deliveries` ในรูปแบบที่อ่านง่ายและใช้งานสะดวก

## ฟีเจอร์หลัก

### 1. สรุปข้อมูล (Summary Cards)
- **จำนวนรายการทั้งหมด**: แสดงจำนวนรายการทั้งหมดในตาราง
- **รายการขาย**: จำนวนรายการประเภท "ขาย"
- **ค่าส่ง**: จำนวนรายการประเภท "ค่าส่ง"
- **ของแถม**: จำนวนรายการประเภท "ของแถม"
- **ยอดรวมทั้งหมด**: ยอดเงินรวมทั้งหมด
- **อัปเดตล่าสุด**: เวลาที่อัปเดตข้อมูลล่าสุด

### 2. การค้นหาและกรองข้อมูล
- **ค้นหา**: ค้นหาจากหมายเลขการจัดส่ง, ชื่อลูกค้า, หรือสินค้า
- **กรองตามประเภท**: เลือกแสดงเฉพาะประเภทขาย/ค่าส่ง/ของแถม
- **กรองตามวันที่**: เลือกแสดงเฉพาะวันที่ที่ต้องการ
- **กรองตามพนักงาน**: เลือกแสดงเฉพาะพนักงานที่ต้องการ
- **ล้างตัวกรอง**: รีเซ็ตตัวกรองทั้งหมด

### 3. ตารางข้อมูล
แสดงข้อมูลรายละเอียดของแต่ละรายการ รวมถึง:
- ID และหมายเลขการจัดส่ง
- วันที่และเวลาทำรายการ
- ข้อมูลพนักงาน
- ข้อมูลลูกค้า (ชื่อ, ID)
- ประเภทรายการ (ขาย/ค่าส่ง/ของแถม)
- สินค้า, จำนวน, ราคา, ยอดรวม
- ช่องทางขายและการชำระเงิน
- ข้อมูลการขนส่ง
- วันที่ส่ง, ผู้รับ, โทรศัพท์, ที่อยู่
- อีเมล

### 4. ฟีเจอร์เพิ่มเติม
- **ส่งออก CSV**: ดาวน์โหลดข้อมูลในรูปแบบ CSV
- **รีเฟรช**: อัปเดตข้อมูลล่าสุด
- **Theme Toggle**: เปลี่ยนระหว่าง Light/Dark mode
- **Responsive Design**: รองรับการใช้งานบนอุปกรณ์ต่างๆ

## การเข้าถึง

### URL
```
http://localhost:3000/dashboard
```

### ข้อกำหนด
- ต้องเข้าสู่ระบบก่อน (Authentication required)
- ต้องมีข้อมูลในตาราง `legacy_deliveries`

## API Endpoints

### GET /dashboard/api/data
ดึงข้อมูลสำหรับ Dashboard (JSON format)

**Parameters:**
- `limit` (optional): จำนวนรายการที่ต้องการ (default: 100)
- `offset` (optional): จุดเริ่มต้น (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 1000,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  }
}
```

## ไฟล์ที่เกี่ยวข้อง

### Routes
- `routes/dashboard.js` - Route handlers สำหรับ dashboard

### Views
- `views/dashboard/index.ejs` - Template หลักของ dashboard

### Database
- `legacy_deliveries` table - ตารางข้อมูลการจัดส่ง

## การติดตั้งและใช้งาน

1. ตรวจสอบว่าเซิร์ฟเวอร์ทำงานอยู่:
   ```bash
   npm start
   ```

2. เข้าสู่ระบบผ่าน:
   ```
   http://localhost:3000/login
   ```

3. เข้าถึง Dashboard:
   ```
   http://localhost:3000/dashboard
   ```

## การปรับแต่ง

### เพิ่มฟิลด์ใหม่
แก้ไขใน `routes/dashboard.js`:
```javascript
const fields = [
  'id',
  'delivernum',
  // เพิ่มฟิลด์ใหม่ที่นี่
  'new_field'
];
```

### แก้ไขจำนวนรายการที่แสดง
แก้ไขใน `routes/dashboard.js`:
```javascript
const [rows] = await pool.query(
  `SELECT ${fields.join(', ')} FROM \`${deliveriesTable.tableName}\` ORDER BY id DESC LIMIT 200` // เปลี่ยนจาก 100 เป็น 200
);
```

### เพิ่มตัวกรองใหม่
แก้ไขใน `views/dashboard/index.ejs`:
```html
<div class="col-md-2">
  <label for="newFilter" class="form-label">ตัวกรองใหม่</label>
  <select class="form-select" id="newFilter">
    <option value="">ทั้งหมด</option>
    <option value="value1">ค่า 1</option>
    <option value="value2">ค่า 2</option>
  </select>
</div>
```

## การแก้ไขปัญหา

### ไม่พบข้อมูล
- ตรวจสอบว่ามีข้อมูลในตาราง `legacy_deliveries`
- ตรวจสอบการเชื่อมต่อฐานข้อมูล

### ไม่สามารถเข้าถึงได้
- ตรวจสอบว่าต้องเข้าสู่ระบบก่อน
- ตรวจสอบ URL ว่าเป็น `/dashboard` (ไม่ใช่ `/workflow/dashboard`)

### ข้อมูลไม่แสดง
- ตรวจสอบ console ในเบราว์เซอร์สำหรับ JavaScript errors
- ตรวจสอบ network tab สำหรับ API errors

## การพัฒนาต่อ

### แนวทางการพัฒนาที่แนะนำ
1. **Pagination**: เพิ่มระบบแบ่งหน้าข้อมูล
2. **Real-time Updates**: อัปเดตข้อมูลแบบ real-time
3. **Charts/Graphs**: เพิ่มกราฟแสดงสถิติ
4. **Export Formats**: รองรับการส่งออกในรูปแบบอื่น (Excel, PDF)
5. **Advanced Filters**: เพิ่มตัวกรองที่ซับซ้อนมากขึ้น
6. **Search History**: บันทึกประวัติการค้นหา
7. **Favorites**: บันทึกรายการที่สนใจ
8. **Notifications**: แจ้งเตือนเมื่อมีข้อมูลใหม่

---

**หมายเหตุ**: Dashboard นี้แยกออกจากส่วน workflow แล้ว เพื่อให้การดูแลรักษาและการพัฒนาต่อทำได้ง่ายขึ้น

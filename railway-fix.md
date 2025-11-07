# แก้ไขปัญหา Railway Deployment

## ปัญหาที่พบ:
1. Port mismatch (8080 vs 3000)
2. Database connection failed
3. Environment variables ไม่ถูกต้อง

## วิธีแก้ไข:

### 1. ตั้งค่า Environment Variables ใน Railway

ไปที่ **Settings > Variables** ในแอปพลิเคชัน "test-deploy" และตั้งค่า:

```
PORT=3000
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
SESSION_SECRET=your_very_secure_session_secret_here_change_this
NODE_ENV=production
```

### 2. ตรวจสอบการตั้งค่า

หลังจากตั้งค่าแล้ว:
1. ตรวจสอบใน Variables tab ว่ามี variables ครบถ้วน
2. ตรวจสอบ logs ว่าไม่มี connection errors
3. เข้าไปที่ `/health` endpoint เพื่อดูสถานะ database

### 3. การแก้ไขปัญหาเฉพาะ

#### ปัญหา: Port mismatch
**สาเหตุ**: Railway ตั้งค่าให้ใช้ port 3000 แต่แอปพลิเคชันใช้ port 8080
**วิธีแก้**: ตั้งค่า `PORT=3000` ใน environment variables

#### ปัญหา: Database connection failed
**สาเหตุ**: Environment variables ไม่ถูกต้อง
**วิธีแก้**: ตั้งค่า database environment variables ให้ถูกต้อง

### 4. ตรวจสอบการทำงาน

หลังจากแก้ไขแล้ว:
- เข้าไปที่ `https://test-deploy-production-24eb.up.railway.app`
- ตรวจสอบ `/health` endpoint
- ควรจะเห็น `"database": "connected"`

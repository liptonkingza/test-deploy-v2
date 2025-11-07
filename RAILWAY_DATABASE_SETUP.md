# การตั้งค่า Database บน Railway

## วิธีที่ 1: ใช้ Railway MySQL Service (แนะนำ)

### ขั้นตอนการตั้งค่า:

1. **ไปที่ Railway Dashboard**
   - เข้าไปที่โปรเจคของคุณ
   - คลิก "New Service" > "Database" > "MySQL"

2. **Railway จะสร้าง MySQL service ให้อัตโนมัติ**
   - Railway จะสร้าง database instance
   - จะได้ connection string อัตโนมัติ

3. **ตั้งค่า Environment Variables**
   - Railway จะตั้งค่า environment variables อัตโนมัติ:
     - `MYSQL_HOST`
     - `MYSQL_PORT` 
     - `MYSQL_USER`
     - `MYSQL_PASSWORD`
     - `MYSQL_DATABASE`

4. **อัปเดต Environment Variables ในแอป**
   - ไปที่ Settings > Variables
   - ตั้งค่า:
     ```
     DB_HOST=${{MYSQL_HOST}}
     DB_PORT=${{MYSQL_PORT}}
     DB_USER=${{MYSQL_USER}}
     DB_PASSWORD=${{MYSQL_PASSWORD}}
     DB_NAME=${{MYSQL_DATABASE}}
     ```

### วิธีที่ 2: ใช้ External MySQL

หากต้องการใช้ MySQL ภายนอก:

1. **ตั้งค่า Environment Variables**:
   ```
   DB_HOST=your_external_mysql_host
   DB_PORT=3306
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=your_database_name
   ```

2. **ตรวจสอบ Network Access**:
   - ตรวจสอบว่า MySQL server อนุญาต external connections
   - ตรวจสอบ firewall settings
   - ตรวจสอบ MySQL user permissions

## การตรวจสอบ Database Connection

### ตรวจสอบใน Railway Dashboard:
1. ไปที่ Variables tab
2. ตรวจสอบว่ามี database variables ครบถ้วน
3. ตรวจสอบ logs ว่าไม่มี connection errors

### ตรวจสอบผ่าน Health Check:
- เข้าไปที่ `https://your-app.railway.app/health`
- ควรจะเห็น `"database": "connected"`

## การแก้ไขปัญหาเฉพาะ

### ปัญหา: `connect ECONNREFUSED ::1:3306`
**สาเหตุ**: ไม่มี database service หรือ environment variables ไม่ถูกต้อง
**วิธีแก้**: 
1. สร้าง Railway MySQL service
2. ตั้งค่า environment variables ให้ถูกต้อง

### ปัญหา: `Access denied for user`
**สาเหตุ**: Username/password ไม่ถูกต้อง
**วิธีแก้**: ตรวจสอบ environment variables

### ปัญหา: `Unknown database`
**สาเหตุ**: Database name ไม่ถูกต้อง
**วิธีแก้**: ตรวจสอบ `DB_NAME` environment variable

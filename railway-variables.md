# Railway Environment Variables Setup

## วิธีตั้งค่า Environment Variables ใน Railway

### 1. ไปที่ Railway Dashboard
- เข้าไปที่โปรเจคของคุณ
- คลิกที่ "Variables" tab

### 2. ตั้งค่า Environment Variables

#### หากใช้ Railway MySQL Service:
```
DB_HOST=${{MYSQL_HOST}}
DB_PORT=${{MYSQL_PORT}}
DB_USER=${{MYSQL_USER}}
DB_PASSWORD=${{MYSQL_PASSWORD}}
DB_NAME=${{MYSQL_DATABASE}}
SESSION_SECRET=your_very_secure_session_secret_here
NODE_ENV=production
```

#### หากใช้ External MySQL:
```
DB_HOST=your_external_mysql_host
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name
SESSION_SECRET=your_very_secure_session_secret_here
NODE_ENV=production
```

### 3. ตรวจสอบการตั้งค่า

หลังจากตั้งค่าแล้ว:
1. ตรวจสอบใน Variables tab ว่ามี variables ครบถ้วน
2. ตรวจสอบ logs ว่าไม่มี connection errors
3. เข้าไปที่ `/health` endpoint เพื่อดูสถานะ database

### 4. การแก้ไขปัญหา

#### ปัญหา: `connect ECONNREFUSED`
- ตรวจสอบว่า `DB_HOST` ถูกต้อง
- ตรวจสอบว่า MySQL service ทำงานอยู่

#### ปัญหา: `Access denied for user`
- ตรวจสอบ `DB_USER` และ `DB_PASSWORD`
- ตรวจสอบ MySQL user permissions

#### ปัญหา: `Unknown database`
- ตรวจสอบ `DB_NAME` ว่าถูกต้อง
- ตรวจสอบว่า database มีอยู่จริง

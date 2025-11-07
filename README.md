Siamdrug EJS + Node.js + MySQL Starter
======================================

Overview
--------
- Express server with EJS server-side rendering plus REST endpoints in one project
- Uses `mysql2/promise` with a pooled connection
- Includes CRUD samples for `products` and additional demo entities
- Optional single-binary build with `pkg`
- **Ready for Railway deployment** 🚂

Requirements
------------
- Node.js 18 or newer
- MySQL 8 (or the version you plan to run)

Setup
-----
1. Install dependencies (`npm install`)
2. Copy environment template (`copy env.example .env`) and update DB credentials
3. Create the database tables (see **Database Schema**)

Run
---
- Development: `npm run dev`
- Production: `npm start`
- Default URL: http://localhost:3000

Deployment
---------
- **Railway**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions
- **Docker**: Use `docker-compose up` for local testing
- **Manual**: Follow the setup instructions above

Routes (Selected)
-----------------
- `GET /` – dashboard (requires login)
- `GET /health` – server/database health check
- Auth: `GET /login`, `POST /login`, `GET /register`, `POST /register`, `GET /logout`
- REST APIs for products, customers, shipments, media, payments, invoices, and legacy data under `/api/legacy/*`

Project Structure
-----------------
- `server.js` – Express app, views, route wiring
- `db.js` – MySQL pool configuration
- `routes/**/*.js` – REST endpoints (auth, products, legacy data, etc.)
- `views/` – EJS templates (layout, dashboard, partials, auth pages)
- `public/` – Static assets (CSS, images)
- `lib/legacy/` – Metadata/utilities for legacy tables (`schemaData.json`)
- `lib/auth/` – Auth helper (ensures `users` table exists)

Authentication 
Legacy Customers Mapping
------------------------
Form inputs map directly to `legacy_customers` columns (matching the imported DBF schema):

- `CUSTOMERID` — legacy customer code (read-only in the dashboard)
- `PRENAME` / `FIRSTNAME` / `LASTNAME` — honorific, first, and last name
- `MOBILETEL` — mobile phone number
- `EMAIL` — email address
- `LINEID` — Line messenger ID or internal contact code
- `BIRTHDAY` (`DATE`) — birth date
- `SEX` — gender (`M`=male, `F`=female, `O`=other)
- `AGE`, `WEIGHT`, `HEIGHT` — age, weight (kg), height (cm)
- Address components: `HOMENUM`, `MOO`, `BUILDING`, `SOI`, `ROAD`, `KWANG`, `KATE`, `PROVINCE`, `ZIPCODE`
- `ADDR1` — summary/combined primary address (auto-derived, editable)
- `ADDR2`..`ADDR5` — ที่อยู่อื่น ๆ (เพิ่มจากฟอร์ม; ใส่บรรทัดละ 1 ที่อยู่ต่อช่อง)
- `OPERATOR` — บันทึกผู้ใช้งานที่กำลังล็อกอินโดยอัตโนมัติเมื่อสร้าง/แก้ไข
- `CUSTOMERID` — รหัสลูกค้า legacy สร้างอัตโนมัติแบบรันนิงนัมเบอร์ (เติมศูนย์นำหน้า)
- `SALEREPID` — เก็บ `pn_id` ของพนักงานขาย (หน้าฟอร์มแสดงชื่อ แต่ส่งค่าเป็น `pn_id`)
- `SOURCE` — ตั้งค่าอัตโนมัติเป็น `5` ทุกครั้งที่บันทึก
- `SICKNESS1`, `SICKNESS2` — medical notes / chronic conditions
- `CUSTTAG` — free-form tag for categorisation
- `BANED` — logical flag (0/1) indicating banned customers
- `BANREMARK` — reason for banning the customer

Any remaining columns in `legacy_customers` are available via the `/api/legacy/customers` endpoints for advanced use cases.Notes
--------------------
- Users register and login with `pn_id` (4-digit employee code) and a 4-digit numeric password (stored in plain text; update before production)
- Additional profile fields captured: `operator`, `source` (join date), `level`
- Session-based auth via `express-session`; replace with a production-grade session store before deployment

Database Schema
---------------
**users**
```sql
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  operator VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  pn_id CHAR(4) NOT NULL UNIQUE,
  source DATE NOT NULL,
  level VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**customers (extended sample)**
```sql
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_code VARCHAR(20) UNIQUE,
  prefix VARCHAR(50),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  mobile VARCHAR(50),
  line_id VARCHAR(100),
  dob DATE,
  house_no VARCHAR(50),
  village VARCHAR(50),
  building VARCHAR(100),
  alley VARCHAR(100),
  road VARCHAR(100),
  subdistrict VARCHAR(100),
  district VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(10),
  gender VARCHAR(10),
  height_cm DECIMAL(5,2),
  weight_kg DECIMAL(5,2),
  disease1 VARCHAR(255),
  disease2 VARCHAR(255),
  tag VARCHAR(255),
  addr1 VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**shipments**
```sql
CREATE TABLE IF NOT EXISTS shipments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  address VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**media**
```sql
CREATE TABLE IF NOT EXISTS media (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**payments**
```sql
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  method VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**invoices**
```sql
CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  number VARCHAR(50) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Legacy Tables
-------------
- Column metadata derived from the DBF structure files is stored in `lib/legacy/schemaData.json`
- Tables `legacy_customers`, `legacy_deliveries`, `legacy_products` are auto-created at startup
- Dashboard renders latest records and provides CRUD forms for each legacy dataset
- Adjust the visible fields by editing `schemaData.json` or the logic in `lib/legacy/tableManager.js`

Notes
-----
- Never commit real credentials; use `.env` or a secret manager
- Replace the in-memory session store and default secrets before production
- Keep REST endpoints and EJS templates in sync when adding new features to avoid UI/behavior drift


# Workflow Data Mapping to legacy_deliveries Table

## Overview
This document explains how data collected from the 5-step workflow process maps to the `legacy_deliveries` table fields. Each row in `legacy_deliveries` represents a complete order/delivery record.

## Table Structure Summary
- **Total Fields**: 216 fields
- **Data Type**: Sales order (`datadesc: 'ขาย'`)
- **Process Type**: Sales process (`processdes: 'ขาย'`)
- **Source**: Web workflow (source: 5)

---

## Step 1: Customer Data (ลูกค้า)
**Source**: Customer selection from Step 1
**Session Storage**: `workflow.selectedCustomer`

| Field | Description | Source | Example |
|-------|-------------|--------|---------|
| `customerid` | รหัสลูกค้า | Customer ID from URL | "C001234" |
| `prename` | คำนำหน้า | Customer form | "นาย" |
| `firstname` | ชื่อ | Customer form | "สมชาย" |
| `lastname` | นามสกุล | Customer form | "ใจดี" |
| `emailaddr` | อีเมล | Customer form | "somchai@email.com" |
| `salerepid` | รหัสพนักงานขาย | Session user | "EMP001" |
| `salename` | ชื่อพนักงานขาย | Session user | "นายขาย ดี" |

---

## Step 2: Delivery Data (ข้อมูลการจัดส่ง)
**Source**: Delivery address selection from Step 2
**Session Storage**: `workflow.selectedDelivery`

### Primary Address Fields
| Field | Description | Source | Example |
|-------|-------------|--------|---------|
| `addr1` | ที่อยู่หลัก | Delivery form | "123 ถนนสุขุมวิท" |
| `addr2` | ที่อยู่รอง | Delivery form | "แขวงคลองตัน" |
| `homenum1` | หมายเลขบ้าน | Delivery form | "123" |
| `homenum2` | หมายเลขบ้าน 2 | Delivery form | "123/4" |
| `building1` | อาคาร | Delivery form | "ตึก A" |
| `building2` | อาคาร 2 | Delivery form | "ตึก B" |
| `floor1` | ชั้น | Delivery form | "5" |
| `floor2` | ชั้น 2 | Delivery form | "6" |
| `room1` | ห้อง | Delivery form | "501" |
| `room2` | ห้อง 2 | Delivery form | "601" |
| `soi1` | ซอย | Delivery form | "ซอยสุขุมวิท 24" |
| `soi2` | ซอย 2 | Delivery form | "ซอยสุขุมวิท 25" |
| `road1` | ถนน | Delivery form | "สุขุมวิท" |
| `road2` | ถนน 2 | Delivery form | "สุขุมวิท 2" |
| `kate1` | เขต | Delivery form | "วัฒนา" |
| `kate2` | เขต 2 | Delivery form | "วัฒนา 2" |
| `kwang1` | แขวง | Delivery form | "คลองตัน" |
| `kwang2` | แขวง 2 | Delivery form | "คลองตัน 2" |
| `mooban1` | หมู่บ้าน | Delivery form | "หมู่บ้านสุขใจ" |
| `mooban2` | หมู่บ้าน 2 | Delivery form | "หมู่บ้านสุขใจ 2" |
| `tumbon1` | ตำบล | Delivery form | "คลองตัน" |
| `tumbon2` | ตำบล 2 | Delivery form | "คลองตัน 2" |
| `ampur1` | อำเภอ | Delivery form | "วัฒนา" |
| `ampur2` | อำเภอ 2 | Delivery form | "วัฒนา 2" |
| `province1` | จังหวัด | Delivery form | "กรุงเทพฯ" |
| `province2` | จังหวัด 2 | Delivery form | "กรุงเทพฯ 2" |
| `zipcode1` | รหัสไปรษณีย์ | Delivery form | "10110" |
| `zipcode2` | รหัสไปรษณีย์ 2 | Delivery form | "10111" |
| `province` | จังหวัดหลัก | Delivery form | "กรุงเทพฯ" |
| `zipcode` | รหัสไปรษณีย์หลัก | Delivery form | "10110" |

### Company Name Fields
| Field | Description | Source | Example |
|-------|-------------|--------|---------|
| `precomnam1` | คำนำหน้าบริษัท | Delivery form | "บริษัท" |
| `precomnam2` | คำนำหน้าบริษัท 2 | Delivery form | "บริษัท" |
| `comname1` | ชื่อบริษัท | Delivery form | "บริษัทตัวอย่าง จำกัด" |
| `comname2` | ชื่อบริษัท 2 | Delivery form | "บริษัทตัวอย่าง 2 จำกัด" |
| `lstcomnam1` | ชื่อบริษัทล่าสุด | Delivery form | "บริษัทตัวอย่าง จำกัด" |
| `lstcomnam2` | ชื่อบริษัทล่าสุด 2 | Delivery form | "บริษัทตัวอย่าง 2 จำกัด" |

---

## Step 3: Media & Channel Data (สื่อและช่องทาง)
**Source**: Media and channel selection from Step 3
**Session Storage**: `workflow.mediaChannelSelection`

| Field | Description | Source | Example |
|-------|-------------|--------|---------|
| `mediatype` | รหัสสื่อ | Media selection | 1 |
| `mediadesc` | ชื่อสื่อ | Media selection | "Facebook" |
| `channel` | รหัสช่องทาง | Channel selection | 2 |
| `channeldes` | ชื่อช่องทาง | Channel selection | "Facebook Page" |
| `followup` | จำนวนวันติดตาม | Follow-up days | 7 |

---

## Step 4: Product Data (สินค้าและการจัดส่ง)
**Source**: Product selection and shipping from Step 4
**Session Storage**: `workflow.step4Draft`

### Product Summary Fields
| Field | Description | Source | Calculation | Example |
|-------|-------------|--------|-------------|---------|
| `title` | ชื่อสินค้ารวม | Product list | Join product titles | "ยา A, ยา B" |
| `price` | ราคารวม | Product list | Sum(price × qty) | 1500.00 |
| `salprice` | ราคาขายรวม | Product list | Sum(price × qty) | 1500.00 |
| `qty` | จำนวนรวม | Product list | Sum(quantities) | 5 |
| `amount` | จำนวนเงินรวม | Product list | Sum(price × qty) | 1500.00 |
| `dscamt` | ส่วนลดรวม | Product list | Sum(discounts) | 100.00 |
| `postfee` | ค่าจัดส่ง | Shipping form | Shipping cost | 50.00 |
| `total` | ยอดสุทธิ | Calculated | price - discount + shipping | 1450.00 |

### Shipping Fields
| Field | Description | Source | Example |
|-------|-------------|--------|---------|
| `shiptype` | ประเภทการจัดส่ง | Shipping method | 1 |
| `shipdesc` | ชื่อการจัดส่ง | Shipping method | "EMS" |

---

## Step 5: Payment Data (การชำระเงิน)
**Source**: Payment method selection from Step 5
**Session Storage**: `workflow.paymentSelection`

### Payment Method Fields
| Field | Description | Source | Example |
|-------|-------------|--------|---------|
| `paytype` | ประเภทการชำระ | Payment selection | 1 |
| `paydesc` | ชื่อการชำระ | Payment selection | "โอนเงิน" |
| `paytype1` | ประเภทย่อย 1 | Payment form | "01" |
| `subpay1` | รหัสย่อย 1 | Payment form | "01" |
| `subpay2` | รหัสย่อย 2 | Payment form | "02" |
| `payment` | สถานะการชำระ | Auto-set | true |
| `payday` | วันที่ชำระ | Auto-set | "2024-01-15" |

### Customer Bank Fields
| Field | Description | Source | Example |
|-------|-------------|--------|---------|
| `cusbankno` | รหัสธนาคารลูกค้า | Payment form | "003" |
| `cusbankna` | ชื่อธนาคารลูกค้า | Payment form | "กสิกรไทย" |
| `cusbankbr` | สาขาลูกค้า | Payment form | "สาขาสุรวงศ์" |
| `cusbankac` | บัญชีลูกค้า | Payment form | "123-4-56789-0" |
| `cusbankref` | อ้างอิงลูกค้า | Payment form | "REF001" |

### Credit Card Fields
| Field | Description | Source | Example |
|-------|-------------|--------|---------|
| `credit` | ใช้บัตรเครดิต | Payment form | false |
| `credittype` | ประเภทบัตร | Payment form | 1 |
| `creditdesc` | ชื่อบัตร | Payment form | "Visa" |
| `creditno` | เลขบัตร | Payment form | "1234-5678-9012-3456" |
| `creditexpm` | เดือนหมดอายุ | Payment form | "12" |
| `creditexpy` | ปีหมดอายุ | Payment form | "2025" |
| `creditref` | อ้างอิงบัตร | Payment form | "CARD001" |
| `last3digit` | 3 หลักสุดท้าย | Payment form | "456" |

### Company Bank Fields
| Field | Description | Source | Example |
|-------|-------------|--------|---------|
| `bankno` | รหัสธนาคารบริษัท | Payment selection | "003" |
| `bankna` | ชื่อธนาคารบริษัท | Payment selection | "กสิกรไทย" |
| `bankbr` | สาขาบริษัท | Payment selection | "สาขาสุรวงศ์" |
| `bankac` | บัญชีบริษัท | Payment selection | "123-4-56789-0" |
| `bankref` | อ้างอิงบริษัท | Payment selection | "REF001" |

### Finance Fields
| Field | Description | Source | Example |
|-------|-------------|--------|---------|
| `finance` | สถานะการเงิน | Auto-set | false |
| `financetyp` | ประเภทการเงิน | Payment selection | 1 |
| `financedes` | ชื่อการเงิน | Payment selection | "โอนเงิน" |
| `financeda` | วันที่การเงิน | Auto-set | null |
| `financeti` | เวลาการเงิน | Auto-set | "" |
| `financeby` | ผู้ทำการเงิน | Auto-set | "" |

---

## System Generated Fields
**Source**: Auto-generated by system

### Timestamp Fields
| Field | Description | Source | Example |
|-------|-------------|--------|---------|
| `workdate` | วันที่ทำงาน | Current date | "2024-01-15" |
| `worktime` | เวลาทำงาน | Current time | "14:30:00" |
| `chkminute` | เวลาตรวจสอบ | Current time | "14:30:00" |
| `timein` | เวลาเข้า | Current time | "14:30:00" |
| `timeout` | เวลาออก | Current time | "14:30:00" |
| `day` | วัน (ภาษาไทย) | Current date | "15/01/2567" |
| `date` | วันที่ | Current date | "2024-01-15" |

### Order Identification
| Field | Description | Source | Example |
|-------|-------------|--------|---------|
| `delivernum` | หมายเลขการจัดส่ง | Auto-generated | "D1705123456" |
| `tohomenum` | หมายเลขบ้านปลายทาง | Customer ID | "C001234" |
| `transno` | หมายเลขธุรกรรม | Same as delivernum | "D1705123456" |
| `uniqueid` | รหัสเฉพาะ | Auto-generated | "WF_1705123456789" |

### Process Fields
| Field | Description | Source | Example |
|-------|-------------|--------|---------|
| `buy` | สถานะซื้อ | Auto-set | true |
| `datatype` | ประเภทข้อมูล | Auto-set | 1 |
| `datadesc` | คำอธิบายข้อมูล | Auto-set | "ขาย" |
| `processtyp` | ประเภทกระบวนการ | Auto-set | 1 |
| `processdes` | คำอธิบายกระบวนการ | Auto-set | "ขาย" |
| `source` | แหล่งที่มา | Auto-set | 5 |

### User Fields
| Field | Description | Source | Example |
|-------|-------------|--------|---------|
| `operator` | ผู้ดำเนินการ | Session user | "EMP001" |
| `userid` | รหัสผู้ใช้ | Session user | "EMP001" |
| `username` | ชื่อผู้ใช้ | Session user | "นายขาย ดี" |

### Status Fields
| Field | Description | Source | Example |
|-------|-------------|--------|---------|
| `statusid` | รหัสสถานะ | Auto-set | 1 |
| `statusdesc` | ชื่อสถานะ | Auto-set | "รอการยืนยัน" |
| `finish` | สถานะเสร็จสิ้น | Auto-set | false |
| `mapstat` | สถานะแผนที่ | Auto-set | "N" |

### Remark Fields
| Field | Description | Source | Example |
|-------|-------------|--------|---------|
| `remark1` | หมายเหตุ 1 | Shipping remark | "จัดส่งด่วน" |
| `remark2` | หมายเหตุ 2 | Payment remark | "โอนเงินแล้ว" |

---

## Data Flow Summary

1. **Step 1** → Customer info → `customerid`, `prename`, `firstname`, `lastname`, etc.
2. **Step 2** → Delivery address → `addr1`, `addr2`, `province`, `zipcode`, etc.
3. **Step 3** → Media/Channel → `mediatype`, `mediadesc`, `channel`, `channeldes`
4. **Step 4** → Products/Shipping → `title`, `price`, `qty`, `total`, `postfee`
5. **Step 5** → Payment → `paytype`, `paydesc`, `bankno`, `bankna`, etc.

## Notes
- All monetary values are stored as DECIMAL(10,2)
- Dates are stored in YYYY-MM-DD format
- Times are stored in HH:MM:SS format
- Boolean fields use 0/1 or true/false
- Empty strings are used for missing data
- System auto-generates unique identifiers and timestamps

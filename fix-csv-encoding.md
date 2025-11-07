# แก้ไขปัญหา Encoding ในการ Import CSV

## ปัญหาที่พบ
```
'charmap' codec can't decode byte 0x84 in position 592: character maps to <undefined>
```

## วิธีแก้ไข

### วิธีที่ 1: เปลี่ยน Encoding ใน MySQL Workbench (แนะนำ)

1. ในหน้าต่าง "Table Data Import" ที่ขั้นตอน "Configure Import Settings"
2. เปลี่ยน **Encoding** จาก `utf-8` เป็น:
   - **`Windows-1252`** หรือ **`cp1252`** (ถ้าไฟล์มาจาก Windows/XAMPP)
   - **`TIS-620`** (ถ้ามีภาษาไทย)
   - **`ISO-8859-1`** (Latin-1)
3. คลิก **"Refresh"** หรือ **"Next"** เพื่อให้ Workbench อ่านคอลัมน์ใหม่
4. ตรวจสอบว่า Columns mapping ถูกต้องแล้วจึง import

### วิธีที่ 2: แปลงไฟล์ CSV เป็น UTF-8

#### ใช้ Notepad++ (แนะนำ)

1. เปิดไฟล์ CSV ด้วย **Notepad++**
2. ดู encoding ปัจจุบันที่มุมขวาล่าง (เช่น `ANSI`, `Windows-1252`)
3. ไปที่เมนู **Encoding** > **Character sets** > เลือก encoding ที่ถูกต้อง:
   - ถ้าเป็นภาษาไทย: **Thai > TIS-620**
   - ถ้าเป็น Windows: **Western European > Windows-1252**
4. ตรวจสอบว่าข้อมูลแสดงผลถูกต้อง
5. ไปที่ **Encoding > Convert to UTF-8**
6. บันทึกไฟล์ (Ctrl+S)
7. Import ใหม่ใน MySQL Workbench โดยตั้ง encoding เป็น `utf-8`

#### ใช้ Excel

1. เปิดไฟล์ CSV ด้วย Excel
2. ไปที่ **File > Save As**
3. เลือก **CSV UTF-8 (Comma delimited) (*.csv)**
4. บันทึกไฟล์
5. Import ใหม่ใน MySQL Workbench

### วิธีที่ 3: ใช้ Command Line (สำหรับผู้ใช้ขั้นสูง)

#### Windows PowerShell

```powershell
# แปลงไฟล์จาก Windows-1252 เป็น UTF-8
Get-Content "input.csv" -Encoding Default | Set-Content "output.csv" -Encoding UTF8
```

#### Python Script

สร้างไฟล์ `convert_csv.py`:

```python
import sys

def convert_encoding(input_file, output_file, source_encoding='cp1252', target_encoding='utf-8'):
    try:
        with open(input_file, 'r', encoding=source_encoding) as f_in:
            content = f_in.read()
        
        with open(output_file, 'w', encoding=target_encoding) as f_out:
            f_out.write(content)
        
        print(f"✅ แปลงไฟล์สำเร็จ: {input_file} -> {output_file}")
        print(f"   จาก {source_encoding} เป็น {target_encoding}")
    except Exception as e:
        print(f"❌ เกิดข้อผิดพลาด: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("วิธีใช้: python convert_csv.py <ไฟล์ต้นทาง> <ไฟล์ปลายทาง> [source_encoding]")
        print("ตัวอย่าง: python convert_csv.py data.csv data_utf8.csv cp1252")
        sys.exit(1)
    
    source_encoding = sys.argv[3] if len(sys.argv) > 3 else 'cp1252'
    convert_encoding(sys.argv[1], sys.argv[2], source_encoding)
```

รันคำสั่ง:
```bash
python convert_csv.py input.csv output.csv cp1252
```

### วิธีที่ 4: Export จาก XAMPP เป็น SQL แทน CSV

1. เปิด **phpMyAdmin** หรือ **MySQL Workbench** ที่เชื่อมต่อกับ XAMPP
2. เลือกตาราง `users` หรือ `legacy_customers`
3. คลิก **Export** > เลือก **SQL** แทน CSV
4. ตั้งค่า:
   - Format: **SQL**
   - Character set: **utf8** หรือ **utf8mb4**
5. Export และ import ไปยัง Railway

## วิธีตรวจสอบ Encoding ของไฟล์

### Windows PowerShell
```powershell
# ตรวจสอบ encoding
Get-Content "file.csv" -Encoding Byte | Select-Object -First 3
```

### Python
```python
import chardet

with open('file.csv', 'rb') as f:
    raw_data = f.read()
    result = chardet.detect(raw_data)
    print(f"Encoding ที่ตรวจพบ: {result['encoding']}")
    print(f"Confidence: {result['confidence']}")
```

## หมายเหตุ

- ไฟล์ CSV จาก XAMPP/Windows มักใช้ encoding **Windows-1252** หรือ **TIS-620** (ถ้ามีภาษาไทย)
- MySQL Workbench มักตั้งค่า default เป็น UTF-8
- ควรใช้ encoding เดียวกันทั้งระบบเพื่อหลีกเลี่ยงปัญหา


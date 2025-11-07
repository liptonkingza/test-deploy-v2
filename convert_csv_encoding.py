#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script สำหรับแปลง encoding ของไฟล์ CSV
ใช้แก้ไขปัญหา 'charmap' codec can't decode byte ใน MySQL Workbench
"""

import sys
import os
import chardet

def detect_encoding(file_path):
    """ตรวจสอบ encoding ของไฟล์"""
    try:
        with open(file_path, 'rb') as f:
            raw_data = f.read(10000)  # อ่าน 10KB แรกเพื่อตรวจสอบ
            result = chardet.detect(raw_data)
            return result['encoding'], result['confidence']
    except Exception as e:
        print(f"❌ ไม่สามารถอ่านไฟล์ได้: {e}")
        return None, 0

def convert_encoding(input_file, output_file=None, source_encoding=None, target_encoding='utf-8'):
    """
    แปลง encoding ของไฟล์ CSV
    
    Args:
        input_file: ไฟล์ต้นทาง
        output_file: ไฟล์ปลายทาง (ถ้าไม่ระบุจะแทนที่ไฟล์เดิม)
        source_encoding: encoding ต้นทาง (ถ้าไม่ระบุจะตรวจสอบอัตโนมัติ)
        target_encoding: encoding ปลายทาง (default: utf-8)
    """
    if not os.path.exists(input_file):
        print(f"❌ ไม่พบไฟล์: {input_file}")
        return False
    
    # ตรวจสอบ encoding อัตโนมัติถ้าไม่ระบุ
    if source_encoding is None:
        print("🔍 กำลังตรวจสอบ encoding ของไฟล์...")
        detected_encoding, confidence = detect_encoding(input_file)
        if detected_encoding and confidence > 0.7:
            source_encoding = detected_encoding
            print(f"✅ ตรวจพบ encoding: {source_encoding} (ความมั่นใจ: {confidence:.1%})")
        else:
            # ลองใช้ encoding ที่พบบ่อยสำหรับ Windows/Thai
            common_encodings = ['cp1252', 'tis-620', 'iso-8859-1', 'utf-8']
            print(f"⚠️  ไม่สามารถตรวจสอบ encoding ได้แน่ชัด")
            print(f"   จะลองใช้ encoding ต่อไปนี้: {', '.join(common_encodings)}")
            source_encoding = common_encodings[0]  # เริ่มจาก cp1252
    
    # ตั้งชื่อไฟล์ output
    if output_file is None:
        name, ext = os.path.splitext(input_file)
        output_file = f"{name}_utf8{ext}"
    
    # แปลง encoding
    try:
        print(f"\n📝 กำลังแปลงไฟล์...")
        print(f"   จาก: {source_encoding}")
        print(f"   เป็น: {target_encoding}")
        
        with open(input_file, 'r', encoding=source_encoding, errors='replace') as f_in:
            content = f_in.read()
        
        with open(output_file, 'w', encoding=target_encoding) as f_out:
            f_out.write(content)
        
        print(f"\n✅ แปลงไฟล์สำเร็จ!")
        print(f"   ไฟล์ต้นทาง: {input_file}")
        print(f"   ไฟล์ปลายทาง: {output_file}")
        print(f"\n💡 ตอนนี้คุณสามารถ import ไฟล์ '{output_file}' ใน MySQL Workbench")
        print(f"   โดยตั้งค่า Encoding เป็น 'utf-8'")
        return True
        
    except UnicodeDecodeError as e:
        print(f"\n❌ ไม่สามารถอ่านไฟล์ด้วย encoding '{source_encoding}' ได้")
        print(f"   ข้อผิดพลาด: {e}")
        print(f"\n💡 ลองระบุ encoding เอง:")
        print(f"   python convert_csv_encoding.py {input_file} --encoding cp1252")
        print(f"   หรือ")
        print(f"   python convert_csv_encoding.py {input_file} --encoding tis-620")
        return False
    except Exception as e:
        print(f"\n❌ เกิดข้อผิดพลาด: {e}")
        return False

def main():
    if len(sys.argv) < 2:
        print("=" * 60)
        print("CSV Encoding Converter")
        print("=" * 60)
        print("\nวิธีใช้:")
        print(f"  python {sys.argv[0]} <ไฟล์ CSV> [ไฟล์ output] [--encoding <encoding>]")
        print("\nตัวอย่าง:")
        print(f"  python {sys.argv[0]} data.csv")
        print(f"  python {sys.argv[0]} data.csv data_utf8.csv")
        print(f"  python {sys.argv[0]} data.csv --encoding cp1252")
        print(f"  python {sys.argv[0]} data.csv data_utf8.csv --encoding tis-620")
        print("\nEncoding ที่ใช้บ่อย:")
        print("  - cp1252 (Windows-1252) - สำหรับ Windows")
        print("  - tis-620 (TIS-620) - สำหรับภาษาไทย")
        print("  - iso-8859-1 (Latin-1)")
        print("  - utf-8")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = None
    source_encoding = None
    
    # Parse arguments
    i = 2
    while i < len(sys.argv):
        arg = sys.argv[i]
        if arg == '--encoding' and i + 1 < len(sys.argv):
            source_encoding = sys.argv[i + 1]
            i += 2
        elif not arg.startswith('--') and output_file is None:
            output_file = arg
            i += 1
        else:
            i += 1
    
    convert_encoding(input_file, output_file, source_encoding)

if __name__ == "__main__":
    main()


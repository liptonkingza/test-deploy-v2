#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script สำหรับแก้ไขไฟล์ CSV ที่มีปัญหา encoding
- แปลง encoding
- แก้ไขอักขระเสียหาย
- ตรวจสอบและแก้ไข Field Separator
"""

import sys
import os
import re

def fix_csv_file(input_file, output_file=None, source_encoding=None):
    """
    แก้ไขไฟล์ CSV ที่มีปัญหา encoding
    
    Args:
        input_file: ไฟล์ต้นทาง
        output_file: ไฟล์ปลายทาง (ถ้าไม่ระบุจะสร้างใหม่)
        source_encoding: encoding ต้นทาง (ถ้าไม่ระบุจะลองหลายๆ encoding)
    """
    if not os.path.exists(input_file):
        print(f"❌ ไม่พบไฟล์: {input_file}")
        return False
    
    if output_file is None:
        name, ext = os.path.splitext(input_file)
        output_file = f"{name}_fixed{ext}"
    
    # รายการ encoding ที่จะลอง
    encodings_to_try = ['utf-8', 'cp1252', 'tis-620', 'windows-874', 'iso-8859-1', 'latin-1']
    
    if source_encoding:
        encodings_to_try = [source_encoding] + encodings_to_try
    
    content = None
    used_encoding = None
    
    # ลองอ่านไฟล์ด้วย encoding ต่างๆ
    for encoding in encodings_to_try:
        try:
            print(f"🔍 กำลังลองอ่านด้วย encoding: {encoding}...")
            with open(input_file, 'r', encoding=encoding, errors='replace') as f:
                content = f.read()
            used_encoding = encoding
            print(f"✅ อ่านไฟล์สำเร็จด้วย encoding: {encoding}")
            break
        except Exception as e:
            print(f"   ❌ ไม่สามารถอ่านด้วย {encoding}: {e}")
            continue
    
    if content is None:
        print("❌ ไม่สามารถอ่านไฟล์ได้ด้วย encoding ใดๆ")
        return False
    
    # แก้ไขอักขระเสียหาย (แทนที่อักขระที่ไม่รู้จักด้วย space)
    print("🔧 กำลังแก้ไขอักขระเสียหาย...")
    # ลบอักขระควบคุมที่ไม่จำเป็น
    content = re.sub(r'[\x00-\x08\x0B-\x0C\x0E-\x1F]', '', content)
    
    # ตรวจสอบและแก้ไข Field Separator
    # ตรวจสอบว่ามี comma หรือ semicolon
    has_comma = ',' in content[:1000]  # ตรวจสอบ 1000 ตัวอักษรแรก
    has_semicolon = ';' in content[:1000]
    
    if has_comma and has_semicolon:
        print("⚠️  พบทั้ง comma และ semicolon ในไฟล์")
        print("   ใช้ comma เป็น Field Separator")
    elif has_semicolon and not has_comma:
        print("⚠️  พบ semicolon เป็น Field Separator")
        print("   ไฟล์จะใช้ semicolon เป็นตัวคั่น")
    
    # บันทึกไฟล์เป็น UTF-8
    print(f"💾 กำลังบันทึกไฟล์เป็น UTF-8...")
    try:
        with open(output_file, 'w', encoding='utf-8', newline='') as f:
            f.write(content)
        
        print(f"\n✅ แก้ไขไฟล์สำเร็จ!")
        print(f"   ไฟล์ต้นทาง: {input_file}")
        print(f"   Encoding ที่ใช้: {used_encoding}")
        print(f"   ไฟล์ปลายทาง: {output_file}")
        print(f"   Encoding ปลายทาง: UTF-8")
        print(f"\n💡 ตอนนี้คุณสามารถ import ไฟล์ '{output_file}' ใน MySQL Workbench")
        print(f"   โดยตั้งค่า:")
        print(f"   - Field Separator: {',' if has_comma else ';'}")
        print(f"   - Encoding: utf-8")
        return True
        
    except Exception as e:
        print(f"❌ ไม่สามารถบันทึกไฟล์ได้: {e}")
        return False

def main():
    if len(sys.argv) < 2:
        print("=" * 60)
        print("CSV File Fixer - แก้ไขปัญหา Encoding และอักขระเสียหาย")
        print("=" * 60)
        print("\nวิธีใช้:")
        print(f"  python {sys.argv[0]} <ไฟล์ CSV> [encoding]")
        print("\nตัวอย่าง:")
        print(f"  python {sys.argv[0]} legacy_customers.csv")
        print(f"  python {sys.argv[0]} legacy_customers.csv cp1252")
        print(f"  python {sys.argv[0]} legacy_customers.csv tis-620")
        sys.exit(1)
    
    input_file = sys.argv[1]
    source_encoding = sys.argv[2] if len(sys.argv) > 2 else None
    
    fix_csv_file(input_file, source_encoding=source_encoding)

if __name__ == "__main__":
    main()


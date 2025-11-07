# Quick Fix: แปลงไฟล์ CSV จาก Windows-1252 เป็น UTF-8
# ใช้สำหรับแก้ปัญหา encoding error ใน MySQL Workbench

param(
    [Parameter(Mandatory=$true)]
    [string]$InputFile,
    
    [string]$OutputFile = "",
    
    [string]$SourceEncoding = "Default"
)

# ตรวจสอบว่าไฟล์มีอยู่จริง
if (-not (Test-Path $InputFile)) {
    Write-Host "[ERROR] ไม่พบไฟล์: $InputFile" -ForegroundColor Red
    exit 1
}

# ตั้งชื่อไฟล์ output ถ้าไม่ระบุ
if ($OutputFile -eq "") {
    $name = [System.IO.Path]::GetFileNameWithoutExtension($InputFile)
    $ext = [System.IO.Path]::GetExtension($InputFile)
    $OutputFile = "${name}_utf8${ext}"
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CSV Encoding Converter" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "กำลังแปลงไฟล์..." -ForegroundColor Yellow
Write-Host "  จาก: $InputFile" -ForegroundColor Gray
Write-Host "  เป็น: $OutputFile" -ForegroundColor Gray
Write-Host "  Encoding: $SourceEncoding -> UTF-8" -ForegroundColor Gray
Write-Host ""

try {
    # อ่านไฟล์ด้วย encoding ต้นทาง
    $content = Get-Content $InputFile -Encoding $SourceEncoding -Raw
    
    # เขียนไฟล์ด้วย UTF-8
    [System.IO.File]::WriteAllText($OutputFile, $content, [System.Text.Encoding]::UTF8)
    
    Write-Host "[SUCCESS] แปลงไฟล์สำเร็จ!" -ForegroundColor Green
    Write-Host ""
    Write-Host "ไฟล์ที่แปลงแล้ว: $OutputFile" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "ตอนนี้คุณสามารถ import ไฟล์ '$OutputFile' ใน MySQL Workbench" -ForegroundColor Yellow
    Write-Host "โดยตั้งค่า Encoding เป็น 'utf-8'" -ForegroundColor Yellow
    Write-Host ""
    
} catch {
    Write-Host "[ERROR] ไม่สามารถแปลงไฟล์ได้: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "ลองระบุ encoding เอง:" -ForegroundColor Yellow
    Write-Host "  .\quick-fix-encoding.ps1 -InputFile '$InputFile' -SourceEncoding 'Windows-1252'" -ForegroundColor Gray
    Write-Host "  .\quick-fix-encoding.ps1 -InputFile '$InputFile' -SourceEncoding 'TIS-620'" -ForegroundColor Gray
    exit 1
}


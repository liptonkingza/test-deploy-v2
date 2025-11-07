@echo off
REM Quick Fix: แปลงไฟล์ CSV จาก Windows-1252 เป็น UTF-8
REM ใช้สำหรับแก้ปัญหา encoding error ใน MySQL Workbench

echo ========================================
echo CSV Encoding Converter (Windows-1252 to UTF-8)
echo ========================================
echo.

if "%~1"=="" (
    echo วิธีใช้: quick-fix-encoding.bat ^<ไฟล์ CSV^>
    echo.
    echo ตัวอย่าง: quick-fix-encoding.bat data.csv
    echo.
    pause
    exit /b 1
)

set INPUT_FILE=%~1
set OUTPUT_FILE=%~n1_utf8%~x1

if not exist "%INPUT_FILE%" (
    echo [ERROR] ไม่พบไฟล์: %INPUT_FILE%
    pause
    exit /b 1
)

echo กำลังแปลงไฟล์...
echo   จาก: %INPUT_FILE%
echo   เป็น: %OUTPUT_FILE%
echo.

REM ใช้ PowerShell เพื่อแปลง encoding
powershell -Command "$content = Get-Content '%INPUT_FILE%' -Encoding Default; Set-Content '%OUTPUT_FILE%' -Value $content -Encoding UTF8"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] แปลงไฟล์สำเร็จ!
    echo.
    echo ไฟล์ที่แปลงแล้ว: %OUTPUT_FILE%
    echo.
    echo ตอนนี้คุณสามารถ import ไฟล์ '%OUTPUT_FILE%' ใน MySQL Workbench
    echo โดยตั้งค่า Encoding เป็น 'utf-8'
    echo.
) else (
    echo.
    echo [ERROR] ไม่สามารถแปลงไฟล์ได้
    echo.
)

pause


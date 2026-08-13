@echo off
chcp 65001 >nul
title Scratch AR Adventure Local Server
cd /d "%~dp0"

echo ==============================================
echo   Scratch AR Adventure - Local Server v5.34
echo ==============================================
echo.

set PORT=5500

where py >nul 2>nul
if %errorlevel%==0 (
  start "Scratch AR Server" /min cmd /c "cd /d \"%~dp0\" && py -m http.server %PORT%"
  goto OPEN
)

where python >nul 2>nul
if %errorlevel%==0 (
  start "Scratch AR Server" /min cmd /c "cd /d \"%~dp0\" && python -m http.server %PORT%"
  goto OPEN
)

echo [ERROR] ไม่พบ Python ในเครื่อง
 echo กรุณาเปิดโฟลเดอร์ด้วย VS Code และใช้ Live Server แทน
pause
exit /b 1

:OPEN
echo กำลังเปิดเซิร์ฟเวอร์ที่ http://localhost:%PORT%
timeout /t 2 /nobreak >nul
start "" "http://localhost:%PORT%"
echo.
echo เปิดเกมแล้ว สามารถปิดหน้าต่างนี้ได้หลังใช้งานเสร็จ
 echo หากเกมยังไม่ขึ้น ให้รีเฟรชหน้าเว็บ 1 ครั้ง
pause

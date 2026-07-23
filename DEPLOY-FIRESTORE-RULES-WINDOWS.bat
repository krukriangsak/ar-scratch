@echo off
chcp 65001 > nul
echo ติดตั้ง Firebase CLI ถ้ายังไม่มี...
call npm install -g firebase-tools
if errorlevel 1 pause & exit /b 1
echo เข้าสู่ระบบ Firebase...
call firebase login
if errorlevel 1 pause & exit /b 1
echo เลือกโปรเจกต์ scratch-ar-adventure...
call firebase use scratch-ar-adventure
if errorlevel 1 pause & exit /b 1
echo กำลังเผยแพร่ Firestore Rules...
call firebase deploy --only firestore:rules
if errorlevel 1 pause & exit /b 1
echo สำเร็จ กรุณารอ 1 นาทีแล้วรีเฟรชเว็บไซต์ด้วย Ctrl+F5
pause

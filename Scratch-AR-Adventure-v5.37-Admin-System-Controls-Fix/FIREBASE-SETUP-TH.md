# ตั้งค่า Firebase ให้ระบบผู้ใช้หลายเครื่องทำงาน

เวอร์ชันนี้ไม่ใช้ Firebase Authentication จึงไม่ต้องเปิด Email/Password หรือ Anonymous provider และจะไม่เกิดข้อผิดพลาด `auth/operation-not-allowed`

## ขั้นตอนที่ต้องทำ

1. เข้า Firebase Console และเลือกโปรเจ็กต์ `scratch-ar-adventure`
2. ไปที่ **Build → Firestore Database**
3. หากยังไม่มีฐานข้อมูล ให้กด **Create database**
4. ไปที่แท็บ **Rules**
5. เปิดไฟล์ `firestore.rules` ในโปรเจ็กต์นี้ คัดลอกทั้งหมดไปวาง
6. กด **Publish**
7. เปิดเว็บผ่าน VS Code Live Server หรือ GitHub Pages ห้ามเปิดไฟล์ด้วย `file://`

## การทดสอบหลายเครื่อง

- เครื่องที่ 1 สมัครชื่อ `student01` และ PIN 4 หลัก
- เครื่องที่ 2 เปิด URL GitHub Pages เดียวกัน
- เข้าสู่ระบบด้วยชื่อและ PIN เดิม
- หน้า Admin จะเห็นผู้ใช้จากทุกเครื่องแบบเรียลไทม์

## ผู้ดูแลระบบ

- ชื่อผู้ใช้: `Krukriangsak`
- รหัสผ่าน: `22112547`

แก้ไขได้ใน `js/firebase-config.js`

## หมายเหตุความปลอดภัย

กฎเวอร์ชันนี้เปิดการอ่านและเขียนข้อมูลผู้เล่นเพื่อให้เว็บ Static บน GitHub Pages ใช้งานได้โดยไม่ต้องเปิด Sign-in provider เหมาะสำหรับต้นแบบ/การทดลองในชั้นเรียน ไม่ควรเก็บข้อมูลส่วนบุคคลที่ละเอียดอ่อน เมื่อใช้งานจริงในวงกว้างควรย้ายการตรวจ PIN และสิทธิ์ผู้ดูแลไป Cloud Functions หรือระบบ backend

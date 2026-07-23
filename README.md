# Scratch AR Adventure v4.0 Cloud Database Edition

ระบบเกมเรียนรู้ Scratch ป.4 แบบ AR พร้อมกล้อง ตรวจจับมือ เสียงอ่าน บทเรียน ด่าน คะแนน ดาว เช็กอิน ตารางอันดับ และ Admin Studio

## สิ่งใหม่ใน v4.0

- ใช้ Firebase Authentication สำหรับบัญชีผู้เล่นและผู้ดูแล
- ใช้ Cloud Firestore บันทึกผู้เล่น คะแนน ดาว ความก้าวหน้า เช็กอิน และกิจกรรม
- นักเรียนเข้าสู่บัญชีเดิมจากคอมพิวเตอร์ โทรศัพท์ หรือแท็บเล็ตเครื่องอื่นได้
- ตารางอันดับอ่านข้อมูลผู้เล่นจากฐานข้อมูลออนไลน์
- Admin เห็นและแก้ไขผู้เล่นจากทุกเครื่อง
- บทเรียน ด่าน การเชื่อมโยง และธีมที่ Admin แก้ไขจะซิงก์ไปยังทุกเครื่อง
- มี localStorage เป็นแคชสำรอง และ Firestore Offline Persistence
- เมื่อยังไม่ตั้งค่า Firebase ระบบยังเปิดเล่นแบบ Local Mode ได้

## 1. สร้าง Firebase Project

1. เข้า Firebase Console และสร้าง Project
2. เพิ่ม Web App
3. เปิด Authentication > Sign-in method > Email/Password
4. เปิด Cloud Firestore
5. คัดลอก Firebase config

## 2. ใส่ Firebase config

เปิดไฟล์ `js/firebase-config.js` แล้วแทนค่าที่ขึ้นต้นด้วย `PUT_YOUR_...`

```js
window.SAR_FIREBASE_CONFIG = {
  apiKey: "...",
  authDomain: "ชื่อโปรเจกต์.firebaseapp.com",
  projectId: "ชื่อโปรเจกต์",
  storageBucket: "ชื่อโปรเจกต์.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
```

ตั้งค่าเพิ่มเติม:

```js
window.SAR_CLOUD_OPTIONS = {
  enabled: true,
  playerEmailDomain: "players.scratchar.app",
  adminEmail: "อีเมลผู้ดูแลที่สร้างใน Firebase Authentication",
  schoolId: "default-school"
};
```

## 3. ตั้ง Firestore Security Rules

คัดลอกเนื้อหาจาก `firestore.rules` ไปวางที่ Firestore Database > Rules แล้วกด Publish

## 4. สร้างบัญชีผู้ดูแล

1. Firebase Authentication > Users > Add user
2. สร้างด้วยอีเมลและรหัสผ่านที่ต้องการ
3. คัดลอก UID ของบัญชีนั้น
4. Firestore > Start collection ชื่อ `admins`
5. Document ID ใช้ UID ที่คัดลอก
6. เพิ่ม field `role` ชนิด string ค่า `admin`
7. ใส่อีเมลเดียวกันใน `adminEmail` ภายใน `js/firebase-config.js`

เมื่อเปิดหน้า Admin สามารถกรอกชื่อ `Krukriangsak` หรืออีเมลผู้ดูแลก็ได้ ระบบจะใช้อีเมลจาก config ในการยืนยันตัวตน รหัสผ่านคือรหัสของบัญชี Firebase ไม่ใช่รหัสที่ฝังใน JavaScript

## 5. เปิดระบบ

### VS Code

1. เปิดโฟลเดอร์ใน VS Code
2. ติดตั้ง Live Server
3. คลิกขวา `index.html`
4. เลือก Open with Live Server

### Python

```bash
python -m http.server 5500
```

จากนั้นเปิด `http://localhost:5500`

### GitHub Pages

อัปโหลดไฟล์ทั้งหมดขึ้น Repository แล้วเปิด Pages ตามปกติ จากนั้นเพิ่มโดเมน GitHub Pages ใน Firebase Authentication > Settings > Authorized domains

## การทำงานของบัญชีผู้เล่น

นักเรียนใช้ชื่อผู้เล่นและ PIN 4 หลักเหมือนเดิม ระบบจะแปลงข้อมูลดังกล่าวเป็นบัญชี Firebase Authentication ภายในโดยอัตโนมัติ PIN จะไม่ถูกบันทึกลง Firestore แบบข้อความธรรมดา

## หมายเหตุสำคัญ

- ต้องเชื่อมต่ออินเทอร์เน็ตเพื่อโหลด MediaPipe และ Firebase SDK จาก CDN
- กล้องต้องเปิดผ่าน HTTPS หรือ localhost
- Firebase config ไม่ใช่รหัสลับ การป้องกันฐานข้อมูลขึ้นอยู่กับ Authentication และ Firestore Rules
- อย่าเปิดสิทธิ์ Firestore เป็น `allow read, write: if true`
- Local Mode เหมาะสำหรับทดสอบเครื่องเดียวเท่านั้น หากต้องการข้อมูลร่วมกันทุกเครื่องต้องตั้ง Firebase ให้ครบ

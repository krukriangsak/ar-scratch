# Scratch AR Adventure v5.0 Classroom Live Edition

เพิ่มระบบรางวัลรายวัน 1–10 คะแนน ปฏิทินไทยและเวลาจริง ประกาศเคลื่อนไหว ระบบเสียงส่วนกลาง ปุ่มเปิดปิดกล้อง โหมดปรับปรุง และ Scratch Level Studio แบบเลือกบล็อกพร้อม Stage Preview

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

## v4.1 Online Users

เวอร์ชันนี้ใส่ Firebase config ของโปรเจ็กต์ `scratch-ar-adventure` แล้ว และเพิ่ม:

- สมัครผู้เล่นจากเครื่องใดก็ได้ แล้วรวมข้อมูลไว้ใน Firestore เดียวกัน
- เข้าสู่ระบบด้วยชื่อผู้เล่นและ PIN จากเครื่องอื่น
- ตารางคะแนนรวมผู้เล่นทุกเครื่อง
- Admin แสดงรายชื่อผู้เล่นแบบ Real-time
- แสดงออนไลน์/ออฟไลน์จาก `lastSeen`
- Admin สร้างผู้ใช้ใหม่ พร้อมชื่อ ชั้น PIN และ Avatar
- Admin แก้คะแนน ดาว ชั้นเรียน ระงับหรือเปิดใช้บัญชี

### ต้องเปิดบริการก่อนใช้งาน

1. Firebase Console > Authentication > Sign-in method > เปิด Email/Password
2. Firebase Console > Firestore Database > Create database
3. Firestore > Rules > วางเนื้อหาจาก `firestore.rules` แล้วกด Publish
4. Authentication > Settings > Authorized domains เพิ่มโดเมน GitHub Pages เช่น `ชื่อผู้ใช้.github.io`

### สร้างผู้ดูแลระบบ

1. Authentication > Users > Add user แล้วสร้างด้วยอีเมลและรหัสผ่านของครู
2. คัดลอก UID ของผู้ใช้นั้น
3. Firestore Database > Start collection ชื่อ `admins`
4. Document ID ใช้ UID ที่คัดลอก
5. เพิ่ม field `role` ชนิด string ค่า `admin`
6. ใส่อีเมลเดียวกันใน `js/firebase-config.js` ช่อง `adminEmail` หรือกรอกอีเมลในหน้า Admin โดยตรง

หมายเหตุ: การลบผู้เล่นจากหน้า Admin จะลบเอกสารข้อมูล Firestore แต่การลบบัญชี Authentication อย่างสมบูรณ์ต้องทำใน Firebase Console เนื่องจากเว็บฝั่งผู้ใช้ไม่มี Firebase Admin SDK

---

## การแก้ไข v4.2 No-Auth Firestore

รุ่นนี้ยกเลิกการเรียก `createUserWithEmailAndPassword` และ `signInWithEmailAndPassword` แล้ว จึงไม่ต้องเปิด Sign-in provider ใน Firebase Authentication ผู้เล่นใช้ชื่อและ PIN โดยตรวจสอบกับ Firestore โดยตรง

กรุณาเผยแพร่กฎจากไฟล์ `firestore.rules` ก่อนใช้งาน ดูรายละเอียดใน `FIREBASE-SETUP-TH.md`

## สำคัญ: เมื่อพบ Missing or insufficient permissions

ให้เปิดไฟล์ `แก้-Missing-or-insufficient-permissions.md` และเผยแพร่ `firestore.rules` ไปยัง Firebase Console ก่อน เว็บที่อัป GitHub เพียงอย่างเดียวจะไม่อัปเดตกฎของฐานข้อมูลให้โดยอัตโนมัติ


## เพิ่มใน v5.1
- ปุ่มเปิด–ปิดการเลื่อนหน้าด้วยท่าชูสองนิ้ว โดยปิดเฉพาะการเลื่อนและยังใช้การหนีบนิ้วกดปุ่มได้
- จำการตั้งค่าการเลื่อนด้วยนิ้วในเครื่องผู้เล่น
- ปุ่มติดต่อผู้ดูแลแบบลอย พร้อม Facebook เริ่มต้น
- หน้าแอดมินเมนู “ช่องทางติดต่อ” สำหรับเพิ่ม แก้ไข ลบ และเปิด–ปิดช่องทางติดต่อแบบเรียลไทม์ผ่าน Firestore system/contacts


## v5.5 Shared English Block Library
- Player Scratch Playground and Admin Creator Studio use `js/block-library.js` as the same canonical registry.
- Admin publishes to `schools/{schoolId}/system/blockStudio`.
- Player loads the document and listens in realtime.
- Blocks use English Scratch-style labels; Thai explanations may remain in lessons.
- Each block keeps the same `id`, `cat/category`, `op/opcode`, shape, inputs, enabled status and version.


## v5.6 Editable JavaScript Blocks
Creator Studio can edit English block labels, shapes, opcodes, publishing status, and JavaScript actions. Enable “Run the JavaScript below” to override the built-in runtime action.


## v5.14 English Scratch Playground
- Scratch Playground block categories are displayed in English: Motion, Looks, Sound, Events, Control, Sensing, Operators, Variables, My Blocks.
- Block labels are English and follow Scratch-style wording.
- Legacy Thai labels loaded from localStorage/Firestore are normalized to the canonical English label when possible.
- Creator Studio shares the same library and now includes a separate My Blocks category.
- Stage controls, sprite names, backdrops, save/load controls, code area, status text, and Playground messages are English.


## v5.16 Creator Shared Block Library
Creator Studio and Scratch Playground now use the same shared English block registry and Block IDs. See UPDATE-v5.16.txt.


## v5.35 – Multiple lesson media
Admin can attach multiple images, videos, audio files, and links to each lesson. The editor has no fixed item-count cap; practical limits are imposed by browser/Firebase storage constraints.

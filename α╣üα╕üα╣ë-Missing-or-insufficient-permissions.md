# แก้ข้อผิดพลาด Missing or insufficient permissions

ข้อผิดพลาดนี้เกิดจาก **Firestore Rules ที่เผยแพร่อยู่ใน Firebase Console ยังไม่อนุญาตให้เว็บอ่านหรือเขียนข้อมูล** ไม่ได้เกิดจาก VS Code หรือ GitHub Pages

## วิธีที่เร็วที่สุดผ่าน Firebase Console

1. เข้า Firebase Console และเลือกโปรเจกต์ `scratch-ar-adventure`
2. ไปที่ **Build → Firestore Database**
3. ตรวจสอบว่าได้สร้างฐานข้อมูลแล้ว และเลือกฐานข้อมูล `(default)`
4. เปิดแท็บ **Rules**
5. ลบกฎเดิม แล้วคัดลอกเนื้อหาจากไฟล์ `firestore.rules`
6. กด **Publish**
7. รอประมาณ 1 นาที จากนั้นกลับเว็บไซต์และกด `Ctrl + F5`

กฎทดสอบใน ZIP นี้คือ:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## วิธีผ่าน VS Code / Terminal

เปิดโฟลเดอร์โปรเจกต์ใน VS Code แล้วรัน:

```bash
npm install -g firebase-tools
firebase login
firebase use scratch-ar-adventure
firebase deploy --only firestore:rules
```

หรือดับเบิลคลิกไฟล์ `DEPLOY-FIRESTORE-RULES-WINDOWS.bat`

## ตรวจสอบเพิ่มเติม

- ต้องอยู่ในโปรเจกต์ `scratch-ar-adventure` ไม่ใช่โปรเจกต์อื่น
- ต้องเผยแพร่กฎของฐานข้อมูล `(default)`
- ถ้าเปิด **App Check enforcement** สำหรับ Cloud Firestore ให้ปิดชั่วคราวระหว่างทดสอบ หรือกำหนด App Check ให้เว็บไซต์ก่อน
- หลังเผยแพร่กฎ อาจใช้เวลาสักครู่จึงมีผลกับ listener เดิม

> กฎ `allow read, write: if true` เหมาะสำหรับการทดลองเท่านั้น เพราะผู้ที่รู้ Project ID สามารถอ่านและแก้ข้อมูลได้ ควรเปลี่ยนไปใช้ Firebase Authentication ก่อนใช้งานจริง

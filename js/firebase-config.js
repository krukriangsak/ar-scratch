// ตั้งค่าจาก Firebase Console > Project settings > Your apps > Web app
// Firebase config สามารถอยู่ในหน้าเว็บได้ ความปลอดภัยต้องควบคุมด้วย Authentication และ Firestore Rules
window.SAR_FIREBASE_CONFIG = {
  apiKey: "PUT_YOUR_API_KEY_HERE",
  authDomain: "PUT_YOUR_PROJECT.firebaseapp.com",
  projectId: "PUT_YOUR_PROJECT_ID_HERE",
  storageBucket: "PUT_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PUT_YOUR_SENDER_ID_HERE",
  appId: "PUT_YOUR_APP_ID_HERE"
};
window.SAR_CLOUD_OPTIONS = {
  enabled: true,
  playerEmailDomain: "players.scratchar.app",
  adminEmail: "", // ใส่อีเมลบัญชีผู้ดูแล Firebase Authentication
  schoolId: "default-school"
};

const configured=()=>{const c=window.SAR_FIREBASE_CONFIG||{};return !!(c.apiKey&&!String(c.apiKey).includes('PUT_YOUR')&&c.projectId)};
async function sha256(text){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
class CloudService{
 constructor(){this.enabled=false;this.db=null;this.auth=null;this.schoolId='default-school';this.unsubscribePlayers=null}
 async init(){
  if(!window.firebase||!configured()||window.SAR_CLOUD_OPTIONS?.enabled===false){console.warn('Firebase ยังไม่ได้ตั้งค่า ใช้ localStorage ชั่วคราว');return false}
  try{
   if(!firebase.apps.length)firebase.initializeApp(window.SAR_FIREBASE_CONFIG);
   this.auth=firebase.auth(); this.db=firebase.firestore(); this.schoolId=window.SAR_CLOUD_OPTIONS?.schoolId||'default-school'; this.enabled=true;
   await this.db.enablePersistence({synchronizeTabs:true}).catch(()=>{}); return true
  }catch(e){console.error('Firebase init failed',e);return false}
 }
 async playerEmail(name){const h=await sha256(name.trim().toLowerCase());return `p-${h.slice(0,32)}@${window.SAR_CLOUD_OPTIONS?.playerEmailDomain||'players.scratchar.app'}`}
 playerPassword(pin){return `SaA!${pin}#2026`}
 userRef(uid){return this.db.collection('schools').doc(this.schoolId).collection('players').doc(uid)}
 playersRef(){return this.db.collection('schools').doc(this.schoolId).collection('players')}
 normalizePlayer(d,id){const x={...d,id:id||d.id}; if(x.lastSeen?.toDate)x.lastSeen=x.lastSeen.toDate().toISOString(); if(x.createdAt?.toDate)x.createdAt=x.createdAt.toDate().toISOString(); return x}
 async registerPlayer(profile,pin){
  const name=profile.name.trim(); const email=await this.playerEmail(name);
  const cred=await this.auth.createUserWithEmailAndPassword(email,this.playerPassword(pin));
  const u={...profile,id:cred.user.uid,uid:cred.user.uid,name,usernameKey:(await sha256(name.toLowerCase())).slice(0,32),status:'active',online:true,createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp(),lastSeen:firebase.firestore.FieldValue.serverTimestamp()};
  delete u.pin; await this.userRef(cred.user.uid).set(u); return {...profile,id:cred.user.uid,uid:cred.user.uid,name,pin,online:true,status:'active'}
 }
 async loginPlayer(name,pin){
  const email=await this.playerEmail(name); const cred=await this.auth.signInWithEmailAndPassword(email,this.playerPassword(pin));
  const snap=await this.userRef(cred.user.uid).get(); if(!snap.exists)throw new Error('ไม่พบข้อมูลผู้เล่น');
  const data=snap.data(); if(data.status==='disabled')throw new Error('บัญชีนี้ถูกระงับ');
  await this.userRef(cred.user.uid).set({online:true,lastSeen:firebase.firestore.FieldValue.serverTimestamp(),lastLoginAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
  return {...this.normalizePlayer(data,cred.user.uid),pin,online:true}
 }
 async savePlayer(user){if(!this.enabled||!user?.id)return;const clean={...user,uid:user.id,online:true,lastSeen:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()};delete clean.pin;delete clean.id;await this.userRef(user.id).set(clean,{merge:true})}
 async heartbeat(user){if(!this.enabled||!user?.id)return;await this.userRef(user.id).set({online:true,lastSeen:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})}
 async markOffline(user){if(!this.enabled||!user?.id)return;try{await this.userRef(user.id).set({online:false,lastSeen:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})}catch{}}
 async deletePlayer(user){if(!this.enabled||!user?.id)return;await this.userRef(user.id).delete();if(this.auth.currentUser?.uid===user.id)await this.auth.currentUser.delete()}
 async listPlayers(){if(!this.enabled)return [];const s=await this.playersRef().orderBy('score','desc').limit(1000).get();return s.docs.map(d=>this.normalizePlayer(d.data(),d.id))}
 subscribeToPlayers(callback){if(!this.enabled)return()=>{};if(this.unsubscribePlayers)this.unsubscribePlayers();this.unsubscribePlayers=this.playersRef().orderBy('score','desc').limit(1000).onSnapshot(s=>callback(s.docs.map(d=>this.normalizePlayer(d.data(),d.id))),e=>console.error('players realtime',e));return this.unsubscribePlayers}
 async createPlayerAsAdmin(profile,pin){
  if(!this.enabled)throw new Error('ยังไม่ได้เชื่อม Firebase');
  const name=profile.name.trim(); if(!name||!/^[0-9]{4}$/.test(pin))throw new Error('กรอกชื่อและ PIN 4 หลัก');
  const email=await this.playerEmail(name);
  let secondary=firebase.apps.find(a=>a.name==='PlayerCreator'); if(!secondary)secondary=firebase.initializeApp(window.SAR_FIREBASE_CONFIG,'PlayerCreator');
  const secondaryAuth=secondary.auth();
  try{
   const cred=await secondaryAuth.createUserWithEmailAndPassword(email,this.playerPassword(pin));
   const u={uid:cred.user.uid,name,classroom:profile.classroom||'',avatar:profile.avatar||'🐱',score:Number(profile.score||0),stars:Number(profile.stars||0),completedLessons:[],levelRuns:{},checkins:[],status:'active',online:false,usernameKey:(await sha256(name.toLowerCase())).slice(0,32),createdBy:'admin',createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp(),lastSeen:firebase.firestore.FieldValue.serverTimestamp()};
   await this.userRef(cred.user.uid).set(u); await secondaryAuth.signOut(); return {...u,id:cred.user.uid,pin}
  }catch(e){try{await secondaryAuth.signOut()}catch{} throw e}
 }
 async updatePlayerAsAdmin(user){if(!this.enabled||!user?.id)return;const clean={...user,uid:user.id,updatedAt:firebase.firestore.FieldValue.serverTimestamp()};delete clean.pin;delete clean.id;delete clean.online;delete clean.lastSeen;await this.userRef(user.id).set(clean,{merge:true})}
 async setPlayerStatus(uid,status){await this.userRef(uid).set({status,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})}
 async saveEvent(event){if(!this.enabled)return;await this.db.collection('schools').doc(this.schoolId).collection('events').add({...event,serverAt:firebase.firestore.FieldValue.serverTimestamp()})}
 async loadShared(){if(!this.enabled)return {};const [content,settings]=await Promise.all([this.db.collection('schools').doc(this.schoolId).collection('system').doc('content').get(),this.db.collection('schools').doc(this.schoolId).collection('system').doc('settings').get()]);return {content:content.exists?content.data():null,settings:settings.exists?settings.data():null}}
 async saveShared(data){if(!this.enabled)return;const base=this.db.collection('schools').doc(this.schoolId).collection('system');if(data.lessons||data.levels)await base.doc('content').set({lessons:data.lessons||[],levels:data.levels||[],updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});if(data.settings)await base.doc('settings').set({...data.settings,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})}
 async adminLogin(identifier,password){if(!this.enabled)throw new Error('ยังไม่ได้ตั้งค่า Firebase');const email=identifier.includes('@')?identifier:(window.SAR_CLOUD_OPTIONS?.adminEmail||'');if(!email)throw new Error('กรุณาใช้อีเมลผู้ดูแล หรือใส่ adminEmail ใน firebase-config.js');const cred=await this.auth.signInWithEmailAndPassword(email,password);const a=await this.db.collection('admins').doc(cred.user.uid).get();if(!a.exists||a.data().role!=='admin'){await this.auth.signOut();throw new Error('บัญชีนี้ไม่มีสิทธิ์ผู้ดูแล')}return true}
 async signOut(){if(this.enabled){const u=this.auth.currentUser;if(u){try{await this.userRef(u.uid).set({online:false,lastSeen:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})}catch{}}await this.auth.signOut()}}
}
export const cloud=new CloudService();

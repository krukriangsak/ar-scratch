const configured=()=>{const c=window.SAR_FIREBASE_CONFIG||{};return !!(c.apiKey&&!String(c.apiKey).includes('PUT_YOUR')&&c.projectId)};
async function sha256(text){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
class CloudService{
 constructor(){this.enabled=false;this.db=null;this.schoolId='default-school';this.unsubscribePlayers=null}
 async init(){
  if(!window.firebase||!configured()||window.SAR_CLOUD_OPTIONS?.enabled===false){console.warn('Firebase ยังไม่ได้ตั้งค่า ใช้ localStorage ชั่วคราว');return false}
  try{
   if(!firebase.apps.length)firebase.initializeApp(window.SAR_FIREBASE_CONFIG);
   this.db=firebase.firestore();this.schoolId=window.SAR_CLOUD_OPTIONS?.schoolId||'default-school';this.enabled=true;
   await this.db.enablePersistence({synchronizeTabs:true}).catch(()=>{});return true
  }catch(e){console.error('Firebase init failed',e);this.enabled=false;return false}
 }
 async playerId(name){return (await sha256(name.trim().toLowerCase())).slice(0,40)}
 async pinHash(name,pin){return sha256(`${name.trim().toLowerCase()}|${pin}|${window.SAR_CLOUD_OPTIONS?.pinSalt||'scratch-ar-2026'}`)}
 userRef(uid){return this.db.collection('schools').doc(this.schoolId).collection('players').doc(uid)}
 playersRef(){return this.db.collection('schools').doc(this.schoolId).collection('players')}
 normalizePlayer(d,id){const x={...d,id:id||d.id};delete x.pinHash;if(x.lastSeen?.toDate)x.lastSeen=x.lastSeen.toDate().toISOString();if(x.createdAt?.toDate)x.createdAt=x.createdAt.toDate().toISOString();return x}
 async registerPlayer(profile,pin){
  if(!this.enabled)throw new Error('ยังไม่ได้เชื่อม Firebase');
  const name=profile.name.trim(),uid=await this.playerId(name),ref=this.userRef(uid),hash=await this.pinHash(name,pin);
  await this.db.runTransaction(async tx=>{const snap=await tx.get(ref);if(snap.exists)throw Object.assign(new Error('ชื่อนี้มีแล้ว กรุณาเข้าสู่บัญชีเดิม'),{code:'username-already-exists'});const u={...profile,id:undefined,uid,name,usernameKey:uid,pinHash:hash,status:'active',online:true,createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp(),lastSeen:firebase.firestore.FieldValue.serverTimestamp(),lastLoginAt:firebase.firestore.FieldValue.serverTimestamp()};delete u.pin;delete u.id;tx.set(ref,u)});
  return {...profile,id:uid,uid,name,pin,online:true,status:'active'}
 }
 async loginPlayer(name,pin){
  if(!this.enabled)throw new Error('ยังไม่ได้เชื่อม Firebase');
  const uid=await this.playerId(name),snap=await this.userRef(uid).get();if(!snap.exists)throw new Error('ชื่อหรือ PIN ไม่ถูกต้อง');
  const data=snap.data(),hash=await this.pinHash(data.name||name,pin);if(hash!==data.pinHash)throw new Error('ชื่อหรือ PIN ไม่ถูกต้อง');if(data.status==='disabled')throw new Error('บัญชีนี้ถูกระงับ');
  await this.userRef(uid).set({online:true,lastSeen:firebase.firestore.FieldValue.serverTimestamp(),lastLoginAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});return {...this.normalizePlayer(data,uid),pin,online:true}
 }
 async savePlayer(user){if(!this.enabled||!user?.id)return;const clean={...user,uid:user.id,online:true,lastSeen:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()};delete clean.pin;delete clean.pinHash;delete clean.id;await this.userRef(user.id).set(clean,{merge:true})}
 async heartbeat(user){if(!this.enabled||!user?.id)return;await this.userRef(user.id).set({online:true,lastSeen:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})}
 async markOffline(user){if(!this.enabled||!user?.id)return;try{await this.userRef(user.id).set({online:false,lastSeen:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})}catch{}}
 async deletePlayer(user){if(!this.enabled||!user?.id)return;await this.userRef(user.id).delete()}
 async listPlayers(){if(!this.enabled)return [];const s=await this.playersRef().get();return s.docs.map(d=>this.normalizePlayer(d.data(),d.id)).sort((a,b)=>(b.score||0)-(a.score||0))}
 subscribeToPlayers(callback){if(!this.enabled)return()=>{};if(this.unsubscribePlayers)this.unsubscribePlayers();this.unsubscribePlayers=this.playersRef().onSnapshot(s=>callback(s.docs.map(d=>this.normalizePlayer(d.data(),d.id)).sort((a,b)=>(b.score||0)-(a.score||0))),e=>console.error('players realtime',e));return this.unsubscribePlayers}
 async createPlayerAsAdmin(profile,pin){
  const name=profile.name.trim();if(!name||!/^[0-9]{4}$/.test(pin))throw new Error('กรอกชื่อและ PIN 4 หลัก');
  return this.registerPlayer({uid:'',name,classroom:profile.classroom||'',avatar:profile.avatar||'🐱',score:Number(profile.score||0),stars:Number(profile.stars||0),completedLessons:[],levelRuns:{},checkins:[],status:'active',online:false,createdBy:'admin'},pin)
 }
 async updatePlayerAsAdmin(user){if(!this.enabled||!user?.id)return;const clean={...user,uid:user.id,updatedAt:firebase.firestore.FieldValue.serverTimestamp()};delete clean.pin;delete clean.pinHash;delete clean.id;delete clean.online;delete clean.lastSeen;await this.userRef(user.id).set(clean,{merge:true})}
 async setPlayerStatus(uid,status){await this.userRef(uid).set({status,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})}
 async saveEvent(event){if(!this.enabled)return;await this.db.collection('schools').doc(this.schoolId).collection('events').add({...event,serverAt:firebase.firestore.FieldValue.serverTimestamp()})}
 async loadShared(){if(!this.enabled)return {};const base=this.db.collection('schools').doc(this.schoolId).collection('system');const [content,settings]=await Promise.all([base.doc('content').get(),base.doc('settings').get()]);return {content:content.exists?content.data():null,settings:settings.exists?settings.data():null}}
 async saveShared(data){if(!this.enabled)return;const base=this.db.collection('schools').doc(this.schoolId).collection('system');if(data.lessons||data.levels)await base.doc('content').set({lessons:data.lessons||[],levels:data.levels||[],updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});if(data.settings)await base.doc('settings').set({...data.settings,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})}
 async adminLogin(identifier,password){
  const opt=window.SAR_CLOUD_OPTIONS||{};const expectedUser=opt.adminUsername||'Krukriangsak',expectedPass=opt.adminPassword||'22112547';
  if(identifier!==expectedUser||password!==expectedPass)throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');return true
 }
 async signOut(){return true}
}
export const cloud=new CloudService();

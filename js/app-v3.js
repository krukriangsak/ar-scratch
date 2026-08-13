import {LESSONS,LEVELS,AVATARS,CATEGORIES,CATEGORY_NAMES,LESSON_UNITS,blockByText,blockHelp} from '../data/seed.js';
import {cameraManager} from './camera/camera-manager.js';
import {handTracker} from './hand-tracking/hand-tracker.js';
import {cloud} from './cloud-service.js';
window.__SAR_APP_BOOTED=true;
window.__SAR_APP_VERSION='5.34';
const $=s=>document.querySelector(s), app=$('#app');
const K={users:'sar.users.v3',session:'sar.session.v3',lessons:'sar.lessons.v3',levels:'sar.levels.v3',settings:'sar.settings.v3',events:'sar.events.v3',voice:'sar.voice.v5',camera:'sar.camera.v5',announcements:'sar.announcements.v5',maintenance:'sar.maintenance.v5',handScroll:'sar.handScroll.v5',contacts:'sar.contacts.v5'};
const get=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
if(!localStorage.getItem(K.lessons))set(K.lessons,LESSONS);if(!localStorage.getItem(K.levels))set(K.levels,LEVELS);
if(!localStorage.getItem('sar.v33.migrated')){localStorage.setItem('sar.backup.pre-v33',JSON.stringify({lessons:get(K.lessons,[]),levels:get(K.levels,[]),at:new Date().toISOString()}));set(K.lessons,LESSONS);set(K.levels,LEVELS);localStorage.setItem('sar.v33.migrated','1')}
let state={user:null,route:'auth',voice:get(K.voice,{enabled:true,lang:'th-TH',rate:.95,volume:1}).enabled,camera:get(K.camera,false),handScroll:get(K.handScroll,true),bot:{started:Date.now(),clicks:[]}};

const DEFAULT_CONTACTS={title:'ติดต่อผู้ดูแลระบบ',description:'พบปัญหาหรือต้องการสอบถาม สามารถติดต่อผ่านช่องทางด้านล่าง',channels:[{id:'facebook',label:'Facebook แอดมิน',icon:'📘',url:'https://www.facebook.com/kriang.sak.47',enabled:true}]};
function normalizeContacts(data){const x=data&&typeof data==='object'?data:{};return {title:x.title||DEFAULT_CONTACTS.title,description:x.description||DEFAULT_CONTACTS.description,channels:Array.isArray(x.channels)?x.channels:DEFAULT_CONTACTS.channels}}
function showContacts(data){const x=normalizeContacts(data);set(K.contacts,x);const title=$('#contactTitle'),desc=$('#contactDescription'),list=$('#contactList');if(title)title.textContent=`💬 ${x.title}`;if(desc)desc.textContent=x.description;if(list){const active=x.channels.filter(c=>c.enabled!==false&&c.url);list.innerHTML=active.map(c=>`<a class="contact-link" href="${String(c.url).replaceAll('"','&quot;')}" target="_blank" rel="noopener noreferrer"><span>${c.icon||'🔗'}</span><b>${c.label||'ช่องทางติดต่อ'}</b><small>เปิดลิงก์ติดต่อ</small></a>`).join('')||'<p>ยังไม่มีช่องทางติดต่อที่เปิดใช้งาน</p>'}}
function openContacts(){showContacts(get(K.contacts,DEFAULT_CONTACTS));$('#contactModal')?.classList.remove('hidden')}
function closeContacts(){$('#contactModal')?.classList.add('hidden')}
function updateHandScrollUI(){handTracker.setScrollEnabled(state.handScroll);const b=$('#handScrollToggle');if(b){b.classList.toggle('on',state.handScroll);b.textContent=state.handScroll?'✌️↕️':'🖱️↕️';b.title=state.handScroll?'ปิดการเลื่อนหน้าด้วยนิ้วมือ (ยังใช้มือกดได้)':'เปิดการเลื่อนหน้าด้วยนิ้วมือ'}}
function toggleHandScroll(){state.handScroll=!state.handScroll;set(K.handScroll,state.handScroll);updateHandScrollUI();toast(state.handScroll?'เปิดการเลื่อนด้วยสองนิ้วแล้ว':'ปิดการเลื่อนด้วยนิ้วแล้ว ใช้เมาส์เลื่อนได้ และยังใช้มือกดปุ่มได้')}
function applyTheme(){const t=get(K.settings,{}),r=document.documentElement;r.style.setProperty('--p',t.primary||'#6c5ce7');r.style.setProperty('--accent',t.accent||'#ffb703');r.style.setProperty('--panel-opacity',t.panelOpacity??.76);r.style.setProperty('--card-opacity',t.cardOpacity??.90);r.style.setProperty('--panel-blur',(t.blur??8)+'px');r.style.setProperty('--panel-radius',(t.radius??30)+'px');r.style.setProperty('--ui-scale',t.scale??1)}
const speechManager={speak(t,lang){const cfg=get(K.voice,{enabled:true,lang:'th-TH',rate:.95,volume:1});if(!cfg.enabled||!('speechSynthesis'in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(String(t||''));u.lang=lang||cfg.lang;u.rate=(lang||cfg.lang).startsWith('en')?Math.min(cfg.rate,.88):cfg.rate;u.volume=cfg.volume;u.onstart=()=>window.SARAudio?.duck(true);u.onend=u.onerror=()=>window.SARAudio?.duck(false);speechSynthesis.speak(u)},stop(){if('speechSynthesis'in window)speechSynthesis.cancel()}};const speak=(t,lang='th-TH')=>speechManager.speak(t,lang);
const toast=t=>{const e=$('#toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2200)};
const users=()=>get(K.users,[]), saveUsers=v=>set(K.users,v), lessons=()=>get(K.lessons,LESSONS), levels=()=>get(K.levels,LEVELS);
const escMedia=v=>String(v??'').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const cleanMediaUrl=v=>String(v||'').trim();
function youtubeEmbedUrl(url){try{const u=new URL(url,location.href);let id='';if(u.hostname.includes('youtu.be'))id=u.pathname.split('/').filter(Boolean)[0]||'';else if(u.hostname.includes('youtube.com')){if(u.pathname==='/watch')id=u.searchParams.get('v')||'';else if(u.pathname.startsWith('/shorts/'))id=u.pathname.split('/')[2]||'';else if(u.pathname.startsWith('/embed/'))id=u.pathname.split('/')[2]||'';}return id?`https://www.youtube.com/embed/${encodeURIComponent(id)}`:''}catch{return ''}}
function driveMediaUrl(url,kind='file'){try{const u=new URL(url,location.href);if(!u.hostname.includes('drive.google.com'))return url;const m=u.pathname.match(/\/file\/d\/([^/]+)/);const id=m?.[1]||u.searchParams.get('id');if(!id)return url;return kind==='image'?`https://drive.google.com/uc?export=view&id=${encodeURIComponent(id)}`:`https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`;}catch{return url}}
function lessonMediaHtml(l){const image=cleanMediaUrl(l.imageUrl),video=cleanMediaUrl(l.videoUrl),audio=cleanMediaUrl(l.audioUrl),yt=youtubeEmbedUrl(video);if(!image&&!video&&!audio)return '';return `<section class="card lesson-media-card"><div class="lesson-block-guide-head"><div><h3>🎨 สื่อประกอบบทเรียน</h3><p>ดูภาพ วิดีโอ หรือฟังเสียงได้จากในเกมโดยไม่ต้องออกไปหน้าอื่น</p></div></div><div class="lesson-media-grid">${image?`<figure class="lesson-media-item"><img src="${escMedia(driveMediaUrl(image,'image'))}" alt="ภาพประกอบ ${escMedia(l.title)}" loading="lazy"><figcaption>🖼️ ภาพประกอบ</figcaption></figure>`:''}${video?`<div class="lesson-media-item"><b>🎬 วิดีโอ</b>${yt?`<iframe src="${escMedia(yt)}" title="${escMedia(l.title)} video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`:`<video controls playsinline preload="metadata" src="${escMedia(driveMediaUrl(video,'file'))}"></video>`}</div>`:''}${audio?`<div class="lesson-media-item"><b>🔊 เสียงประกอบ</b><audio controls preload="metadata" src="${escMedia(driveMediaUrl(audio,'file'))}"></audio></div>`:''}</div></section>`}

function log(type,data={}){const event={type,data,at:new Date().toISOString(),userId:state.user?.id||null};const x=get(K.events,[]);x.push(event);set(K.events,x.slice(-3000));cloud.saveEvent(event).catch(console.error)}
function botGuard(action){const now=Date.now();state.bot.clicks=state.bot.clicks.filter(x=>now-x<5000);state.bot.clicks.push(now);if(state.bot.clicks.length>35){log('bot_flag',{action});toast('ตรวจพบการกดเร็วผิดปกติ กรุณารอสักครู่');return false}return true}
function currentUser(){if(!state.user)return null;return users().find(x=>x.id===state.user.id)||state.user}
function saveUser(u){const all=users(),i=all.findIndex(x=>x.id===u.id);if(i>=0)all[i]=u;else all.push(u);saveUsers(all);state.user=u;sessionStorage.setItem(K.session,JSON.stringify({id:u.id}));updateHeader();cloud.savePlayer(u).catch(console.error)}
function updateHeader(){const u=currentUser();$('#playerMini').textContent=u?`${u.avatar} ${u.name}`:'';$('#scoreMini').textContent=u?.score||0}
function route(name,data={}){window.SAR_READING_BOT?.stop?.();speechManager?.stop?.();state.route=name;location.hash=name+(data.id?'/'+data.id:'');render(data)}
function shell(html){app.innerHTML=`<section class="screen"><div class="panel">${html}</div></section>`}
async function enableCamera(){try{cameraManager.initialize({videoElement:$('#camera-video'),cameraLayer:$('#cameraLayer'),cameraPlaceholder:$('#camera-placeholder')});await cameraManager.start();handTracker.configure({videoElement:$('#camera-video'),canvasElement:$('#camera-canvas'),cursorElement:$('#hand-cursor'),statusElement:$('#hand-status'),statusIcon:$('#hand-status-icon'),statusTitle:$('#hand-status-title'),statusDescription:$('#hand-status-description'),guideElement:$('#hand-guide')});handTracker.setScrollEnabled(state.handScroll);await handTracker.start();state.camera=true;set(K.camera,true);document.body.classList.add('camera-active');document.querySelector('#cameraToggle')?.classList.add('on');document.querySelector('#cameraToggle')&&(document.querySelector('#cameraToggle').textContent='📹');toast('เปิดกล้องและตรวจจับมือแล้ว')}catch(e){console.error(e);document.body.classList.remove('camera-active');toast('เปิดกล้องไม่สำเร็จ ใช้เมาส์แทนได้')}}
function confirmCameraAccess(){return new Promise(resolve=>{const modal=$('#cameraConfirmModal'),yes=$('#cameraConfirmYes'),no=$('#cameraConfirmNo');if(!modal||!yes||!no){resolve(true);return}let done=false;const finish=value=>{if(done)return;done=true;modal.classList.add('hidden');yes.onclick=null;no.onclick=null;modal.onclick=null;document.removeEventListener('keydown',onKey);resolve(value)};const onKey=e=>{if(e.key==='Escape')finish(false)};yes.onclick=()=>finish(true);no.onclick=()=>finish(false);modal.onclick=e=>{if(e.target===modal)finish(false)};document.addEventListener('keydown',onKey);modal.classList.remove('hidden');yes.focus()})}
async function requestCameraEnable(){
  // v5.29: never trust the old localStorage camera flag. A real live MediaStream must exist.
  const live=!!(cameraManager.stream && cameraManager.stream.active && cameraManager.stream.getVideoTracks?.().some(t=>t.readyState==='live'));
  if(state.camera&&live)return true;
  if(!live){state.camera=false;document.body.classList.remove('camera-active');document.querySelector('#cameraToggle')?.classList.remove('on');}
  const allowed=await confirmCameraAccess();
  if(!allowed){toast('ยังไม่เปิดกล้อง ใช้เมาส์หรือหน้าจอสัมผัสได้');return false}
  await enableCamera();
  return state.camera
}
function render(){const [r,id]=location.hash.replace('#','').split('/');state.route=r||'welcome';const u=currentUser();$('#top').classList.toggle('hidden',!u||state.route==='welcome'||state.route==='auth');if(state.route==='welcome')return welcome();if(state.route==='auth')return auth();if(!u)return route('auth');if(state.route==='home')home();else if(state.route==='lessons')lessonList();else if(state.route==='lesson')lessonView(id);else if(state.route==='adventure')adventure();else if(state.route==='game')game(id);else if(state.route==='leaderboard')leaderboard();else if(state.route==='profile')profile();else home();updateHeader()}
function welcome(){shell(`<div class="hero"><div style="font-size:5rem">🐱✋</div><h1>Scratch AR Adventure</h1><p>เกมเรียนรู้ Scratch ป.4 ผ่านบล็อกภาษาอังกฤษ เสียงอ่าน และการควบคุมด้วยนิ้วมือ</p><div class="actions"><button id="enter" class="primary">เริ่มเข้าสู่เกมและอนุญาตกล้อง</button><button id="mouse" class="secondary">ใช้เมาส์ก่อน</button></div><p><small>กล้องและการตรวจจับมือทำงานต่อเนื่องทุกเมนูของผู้เล่น ยกเว้นหน้าผู้ดูแลระบบ</small></p></div>`);$('#enter').onclick=async()=>{await requestCameraEnable();route('auth')};$('#mouse').onclick=()=>route('auth')}
function auth(){shell(`<div class="cute-auth">
  <div class="auth-space-decor" aria-hidden="true"><span class="d-star s1">⭐</span><span class="d-star s2">✨</span><span class="d-planet">🪐</span><span class="d-rocket">🚀</span></div>
  <section class="auth-welcome">
    <div class="auth-mascot-wrap"><div class="auth-mascot">🐱</div><div class="auth-hand">✋</div><div class="auth-speech">พร้อมเขียนโค้ดหรือยัง?</div></div>
    <span class="auth-eyebrow">SCRATCH • AR • ADVENTURE</span>
    <h1>ยินดีต้อนรับนักสำรวจโค้ด! 🚀</h1>
    <p>เรียน Scratch ผ่านการผจญภัย ใช้เมาส์ก็ได้ หรือเปิดกล้องแล้วใช้มือหยิบ–ลากบล็อก AR ได้เลย</p>
    <div class="auth-feature-chips"><span>🧩 บล็อกอังกฤษ</span><span>✋ Hand Tracking</span><span>🔊 ช่วยอ่าน</span><span>⭐ สะสมดาว</span></div>
    <div class="auth-camera-state ${state.camera?'is-on':''}"><span>${state.camera?'📹':'📷'}</span><div><b>${state.camera?'กล้อง AR พร้อมแล้ว':'ยังไม่ได้เปิดกล้อง'}</b><small>${state.camera?'ลองชี้นิ้วและหนีบเพื่อกดได้เลย':'เปิดได้ตลอดจากปุ่มกล้องด้านขวาล่าง'}</small></div></div>
  </section>
  <section class="auth-actions-card">
    <div class="auth-card-title"><span>🎮</span><div><h2>เข้าสู่เกม</h2><p>เลือกวิธีเริ่มต้นของคุณ</p></div></div>
    <div class="auth-choice-grid">
      <button id="new" class="auth-choice new-player"><span class="auth-choice-icon">🌟</span><b>สมัครผู้เล่นใหม่</b><small>สร้างชื่อ ชั้น อวตาร และ PIN 4 หลัก</small><em>เริ่มผจญภัย →</em></button>
      <button id="old" class="auth-choice old-player"><span class="auth-choice-icon">🔐</span><b>เข้าสู่บัญชีเดิม</b><small>กลับมาเล่นต่อด้วยชื่อผู้เล่นและ PIN</small><em>กลับเข้าสู่เกม →</em></button>
    </div>
    <button id="authCameraQuick" class="auth-camera-quick ${state.camera?'is-on':''}" type="button">${state.camera?'📹 กล้อง AR เปิดอยู่':'📷 เปิดกล้อง AR และใช้มือเล่น'}</button>
    <div id="authbox" class="auth-form-box"></div>
    <p class="auth-safe-note">🔒 กล้องใช้เฉพาะการตรวจจับมือในหน้าเกม และสามารถปิดได้ทุกเวลา</p>
  </section>
</div>`);
  $('#new').onclick=()=>registerForm();
  $('#old').onclick=()=>loginForm();
  $('#authCameraQuick').onclick=async()=>{if(state.camera)await disableCamera();else await requestCameraEnable();auth()};
}
function registerForm(){const box=$('#authbox');box.innerHTML=`<div class="card" style="margin-top:18px;text-align:left"><h3>สมัครผู้เล่นใหม่</h3><label>ชื่อผู้เล่น<input id="rn" maxlength="20"></label><label>ชั้นเรียน<input id="rc" placeholder="ป.4/1"></label><label>PIN 4 หลัก<input id="rp" inputmode="numeric" maxlength="4"></label><div class="avatar-grid">${AVATARS.map((a,i)=>`<button class="avatar ${i===0?'active':''}" data-a="${a}">${a}</button>`).join('')}</div><input id="website" style="display:none" tabindex="-1" autocomplete="off"><button id="rs" class="primary">สมัครและเข้าสู่เกม</button></div>`;let av=AVATARS[0];box.querySelectorAll('[data-a]').forEach(b=>b.onclick=e=>{e.preventDefault();box.querySelectorAll('[data-a]').forEach(x=>x.classList.remove('active'));b.classList.add('active');av=b.dataset.a});$('#rs').onclick=async()=>{if(!botGuard('register'))return;const n=$('#rn').value.trim(),c=$('#rc').value.trim(),p=$('#rp').value.trim();if($('#website').value||Date.now()-state.bot.started<900)return toast('กรุณาลองใหม่');if(!n||!c||!/^[0-9]{4}$/.test(p))return toast('กรอกชื่อ ชั้น และ PIN 4 หลักให้ครบ');$('#rs').disabled=true;try{let u={id:crypto.randomUUID(),name:n,classroom:c,pin:p,avatar:av,score:0,stars:0,completedLessons:[],levelRuns:{},checkins:[],createdAt:new Date().toISOString()};if(cloud.enabled)u=await cloud.registerPlayer(u,p);else if(users().some(x=>x.name.toLowerCase()===n.toLowerCase()))throw new Error('ชื่อนี้มีแล้ว กรุณาใช้ชื่ออื่น');saveUser(u);log('register');route('home')}catch(e){console.error(e);toast(e.code==='auth/email-already-in-use'?'ชื่อนี้มีแล้ว กรุณาเข้าสู่บัญชีเดิม':(e.message||'สมัครไม่สำเร็จ'))}finally{$('#rs')&&($('#rs').disabled=false)}};}
function loginForm(){const box=$('#authbox');box.innerHTML=`<div class="card" style="margin-top:18px;text-align:left"><h3>เข้าสู่บัญชีเดิม</h3><label>ชื่อผู้เล่น<input id="ln"></label><label>PIN 4 หลัก<input id="lp" inputmode="numeric" maxlength="4"></label><button id="ls" class="primary">เข้าสู่ระบบ</button></div>`;$('#ls').onclick=async()=>{if(!botGuard('login'))return;const name=$('#ln').value.trim(),pin=$('#lp').value.trim();$('#ls').disabled=true;try{let u;if(cloud.enabled)u=await cloud.loginPlayer(name,pin);else u=users().find(x=>x.name.toLowerCase()===name.toLowerCase()&&x.pin===pin);if(!u)throw new Error('ชื่อหรือ PIN ไม่ถูกต้อง');saveUser(u);log('login');route('home')}catch(e){console.error(e);toast('ชื่อหรือ PIN ไม่ถูกต้อง')}finally{$('#ls')&&($('#ls').disabled=false)}}}
function thaiDateKey(d=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).format(d)}
function yesterdayKey(){const d=new Date();d.setDate(d.getDate()-1);return thaiDateKey(d)}
function home(){const u=currentUser(),today=thaiDateKey(),claimed=u.dailyRewards?.some(r=>r.date===today),streak=u.loginStreak||0,total=u.totalLoginDays||u.dailyRewards?.length||0;shell(`<h2>สวัสดี ${u.avatar} ${u.name}</h2><div class="stats"><div class="card stat"><b>${u.score||0}</b>คะแนน</div><div class="card stat"><b>${u.stars||0}</b>ดาว</div><div class="card stat"><b>${u.completedLessons?.length||0}</b>บทเรียน</div><div class="card stat"><b>${Object.keys(u.levelRuns||{}).length}</b>ด่าน</div></div><div class="card daily-reward"><h3>🎁 รางวัลเข้าเรียนประจำวัน</h3><p>${claimed?'รับรางวัลวันนี้แล้ว กลับมาใหม่พรุ่งนี้':'สุ่มรับคะแนน 1–10 คะแนน วันละ 1 ครั้ง'}</p><div class="reward-number">${claimed?'✅':'🎲'}</div><p>🔥 ต่อเนื่อง ${streak} วัน • 📅 เข้าเรียนรวม ${total} วัน</p><button id="checkin" class="primary" ${claimed?'disabled':''}>${claimed?'รับแล้ววันนี้':'สุ่มรับคะแนนวันนี้'}</button></div><div class="grid" style="margin-top:16px"><button class="card menu" data-r="lessons">📚 <b>บทเรียน</b><p>เรียนจบเพื่อปลดล็อกด่าน</p></button><button class="card menu" data-r="adventure">🗺️ <b>แผนที่ด่าน</b><p>ต่อบล็อก Scratch ภาษาอังกฤษ</p></button><button class="card menu" data-r="leaderboard">🏆 <b>การจัดอันดับ</b><p>รายวัน รายเดือน และทั้งหมด</p></button><button class="card menu" data-r="profile">👤 <b>บัญชีผู้เล่น</b><p>แก้ไข ออกจากระบบ หรือลบบัญชี</p></button></div>`);document.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>route(b.dataset.r));$('#checkin').onclick=()=>{const x=currentUser(),day=thaiDateKey();x.dailyRewards=x.dailyRewards||[];if(x.dailyRewards.some(r=>r.date===day))return;const reward=Math.floor(Math.random()*10)+1,last=x.lastDailyRewardDate;x.loginStreak=last===yesterdayKey()?(x.loginStreak||0)+1:1;x.totalLoginDays=(x.totalLoginDays||0)+1;x.lastDailyRewardDate=day;x.dailyRewards.push({date:day,points:reward,at:new Date().toISOString()});x.score=(x.score||0)+reward;saveUser(x);log('daily_reward',{date:day,score:reward});speak(`ยินดีด้วย วันนี้คุณได้รับ ${reward} คะแนน`);toast(`รับรางวัลวันนี้ +${reward} คะแนน`);home()}}

function lessonList(){const u=currentUser(),all=lessons().filter(x=>x.published!==false);shell(`<h2>📚 เส้นทางการเรียนรู้ Scratch</h2><p>เลือกหมวดใหญ่ก่อน แล้วค่อยเรียนบทเรียนย่อย เมื่อเรียนจบจึงปลดล็อกด่านที่เชื่อมโยง</p><div class="learning-path">${Object.entries(LESSON_UNITS).map(([key,unit])=>{const items=all.filter(l=>(l.unit||'commands')===key);if(!items.length)return '';const done=items.filter(l=>u.completedLessons?.includes(l.id)).length;return `<section class="unit-section"><div class="unit-head"><div><span class="unit-icon">${unit.icon}</span><h3>${unit.title}</h3><p>${unit.description}</p></div><b>${done}/${items.length}</b></div><div class="grid">${items.map(l=>`<div class="card lesson-card ${u.completedLessons?.includes(l.id)?'done':''}"><span class="tag">${l.id}</span><h3>${l.title}</h3><p>${l.content}</p><b>${u.completedLessons?.includes(l.id)?'✅ เรียนจบแล้ว':'🎁 '+l.points+' คะแนน'}</b><button class="primary" data-l="${l.id}">เปิดบทเรียน</button></div>`).join('')}</div></section>`}).join('')}</div>`);document.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>route('lesson',{id:b.dataset.l}))}
function blockCategory(item){const text=typeof item==='string'?item:(item?.label||item?.blockId||'');const known=blockByText(text);if(known&&known.text===text)return known.category;if(/green flag|key pressed|broadcast|receive/.test(text))return'events';if(/move|turn|go to|glide|change x|change y|edge/.test(text))return'motion';if(/say|costume|show|hide/.test(text))return'looks';if(/sound|volume/.test(text))return'sound';if(/repeat|forever|wait|if/.test(text))return'control';if(/touching|key \(|ask|answer/.test(text))return'sensing';if(/\+|>|and|join/.test(text))return'operators';if(/score|list|variable|add \(|delete|item|length/.test(text))return'variables';if(/define|jump/.test(text))return'myblocks';return'control'}
function blockHtml(item,attrs=''){const sb=window.SAR_BLOCK_FROM_LEVEL_ITEM?.(item),t=sb?window.SAR_FORMAT_BLOCK(sb):String(item),meta=blockByText(t),c=sb?.cat||sb?.category||meta.category||blockCategory(t),shape=sb?.shape||meta.shape||'stack';return `<div class="block shape-${shape}" style="--c:${CATEGORIES[c]}" ${attrs} data-category="${c}" data-shape="${shape}" data-block-id="${sb?.id||''}" data-text="${t.replaceAll('"','&quot;')}">${t}</div>`}
function lessonView(id){
  const l=lessons().find(x=>x.id===id);if(!l)return lessonList();
  const u=currentUser(),done=u.completedLessons?.includes(id);
  const lessonBlocks=l.blocks.map(x=>{const meta=blockByText(x),h=blockHelp(x,meta.category);return `<article class="block-lesson-item"><div class="block-lesson-code">${blockHtml(x)}</div><div class="block-lesson-info"><div><b>ความหมาย</b><p>${h.meaning}</p></div><div><b>ใช้ทำอะไร</b><p>${h.use}</p></div>${h.tip?`<div class="block-tip"><b>💡 ตัวอย่าง/เคล็ดลับ</b><p>${h.tip}</p></div>`:''}</div></article>`}).join('');
  const intro=l.blocks.length?`<div class="lesson-guide-intro"><b>🧠 เรียนรู้ทีละบล็อก</b><span>แตะบล็อกภาษาอังกฤษเพื่อฟังชื่อคำสั่ง แล้วอ่านความหมายและการใช้งาน</span></div>`:'';
  shell(`<button class="secondary" id="back">← กลับ</button><h2>${l.title}</h2><p class="lesson-summary">${l.content}</p>${lessonMediaHtml(l)}${intro}${l.blocks.length?`<section class="card lesson-block-guide"><div class="lesson-block-guide-head"><div><h3>🧩 บล็อกคำสั่งในบทเรียน</h3><p>ชื่อบล็อกเป็นภาษาอังกฤษตาม Scratch พร้อมคำอธิบายภาษาไทย</p></div><span class="tag">${l.blocks.length} บล็อก</span></div><div class="block-lesson-list">${lessonBlocks}</div></section>`:'<div class="card"><h3>📘 เนื้อหาพื้นฐาน</h3><p>บทเรียนนี้เน้นทำความรู้จักแนวคิดและส่วนประกอบของ Scratch ก่อนเริ่มใช้บล็อกคำสั่ง</p></div>'}<div class="actions"><button id="readth" class="secondary">🔊 อ่านเนื้อหาและความหมาย</button><button id="readen" class="secondary">🔤 อ่านชื่อบล็อกภาษาอังกฤษ</button><button id="finish" class="primary" ${done?'disabled':''}>${done?'เรียนจบแล้ว':'เรียนจบและรับ '+l.points+' คะแนน'}</button></div>`);
  $('#back').onclick=()=>route('lessons');
  $('#readth').onclick=()=>speak(`${l.title} ${l.content} ${l.blocks.map(x=>{const meta=blockByText(x),h=blockHelp(x,meta.category);return `${x} หมายถึง ${h.meaning} ใช้สำหรับ ${h.use}`}).join(' ')}`);
  $('#readen').onclick=()=>l.blocks.forEach((x,i)=>setTimeout(()=>speak(x,'en-US'),i*1800));
  document.querySelectorAll('.block').forEach(b=>b.onclick=()=>speak(b.dataset.text,'en-US'));
  $('#finish').onclick=()=>{const x=currentUser();x.completedLessons=x.completedLessons||[];if(!x.completedLessons.includes(id)){x.completedLessons.push(id);x.score=(x.score||0)+Number(l.points||0);saveUser(x);log('lesson_complete',{lessonId:id,score:l.points});toast(`เรียนจบ +${l.points} คะแนน`)}route('adventure')}
}
function levelUnlocked(l,u){
  const required=Array.isArray(l?.lessonIds)?l.lessonIds.filter(Boolean):[];
  const completed=new Set(Array.isArray(u?.completedLessons)?u.completedLessons:[]);
  const miss=required.filter(id=>!completed.has(id));
  const previousId=l?.previousLevelId||null;
  const prev=Boolean(previousId && !u?.levelRuns?.[previousId]);
  return {ok:miss.length===0&&!prev,miss,prev};
}

function adventure(){
  const u=currentUser(),ls=lessons(),all=levels().filter(x=>x.published!==false).sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0));
  const unitFor=v=>ls.find(x=>x.id===(v.lessonIds||[])[0])?.unit||'commands';
  const attr=v=>String(v??'').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  const worlds=Object.entries(LESSON_UNITS).map(([key,unit])=>{
    const items=all.filter(v=>unitFor(v)===key);if(!items.length)return '';
    return `<section class="world-section"><div class="world-title"><span>${unit.icon}</span><div><h3>${unit.title}</h3><p>${unit.description}</p></div></div><div class="map-track">${items.map(l=>{
      const z=levelUnlocked(l,u),run=u.levelRuns?.[l.id];
      const names=z.miss.map(id=>ls.find(x=>x.id===id)?.title||id);
      if(z.ok){
        return `<article class="map-node card"><span class="map-number">${l.order}</span><h3>🔓 ${l.title}</h3><p>${run?`ผ่านแล้ว ${run.bestStars||0} ดาว • เล่นซ้ำได้`:'พร้อมเล่น'}</p><button type="button" class="primary level-play-btn" data-g="${attr(l.id)}">▶ เล่นด่าน</button></article>`;
      }
      const studyId=z.miss[0]||'';
      return `<article class="map-node card locked"><span class="map-number">${l.order}</span><h3>🔒 ${l.title}</h3><p><b>เรียนก่อนปลดล็อก:</b></p>${names.map(n=>`<p>📚 ${n}</p>`).join('')}${z.prev?`<p>🏁 ผ่านด่านก่อนหน้า ${l.previousLevelId}</p>`:''}${studyId?`<button type="button" class="secondary level-study-btn" data-study="${attr(studyId)}">ไปเรียนบทเรียน</button>`:'<button type="button" class="secondary" disabled>ยังไม่ปลดล็อก</button>'}</article>`;
    }).join('')}</div></section>`;
  }).join('');
  shell(`<h2>🗺️ แผนที่การผจญภัย</h2><p>แผนที่แบ่งเป็นโลกการเรียนรู้ ด่านที่ล็อกจะแสดงชื่อบทเรียนที่ต้องเรียนก่อน</p><div class="world-map">${worlds}</div>`);
  document.querySelectorAll('.level-play-btn[data-g]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const id=b.dataset.g;if(!id)return toast('ไม่พบรหัสด่าน');route('game',{id})}));
  document.querySelectorAll('.level-study-btn[data-study]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const id=b.dataset.study;if(!id)return toast('ไม่พบบทเรียนที่เชื่อมกับด่าน');route('lesson',{id})}));
}

function game(id){
  const l=levels().find(x=>x.id===id),u=currentUser();
  if(!l)return adventure();
  if(l.gameType)return miniGame(l,u);
  const lock=levelUnlocked(l,u);if(!lock.ok)return adventure();
  const expectedAnswer=(l.answer||[]).map(String);
  const shuffled=[...new Set([...(l.distractors||[]).map(String),...expectedAnswer])].sort(()=>Math.random()-.5);
  const groups=[...new Set(shuffled.map(blockCategory))];
  const escAttr=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  const signature=t=>String(t).replace(/\([^()]*\)/g,'()').replace(/-?\d+(?:\.\d+)?/g,'#').replace(/\s+/g,' ').trim();
  const editValues=t=>{
    let changed=false;
    const next=String(t).replace(/\(([^()]*)\)/g,(whole,value)=>{
      const v=prompt('Edit block value',value);
      if(v===null)return whole;changed=true;
      return `(${v})`;
    });
    return changed?next:String(t);
  };
  shell(`<button id="back" class="secondary">← แผนที่ด่าน</button><h2>ด่าน ${l.order}: ${l.title}</h2><p>${l.prompt||'เลือกหรือลากบล็อกมาต่อ ปรับค่าที่ต้องการ แล้วกด Run เพื่อดูผลจริงบน Stage'}</p><div class="game-layout-v2"><div><h3>Block Palette</h3><p class="small-note">แตะบล็อกเพื่อเพิ่ม หรือเปิดกล้องแล้ว 👌 หนีบบล็อกค้างไว้ ลากไป Code Area และคลายนิ้วเพื่อวาง</p><div id="palette">${groups.map(cat=>`<div class="category-group"><h4><span style="color:${CATEGORIES[cat]}">●</span> ${CATEGORY_NAMES[cat]||cat}</h4>${shuffled.filter(x=>blockCategory(x)===cat).map((x,i)=>blockHtml(x,`draggable="true" data-hand-draggable="true" data-i="${i}"`)).join('')}</div>`).join('')}</div></div><div><h3>Code Area</h3><p class="small-note">ใช้ ✏️ เพื่อเปลี่ยนตัวเลข/ข้อความในบล็อก เช่น move (10) → move (120)</p><div id="zone" class="codezone" data-hand-dropzone="true"></div><div class="actions"><button id="clear" class="secondary">ล้าง</button><button id="run" class="secondary">▶ ทดลองรัน</button><button id="check" class="primary">✅ Run & Check</button></div></div><div class="stage-card"><div class="stage-title-row"><h3>Stage Preview</h3><span class="demo-badge">Scratch coords ±240 × ±180</span></div><div id="stage" class="stage stage-scratch-coords"><div class="stage-grid"></div><div id="trail" class="motion-trail"></div><div id="bubble" class="speech-bubble"></div><div id="sprite" class="sprite">🐱</div></div><div class="value-monitor"><span>X: <b id="mx">0</b></span><span>Y: <b id="my">0</b></span><span>Direction: <b id="md">90</b></span><span>Score: <b id="ms">0</b></span></div><p class="small-note">โหมดตัวอย่างจะจำลอง Repeat/Forever หลายรอบแบบจำกัด เพื่อให้เห็นการชนขอบและเด้งกลับชัดเจน</p><div class="stage-toolbar"><button id="flag" class="primary">⚑ Green Flag</button><button id="resetStage" class="secondary">↺ Reset</button></div><div class="card"><b>คะแนน:</b> ครั้งแรก ${l.firstScore} • เล่นซ้ำ ${l.repeatScore}</div></div></div>`);
  $('#back').onclick=()=>route('adventure');
  let chosen=[];
  document.querySelectorAll('#palette .block').forEach(b=>{b.onclick=()=>{speak(b.dataset.text,'en-US');add(b.dataset.text)};b.ondragstart=e=>e.dataTransfer.setData('text/plain',b.dataset.text)});
  const zone=$('#zone');zone.ondragover=e=>e.preventDefault();zone.ondrop=e=>{e.preventDefault();add(e.dataTransfer.getData('text/plain'))};
  zone.addEventListener('handdrop',e=>{const source=e.detail?.source;if(!source)return;const text=source.dataset.text||source.textContent?.trim();if(text){add(text);speak(text,'en-US');toast('วางบล็อกด้วยมือแล้ว')}});
  function renderChosen(){
    zone.innerHTML=chosen.map((t,i)=>`<div class="code-block-row"><div class="block" style="--c:${CATEGORIES[blockCategory(t)]}" data-code-i="${i}" title="${escAttr(t)}">${t}</div><button class="block-mini-btn" data-edit-i="${i}" title="แก้ค่าบล็อก">✏️</button><button class="block-mini-btn danger-mini" data-del-i="${i}" title="ลบบล็อก">×</button></div>`).join('');
    zone.querySelectorAll('[data-edit-i]').forEach(b=>b.onclick=()=>{const i=+b.dataset.editI;chosen[i]=editValues(chosen[i]);renderChosen()});
    zone.querySelectorAll('[data-del-i]').forEach(b=>b.onclick=()=>{chosen.splice(+b.dataset.delI,1);renderChosen()});
    zone.querySelectorAll('[data-code-i]').forEach(b=>{b.onclick=()=>speak(chosen[+b.dataset.codeI],'en-US');b.ondblclick=()=>{const i=+b.dataset.codeI;chosen[i]=editValues(chosen[i]);renderChosen()}});
  }
  function add(t){chosen.push(String(t));renderChosen()}
  $('#clear').onclick=()=>{chosen=[];renderChosen();resetStage()};
  const st={x:0,y:0,dir:90,score:0,visible:true,size:100};
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  function draw(addTrail=true){
    const sp=$('#sprite'),xPct=50+(Math.max(-240,Math.min(240,st.x))/240)*45,yPct=50-(Math.max(-180,Math.min(180,st.y))/180)*40;
    sp.style.left=xPct+'%';sp.style.top=yPct+'%';sp.style.transform=`translate(-50%,-50%) rotate(${st.dir-90}deg) scale(${Math.max(.2,st.size/100)})`;sp.style.opacity=st.visible?1:0;
    $('#mx').textContent=Math.round(st.x);$('#my').textContent=Math.round(st.y);$('#md').textContent=Math.round(st.dir);$('#ms').textContent=st.score;
    if(addTrail&&$('#trail')){const d=document.createElement('i');d.style.left=xPct+'%';d.style.top=yPct+'%';$('#trail').appendChild(d);if($('#trail').children.length>80)$('#trail').firstElementChild.remove()}
  }
  function resetStage(){Object.assign(st,{x:0,y:0,dir:90,score:0,visible:true,size:100});$('#bubble').style.display='none';$('#trail').innerHTML='';$('#stage').classList.remove('edge-hit');draw(false)}
  function numbers(t){return (String(t).match(/-?\d+(?:\.\d+)?/g)||[]).map(Number)}
  function firstValue(t,fallback=10){const n=numbers(t);return Number.isFinite(n[0])?n[0]:fallback}
  function textValue(t,fallback='Hello!'){const m=String(t).match(/\(([^()]*)\)/);return m?m[1]:fallback}
  function normalizeDir(){while(st.dir>180)st.dir-=360;while(st.dir<=-180)st.dir+=360}
  function bounceIfNeeded(){
    let hit=false,hitX=false,hitY=false;
    if(st.x>220){st.x=220;hit=hitX=true}else if(st.x<-220){st.x=-220;hit=hitX=true}
    if(st.y>155){st.y=155;hit=hitY=true}else if(st.y<-155){st.y=-155;hit=hitY=true}
    if(hitX)st.dir=-st.dir;if(hitY)st.dir=180-st.dir;normalizeDir();
    if(hit){$('#stage').classList.add('edge-hit');setTimeout(()=>$('#stage')?.classList.remove('edge-hit'),180)}
    return hit;
  }
  async function executeOne(t,delay=170){
    const n=firstValue(t),b=$('#bubble');
    if(t.startsWith('move')){const rad=st.dir*Math.PI/180;st.x+=Math.sin(rad)*n;st.y+=Math.cos(rad)*n}
    else if(t.startsWith('turn right')){st.dir+=n;normalizeDir()}
    else if(t.startsWith('turn left')){st.dir-=n;normalizeDir()}
    else if(t.startsWith('point in direction')){st.dir=n;normalizeDir()}
    else if(t.startsWith('change x'))st.x+=n;else if(t.startsWith('set x'))st.x=n;
    else if(t.startsWith('change y'))st.y+=n;else if(t.startsWith('set y'))st.y=n;
    else if(t.startsWith('go to x')){const nums=numbers(t);st.x=nums[0]||0;st.y=nums[1]||0}
    else if(t.startsWith('glide')){const nums=numbers(t),secs=Math.max(.05,nums[0]||1),tx=nums[1]||0,ty=nums[2]||0,sx=st.x,sy=st.y,steps=12;for(let i=1;i<=steps;i++){st.x=sx+(tx-sx)*i/steps;st.y=sy+(ty-sy)*i/steps;draw();await sleep(Math.min(80,secs*1000/steps))}return}
    else if(t==='if on edge, bounce')bounceIfNeeded();
    else if(t.startsWith('say')){b.textContent=textValue(t);b.style.display='block'}
    else if(t.startsWith('think')){b.textContent=textValue(t);b.style.display='block'}
    else if(t==='hide')st.visible=false;else if(t==='show')st.visible=true;
    else if(t.startsWith('change size'))st.size+=n;else if(t.startsWith('set size'))st.size=n;
    else if(t.startsWith('change (score)'))st.score+=n;else if(t.startsWith('set (score)'))st.score=n;
    else if(t.startsWith('wait'))await sleep(Math.min(1200,Math.max(0,n)*300));
    draw();await sleep(delay)
  }
  async function runBody(body,cycles=1){for(let c=0;c<cycles;c++){for(const t of body){if(t.startsWith('when '))continue;if(t==='forever'||t.startsWith('repeat ('))continue;await executeOne(t,cycles>1?55:180)}}}
  async function runCode(){
    resetStage();
    const executable=chosen.filter(t=>!t.startsWith('when '));
    const foreverAt=executable.indexOf('forever');
    const repeatAt=executable.findIndex(t=>t.startsWith('repeat ('));
    if(foreverAt>=0){const body=executable.slice(foreverAt+1);await runBody(body,60);return}
    if(repeatAt>=0){const times=Math.max(1,Math.min(30,firstValue(executable[repeatAt],10)));const body=executable.slice(repeatAt+1);await runBody(body,times);return}
    await runBody(executable,1)
  }
  $('#run').onclick=runCode;$('#flag').onclick=runCode;$('#resetStage').onclick=resetStage;
  $('#check').onclick=async()=>{if(!botGuard('level_check'))return;await runCode();const mode=l.valueMode||'exact';const ok=mode==='structure'?JSON.stringify(chosen.map(signature))===JSON.stringify(expectedAnswer.map(signature)):JSON.stringify(chosen)===JSON.stringify(expectedAnswer);if(!ok){speak('ลำดับบล็อกหรือค่าที่ใส่ยังไม่ตรงกับโจทย์');return toast(mode==='structure'?'โครงสร้างบล็อกยังไม่ถูกต้อง':'ตรวจลำดับและค่าภายในบล็อกอีกครั้ง')}const x=currentUser(),old=x.levelRuns?.[id],earned=old?l.repeatScore:l.firstScore,stars=chosen.length===l.answer.length?3:2;x.levelRuns=x.levelRuns||{};x.levelRuns[id]={plays:(old?.plays||0)+1,bestStars:Math.max(old?.bestStars||0,stars),lastAt:new Date().toISOString()};x.score=(x.score||0)+earned;x.stars=(x.stars||0)+(old?0:stars);saveUser(x);log('level_complete',{levelId:id,earned,repeat:!!old});speak(`ยอดเยี่ยม คุณผ่านด่าน ได้ ${stars} ดาว`);toast(`ผ่านด่าน ⭐${stars} +${earned} คะแนน`);setTimeout(()=>route('adventure'),1800)};
  renderChosen();resetStage();
}
async function leaderboard(){let all=users();if(cloud.enabled){try{all=await cloud.listPlayers();saveUsers(all)}catch(e){console.error(e)}}const ev=get(K.events,[]),today=new Date().toISOString().slice(0,10),month=today.slice(0,7);const scoreFor=(uid,period)=>ev.filter(e=>e.userId===uid&&e.at.startsWith(period)&&['lesson_complete','level_complete','monthly_checkin','daily_reward'].includes(e.type)).reduce((s,e)=>s+Number(e.data.score||e.data.earned||0),0);shell(`<h2>🏆 การจัดอันดับ</h2><div class="rank-tabs"><button data-p="day" class="primary">รายวัน</button><button data-p="month" class="secondary">รายเดือน</button><button data-p="all" class="secondary">ทั้งหมด</button></div><div id="rank"></div>`);const draw=p=>{const arr=all.map(u=>({...u,rankScore:p==='day'?scoreFor(u.id,today):p==='month'?scoreFor(u.id,month):u.score||0})).sort((a,b)=>b.rankScore-a.rankScore).slice(0,100);$('#rank').innerHTML=arr.map((u,i)=>`<div class="rank-row"><b>${i+1}</b><span>${u.avatar} ${u.name} <small>${u.classroom}</small></span><b>${u.rankScore}</b></div>`).join('')||'<p>ยังไม่มีข้อมูล</p>'};draw('day');document.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-p]').forEach(x=>x.className='secondary');b.className='primary';draw(b.dataset.p)})}
function profile(){const u=currentUser();shell(`<h2>👤 บัญชีผู้เล่น</h2><div class="card"><label>ชื่อผู้เล่น<input id="pn" value="${u.name}"></label><label>ชั้นเรียน<input id="pc" value="${u.classroom}"></label><label>PIN 4 หลัก<input id="pp" value="${u.pin}" maxlength="4"></label><div class="avatar-grid">${AVATARS.map(a=>`<button class="avatar ${a===u.avatar?'active':''}" data-a="${a}">${a}</button>`).join('')}</div><div class="actions"><button id="savep" class="primary">บันทึก</button><button id="logout" class="secondary">ออกจากระบบ</button><button id="delete" class="danger">ลบบัญชี</button></div></div>`);let av=u.avatar;document.querySelectorAll('[data-a]').forEach(b=>b.onclick=e=>{e.preventDefault();document.querySelectorAll('[data-a]').forEach(x=>x.classList.remove('active'));b.classList.add('active');av=b.dataset.a});$('#savep').onclick=()=>{const n=$('#pn').value.trim(),p=$('#pp').value.trim();if(!n||!/^[0-9]{4}$/.test(p))return toast('กรอกข้อมูลและ PIN 4 หลัก');u.name=n;u.classroom=$('#pc').value.trim();u.avatar=av;if(!cloud.enabled)u.pin=p;saveUser(u);toast(cloud.enabled?'บันทึกแล้ว (การเปลี่ยน PIN ให้ผู้ดูแลดำเนินการ)':'บันทึกแล้ว')};$('#logout').onclick=()=>{sessionStorage.removeItem(K.session);state.user=null;location.hash='auth';render()};$('#delete').onclick=()=>{const confirmName=prompt(`พิมพ์ชื่อผู้ใช้ “${u.name}” เพื่อยืนยันการลบบัญชี`);if(confirmName!==u.name)return toast('ชื่อยืนยันไม่ตรง');cloud.deletePlayer(u).catch(console.error);saveUsers(users().filter(x=>x.id!==u.id));sessionStorage.removeItem(K.session);log('account_deleted',{name:u.name});state.user=null;route('auth')}}
function updateClock(){const el=$('#realClock');if(!el)return;const d=new Date();el.innerHTML=`${new Intl.DateTimeFormat('th-TH',{dateStyle:'full',timeZone:'Asia/Bangkok'}).format(d)}<br>${new Intl.DateTimeFormat('th-TH',{timeStyle:'medium',hour12:false,timeZone:'Asia/Bangkok'}).format(d)} น.`}
function activeAnnouncement(items=[]){const now=Date.now();return items.filter(a=>a.enabled!==false&&(!a.startAt||new Date(a.startAt).getTime()<=now)&&(!a.endAt||new Date(a.endAt).getTime()>=now)).sort((a,b)=>(b.priority||0)-(a.priority||0))[0]}
function showAnnouncements(items=[]){set(K.announcements,items);const a=activeAnnouncement(items),bar=$('#announcementBar');if(!bar)return;bar.classList.toggle('hidden',!a);if(a){$('#announcementText').textContent=a.message||a.title||'';if(a.speak&&sessionStorage.getItem('sar.spoken.announcement')!==a.id){sessionStorage.setItem('sar.spoken.announcement',a.id);speak(`${a.title||'ประกาศ'} ${a.message||''}`)}}}
function showMaintenance(m){set(K.maintenance,m||{});const box=$('#maintenanceOverlay');if(!box)return;const on=!!m?.enabled;box.classList.toggle('hidden',!on);if(on){$('#maintenanceTitle').textContent=m.title||'กำลังปรับปรุงระบบ';$('#maintenanceMessage').textContent=m.message||'กรุณากลับมาใหม่ภายหลัง';$('#maintenanceReopen').textContent=m.reopenAt?`คาดว่าจะเปิดอีกครั้ง: ${new Date(m.reopenAt).toLocaleString('th-TH')}`:'';$('#maintenanceImage').textContent=m.image||'🛠️';if(m.speak&&sessionStorage.getItem('sar.spoken.maintenance')!==String(m.updatedAt||m.reopenAt)){sessionStorage.setItem('sar.spoken.maintenance',String(m.updatedAt||m.reopenAt));speak(`${m.title||'กำลังปรับปรุงระบบ'} ${m.message||''}`)}}}
async function disableCamera(){try{handTracker.stop?.();cameraManager.stop?.()}catch(e){console.warn(e)}state.camera=false;set(K.camera,false);document.body.classList.remove('camera-active');$('#cameraToggle')?.classList.remove('on');if($('#cameraToggle'))$('#cameraToggle').textContent='📷';toast('ปิดกล้องแล้ว ใช้เมาส์แทนได้')}
function openVoiceSettings(){const cfg=get(K.voice,{enabled:true,lang:'th-TH',rate:.95,volume:1}),audio=window.SARAudio?.getUser?.()||{musicEnabled:true,effectsEnabled:true,musicVolume:1,effectsVolume:1};document.body.insertAdjacentHTML('beforeend',`<div id="voiceModal" class="voice-modal" role="dialog" aria-modal="true" aria-labelledby="voiceSettingsTitle"><div class="voice-modal-card"><div class="voice-modal-header"><h2 id="voiceSettingsTitle">🔊 ตั้งค่าเสียง</h2><button id="voiceExitTop" class="voice-exit-top" type="button" aria-label="ออกจากหน้าตั้งค่า" title="ออกจากหน้าตั้งค่า">✕</button></div><div class="audio-setting-section"><h3>เสียงอ่าน</h3><label><input id="ve" type="checkbox" ${cfg.enabled?'checked':''}> เปิดเสียงอ่าน</label><label><input id="readSelectionEnabled" type="checkbox" ${window.SAR_READING_BOT?.readSelection!==false?'checked':''}> แสดงปุ่มอ่านเฉพาะข้อความที่เลือก</label><small class="voice-selection-help">ลากคลุมข้อความที่ต้องการ แล้วกด 🔊 อ่านส่วนที่เลือก</small><label>ภาษา<select id="vl"><option value="th-TH">ภาษาไทย</option><option value="en-US">English</option></select></label><label>ความเร็ว <output id="vrOut">${Math.round(cfg.rate*100)}%</output><input id="vr" type="range" min="0.5" max="1.5" step="0.05" value="${cfg.rate}"></label><label>ความดังเสียงอ่าน <output id="vvOut">${Math.round(cfg.volume*100)}%</output><input id="vv" type="range" min="0" max="1" step="0.05" value="${cfg.volume}"></label></div><div class="audio-setting-section"><h3>เพลงและเสียงกด</h3><label><input id="musicEnabled" type="checkbox" ${audio.musicEnabled?'checked':''}> เปิดเพลงพื้นหลัง</label><label>ความดังเพลง <output id="musicVolOut">${Math.round(audio.musicVolume*100)}%</output><input id="musicVol" type="range" min="0" max="1" step="0.05" value="${audio.musicVolume}"></label><label><input id="effectsEnabled" type="checkbox" ${audio.effectsEnabled?'checked':''}> เปิดเสียงกดและเสียงเอฟเฟกต์</label><label>ความดังเสียงกด <output id="effectsVolOut">${Math.round(audio.effectsVolume*100)}%</output><input id="effectsVol" type="range" min="0" max="1" step="0.05" value="${audio.effectsVolume}"></label></div><div class="actions voice-settings-actions"><button id="voiceTest" class="secondary">ทดลองเสียงอ่าน</button><button id="effectTest" class="secondary">ทดลองเสียงกด</button><button id="fullscreenToggle" class="secondary fullscreen-toggle" type="button">⛶ โหมดเต็มจอ</button><button id="voiceSave" class="primary">💾 บันทึก</button><button id="voiceClose" class="secondary exit-settings" type="button">← ออกจากการตั้งค่า</button></div></div></div>`);$('#vl').value=cfg.lang;const bind=(id,out,scale=100)=>{$('#'+id).oninput=()=>$('#'+out).textContent=Math.round(+$(`#${id}`).value*scale)+'%'};bind('vr','vrOut');bind('vv','vvOut');bind('musicVol','musicVolOut');bind('effectsVol','effectsVolOut');const previewAudio=()=>window.SARAudio?.setUser({musicEnabled:$('#musicEnabled').checked,effectsEnabled:$('#effectsEnabled').checked,musicVolume:+$('#musicVol').value,effectsVolume:+$('#effectsVol').value});$('#musicEnabled').onchange=$('#effectsEnabled').onchange=$('#musicVol').oninput=$('#effectsVol').oninput=()=>{if(event?.target?.type==='range'){const map={musicVol:'musicVolOut',effectsVol:'effectsVolOut'};$('#'+map[event.target.id]).textContent=Math.round(+event.target.value*100)+'%'}previewAudio()};$('#voiceTest').onclick=()=>{set(K.voice,{enabled:true,lang:$('#vl').value,rate:+$('#vr').value,volume:+$('#vv').value});speechManager.speak($('#vl').value.startsWith('th')?'สวัสดี ยินดีต้อนรับสู่สแครช เออาร์ แอดเวนเจอร์':'Welcome to Scratch AR Adventure',$('#vl').value)};$('#effectTest').onclick=()=>{previewAudio();window.SARAudio?.play('click')};$('#voiceSave').onclick=()=>{const v={enabled:$('#ve').checked,lang:$('#vl').value,rate:+$('#vr').value,volume:+$('#vv').value};set(K.voice,v);window.SAR_READING_BOT?.setReadSelection?.($('#readSelectionEnabled').checked);window.SARAudio?.setUser({musicEnabled:$('#musicEnabled').checked,effectsEnabled:$('#effectsEnabled').checked,musicVolume:+$('#musicVol').value,effectsVolume:+$('#effectsVol').value});state.voice=v.enabled;$('#voiceBtn').textContent=v.enabled?'🔊':'🔇';$('#voiceModal').remove()};const closeVoiceSettings=()=>{$('#voiceModal')?.remove();document.removeEventListener('keydown',voiceSettingsEsc)};const voiceSettingsEsc=e=>{if(e.key==='Escape'&&!document.fullscreenElement)closeVoiceSettings()};const syncFullscreenButton=()=>{const b=$('#fullscreenToggle');if(!b)return;const on=!!document.fullscreenElement;b.textContent=on?'🗗 ออกจากเต็มจอ':'⛶ โหมดเต็มจอ';b.setAttribute('aria-pressed',String(on))};$('#fullscreenToggle').onclick=async()=>{try{if(!document.fullscreenElement){await document.documentElement.requestFullscreen()}else{await document.exitFullscreen()}}catch(e){toast('อุปกรณ์หรือเบราว์เซอร์นี้ไม่รองรับโหมดเต็มจอ')}syncFullscreenButton()};document.addEventListener('fullscreenchange',syncFullscreenButton,{once:false});syncFullscreenButton();$('#voiceClose').onclick=closeVoiceSettings;$('#voiceExitTop').onclick=closeVoiceSettings;$('#voiceModal').onclick=e=>{if(e.target.id==='voiceModal')closeVoiceSettings()};document.addEventListener('keydown',voiceSettingsEsc)}

async function runStartupExperience(){
  const splash=$('#startupSplash');
  if(!splash)return;
  document.body.classList.add('startup-active');
  const bar=$('#startupProgressBar'),pct=$('#startupPercent'),msg=$('#startupMessage'),progress=splash.querySelector('.startup-progress');
  const steps=[
    [12,'กำลังปลุกน้องแมว Scratch...'],
    [30,'กำลังจัดเตรียมบล็อกคำสั่ง...'],
    [52,'กำลังเชื่อมแผนที่การผจญภัย...'],
    [74,'กำลังเตรียมระบบ AR และตรวจจับมือ...'],
    [92,'เกือบพร้อมแล้ว!'],
    [100,'พร้อมออกผจญภัย 🚀']
  ];
  for(const [value,text] of steps){
    if(msg)msg.textContent=text;
    if(bar)bar.style.width=value+'%';
    if(pct)pct.textContent=value+'%';
    progress?.setAttribute('aria-valuenow',String(value));
    await new Promise(r=>setTimeout(r,value===100?300:240));
  }
  splash.classList.add('is-leaving');
  document.body.classList.remove('startup-active');
  if(window.__sarBootWatchdog){clearTimeout(window.__sarBootWatchdog);window.__sarBootWatchdog=null}
  await new Promise(r=>setTimeout(r,360));
  splash.remove();
  // Show our own clear consent dialog before the browser permission prompt.
  // getUserMedia is only called after the learner presses the allow button.
  try{await requestCameraEnable()}catch(e){console.warn('startup camera choice',e)}
}

async function init(){
  // v5.21: render login FIRST. Cloud, camera and MediaPipe must never block the login UI.
  try{ applyTheme(); }catch(e){ console.warn('theme init',e); }
  try{ updateClock(); setInterval(updateClock,1000); }catch(e){ console.warn('clock init',e); }
  try{ showAnnouncements(get(K.announcements,[])); }catch(e){ console.warn('announcement init',e); }
  try{ showMaintenance(get(K.maintenance,{})); }catch(e){ console.warn('maintenance init',e); }

  // Bind static controls defensively. A missing optional element must not stop boot.
  document.body.addEventListener('click',e=>{
    const play=e.target.closest?.('[data-g]');
    if(play?.dataset.g){e.preventDefault();route('game',{id:play.dataset.g});return;}
    const study=e.target.closest?.('[data-study]');
    if(study?.dataset.study){e.preventDefault();route('lesson',{id:study.dataset.study});return;}
    const r=e.target.closest?.('[data-route]')?.dataset.route;
    if(r)route(r);
  });
  if($('#voiceBtn')) $('#voiceBtn').onclick=()=>{
    const v=get(K.voice,{enabled:true,lang:'th-TH',rate:.95,volume:1});
    v.enabled=!v.enabled; set(K.voice,v); state.voice=v.enabled;
    if(!v.enabled)speechManager.stop();
    $('#voiceBtn').textContent=v.enabled?'🔊':'🔇';
  };
  if($('#voiceSettingsBtn')) $('#voiceSettingsBtn').onclick=openVoiceSettings;
  if($('#cameraToggle')) $('#cameraToggle').onclick=()=>state.camera?disableCamera():requestCameraEnable();
  if($('#handScrollToggle')) $('#handScrollToggle').onclick=toggleHandScroll;
  if($('#contactBtn')) $('#contactBtn').onclick=openContacts;
  if($('#contactClose')) $('#contactClose').onclick=closeContacts;
  if($('#contactModal')) $('#contactModal').onclick=e=>{if(e.target.id==='contactModal')closeContacts()};
  try{ updateHandScrollUI(); }catch(e){ console.warn('hand scroll init',e); }
  try{ showContacts(get(K.contacts,DEFAULT_CONTACTS)); }catch(e){ console.warn('contacts init',e); }

  // Never auto-login from an earlier tab/session. Always start at the player login page.
  // v5.29: camera permission is a fresh choice every browser session; never skip the prompt because an old flag says true.
  state.camera=false; set(K.camera,false);
  state.user=null;
  sessionStorage.removeItem(K.session);
  if(!location.hash || ['#welcome','#auth'].includes(location.hash)) location.hash='auth';
  try{
    render();
  }catch(e){
    console.error('Initial render failed:',e);
    renderBootFallback(e);
  }

  // v5.28: playful loading screen first, then ask whether to enable AR camera.
  // This never blocks access to the login screen when the learner chooses mouse mode.
  try{ await runStartupExperience(); }catch(e){ console.warn('startup experience',e); }

  // Firebase starts AFTER login UI is already visible.
  try{
    await cloud.init();
    if(!cloud.enabled){
      setTimeout(()=>toast('โหมดออฟไลน์: สามารถเข้าเกมได้ แต่ข้อมูลข้ามเครื่องยังไม่ซิงก์'),900);
      return;
    }
    try{
      const shared=await cloud.loadShared();
      if(shared.content?.lessons)set(K.lessons,shared.content.lessons);
      if(shared.content?.levels)set(K.levels,shared.content.levels);
      if(shared.settings){set(K.settings,shared.settings);applyTheme()}
      const audio=await cloud.loadSystemDoc('audioSettings');
      if(audio)window.SARAudio?.apply(audio);
    }catch(e){console.warn('Cloud initial sync failed:',e)}
    cloud.subscribeAnnouncements(showAnnouncements);
    cloud.subscribeSystemDoc('maintenance',showMaintenance);
    cloud.subscribeSystemDoc('contacts',showContacts);
    cloud.subscribeSystemDoc('audioSettings',x=>{if(x)window.SARAudio?.apply(x)});
    setInterval(()=>{const u=currentUser();if(u)cloud.heartbeat(u).catch(console.error)},45000);
    window.addEventListener('pagehide',()=>{const u=currentUser();if(u)cloud.markOffline(u)});
  }catch(e){
    console.error('Firebase startup failed:',e);
    setTimeout(()=>toast('ฐานข้อมูลเชื่อมต่อไม่ได้ชั่วคราว แต่หน้าล็อกอินยังใช้งานได้'),900);
  }
}

function renderBootFallback(error){
  const safe=String(error?.message||'ไม่ทราบสาเหตุ').replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));
  app.innerHTML=`<section class="screen"><div class="panel"><div class="hero">
    <h2>🔐 เข้าสู่ระบบผู้เล่น</h2>
    <p>หน้าเกมโหลดส่วนเสริมบางรายการไม่สำเร็จ แต่ยังสามารถลองเปิดหน้าล็อกอินอีกครั้งได้</p>
    <div class="actions"><button id="bootRetry" class="primary">ลองโหลดหน้าล็อกอินอีกครั้ง</button><button id="bootReload" class="secondary">รีโหลดระบบ</button></div>
    <p class="small-note">รายละเอียด: ${safe}</p>
  </div></div></section>`;
  $('#bootRetry')?.addEventListener('click',()=>{location.hash='auth';try{render()}catch(e){console.error(e)}});
  $('#bootReload')?.addEventListener('click',()=>location.reload());
}

window.addEventListener('error',e=>{
  console.error('Global runtime error:',e.error||e.message);
  if(app && !app.children.length) renderBootFallback(e.error||new Error(e.message));
});
window.addEventListener('unhandledrejection',e=>{
  console.error('Unhandled promise rejection:',e.reason);
  if(app && !app.children.length) renderBootFallback(e.reason instanceof Error?e.reason:new Error(String(e.reason)));
});

init().catch(e=>{console.error('Boot failed:',e);renderBootFallback(e)});

function miniGame(l,u){const finish=()=>{const x=currentUser(),old=x.levelRuns?.[l.id],earned=old?(l.repeatScore||50):(l.firstScore||200);x.levelRuns=x.levelRuns||{};x.levelRuns[l.id]={plays:(old?.plays||0)+1,bestStars:Math.max(old?.bestStars||0,3),lastAt:new Date().toISOString()};x.score=(x.score||0)+earned;x.stars=(x.stars||0)+(old?0:3);saveUser(x);log('level_complete',{levelId:l.id,earned,repeat:!!old});speak(`ยอดเยี่ยม ผ่านเกม ได้ 3 ดาว`);toast(`ผ่านเกม ⭐⭐⭐ +${earned} คะแนน`);setTimeout(()=>route('adventure'),1300)};if(l.gameType==='quiz'){shell(`<button id="mgBack" class="secondary">← แผนที่ด่าน</button><div class="card"><h2>❓ ${l.title}</h2><p>${l.prompt||'เลือกคำตอบที่ถูกต้อง'}</p><div id="mgOptions" class="grid">${(l.options||[]).map(x=>`<button class="card menu" data-a="${String(x).replaceAll('"','&quot;')}"><b>${x}</b></button>`).join('')}</div></div>`);$('#mgBack').onclick=()=>route('adventure');document.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>String(b.dataset.a)===String(l.correct)?finish():toast('ยังไม่ถูก ลองอีกครั้ง'));return}if(l.gameType==='matching'){let left=null,done=new Set();const pairs=l.pairs||[];shell(`<button id="mgBack" class="secondary">← แผนที่ด่าน</button><div class="card"><h2>🧠 ${l.title}</h2><p>${l.prompt||'จับคู่ให้ถูกต้อง'}</p><div class="game-layout-v2"><div id="mgl">${pairs.map((p,i)=>`<button class="secondary" data-li="${i}" style="display:block;margin:8px">${p[0]}</button>`).join('')}</div><div id="mgr">${pairs.map((p,i)=>`<button class="primary" data-ri="${i}" style="display:block;margin:8px">${p[1]}</button>`).sort(()=>Math.random()-.5).join('')}</div></div></div>`);$('#mgBack').onclick=()=>route('adventure');document.querySelectorAll('[data-li]').forEach(b=>b.onclick=()=>{left=+b.dataset.li;toast('เลือกด้านขวาที่ตรงกัน')});document.querySelectorAll('[data-ri]').forEach(b=>b.onclick=()=>{const i=+b.dataset.ri;if(left===i){done.add(i);b.disabled=true;document.querySelector(`[data-li="${i}"]`).disabled=true;left=null;if(done.size===pairs.length)finish()}else toast('คู่นี้ยังไม่ตรงกัน')});return}if(l.gameType==='sorting'){const items=(l.items||[]).map((x,i)=>({x,i})).sort(()=>Math.random()-.5);let selected=null,done=new Set();shell(`<button id="mgBack" class="secondary">← แผนที่ด่าน</button><div class="card"><h2>🗂️ ${l.title}</h2><p>${l.prompt||'แยกประเภทให้ถูกต้อง'}</p><div id="sortItems">${items.map(o=>`<button class="secondary" data-si="${o.i}" style="margin:6px">${o.x[0]}</button>`).join('')}</div><hr><div>${(l.categories||[]).map(c=>`<button class="card menu" data-cat="${c}" style="margin:6px"><b>📦 ${c}</b></button>`).join('')}</div></div>`);$('#mgBack').onclick=()=>route('adventure');document.querySelectorAll('[data-si]').forEach(b=>b.onclick=()=>{selected=+b.dataset.si;toast('เลือกหมวดปลายทาง')});document.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{if(selected===null)return toast('เลือกรายการก่อน');if((l.items[selected]||[])[1]===b.dataset.cat){done.add(selected);document.querySelector(`[data-si="${selected}"]`).disabled=true;selected=null;if(done.size===(l.items||[]).length)finish()}else toast('หมวดยังไม่ถูกต้อง')});return}route('adventure')}

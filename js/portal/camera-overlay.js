import {cameraManager} from '../camera/camera-manager.js';
import {handTracker} from '../hand-tracking/hand-tracker.js';

const CDN=[
 ['Hands','https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hands.js'],
 ['drawConnectors','https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3.1675466124/drawing_utils.js']
];
function loadScript(src){return new Promise((resolve,reject)=>{const old=[...document.scripts].find(s=>s.src===src);if(old){old.addEventListener('load',resolve,{once:true});if(old.dataset.loaded==='1'||old.readyState==='complete')resolve();return}const s=document.createElement('script');s.src=src;s.crossOrigin='anonymous';s.onload=()=>{s.dataset.loaded='1';resolve()};s.onerror=()=>reject(new Error('โหลดระบบตรวจจับมือไม่ได้'));document.head.appendChild(s)})}
async function ensureMediaPipe(){for(const [global,src] of CDN){if(!window[global])await loadScript(src)}}

export function installPortalCamera(){
 if(document.querySelector('#portal-camera-layer'))return;
 const layer=document.createElement('div');layer.id='portal-camera-layer';layer.className='portal-camera-layer';layer.innerHTML=`<video id="portal-camera-video" muted autoplay playsinline></video><canvas id="portal-camera-canvas"></canvas><div id="portal-camera-placeholder">📷 เปิดกล้องเพื่อใช้โหมด AR</div>`;
 const cursor=document.createElement('div');cursor.id='portal-hand-cursor';cursor.className='portal-hand-cursor';
 const status=document.createElement('aside');status.id='portal-hand-status';status.className='portal-hand-status hidden';status.innerHTML='<span id="portal-hand-status-icon">✋</span><div><strong id="portal-hand-status-title">ระบบตรวจจับมือ</strong><small id="portal-hand-status-description">นำมือเข้ามาในภาพ</small></div>';
 const guide=document.createElement('div');guide.id='portal-hand-guide';guide.className='portal-hand-guide hidden';guide.textContent='☝️ ชี้เพื่อเลื่อน • 👌 หนีบนิ้วเพื่อกด';
 const controls=document.createElement('div');controls.className='portal-camera-controls';controls.innerHTML='<button id="portal-camera-toggle" type="button">📷 เปิดกล้อง</button><button id="portal-hand-toggle" type="button" disabled>✋ เปิดควบคุมด้วยมือ</button>';
 document.body.prepend(layer,cursor,status,guide);document.body.appendChild(controls);
 const video=layer.querySelector('video'),canvas=layer.querySelector('canvas'),placeholder=layer.querySelector('#portal-camera-placeholder');
 const cameraBtn=controls.querySelector('#portal-camera-toggle'),handBtn=controls.querySelector('#portal-hand-toggle');
 cameraManager.initialize({videoElement:video,cameraLayer:layer,cameraPlaceholder:placeholder});
 handTracker.configure({videoElement:video,canvasElement:canvas,cursorElement:cursor,statusElement:status,statusIcon:status.querySelector('#portal-hand-status-icon'),statusTitle:status.querySelector('#portal-hand-status-title'),statusDescription:status.querySelector('#portal-hand-status-description'),guideElement:guide});
 let handOn=false;
 const setSession=(camera,hand)=>{sessionStorage.setItem('scratchAR.cameraEnabled',camera?'yes':'no');sessionStorage.setItem('scratchAR.handEnabled',hand?'yes':'no')};
 async function startSharedCamera({silent=false}={}){
   cameraBtn.disabled=true;
   try{
     if(!cameraManager.stream)await cameraManager.start();
     cameraBtn.textContent='⛔ ปิดกล้อง';handBtn.disabled=false;
     setSession(true,handOn);
     if(sessionStorage.getItem('scratchAR.handEnabled')==='yes'){
       await ensureMediaPipe();await handTracker.start();handOn=true;handBtn.textContent='🖱️ ปิดควบคุมด้วยมือ';setSession(true,true);
     }
   }catch(e){setSession(false,false);if(!silent)alert(e.message)}finally{cameraBtn.disabled=false}
 }
 cameraBtn.onclick=async()=>{cameraBtn.disabled=true;try{if(cameraManager.stream){handTracker.stop();handOn=false;await cameraManager.stop();cameraBtn.textContent='📷 เปิดกล้อง';handBtn.textContent='✋ เปิดควบคุมด้วยมือ';handBtn.disabled=true;setSession(false,false)}else{sessionStorage.setItem('scratchAR.handEnabled','yes');await startSharedCamera()}}catch(e){alert(e.message)}finally{cameraBtn.disabled=false}};
 handBtn.onclick=async()=>{handBtn.disabled=true;try{if(handOn){handTracker.stop();handOn=false;handBtn.textContent='✋ เปิดควบคุมด้วยมือ';setSession(true,false)}else{await ensureMediaPipe();await handTracker.start();handOn=true;handBtn.textContent='🖱️ ปิดควบคุมด้วยมือ';setSession(true,true)}}catch(e){alert(e.message)}finally{handBtn.disabled=!cameraManager.stream}};
 // หน้าอื่นจะเปิดกล้องและตรวจจับมือต่อให้อัตโนมัติ หลังผู้ใช้อนุญาตจากหน้าแรกแล้ว
 if(sessionStorage.getItem('scratchAR.cameraEnabled')==='yes')queueMicrotask(()=>startSharedCamera({silent:true}));
 window.addEventListener('beforeunload',()=>{handTracker.stop();cameraManager.stop({updateState:false,dispatchEvent:false})});
}
installPortalCamera();

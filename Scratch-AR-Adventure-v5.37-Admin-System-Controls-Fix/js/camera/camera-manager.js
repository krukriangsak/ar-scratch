import { getState, setState } from "../core/state.js";
import { loadSettings, saveSettings } from "../core/storage.js";

class CameraManager {
  constructor(){this.videoElement=null;this.cameraLayer=null;this.cameraPlaceholder=null;this.stream=null;this.startPromise=null;this.stopPromise=null;}
  initialize({videoElement,cameraLayer=null,cameraPlaceholder=null}={}){if(!videoElement)throw new Error('ไม่พบพื้นที่วิดีโอของกล้อง');this.videoElement=videoElement;this.cameraLayer=cameraLayer;this.cameraPlaceholder=cameraPlaceholder;videoElement.autoplay=true;videoElement.muted=true;videoElement.playsInline=true;}
  isSupported(){return !!navigator.mediaDevices?.getUserMedia}
  isSecure(){return window.isSecureContext||['localhost','127.0.0.1','::1'].includes(location.hostname)}
  async start(){if(this.startPromise)return this.startPromise;this.startPromise=this.performStart().finally(()=>this.startPromise=null);return this.startPromise}
  async performStart(){
    if(!this.isSupported())throw new Error('เบราว์เซอร์นี้ไม่รองรับกล้อง กรุณาใช้ Chrome หรือ Edge รุ่นใหม่');
    if(!this.isSecure())throw new Error('กล้องเปิดได้เฉพาะ HTTPS หรือ localhost กรุณาเปิดผ่าน start-server.bat และใช้ลิงก์ http://localhost:8000');
    if(!this.videoElement)throw new Error('ระบบกล้องยังไม่พร้อม');
    await this.stop({updateState:false,dispatchEvent:false});
    const attempts=[
      {video:{facingMode:'user',width:{ideal:1280},height:{ideal:720}},audio:false},
      {video:{facingMode:'user'},audio:false},
      {video:true,audio:false}
    ];
    let lastError;
    for(const constraints of attempts){
      try{this.stream=await navigator.mediaDevices.getUserMedia(constraints);break}catch(error){lastError=error;if(['NotAllowedError','PermissionDeniedError','SecurityError','NotFoundError'].includes(error?.name))break}
    }
    if(!this.stream){this.setFailureState(lastError);throw this.createFriendlyError(lastError)}
    try{
      this.videoElement.srcObject=this.stream;
      await this.waitForVideo();
      await this.videoElement.play();
      this.videoElement.classList.add('active');this.cameraLayer?.classList.add('camera-enabled');this.cameraPlaceholder?.classList.add('hidden');
      setState(p=>({...p,camera:{enabled:true,permission:'granted',stream:this.stream},inputMode:'hand'}));this.saveCameraSetting(true);
      window.dispatchEvent(new CustomEvent('camera:started',{detail:{stream:this.stream}}));return this.stream;
    }catch(error){await this.stop({updateState:false,dispatchEvent:false});this.setFailureState(error);throw this.createFriendlyError(error)}
  }
  setFailureState(error){const permission=['NotAllowedError','PermissionDeniedError','SecurityError'].includes(error?.name)?'denied':'error';setState(p=>({...p,camera:{enabled:false,permission,stream:null},inputMode:'mouse'}));this.saveCameraSetting(false)}
  waitForVideo(){if(this.videoElement.readyState>=2&&this.videoElement.videoWidth>0)return Promise.resolve();return new Promise((resolve,reject)=>{let done=false;const finish=(fn,value)=>{if(done)return;done=true;cleanup();fn(value)};const onReady=()=>{if(this.videoElement.videoWidth>0)finish(resolve)};const onError=()=>finish(reject,new Error('ไม่สามารถแสดงภาพจากกล้องได้'));const timer=setTimeout(()=>finish(reject,new Error('ใช้เวลาเตรียมกล้องนานเกินไป')),15000);const cleanup=()=>{clearTimeout(timer);['loadedmetadata','loadeddata','canplay','playing'].forEach(e=>this.videoElement?.removeEventListener(e,onReady));this.videoElement?.removeEventListener('error',onError)};['loadedmetadata','loadeddata','canplay','playing'].forEach(e=>this.videoElement.addEventListener(e,onReady));this.videoElement.addEventListener('error',onError)})}
  async stop({updateState=true,dispatchEvent=true}={}){if(this.stopPromise)return this.stopPromise;this.stopPromise=Promise.resolve().then(()=>{const streams=[this.stream,getState()?.camera?.stream,this.videoElement?.srcObject].filter(Boolean);[...new Set(streams)].forEach(s=>s.getTracks?.().forEach(t=>t.stop()));this.stream=null;if(this.videoElement){try{this.videoElement.pause()}catch{}this.videoElement.srcObject=null;this.videoElement.classList.remove('active')}this.cameraLayer?.classList.remove('camera-enabled');this.cameraPlaceholder?.classList.remove('hidden');if(updateState){setState(p=>({...p,camera:{...p.camera,enabled:false,stream:null},inputMode:'mouse'}));this.saveCameraSetting(false)}if(dispatchEvent)window.dispatchEvent(new CustomEvent('camera:stopped'));return true}).finally(()=>this.stopPromise=null);return this.stopPromise}
  saveCameraSetting(v){const s=loadSettings()||{};saveSettings({...s,cameraEnabled:!!v,inputMode:v?'hand':'mouse'})}
  createFriendlyError(error={}){const m={NotAllowedError:'ไม่ได้รับอนุญาตให้ใช้กล้อง กดไอคอนกล้องข้างแถบที่อยู่แล้วเลือก อนุญาต จากนั้นโหลดหน้าใหม่',PermissionDeniedError:'ไม่ได้รับอนุญาตให้ใช้กล้อง กรุณาเปิดสิทธิ์กล้องในเบราว์เซอร์',NotFoundError:'ไม่พบกล้องในอุปกรณ์',DevicesNotFoundError:'ไม่พบกล้องในอุปกรณ์',NotReadableError:'กล้องกำลังถูกโปรแกรมอื่นใช้งาน กรุณาปิด Zoom, Meet หรือแอป Camera แล้วลองใหม่',TrackStartError:'กล้องกำลังถูกโปรแกรมอื่นใช้งาน',OverconstrainedError:'กล้องไม่รองรับค่าที่ร้องขอ ระบบลองค่ามาตรฐานแล้วแต่ยังเปิดไม่ได้',SecurityError:'กรุณาเปิดผ่าน HTTPS หรือ http://localhost:8000'};return new Error(m[error?.name]||error?.message||'ไม่สามารถเปิดกล้องได้')}
  async destroy(){await this.stop({updateState:false,dispatchEvent:false});this.videoElement=this.cameraLayer=this.cameraPlaceholder=null}
}
export const cameraManager=new CameraManager();

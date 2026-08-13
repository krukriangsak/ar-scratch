(() => {
  'use strict';
  const STORAGE_KEY='sar.audio.v58';
  const USER_KEY='sar.audio.user.v510';
  const DEFAULTS={
    enabled:true,
    music:{enabled:true,url:'',volume:.28,loop:true},
    effects:{enabled:true,volume:.72,clickUrl:'',successUrl:'',errorUrl:'',rewardUrl:''},
    ducking:true
  };
  const USER_DEFAULTS={musicEnabled:true,effectsEnabled:true,musicVolume:1,effectsVolume:1};
  const merge=(a,b)=>({
    ...a,...(b||{}),
    music:{...a.music,...(b?.music||{})},
    effects:{...a.effects,...(b?.effects||{})}
  });
  const clamp=n=>Math.max(0,Math.min(1,Number(n)||0));
  const readJson=(key,fallback)=>{try{return {...fallback,...JSON.parse(localStorage.getItem(key)||'null')}}catch{return {...fallback}}};
  let settings=merge(DEFAULTS,readJson(STORAGE_KEY,{}));
  let user=readJson(USER_KEY,USER_DEFAULTS);
  let context=null, music=null, unlocked=false, duckCount=0;
  const save=()=>localStorage.setItem(STORAGE_KEY,JSON.stringify(settings));
  const saveUser=()=>localStorage.setItem(USER_KEY,JSON.stringify(user));
  const musicAllowed=()=>settings.enabled&&settings.music.enabled&&user.musicEnabled;
  const effectsAllowed=()=>settings.enabled&&settings.effects.enabled&&user.effectsEnabled;
  const musicVolume=()=>clamp(settings.music.volume)*clamp(user.musicVolume);
  const effectsVolume=()=>clamp(settings.effects.volume)*clamp(user.effectsVolume);
  function ensureContext(){
    if(!context) context=new (window.AudioContext||window.webkitAudioContext)();
    if(context.state==='suspended') context.resume().catch(()=>{});
    unlocked=true;
  }
  function tone(kind='click'){
    if(!effectsAllowed())return;
    try{
      ensureContext();
      const osc=context.createOscillator(), gain=context.createGain();
      const presets={click:[520,.045,'sine'],success:[660,.16,'triangle'],error:[180,.18,'sawtooth'],reward:[880,.25,'triangle']};
      const [freq,duration,type]=presets[kind]||presets.click;
      osc.type=type;osc.frequency.setValueAtTime(freq,context.currentTime);
      if(kind==='success'||kind==='reward')osc.frequency.exponentialRampToValueAtTime(freq*1.45,context.currentTime+duration);
      if(kind==='error')osc.frequency.exponentialRampToValueAtTime(110,context.currentTime+duration);
      gain.gain.setValueAtTime(effectsVolume()*.18,context.currentTime);
      gain.gain.exponentialRampToValueAtTime(.0001,context.currentTime+duration);
      osc.connect(gain).connect(context.destination);osc.start();osc.stop(context.currentTime+duration);
    }catch(e){console.warn('Audio tone unavailable',e)}
  }
  function effectUrl(kind){return settings.effects[`${kind}Url`]||''}
  function playEffect(kind='click'){
    if(!effectsAllowed())return;
    const url=effectUrl(kind);
    if(!url)return tone(kind);
    const a=new Audio(url);a.volume=effectsVolume();a.play().catch(()=>tone(kind));
  }
  function applyMusicVolume(){if(music)music.volume=musicVolume()*(duckCount?0.22:1)}
  function stopMusic(){if(music){music.pause();music.src='';music=null}}
  function startMusic(){
    if(!musicAllowed()||!settings.music.url||!unlocked)return;
    const resolved=new URL(settings.music.url,location.href).href;
    if(music&&music.src===resolved){applyMusicVolume();if(music.paused)music.play().catch(()=>{});return}
    stopMusic();music=new Audio(settings.music.url);music.loop=settings.music.loop!==false;music.preload='auto';applyMusicVolume();music.play().catch(()=>{});
  }
  function apply(next,{persist=true}={}){
    settings=merge(DEFAULTS,next);
    if(persist)save();
    if(!musicAllowed()||!settings.music.url)stopMusic();else startMusic();
    applyMusicVolume();
    window.dispatchEvent(new CustomEvent('sar-audio-settings',{detail:get()}));
  }
  function get(){return JSON.parse(JSON.stringify(settings))}
  function getUser(){return JSON.parse(JSON.stringify(user))}
  function setUser(next){
    user={...USER_DEFAULTS,...user,...(next||{})};
    user.musicEnabled=!!user.musicEnabled;
    user.effectsEnabled=!!user.effectsEnabled;
    user.musicVolume=clamp(user.musicVolume);
    user.effectsVolume=clamp(user.effectsVolume);
    saveUser();
    if(!musicAllowed())stopMusic();else startMusic();
    applyMusicVolume();
    window.dispatchEvent(new CustomEvent('sar-audio-user-settings',{detail:getUser()}));
    return getUser();
  }
  function duck(on=true){duckCount=Math.max(0,duckCount+(on?1:-1));applyMusicVolume()}
  document.addEventListener('pointerdown',()=>{ensureContext();startMusic()},{once:true,capture:true});
  document.addEventListener('click',e=>{
    if(e.target.closest('button,a,[role="button"],input[type="checkbox"],input[type="radio"],select'))playEffect('click');
  },true);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&music)music.pause();else startMusic()});
  window.addEventListener('beforeunload',stopMusic);
  window.SARAudio={get,apply,getUser,setUser,play:playEffect,startMusic,stopMusic,duck,defaults:()=>merge(DEFAULTS,{})};
})();

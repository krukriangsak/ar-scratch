(() => {
  'use strict';

  const STORAGE_KEY = 'sar.readingBot.v57';
  const DEFAULTS = { enabled: true, language: 'th', autoRead: false, readSelection: true, rate: 0.95, volume: 1 };
  const state = Object.assign({}, DEFAULTS, safeParse(localStorage.getItem(STORAGE_KEY)));
  const originalText = new WeakMap();
  let voices = [];
  let queueToken = 0;

  const EN_MAP = new Map(Object.entries({
    'หน้าหลัก':'Home','บทเรียน':'Lessons','แผนที่ด่าน':'Level Map','การจัดอันดับ':'Leaderboard','บัญชีผู้เล่น':'Player Account',
    'เริ่มเข้าสู่เกมและอนุญาตกล้อง':'Start and allow camera','ใช้เมาส์ก่อน':'Use mouse first','เข้าสู่ระบบผู้เล่น':'Player Sign In',
    'สมัครผู้เล่นใหม่':'Create New Player','เข้าสู่บัญชีเดิม':'Sign In to Existing Account','ชื่อผู้เล่น':'Player name','ชั้นเรียน':'Classroom',
    'สมัครและเข้าสู่เกม':'Create account and start','เข้าสู่เกม':'Sign in','กลับ':'Back','ล้าง':'Clear','ทดลองรัน':'Run Preview',
    'เรียนจบแล้ว':'Lesson completed','คะแนน':'points','ดาว':'stars','บทเรียน':'lessons','ด่าน':'levels','เปิดเสียงอ่าน':'Enable reading voice',
    'ตั้งค่าเสียงอ่าน':'Reading Voice Settings','ภาษา':'Language','ความเร็ว':'Speed','ความดัง':'Volume','ทดลองฟัง':'Test voice','บันทึก':'Save','ปิด':'Close',
    'อ่านเนื้อหาภาษาไทย':'Read lesson','อ่านชื่อบล็อกภาษาอังกฤษ':'Read English block names','บล็อกสำคัญ':'Important Blocks',
    'รางวัลเข้าเรียนประจำวัน':'Daily Learning Reward','สุ่มรับคะแนนวันนี้':'Claim today’s points','รับแล้ววันนี้':'Claimed today',
    'ติดต่อผู้ดูแลระบบ':'Contact administrator','เปิดลิงก์ติดต่อ':'Open contact link','ยังไม่มีช่องทางติดต่อที่เปิดใช้งาน':'No contact channel is currently available',
    'เปิดกล้องและตรวจจับมือแล้ว':'Camera and hand tracking are active','เปิดกล้องไม่สำเร็จ ใช้เมาส์แทนได้':'Could not open the camera. You can use the mouse instead.',
    'ยอดเยี่ยม คุณผ่านด่าน':'Excellent! You passed the level.','ลำดับบล็อกยังไม่ถูกต้อง ลองเริ่มจากบล็อกเหตุการณ์ก่อน':'The block order is not correct yet. Try starting with an event block.',
    'ยินดีด้วย วันนี้คุณได้รับ':'Congratulations! Today you received','โหมดออฟไลน์: ตั้งค่า Firebase เพื่อใช้ข้อมูลร่วมกันทุกเครื่อง':'Offline mode. Configure Firebase to share data across devices.',
    'เกมเรียนรู้ Scratch ป.4 ผ่านบล็อกภาษาอังกฤษ เสียงอ่าน และการควบคุมด้วยนิ้วมือ':'A Grade 4 Scratch learning game with English blocks, voice guidance, and hand control.',
    'กล้องและการตรวจจับมือทำงานต่อเนื่องทุกเมนูของผู้เล่น ยกเว้นหน้าผู้ดูแลระบบ':'Camera and hand tracking continue across player screens, except the administrator page.'
  }));

  const PHRASES = [
    [/สวัสดี/g,'Hello'],[/ยินดีต้อนรับ/g,'Welcome'],[/วันนี้คุณได้รับ/g,'Today you received'],[/คะแนน/g,'points'],[/ดาว/g,'stars'],
    [/เรียนจบ/g,'lesson completed'],[/ผ่านด่าน/g,'passed the level'],[/กรุณา/g,'Please'],[/ลองใหม่/g,'try again'],[/ภาษาไทย/g,'Thai'],[/ภาษาอังกฤษ/g,'English']
  ];

  function safeParse(value){ try { return JSON.parse(value || '{}'); } catch { return {}; } }
  function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function hasThai(text){ return /[\u0E00-\u0E7F]/.test(text); }
  function translateText(text){
    let out = String(text || '');
    if (EN_MAP.has(out.trim())) return out.replace(out.trim(), EN_MAP.get(out.trim()));
    for (const [th,en] of EN_MAP) out = out.split(th).join(en);
    for (const [re,en] of PHRASES) out = out.replace(re,en);
    return out;
  }
  function chooseVoice(lang){
    const prefix = lang.startsWith('th') ? 'th' : 'en';
    const candidates = voices.filter(v => String(v.lang || '').toLowerCase().startsWith(prefix));
    return candidates.find(v => /female|หญิง|natural|google|microsoft/i.test(v.name)) || candidates[0] || null;
  }
  function refreshVoices(){ voices = speechSynthesis.getVoices?.() || []; }
  if ('speechSynthesis' in window){ refreshVoices(); speechSynthesis.addEventListener?.('voiceschanged', refreshVoices); }

  function splitMixed(text){
    return String(text || '').match(/[\u0E00-\u0E7F\s.,!?ๆฯ]+|[^\u0E00-\u0E7F]+/g)?.filter(x => x.trim()) || [];
  }
  function speakRaw(text, lang){
    return new Promise(resolve => {
      if (!state.enabled || !text || !('speechSynthesis' in window)) return resolve();
      const u = new SpeechSynthesisUtterance(String(text));
      u.lang = lang;
      u.rate = lang.startsWith('en') ? Math.min(state.rate, 0.92) : state.rate;
      u.pitch = lang.startsWith('th') ? 1.06 : 1.0;
      u.volume = state.volume;
      const voice = chooseVoice(lang); if (voice) u.voice = voice;
      u.onend = u.onerror = () => resolve();
      speechSynthesis.speak(u);
    });
  }
  async function speak(text, options={}){
    if (!state.enabled) return;
    const myToken = ++queueToken;
    speechSynthesis.cancel();
    setSpeaking(true);
    try {
      if (state.language === 'en') {
        await speakRaw(translateText(text), 'en-US');
      } else {
        const parts = splitMixed(text);
        for (const part of parts) {
          if (myToken !== queueToken) break;
          await speakRaw(part, hasThai(part) ? 'th-TH' : 'en-US');
        }
      }
    } finally { if (myToken === queueToken) setSpeaking(false); }
  }
  function stop(){ queueToken++; speechSynthesis.cancel(); setSpeaking(false); }

  function translateDOM(root=document.body){
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
        const p = node.parentElement;
        if (!p || /^(SCRIPT|STYLE|TEXTAREA|INPUT|OPTION)$/i.test(p.tagName) || p.closest('#readingBot')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes){
      if (!originalText.has(node)) originalText.set(node,node.nodeValue);
      node.nodeValue = state.language === 'en' ? translateText(originalText.get(node)) : originalText.get(node);
    }
    document.documentElement.lang = state.language === 'en' ? 'en' : 'th';
  }

  function ensureGlobalStopButton(){
    let btn=document.querySelector('#globalSpeechStop');
    if(btn)return btn;
    btn=document.createElement('button');
    btn.id='globalSpeechStop';
    btn.className='global-speech-stop';
    btn.type='button';
    btn.hidden=true;
    btn.setAttribute('aria-label','หยุดอ่าน');
    btn.innerHTML='<span class="global-speech-stop-icon">■</span><span class="global-speech-stop-label">หยุดอ่าน</span>';
    btn.addEventListener('click',()=>stop());
    document.body.appendChild(btn);
    return btn;
  }
  function setSpeaking(on){
    document.querySelector('#readingBot')?.classList.toggle('is-speaking', on);
    const status=document.querySelector('#readingBotStatus');
    if(status) status.textContent=on?(state.language==='en'?'Speaking…':'กำลังอ่าน…'):(state.language==='en'?'Ready':'พร้อมช่วยอ่าน');
    const stopBtn=ensureGlobalStopButton();
    stopBtn.hidden=!on;
    const label=stopBtn.querySelector('.global-speech-stop-label');
    if(label) label.textContent=state.language==='en'?'Stop reading':'หยุดอ่าน';
    stopBtn.setAttribute('aria-label',state.language==='en'?'Stop reading':'หยุดอ่าน');
  }
  function readPage(){
    const panel=document.querySelector('#app .panel');
    const text=(panel?.innerText || document.body.innerText).replace(/\s+/g,' ').slice(0,1400);
    speak(text);
  }
  function selectedText(){ return String(window.getSelection?.() || '').trim(); }

  // Floating reading-bot button removed in v5.7.1.
  // This function is retained only for backward compatibility and is no longer called.
  function renderBot(){
    if (document.querySelector('#readingBot')) return;
    document.body.insertAdjacentHTML('beforeend', `
      <aside id="readingBot" class="reading-bot" aria-label="Reading assistant">
        <button id="readingBotAvatar" class="reading-bot-avatar" title="ผู้ช่วยอ่าน / Reading assistant" aria-expanded="false">
          <span class="bot-face">ช</span><span class="bot-wave">👋</span>
        </button>
        <section class="reading-bot-panel" hidden>
          <div class="reading-bot-head"><div><b id="readingBotName">น้องช่วยอ่าน</b><small id="readingBotStatus">พร้อมช่วยอ่าน</small></div><button id="readingBotClose" aria-label="Close">×</button></div>
          <div class="reading-bot-language"><button data-bot-lang="th">🇹🇭 ไทย</button><button data-bot-lang="en">🇬🇧 English</button></div>
          <div class="reading-bot-actions"><button id="readingBotPage">📖 อ่านหน้านี้</button><button id="readingBotSelection">🔎 อ่านข้อความที่เลือก</button><button id="readingBotStop">⏹ หยุด</button></div>
          <label class="reading-bot-toggle"><input id="readingBotEnabled" type="checkbox"> เปิดเสียงผู้ช่วย</label>
          <p id="readingBotHint">โหมดไทยจะสลับเสียงไทย–อังกฤษอัตโนมัติเมื่อพบบล็อกภาษาอังกฤษ</p>
        </section>
      </aside>`);
    const bot=document.querySelector('#readingBot'), panel=bot.querySelector('.reading-bot-panel'), avatar=bot.querySelector('#readingBotAvatar');
    avatar.onclick=()=>{const open=panel.hidden;panel.hidden=!open;avatar.setAttribute('aria-expanded',String(open));};
    bot.querySelector('#readingBotClose').onclick=()=>{panel.hidden=true;avatar.setAttribute('aria-expanded','false');};
    bot.querySelector('#readingBotPage').onclick=readPage;
    bot.querySelector('#readingBotSelection').onclick=()=>speak(selectedText() || (state.language==='en'?'Please select text first.':'กรุณาเลือกข้อความก่อน'));
    bot.querySelector('#readingBotStop').onclick=stop;
    bot.querySelector('#readingBotEnabled').checked=state.enabled;
    bot.querySelector('#readingBotEnabled').onchange=e=>{state.enabled=e.target.checked;save();if(!state.enabled)stop();updateBotLabels();};
    bot.querySelectorAll('[data-bot-lang]').forEach(btn=>btn.onclick=()=>setLanguage(btn.dataset.botLang));
    updateBotLabels();
  }
  function updateBotLabels(){
    const bot=document.querySelector('#readingBot'); if(!bot)return;
    bot.querySelectorAll('[data-bot-lang]').forEach(b=>b.classList.toggle('active',b.dataset.botLang===state.language));
    bot.querySelector('.bot-face').textContent=state.language==='en'?'A':'ช';
    bot.querySelector('#readingBotName').textContent=state.language==='en'?'Reading Buddy':'น้องช่วยอ่าน';
    bot.querySelector('#readingBotStatus').textContent=state.language==='en'?'Ready':'พร้อมช่วยอ่าน';
    bot.querySelector('#readingBotPage').textContent=state.language==='en'?'📖 Read this page':'📖 อ่านหน้านี้';
    bot.querySelector('#readingBotSelection').textContent=state.language==='en'?'🔎 Read selected text':'🔎 อ่านข้อความที่เลือก';
    bot.querySelector('#readingBotStop').textContent=state.language==='en'?'⏹ Stop':'⏹ หยุด';
    bot.querySelector('.reading-bot-toggle').lastChild.nodeValue=state.language==='en'?' Enable reading voice':' เปิดเสียงผู้ช่วย';
    bot.querySelector('#readingBotHint').textContent=state.language==='en'?'English mode uses an English voice for all readable content.':'โหมดไทยจะสลับเสียงไทย–อังกฤษอัตโนมัติเมื่อพบบล็อกภาษาอังกฤษ';
  }
  function setLanguage(lang){
    state.language=lang==='en'?'en':'th'; save(); stop(); updateBotLabels(); translateDOM();
    window.dispatchEvent(new CustomEvent('sar-language-change',{detail:{language:state.language}}));
    speak(state.language==='en'?'English mode is now active.':'เปิดโหมดภาษาไทยแล้ว ระบบจะสลับเสียงไทยและอังกฤษให้อัตโนมัติ');
  }

  // Replace browser speech calls so the existing app also follows the selected bot mode.
  if ('speechSynthesis' in window){
    const nativeSpeak=speechSynthesis.speak.bind(speechSynthesis);
    speechSynthesis.speak=function(utterance){
      if (utterance?.__sarBotInternal) return nativeSpeak(utterance);
      const text=utterance?.text || '';
      speak(text);
    };
    const oldSpeakRaw=speakRaw;
    speakRaw=function(text,lang){
      return new Promise(resolve=>{
        if(!state.enabled||!text)return resolve();
        const u=new SpeechSynthesisUtterance(String(text));u.__sarBotInternal=true;u.lang=lang;u.rate=lang.startsWith('en')?Math.min(state.rate,.92):state.rate;u.pitch=lang.startsWith('th')?1.06:1;u.volume=state.volume;const voice=chooseVoice(lang);if(voice)u.voice=voice;u.onend=u.onerror=resolve;nativeSpeak(u);
      });
    };
  }

  // v5.24: read only the text/area selected by the learner.
  let selectionTimer = 0;
  function selectionAllowed(){
    if (!state.enabled || !state.readSelection) return false;
    const sel = window.getSelection?.();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false;
    const text = String(sel).trim();
    if (!text) return false;
    const node = sel.anchorNode?.nodeType === 1 ? sel.anchorNode : sel.anchorNode?.parentElement;
    if (node?.closest?.('input,textarea,select,[contenteditable="true"],#selectionReader')) return false;
    return true;
  }
  function ensureSelectionReader(){
    let el=document.querySelector('#selectionReader');
    if(el)return el;
    el=document.createElement('div');
    el.id='selectionReader';
    el.className='selection-reader';
    el.hidden=true;
    el.innerHTML=`<button type="button" id="selectionReadBtn" class="selection-reader-btn" aria-label="อ่านส่วนที่เลือก">🔊 <span>อ่านส่วนที่เลือก</span></button><button type="button" id="selectionStopBtn" class="selection-reader-stop" aria-label="หยุดอ่าน" title="หยุดอ่าน">■</button>`;
    document.body.appendChild(el);
    el.querySelector('#selectionReadBtn').addEventListener('pointerdown',e=>e.preventDefault());
    el.querySelector('#selectionReadBtn').addEventListener('click',()=>{
      const text=selectedText();
      if(text)speak(text);
      hideSelectionReader();
    });
    el.querySelector('#selectionStopBtn').addEventListener('pointerdown',e=>e.preventDefault());
    el.querySelector('#selectionStopBtn').addEventListener('click',()=>{stop();hideSelectionReader();});
    return el;
  }
  function hideSelectionReader(){ const el=document.querySelector('#selectionReader'); if(el)el.hidden=true; }
  function updateSelectionReader(){
    clearTimeout(selectionTimer);
    selectionTimer=setTimeout(()=>{
      if(!selectionAllowed()){ hideSelectionReader(); return; }
      const sel=window.getSelection();
      let rect;
      try{ rect=sel.getRangeAt(0).getBoundingClientRect(); }catch{ hideSelectionReader(); return; }
      if(!rect || (!rect.width && !rect.height)){ hideSelectionReader(); return; }
      const el=ensureSelectionReader();
      const label=el.querySelector('#selectionReadBtn span');
      if(label)label.textContent=state.language==='en'?'Read selection':'อ่านส่วนที่เลือก';
      el.querySelector('#selectionReadBtn').setAttribute('aria-label',state.language==='en'?'Read selected text':'อ่านส่วนที่เลือก');
      el.hidden=false;
      const pad=10, w=el.offsetWidth||180, h=el.offsetHeight||48;
      let left=rect.left + rect.width/2 - w/2;
      left=Math.max(pad,Math.min(left,window.innerWidth-w-pad));
      let top=rect.bottom+10;
      if(top+h>window.innerHeight-pad)top=Math.max(pad,rect.top-h-10);
      el.style.left=`${Math.round(left)}px`;
      el.style.top=`${Math.round(top)}px`;
    },80);
  }
  function setReadSelection(enabled){ state.readSelection=!!enabled; save(); if(!state.readSelection)hideSelectionReader(); }

  document.addEventListener('selectionchange',updateSelectionReader);
  document.addEventListener('pointerup',updateSelectionReader,{passive:true});
  document.addEventListener('keyup',updateSelectionReader);
  document.addEventListener('scroll',hideSelectionReader,{passive:true,capture:true});
  window.addEventListener('resize',hideSelectionReader,{passive:true});

  // v5.25: speech must never continue after the learner changes page/menu.
  const stopForNavigation=()=>{ stop(); hideSelectionReader(); };
  window.addEventListener('hashchange',stopForNavigation);
  window.addEventListener('popstate',stopForNavigation);
  window.addEventListener('pagehide',stopForNavigation);
  document.addEventListener('click',e=>{
    const nav=e.target.closest?.('[data-route],[data-g],[data-study],a[href^="#"]');
    if(nav) stopForNavigation();
  },true);

  const observer=new MutationObserver(()=>{clearTimeout(observer._t);observer._t=setTimeout(()=>translateDOM(),30);});
  document.addEventListener('DOMContentLoaded',()=>{translateDOM();observer.observe(document.body,{childList:true,subtree:true});});
  window.SAR_READING_BOT={speak,stop,setLanguage,setReadSelection,get language(){return state.language;},get readSelection(){return state.readSelection;},readPage,readSelection:()=>{const t=selectedText();if(t)speak(t);}};
})();

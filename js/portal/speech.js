let enabled=JSON.parse(localStorage.getItem('scratchAR.speechEnabled')??'true');
const synth=window.speechSynthesis;
function chooseVoice(lang){const voices=synth?.getVoices?.()||[];return voices.find(v=>v.lang?.toLowerCase().startsWith(lang.toLowerCase().split('-')[0]))||null}
export function speak(text,lang='th-TH',{cancel=true,rate}={}){if(!enabled||!text||!synth)return;if(cancel)synth.cancel();const u=new SpeechSynthesisUtterance(String(text).replace(/[★☆]/g,''));u.lang=lang;u.voice=chooseVoice(lang);u.rate=rate??(lang.startsWith('en')?.78:.92);u.pitch=1.03;synth.speak(u)}
export function speakMixed(th,en){if(!enabled||!synth)return;synth.cancel();if(th){const a=new SpeechSynthesisUtterance(th);a.lang='th-TH';a.voice=chooseVoice('th');a.rate=.92;synth.speak(a)}if(en){const b=new SpeechSynthesisUtterance(en);b.lang='en-US';b.voice=chooseVoice('en');b.rate=.72;synth.speak(b)}}
export function stop(){synth?.cancel()}
export function toggle(){enabled=!enabled;localStorage.setItem('scratchAR.speechEnabled',JSON.stringify(enabled));if(!enabled)stop();return enabled}
export function installSpeechControls(){
  const b=document.createElement('button');b.className='speech-fab';b.type='button';b.title='เปิดหรือปิดเสียงอ่าน';b.textContent=enabled?'🔊':'🔇';b.onclick=()=>{b.textContent=toggle()?'🔊':'🔇';speak(enabled?'เปิดเสียงอ่านแล้ว':'','th-TH')};document.body.appendChild(b);
  document.addEventListener('click',e=>{const el=e.target.closest('button,a,[data-speak]');if(!el||el===b||el.dataset.noSpeak!==undefined)return;const txt=el.dataset.speak||el.getAttribute('aria-label')||el.textContent?.trim();if(txt)speak(txt,'th-TH')},true);
}

import {DEFAULT_LESSONS,DEFAULT_LEVELS,DEFAULT_THEME,SCRATCH_CATEGORIES} from '../../data/content-seed.js';
export const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}};
export function setupTheme(){const t={...DEFAULT_THEME,...read('scratchAR.theme',{})};const r=document.documentElement;r.style.setProperty('--accent',t.accent);r.style.setProperty('--card-alpha',t.cardOpacity);r.style.setProperty('--blur',t.blur+'px');r.style.setProperty('--radius',t.cornerRadius+'px');r.style.setProperty('--font-scale',t.fontScale);document.querySelector('#brand').textContent=(location.pathname.includes('learn')?'📚 ':'🗺️ ')+(t.systemName||'Scratch AR Adventure');const a=document.querySelector('#admin-link');if(a)a.hidden=!t.showAdminLink;return t}
export function lessons(){return read('scratchAR.lessons',DEFAULT_LESSONS).filter(x=>x.published!==false).sort((a,b)=>a.order-b.order)}
export function levels(){return read('scratchAR.levels',DEFAULT_LEVELS).filter(x=>x.published!==false).sort((a,b)=>a.order-b.order)}
export {SCRATCH_CATEGORIES};
export const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

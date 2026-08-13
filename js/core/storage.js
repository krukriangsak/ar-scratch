const KEYS = {
  profile: "scratchAR.profile",
  settings: "scratchAR.settings",
  progress: "scratchAR.progress",
  users: "scratchAR.users",
  levels: "scratchAR.levels",
  activities: "scratchAR.activities"
};

function readJSON(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  catch (error) { console.warn(`อ่านข้อมูล ${key} ไม่สำเร็จ`, error); return fallback; }
}
function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (error) { console.warn(`บันทึกข้อมูล ${key} ไม่สำเร็จ`, error); }
}
function userId(profile) {
  return profile.id || `${profile.nickname || "player"}-${profile.classroom || ""}-${profile.studentNumber || ""}`.replace(/\s+/g,"-");
}
export const loadProfile = () => readJSON(KEYS.profile, null);
export function saveProfile(profile) {
  const now = new Date().toISOString();
  const complete = { ...profile, id: userId(profile), updatedAt: now, createdAt: profile.createdAt || now };
  writeJSON(KEYS.profile, complete);
  const users = readJSON(KEYS.users, []);
  const i = users.findIndex(u => u.id === complete.id);
  const progress = loadProgress();
  const record = { ...complete, progress, lastPlayedAt: now };
  if (i >= 0) users[i] = { ...users[i], ...record }; else users.push(record);
  writeJSON(KEYS.users, users);
}
export const clearProfile = () => localStorage.removeItem(KEYS.profile);
export const loadSettings = () => readJSON(KEYS.settings, { soundEnabled: true, cameraEnabled: false, inputMode: "mouse" });
export const saveSettings = settings => writeJSON(KEYS.settings, settings);
export const loadProgress = () => readJSON(KEYS.progress, { totalStars: 0, totalScore: 0, completedLevels: 0 });
export function saveProgress(progress) {
  writeJSON(KEYS.progress, progress);
  const profile = loadProfile();
  if (profile) {
    const users = readJSON(KEYS.users, []);
    const i = users.findIndex(u => u.id === profile.id);
    if (i >= 0) { users[i].progress = progress; users[i].lastPlayedAt = new Date().toISOString(); writeJSON(KEYS.users, users); }
  }
}
export const loadUsers = () => readJSON(KEYS.users, []);
export const saveUsers = users => writeJSON(KEYS.users, users);
export const loadLevels = () => readJSON(KEYS.levels, []);
export const saveLevels = levels => writeJSON(KEYS.levels, levels);

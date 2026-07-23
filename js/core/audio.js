import { loadSettings, saveSettings } from "./storage.js";
import { getState, setState } from "./state.js";

class AudioManager {
  constructor() {
    this.enabled = true;
    this.initialized = false;
  }

  async initialize() {
    this.initialized = "speechSynthesis" in window;
    return this.initialized;
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    setState((previous) => ({ ...previous, sound: { enabled: this.enabled } }));
  }

  toggle() {
    this.setEnabled(!this.enabled);
    const settings = loadSettings() || {};
    saveSettings({ ...settings, soundEnabled: this.enabled });
    if (!this.enabled) this.stop();
    return this.enabled;
  }

  speak(text, lang = "th-TH") {
    if (!this.enabled || !text || !("speechSynthesis" in window)) return;
    this.stop();
    const utterance = new SpeechSynthesisUtterance(String(text));
    utterance.lang = lang;
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  }

  stop() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }
}

export const audioManager = new AudioManager();

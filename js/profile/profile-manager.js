import { APP_CONFIG } from "../config.js";
import { saveProfile } from "../core/storage.js";
import { setState } from "../core/state.js";

const AVATARS = ["🐱", "🐶", "🐰", "🐼", "🦊", "🐸", "🐯", "🐨"];

class ProfileManager {
  initialize(elements, callbacks = {}) {
    this.elements = elements;
    this.onProfileSaved = callbacks.onProfileSaved;
    this.selectedAvatar = null;
    this.renderAvatars();
    this.bind();
  }

  renderAvatars() {
    this.elements.avatarGrid.innerHTML = "";
    AVATARS.forEach((emoji) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "avatar-option";
      button.textContent = emoji;
      button.dataset.avatar = emoji;
      button.setAttribute("aria-label", `เลือกตัวละคร ${emoji}`);
      button.addEventListener("click", () => this.selectAvatar(emoji));
      this.elements.avatarGrid.appendChild(button);
    });
  }

  bind() {
    this.elements.nicknameInput.addEventListener("input", () => {
      const value = this.elements.nicknameInput.value.slice(0, APP_CONFIG.profile.nicknameMaxLength);
      this.elements.nicknameInput.value = value;
      this.elements.nicknameLength.textContent = `${value.length}/${APP_CONFIG.profile.nicknameMaxLength}`;
      this.elements.profileNamePreview.textContent = value || "ชื่อผู้เล่น";
    });
    this.elements.classroomInput.addEventListener("input", () => {
      this.elements.profileClassPreview.textContent = this.elements.classroomInput.value || "ชั้นเรียน";
    });
    this.elements.form.addEventListener("submit", (event) => {
      event.preventDefault();
      this.submit();
    });
  }

  selectAvatar(emoji) {
    this.selectedAvatar = emoji;
    this.elements.avatarGrid.querySelectorAll(".avatar-option").forEach((button) => button.classList.toggle("selected", button.dataset.avatar === emoji));
    this.elements.selectedAvatarPreview.textContent = emoji;
    this.elements.avatarError.textContent = "";
  }

  submit() {
    const nickname = this.elements.nicknameInput.value.trim();
    this.elements.nicknameError.textContent = nickname ? "" : "กรุณากรอกชื่อเล่น";
    this.elements.avatarError.textContent = this.selectedAvatar ? "" : "กรุณาเลือกตัวละคร";
    if (!nickname || !this.selectedAvatar) return;

    const profile = {
      nickname,
      classroom: this.elements.classroomInput.value.trim(),
      studentNumber: this.elements.studentNumberInput.value.trim(),
      avatarEmoji: this.selectedAvatar,
      updatedAt: new Date().toISOString()
    };
    saveProfile(profile);
    setState((previous) => ({ ...previous, profile }));
    this.onProfileSaved?.(profile);
  }

  resetForm() {
    this.selectedAvatar = null;
    this.elements.form?.reset();
    this.elements.nicknameLength.textContent = `0/${APP_CONFIG.profile.nicknameMaxLength}`;
    this.elements.profileNamePreview.textContent = "ชื่อผู้เล่น";
    this.elements.profileClassPreview.textContent = "ชั้นเรียน";
    this.elements.selectedAvatarPreview.textContent = "❔";
    this.elements.nicknameError.textContent = "";
    this.elements.avatarError.textContent = "";
    this.elements.avatarGrid
      .querySelectorAll(".avatar-option")
      .forEach((button) => button.classList.remove("selected"));
  }

  populate(profile) {
    if (!profile) return;
    this.elements.nicknameInput.value = profile.nickname || "";
    this.elements.classroomInput.value = profile.classroom || "";
    this.elements.studentNumberInput.value = profile.studentNumber || "";
    this.elements.nicknameLength.textContent = `${(profile.nickname || "").length}/${APP_CONFIG.profile.nicknameMaxLength}`;
    this.elements.profileNamePreview.textContent = profile.nickname || "ชื่อผู้เล่น";
    this.elements.profileClassPreview.textContent = profile.classroom || "ชั้นเรียน";
    this.selectAvatar(profile.avatarEmoji || AVATARS[0]);
  }
}

export const profileManager = new ProfileManager();

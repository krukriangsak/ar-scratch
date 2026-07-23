import { APP_CONFIG } from "./config.js";

import {
  getState,
  setState,
  subscribe
} from "./core/state.js";

import {
  loadProfile,
  loadProgress,
  loadSettings,
  saveSettings,
  clearProfile,
  saveProgress
} from "./core/storage.js";

import { audioManager } from "./core/audio.js";

import { cameraManager } from "./camera/camera-manager.js";

import { profileManager } from "./profile/profile-manager.js";

/**
 * แอปหลัก
 */
class ScratchARApp {
  constructor() {
    this.elements = {};
    this.toastTimer = null;
    this.confirmAction = null;

    this.handTracker = null;
    this.handTrackerLoading = null;
  }

  /**
   * เริ่มต้นแอป
   */
async initialize() {
  try {
    this.cacheElements();
    this.initializeManagers();
    this.bindEvents();
    this.restoreSavedData();
    this.watchState();

    await this.runLoadingSequence();

    setState((previousState) => ({
      ...previousState,
      isInitialized: true
    }));

    this.openInitialScreen();
  } catch (error) {
    console.error(
      "App initialization error:",
      error
    );

    /*
     * อย่าปล่อยให้เกมค้างอยู่หน้า Loading
     */
    this.elements.loadingMessage.textContent =
      "โหลดบางระบบไม่สำเร็จ กำลังเข้าสู่เกมแบบใช้เมาส์...";

    this.elements.loadingProgress.style.width =
      "100%";

    await this.wait(800);

    this.showScreen("welcome-screen");

    this.showToast(
      "ระบบตรวจจับมือยังไม่พร้อม แต่ยังใช้เมาส์เล่นได้",
      "warning"
    );
  }
}

  /**
   * ดึง Element จากหน้า HTML
   */
  cacheElements() {
    this.elements = {
      screens:
        document.querySelectorAll(".screen"),

      loadingScreen:
        document.getElementById("loading-screen"),

      loadingMessage:
        document.getElementById("loading-message"),

      loadingProgress:
        document.getElementById("loading-progress"),

      welcomeScreen:
        document.getElementById("welcome-screen"),

      cameraPermissionScreen:
        document.getElementById(
          "camera-permission-screen"
        ),

      profileScreen:
        document.getElementById("profile-screen"),

      homeScreen:
        document.getElementById("home-screen"),

      comingSoonScreen:
        document.getElementById(
          "coming-soon-screen"
        ),

      topBar:
        document.getElementById("top-bar"),

      cameraLayer:
        document.getElementById("camera-layer"),

      cameraVideo:
        document.getElementById("camera-video"),

        cameraCanvas:
  document.getElementById("camera-canvas"),

handCursor:
  document.getElementById("hand-cursor"),

handStatus:
  document.getElementById("hand-status"),

handStatusIcon:
  document.getElementById(
    "hand-status-icon"
  ),

handStatusTitle:
  document.getElementById(
    "hand-status-title"
  ),

handStatusDescription:
  document.getElementById(
    "hand-status-description"
  ),

handGuide:
  document.getElementById("hand-guide"),

      cameraPlaceholder:
        document.getElementById(
          "camera-placeholder"
        ),

      startSetupButton:
        document.getElementById(
          "start-setup-button"
        ),

      skipCameraButton:
        document.getElementById(
          "skip-camera-button"
        ),

      allowCameraButton:
        document.getElementById(
          "allow-camera-button"
        ),

      cameraLaterButton:
        document.getElementById(
          "camera-later-button"
        ),

      cameraErrorMessage:
        document.getElementById(
          "camera-error-message"
        ),

      cameraToggleButton:
        document.getElementById(
          "camera-toggle-button"
        ),

      cameraToggleIcon:
        document.getElementById(
          "camera-toggle-icon"
        ),

      soundToggleButton:
        document.getElementById(
          "sound-toggle-button"
        ),

      soundToggleIcon:
        document.getElementById(
          "sound-toggle-icon"
        ),

      fullscreenButton:
        document.getElementById(
          "fullscreen-button"
        ),

      profileForm:
        document.getElementById("profile-form"),

      nicknameInput:
        document.getElementById(
          "nickname-input"
        ),

      classroomInput:
        document.getElementById(
          "classroom-input"
        ),

      studentNumberInput:
        document.getElementById(
          "student-number-input"
        ),

      avatarGrid:
        document.getElementById("avatar-grid"),

      nicknameError:
        document.getElementById(
          "nickname-error"
        ),

      avatarError:
        document.getElementById("avatar-error"),

      selectedAvatarPreview:
        document.getElementById(
          "selected-avatar-preview"
        ),

      profileNamePreview:
        document.getElementById(
          "profile-name-preview"
        ),

      profileClassPreview:
        document.getElementById(
          "profile-class-preview"
        ),

      nicknameLength:
        document.getElementById(
          "nickname-length"
        ),

      topPlayerName:
        document.getElementById(
          "top-player-name"
        ),

      homeAvatar:
        document.getElementById("home-avatar"),

      homePlayerName:
        document.getElementById(
          "home-player-name"
        ),

      homePlayerDetail:
        document.getElementById(
          "home-player-detail"
        ),

      totalStars:
        document.getElementById("total-stars"),

      totalScore:
        document.getElementById("total-score"),

      completedLevels:
        document.getElementById(
          "completed-levels"
        ),

      inputModeText:
        document.getElementById(
          "input-mode-text"
        ),

      switchInputModeButton:
        document.getElementById(
          "switch-input-mode-button"
        ),

      menuButtons:
        document.querySelectorAll("[data-menu]"),

      comingSoonIcon:
        document.getElementById(
          "coming-soon-icon"
        ),

      comingSoonTitle:
        document.getElementById(
          "coming-soon-title"
        ),

      comingSoonDescription:
        document.getElementById(
          "coming-soon-description"
        ),

      backHomeButton:
        document.getElementById(
          "back-home-button"
        ),

      toast:
        document.getElementById("toast"),

      toastIcon:
        document.getElementById("toast-icon"),

      toastMessage:
        document.getElementById("toast-message"),

      confirmModal:
        document.getElementById("confirm-modal"),

      confirmModalTitle:
        document.getElementById(
          "confirm-modal-title"
        ),

      confirmModalMessage:
        document.getElementById(
          "confirm-modal-message"
        ),

      confirmModalIcon:
        document.getElementById(
          "confirm-modal-icon"
        ),

      confirmModalCancel:
        document.getElementById(
          "confirm-modal-cancel"
        ),

      confirmModalAccept:
        document.getElementById(
          "confirm-modal-accept"
        )
    };
  }

  /**
   * เตรียมระบบย่อย
   */
  initializeManagers() {
    cameraManager.initialize({
      videoElement: this.elements.cameraVideo,
      cameraLayer: this.elements.cameraLayer,
      cameraPlaceholder:
        this.elements.cameraPlaceholder
    });

    profileManager.initialize(
      {
        form: this.elements.profileForm,
        nicknameInput:
          this.elements.nicknameInput,
        classroomInput:
          this.elements.classroomInput,
        studentNumberInput:
          this.elements.studentNumberInput,
        avatarGrid:
          this.elements.avatarGrid,
        nicknameError:
          this.elements.nicknameError,
        avatarError:
          this.elements.avatarError,
        selectedAvatarPreview:
          this.elements.selectedAvatarPreview,
        profileNamePreview:
          this.elements.profileNamePreview,
        profileClassPreview:
          this.elements.profileClassPreview,
        nicknameLength:
          this.elements.nicknameLength
      },
      {
        onProfileSaved: (profile) => {
          this.handleProfileSaved(profile);
        }
      }
    );
  }

  /**
   * ผูก Event กับปุ่มต่าง ๆ
   */
  bindEvents() {
    this.elements.startSetupButton.addEventListener(
      "click",
      () => {
        this.showScreen(
          "camera-permission-screen"
        );

        audioManager.speak(
          "กรุณาอนุญาตให้เกมใช้กล้อง หรือเลือกใช้เมาส์แทน"
        );
      }
    );

    this.elements.skipCameraButton.addEventListener(
      "click",
      () => {
        this.continueWithoutCamera();
      }
    );

    this.elements.allowCameraButton.addEventListener(
      "click",
      () => {
        this.requestCamera();
      }
    );

    this.elements.cameraLaterButton.addEventListener(
      "click",
      () => {
        this.continueWithoutCamera();
      }
    );

    this.elements.cameraToggleButton.addEventListener(
      "click",
      () => {
        this.toggleCamera();
      }
    );

    this.elements.soundToggleButton.addEventListener(
      "click",
      () => {
        const enabled = audioManager.toggle();

        this.showToast(
          enabled ? "เปิดเสียงแล้ว" : "ปิดเสียงแล้ว",
          "success"
        );
      }
    );

    this.elements.fullscreenButton.addEventListener(
      "click",
      () => {
        this.toggleFullscreen();
      }
    );

    this.elements.menuButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.openMenu(button.dataset.menu);
      });
    });

    this.elements.backHomeButton.addEventListener(
      "click",
      () => {
        this.showScreen("home-screen");

        audioManager.speak("กลับสู่หน้าเมนูหลัก");
      }
    );

    this.elements.switchInputModeButton.addEventListener(
      "click",
      () => {
        this.toggleCamera();
      }
    );

    this.elements.confirmModalCancel.addEventListener(
      "click",
      () => {
        this.closeConfirmModal();
      }
    );

    this.elements.confirmModalAccept.addEventListener(
      "click",
      () => {
        if (
          typeof this.confirmAction === "function"
        ) {
          this.confirmAction();
        }

        this.closeConfirmModal();
      }
    );

    document
      .querySelectorAll("[data-close-modal]")
      .forEach((element) => {
        element.addEventListener("click", () => {
          this.closeConfirmModal();
        });
      });

    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) {
          audioManager.stop();
        }
      }
    );

    window.addEventListener(
      "beforeunload",
      () => {
        audioManager.stop();

        try {
          if (this.handTracker) {
            this.handTracker.destroy();
          }
        } catch (error) {
          console.warn(
            "Hand Tracker destroy warning:",
            error
          );
        }

        cameraManager.destroy().catch((error) => {
          console.warn(
            "Camera destroy warning:",
            error
          );
        });
      }
    );
  }

  /**
   * โหลดข้อมูลที่บันทึกไว้
   */
  restoreSavedData() {
    const profile = loadProfile();
    const settings = loadSettings();
    const progress = loadProgress();

    setState((previousState) => ({
      ...previousState,

      profile,

      sound: {
        enabled:
          settings.soundEnabled !== false
      },

      inputMode:
        settings.inputMode || "mouse",

      progress
    }));

    audioManager.setEnabled(
      settings.soundEnabled !== false
    );

    if (profile) {
      profileManager.populate(profile);
    }
  }

  /**
   * ติดตาม State
   */
  watchState() {
    subscribe((state) => {
      this.updateInterface(state);
    });

    this.updateInterface(getState());
  }

  /**
   * Loading Animation
   */
async runLoadingSequence() {
  const steps = [
    {
      progress: 20,
      message: "กำลังเตรียมหน้าจอเกม..."
    },
    {
      progress: 45,
      message: "กำลังโหลดข้อมูลผู้เล่น..."
    },
    {
      progress: 70,
      message: "กำลังเตรียมระบบเสียง..."
    },
    {
      progress: 90,
      message: "กำลังตรวจสอบอุปกรณ์..."
    },
    {
      progress: 100,
      message: "พร้อมเริ่มผจญภัย!"
    }
  ];

  /*
   * เสียงล้มเหลวก็ไม่ควรทำให้เกมค้าง
   */
  try {
    await audioManager.initialize();
  } catch (error) {
    console.warn(
      "ไม่สามารถเริ่มระบบเสียงได้:",
      error
    );
  }

  const delay =
    APP_CONFIG.loading.duration /
    steps.length;

  for (const step of steps) {
    this.elements.loadingMessage.textContent =
      step.message;

    this.elements.loadingProgress.style.width =
      `${step.progress}%`;

    await this.wait(delay);
  }
}

  /**
   * เลือกหน้าที่จะแสดงครั้งแรก
   */
  openInitialScreen() {
    const state = getState();

    if (state.profile) {
      this.renderProfile(state.profile);
      this.showScreen("home-screen");

      audioManager.speak(
        `สวัสดี ${state.profile.nickname} ยินดีต้อนรับกลับเข้าสู่ Scratch AR Adventure`
      );

      window.setTimeout(() => {
        this.showConfirmModal({
          icon: "👤",
          title: "เลือกผู้เล่น",
          message: `ต้องการเล่นต่อด้วยโปรไฟล์ ${state.profile.nickname} หรือสร้างโปรไฟล์ใหม่สำหรับผู้เล่นคนนี้?`,
          confirmText: "สร้างโปรไฟล์ใหม่",
          onConfirm: () => this.startNewProfile()
        });
      }, 350);
    } else {
      this.showScreen("welcome-screen");

      audioManager.speak(
        "ยินดีต้อนรับเข้าสู่ Scratch AR Adventure เกมเรียนรู้การเขียนโปรแกรมสำหรับนักเรียนชั้นประถมศึกษาปีที่ 4"
      );
    }
  }

  /**
   * โหลดระบบตรวจจับมือเมื่อจำเป็น
   */
  async getHandTracker() {
    if (this.handTracker) {
      return this.handTracker;
    }

    if (this.handTrackerLoading) {
      return this.handTrackerLoading;
    }

    this.handTrackerLoading = import(
      "./hand-tracking/hand-tracker.js"
    )
      .then(({ handTracker }) => {
        if (!handTracker) {
          throw new Error(
            "ไฟล์ hand-tracker.js ไม่ได้ export handTracker"
          );
        }

        handTracker.configure({
          videoElement:
            this.elements.cameraVideo,
          canvasElement:
            this.elements.cameraCanvas,
          cursorElement:
            this.elements.handCursor,
          statusElement:
            this.elements.handStatus,
          statusIcon:
            this.elements.handStatusIcon,
          statusTitle:
            this.elements.handStatusTitle,
          statusDescription:
            this.elements.handStatusDescription,
          guideElement:
            this.elements.handGuide
        });

        this.handTracker = handTracker;

        return handTracker;
      })
      .catch((error) => {
        console.error(
          "Hand Tracker import error:",
          error
        );

        this.handTracker = null;
        this.handTrackerLoading = null;

        throw new Error(
          error?.message ||
          "ไม่สามารถโหลดระบบตรวจจับมือได้"
        );
      });

    return this.handTrackerLoading;
  }

  /**
   * ขอเปิดกล้อง
   */
  async requestCamera() {
    this.setButtonLoading(
      this.elements.allowCameraButton,
      true,
      "กำลังเปิดกล้อง..."
    );

    this.hideCameraError();

    try {
      await cameraManager.start();
      sessionStorage.setItem('scratchAR.cameraEnabled','yes');
      sessionStorage.setItem('scratchAR.handEnabled','yes');

      try {
        const tracker =
          await this.getHandTracker();

        await tracker.start();

        this.showToast(
          "เปิดกล้องและตรวจจับมือสำเร็จ",
          "success"
        );

        audioManager.speak(
          "เปิดกล้องและระบบตรวจจับมือสำเร็จ ใช้นิ้วชี้เลื่อนตัวชี้ และหนีบนิ้วเพื่อกด"
        );
      } catch (handError) {
        console.error(
          "Hand tracking error:",
          handError
        );

        this.showToast(
          "เปิดกล้องแล้ว แต่ระบบตรวจจับมือยังไม่พร้อม",
          "warning"
        );

        audioManager.speak(
          "เปิดกล้องสำเร็จ แต่ระบบตรวจจับมือยังไม่พร้อม คุณยังสามารถใช้เมาส์ได้"
        );
      }

      this.openProfileOrHome();
    } catch (error) {
      console.error(
        "Camera request error:",
        error
      );

      this.showCameraError(
        error?.message ||
        "ไม่สามารถเปิดกล้องได้"
      );

      this.showToast(
        "ไม่สามารถเปิดกล้องได้",
        "error"
      );

      audioManager.speak(
        error?.message ||
        "ไม่สามารถเปิดกล้องได้"
      );
    } finally {
      this.setButtonLoading(
        this.elements.allowCameraButton,
        false,
        "อนุญาตให้ใช้กล้อง",
        "📷"
      );
    }
  }

  /**
   * เล่นต่อโดยไม่เปิดกล้อง
   */
  async continueWithoutCamera() {
    sessionStorage.setItem('scratchAR.cameraEnabled','no');
    sessionStorage.setItem('scratchAR.handEnabled','no');
    try {
      if (this.handTracker) {
        this.handTracker.stop();
      }
    } catch (error) {
      console.warn(
        "Hand Tracker stop warning:",
        error
      );
    }

    try {
      await cameraManager.stop();
    } catch (error) {
      console.warn(
        "Camera stop warning:",
        error
      );
    }

    const settings =
      loadSettings() || {};

    saveSettings({
      ...settings,
      cameraEnabled: false,
      inputMode: "mouse"
    });

    setState((previousState) => ({
      ...previousState,
      inputMode: "mouse",
      camera: {
        ...previousState.camera,
        enabled: false,
        stream: null
      }
    }));

    this.showToast(
      "กำลังใช้เมาส์ในการควบคุม",
      "success"
    );

    audioManager.speak(
      "เลือกใช้เมาส์ในการควบคุม ต่อไปมาสร้างโปรไฟล์กัน"
    );

    this.openProfileOrHome();
  }

  /**
   * ถ้ามีโปรไฟล์แล้วไป Home
   * ถ้ายังไม่มีไปหน้าสร้างโปรไฟล์
   */
  openProfileOrHome() {
    const state = getState();

    if (state.profile) {
      this.renderProfile(state.profile);
      this.showScreen("home-screen");
    } else {
      this.showScreen("profile-screen");
    }
  }

  /**
   * เมื่อบันทึกโปรไฟล์สำเร็จ
   */
  handleProfileSaved(profile) {
    this.renderProfile(profile);
    this.showScreen("home-screen");

    this.showToast(
      `ยินดีต้อนรับ ${profile.nickname}`,
      "success"
    );

    audioManager.speak(
      `สร้างโปรไฟล์สำเร็จ ยินดีต้อนรับ ${profile.nickname} พร้อมออกผจญภัยแล้ว`
    );
  }

  /**
   * เริ่มต้นสำหรับผู้เล่นคนใหม่
   */
  startNewProfile() {
    clearProfile();

    const emptyProgress = {
      totalStars: 0,
      totalScore: 0,
      completedLevels: 0
    };

    saveProgress(emptyProgress);
    profileManager.resetForm();

    setState((previousState) => ({
      ...previousState,
      profile: null,
      progress: emptyProgress
    }));

    this.elements.topPlayerName.textContent = "-";
    this.showScreen("profile-screen");
    this.showToast("พร้อมสร้างโปรไฟล์สำหรับผู้เล่นคนใหม่", "success");
    audioManager.speak("เริ่มสร้างโปรไฟล์ใหม่ กรุณากรอกชื่อและเลือกตัวละคร");
  }

  /**
   * แสดงข้อมูลโปรไฟล์
   */
  renderProfile(profile) {
    if (!profile) {
      return;
    }

    this.elements.topPlayerName.textContent =
      profile.nickname;

    this.elements.homePlayerName.textContent =
      profile.nickname;

    this.elements.homeAvatar.textContent =
      profile.avatarEmoji || "🐱";

    let playerDetail =
      "พร้อมออกเดินทางแล้วหรือยัง?";

    if (profile.classroom && profile.studentNumber) {
      playerDetail =
        `${profile.classroom} เลขที่ ${profile.studentNumber}`;
    } else if (profile.classroom) {
      playerDetail = profile.classroom;
    } else if (profile.studentNumber) {
      playerDetail =
        `เลขที่ ${profile.studentNumber}`;
    }

    this.elements.homePlayerDetail.textContent =
      playerDetail;
  }

  /**
   * เปิดเมนู
   */
  openMenu(menuName) {
    const menuInformation = {
      lessons: {
        icon: "📚",
        title: "บทเรียน Scratch",
        description:
          "ในขั้นต่อไปเราจะสร้างบทเรียนพร้อมเสียงบรรยายและระบบปลดล็อก"
      },

      adventure: {
        icon: "🗺️",
        title: "แผนที่การผจญภัย",
        description:
          "ในขั้นต่อไปเราจะสร้างแผนที่ด่าน ระบบดาว คะแนน และการปลดล็อก"
      },

      leaderboard: {
        icon: "🏆",
        title: "ตารางคะแนน",
        description:
          "ในขั้นต่อไปเราจะเชื่อมต่อระบบจัดอันดับรายวัน"
      }
    };

    if (menuName === "new-profile") {
      this.showConfirmModal({
        icon: "🆕",
        title: "สร้างโปรไฟล์ใหม่",
        message: "ระบบจะออกจากโปรไฟล์ปัจจุบันและล้างคะแนนของผู้เล่นเดิมบนอุปกรณ์นี้ ต้องการดำเนินการต่อหรือไม่?",
        confirmText: "สร้างใหม่",
        onConfirm: () => this.startNewProfile()
      });
      return;
    }

    if (menuName === "profile") {
      const profile = getState().profile;

      if (profile) {
        profileManager.populate(profile);
      }

      this.showScreen("profile-screen");

      audioManager.speak(
        "หน้าแก้ไขโปรไฟล์ คุณสามารถเปลี่ยนชื่อ ชั้นเรียน เลขที่ และตัวละครได้"
      );

      return;
    }

    if (menuName === "lessons") { window.location.href = "./learn.html"; return; }
    if (menuName === "adventure") { window.location.href = "./adventure.html"; return; }

    const information =
      menuInformation[menuName] ||
      {
        icon: "🚧",
        title: "กำลังพัฒนา",
        description:
          "ระบบนี้จะถูกเพิ่มในขั้นตอนต่อไป"
      };

    this.elements.comingSoonIcon.textContent =
      information.icon;

    this.elements.comingSoonTitle.textContent =
      information.title;

    this.elements.comingSoonDescription.textContent =
      information.description;

    this.showScreen("coming-soon-screen");

    audioManager.speak(
      `${information.title} ${information.description}`
    );
  }

  /**
   * เปิดหรือปิดกล้องจากปุ่มด้านบน
   */
  async toggleCamera() {
    const state = getState();

    if (!state.camera.enabled) {
      this.showConfirmModal({
        icon: "📷",
        title: "เปิดกล้อง",
        message:
          "ต้องการเปิดกล้องและใช้มือควบคุมเกมหรือไม่?",
        confirmText: "เปิดกล้อง",

        onConfirm: async () => {
          try {
            await cameraManager.start();
            sessionStorage.setItem('scratchAR.cameraEnabled','yes');
            sessionStorage.setItem('scratchAR.handEnabled','yes');

            try {
              const tracker =
                await this.getHandTracker();

              await tracker.start();

              this.showToast(
                "เปิดกล้องและตรวจจับมือสำเร็จ",
                "success"
              );

              audioManager.speak(
                "เปิดกล้องและระบบตรวจจับมือแล้ว ใช้นิ้วชี้ควบคุมตัวชี้ และหนีบนิ้วเพื่อกด"
              );
            } catch (handError) {
              console.error(
                "Hand Tracker error:",
                handError
              );

              this.showToast(
                "เปิดกล้องแล้ว แต่ระบบตรวจจับมือยังไม่พร้อม",
                "warning"
              );

              audioManager.speak(
                "เปิดกล้องแล้ว แต่ระบบตรวจจับมือยังไม่พร้อม คุณยังสามารถใช้เมาส์ได้"
              );
            }
          } catch (cameraError) {
            console.error(
              "Camera start error:",
              cameraError
            );

            const message =
              cameraError?.message ||
              "ไม่สามารถเปิดกล้องได้";

            this.showToast(
              message,
              "error"
            );

            audioManager.speak(message);
          }
        }
      });

      return;
    }

    this.showConfirmModal({
      icon: "🖱️",
      title: "ปิดกล้อง",
      message:
        "ต้องการปิดกล้องและกลับไปใช้เมาส์หรือไม่?",
      confirmText: "ปิดกล้อง",

      onConfirm: async () => {
        try {
          if (this.handTracker) {
            this.handTracker.stop();
          }
        } catch (handError) {
          console.warn(
            "Hand Tracker stop error:",
            handError
          );
        }

        try {
          await cameraManager.stop();
          sessionStorage.setItem('scratchAR.cameraEnabled','no');
          sessionStorage.setItem('scratchAR.handEnabled','no');

          this.showToast(
            "ปิดกล้องและเปลี่ยนเป็นเมาส์แล้ว",
            "success"
          );

          audioManager.speak(
            "ปิดกล้องแล้ว ขณะนี้ใช้เมาส์ในการควบคุม"
          );
        } catch (cameraError) {
          console.error(
            "Camera stop error:",
            cameraError
          );

          const stream =
            this.elements.cameraVideo?.srcObject;

          if (stream) {
            stream
              .getTracks()
              .forEach((track) => {
                track.stop();
              });
          }

          if (this.elements.cameraVideo) {
            this.elements.cameraVideo.pause();
            this.elements.cameraVideo.srcObject = null;
            this.elements.cameraVideo.classList.remove(
              "active"
            );
          }

          this.elements.cameraLayer?.classList.remove(
            "camera-enabled"
          );

          setState((previousState) => ({
            ...previousState,
            inputMode: "mouse",
            camera: {
              ...previousState.camera,
              enabled: false,
              stream: null
            }
          }));

          this.showToast(
            "ปิดกล้องแล้ว",
            "success"
          );
        }
      }
    });
  }

  /**
   * สลับโหมดเต็มหน้าจอ
   */
  async toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();

        this.showToast(
          "เปิดโหมดเต็มหน้าจอแล้ว",
          "success"
        );
      } else {
        await document.exitFullscreen();

        this.showToast(
          "ออกจากโหมดเต็มหน้าจอแล้ว",
          "success"
        );
      }
    } catch (error) {
      console.error(error);

      this.showToast(
        "อุปกรณ์นี้ไม่รองรับโหมดเต็มหน้าจอ",
        "warning"
      );
    }
  }

  /**
   * เปลี่ยนหน้าจอ
   */
  showScreen(screenId) {
    this.elements.screens.forEach((screen) => {
      const isTarget = screen.id === screenId;

      screen.classList.toggle("active", isTarget);

      screen.setAttribute(
        "aria-hidden",
        String(!isTarget)
      );
    });

    setState((previousState) => ({
      ...previousState,
      currentScreen: screenId
    }));

    const hideTopBarScreens = [
      "loading-screen",
      "welcome-screen",
      "camera-permission-screen"
    ];

    this.elements.topBar.classList.toggle(
      "hidden",
      hideTopBarScreens.includes(screenId)
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  /**
   * อัปเดต UI ตาม State
   */
  updateInterface(state) {
    const soundEnabled = state.sound.enabled;
    const cameraEnabled = state.camera.enabled;

    this.elements.soundToggleIcon.textContent =
      soundEnabled ? "🔊" : "🔇";

    this.elements.soundToggleButton.setAttribute(
      "aria-label",
      soundEnabled ? "ปิดเสียง" : "เปิดเสียง"
    );

    this.elements.cameraToggleIcon.textContent =
      cameraEnabled ? "📹" : "📷";

    this.elements.cameraToggleButton.setAttribute(
      "aria-label",
      cameraEnabled ? "ปิดกล้อง" : "เปิดกล้อง"
    );

    this.elements.inputModeText.textContent =
      cameraEnabled
        ? "ขณะนี้กล้องเปิดอยู่ และกำลังเตรียมโหมดควบคุมด้วยมือ"
        : "ขณะนี้กำลังใช้เมาส์ในการควบคุม";

    this.elements.switchInputModeButton.innerHTML =
      cameraEnabled
        ? "<span>เปลี่ยนเป็นเมาส์</span><span>🖱️</span>"
        : "<span>เปิดโหมดควบคุมด้วยมือ</span><span>✋</span>";

    this.elements.totalStars.textContent =
      state.progress.totalStars || 0;

    this.elements.totalScore.textContent =
      Number(
        state.progress.totalScore || 0
      ).toLocaleString("th-TH");

    this.elements.completedLevels.textContent =
      state.progress.completedLevels || 0;

    if (state.profile) {
      this.renderProfile(state.profile);
    }
  }

  /**
   * แสดง Toast
   */
  showToast(message, type = "success") {
    window.clearTimeout(this.toastTimer);

    const icons = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️"
    };

    this.elements.toast.className =
      `toast toast--${type}`;

    this.elements.toastIcon.textContent =
      icons[type] || icons.info;

    this.elements.toastMessage.textContent =
      message;

    requestAnimationFrame(() => {
      this.elements.toast.classList.add("show");
    });

    this.toastTimer = window.setTimeout(() => {
      this.elements.toast.classList.remove("show");
    }, 3200);
  }

  /**
   * เปิดกล่องยืนยัน
   */
  showConfirmModal({
    icon = "❓",
    title,
    message,
    confirmText = "ยืนยัน",
    onConfirm
  }) {
    this.elements.confirmModalIcon.textContent =
      icon;

    this.elements.confirmModalTitle.textContent =
      title;

    this.elements.confirmModalMessage.textContent =
      message;

    this.elements.confirmModalAccept.textContent =
      confirmText;

    this.confirmAction = onConfirm;

    this.elements.confirmModal.classList.remove(
      "hidden"
    );

    document.body.classList.add("no-scroll");
  }

  /**
   * ปิดกล่องยืนยัน
   */
  closeConfirmModal() {
    this.elements.confirmModal.classList.add(
      "hidden"
    );

    document.body.classList.remove("no-scroll");

    this.confirmAction = null;
  }

  /**
   * แสดงข้อผิดพลาดกล้อง
   */
  showCameraError(message) {
    this.elements.cameraErrorMessage.textContent =
      message;

    this.elements.cameraErrorMessage.classList.remove(
      "hidden"
    );
  }

  /**
   * ซ่อนข้อผิดพลาดกล้อง
   */
  hideCameraError() {
    this.elements.cameraErrorMessage.textContent =
      "";

    this.elements.cameraErrorMessage.classList.add(
      "hidden"
    );
  }

  /**
   * แสดงสถานะโหลดบนปุ่ม
   */
  setButtonLoading(
    button,
    loading,
    text,
    icon = ""
  ) {
    if (!button) {
      return;
    }

    button.disabled = loading;

    if (loading) {
      button.innerHTML =
        `<span>${text}</span><span>⏳</span>`;
    } else {
      button.innerHTML =
        `<span>${text}</span>` +
        (icon ? `<span>${icon}</span>` : "");
    }
  }

  /**
   * หน่วงเวลา
   */
  wait(milliseconds) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, milliseconds);
    });
  }
}

/**
 * เริ่มเกมเมื่อ HTML โหลดเสร็จ
 */
document.addEventListener(
  "DOMContentLoaded",
  () => {
    const app = new ScratchARApp();


    
    app.initialize();
  }
);
import { APP_CONFIG } from "../config.js";

/**
 * ระบบตรวจจับมือด้วย MediaPipe Hands แบบ CDN Global Script
 * กล้องถูกเปิดโดย camera-manager.js อยู่แล้ว
 * คลาสนี้จึงใช้ video เดิมส่งภาพเข้า MediaPipe โดยตรง
 */
class HandTracker {
  constructor() {
    this.elements = {};
    this.hands = null;
    this.running = false;
    this.processing = false;
    this.frameId = null;
    this.lastVideoTime = -1;
    this.lastClickAt = 0;
    this.pinching = false;
    this.lastScrollY = null;
    this.scrollActive = false;
    this.cursor = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };
  }

  configure(elements = {}) {
    this.elements = elements;
    return this;
  }

  ensureMediaPipeLoaded() {
    if (typeof window.Hands !== "function") {
      throw new Error(
        "โหลด MediaPipe Hands ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ตและรีเฟรชหน้าเว็บ"
      );
    }
  }

  async initializeModel() {
    if (this.hands) {
      return;
    }

    this.ensureMediaPipeLoaded();

    this.setStatus(
      "⏳",
      "กำลังโหลดระบบตรวจจับมือ",
      "โปรดรอสักครู่"
    );

    this.hands = new window.Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`
    });

    const config = APP_CONFIG?.handTracking || {};

    this.hands.setOptions({
      maxNumHands: Number(config.numHands || 1),
      modelComplexity: 1,
      minDetectionConfidence: Number(
        config.minHandDetectionConfidence || 0.6
      ),
      minTrackingConfidence: Number(
        config.minTrackingConfidence || 0.6
      ),
      selfieMode: false
    });

    this.hands.onResults((results) => {
      this.processResults(results);
    });

    /* บังคับให้โหลดโมเดลล่วงหน้า หากเวอร์ชันที่ใช้รองรับ */
    if (typeof this.hands.initialize === "function") {
      await this.hands.initialize();
    }
  }

  async start() {
    if (this.running) {
      return;
    }

    const video = this.elements.videoElement;

    if (!video) {
      throw new Error("ไม่พบวิดีโอสำหรับตรวจจับมือ");
    }

    if (!video.srcObject) {
      throw new Error("กล้องยังไม่เปิด กรุณาเปิดกล้องก่อน");
    }

    await this.initializeModel();

    this.running = true;
    this.processing = false;
    this.lastVideoTime = -1;

    this.elements.cursorElement?.classList.add("visible");
    this.elements.guideElement?.classList.remove("hidden");

    this.setStatus(
      "✋",
      "ระบบตรวจจับมือพร้อมแล้ว",
      "ชูมือให้อยู่ในกรอบกล้อง"
    );

    this.loop();
  }

  loop = async () => {
    if (!this.running) {
      return;
    }

    const video = this.elements.videoElement;

    if (
      !this.processing &&
      video &&
      video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
      video.currentTime !== this.lastVideoTime
    ) {
      this.processing = true;
      this.lastVideoTime = video.currentTime;

      try {
        await this.hands.send({ image: video });
      } catch (error) {
        console.warn("Hand detection frame error:", error);
        this.setStatus(
          "⚠️",
          "ตรวจจับมือสะดุด",
          "ลองขยับมือให้อยู่กลางภาพ"
        );
      } finally {
        this.processing = false;
      }
    }

    this.frameId = window.requestAnimationFrame(this.loop);
  };

  processResults(results) {
    if (!this.running) {
      return;
    }

    const landmarks = results?.multiHandLandmarks?.[0];
    const canvas = this.elements.canvasElement;

    if (canvas) {
      this.drawLandmarks(canvas, landmarks);
    }

    if (!landmarks) {
      this.pinching = false;
      this.elements.cursorElement?.classList.remove("pinching");
      this.setStatus(
        "🔎",
        "กำลังค้นหามือ",
        "นำมือเข้ามาในภาพกล้อง"
      );
      return;
    }

    const indexTip = landmarks[8];
    const thumbTip = landmarks[4];
    const middleTip = landmarks[12];
    const indexPip = landmarks[6];
    const middlePip = landmarks[10];

    /* กล้องหน้าแสดงผลแบบกระจก จึงกลับแกน X */
    const targetX = (1 - indexTip.x) * window.innerWidth;
    const targetY = indexTip.y * window.innerHeight;

    const smoothing = Number(
      APP_CONFIG?.handTracking?.smoothing || 0.35
    );

    this.cursor.x += (targetX - this.cursor.x) * smoothing;
    this.cursor.y += (targetY - this.cursor.y) * smoothing;

    this.moveCursor(this.cursor.x, this.cursor.y);

    const pinchDistance = Math.hypot(
      indexTip.x - thumbTip.x,
      indexTip.y - thumbTip.y
    );

    const pinchThreshold = Number(
      APP_CONFIG?.handTracking?.pinchThreshold || 0.055
    );

    const isPinching = pinchDistance < pinchThreshold;
    const twoFingerScroll = indexTip.y < indexPip.y && middleTip.y < middlePip.y && Math.abs(indexTip.y - middleTip.y) < 0.09 && !isPinching;

    this.elements.cursorElement?.classList.toggle("pinching", isPinching);
    this.elements.cursorElement?.classList.toggle("scrolling", twoFingerScroll);
    const scrollIndicator = document.querySelector("#scroll-indicator");
    scrollIndicator?.classList.toggle("hidden", !twoFingerScroll);

    if (twoFingerScroll) {
      const handY = (indexTip.y + middleTip.y) / 2;
      if (this.lastScrollY !== null) {
        const delta = handY - this.lastScrollY;
        if (Math.abs(delta) > 0.006) window.scrollBy({ top: delta * 1450, behavior: "auto" });
      }
      this.lastScrollY = handY;
      this.scrollActive = true;
    } else {
      this.lastScrollY = null;
      this.scrollActive = false;
    }

    this.setStatus(
      twoFingerScroll ? "✌️" : (isPinching ? "👌" : "☝️"),
      twoFingerScroll ? "กำลังเลื่อนหน้า" : (isPinching ? "กำลังกด" : "ตรวจพบมือแล้ว"),
      twoFingerScroll ? "ขยับมือขึ้นหรือลงอย่างช้า ๆ" : (isPinching ? "คลายนิ้วก่อนกดครั้งต่อไป" : "วงกลมจะครอบปุ่มเป้าหมาย แล้วหนีบนิ้วเพื่อกด")
    );

    const clickCooldown = Number(
      APP_CONFIG?.handTracking?.clickCooldown || 650
    );

    if (
      isPinching &&
      !this.pinching &&
      Date.now() - this.lastClickAt > clickCooldown
    ) {
      this.lastClickAt = Date.now();
      this.clickAt(this.cursor.x, this.cursor.y);
    }

    this.pinching = isPinching;
  }

  moveCursor(x, y) {
    const cursor = this.elements.cursorElement;

    if (cursor) {
      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;
      cursor.style.transform = "translate(-50%, -50%)";
    }

    document
      .querySelectorAll(".hand-hover")
      .forEach((element) => {
        element.classList.remove("hand-hover");
      });

    const target = document.elementFromPoint(x, y)?.closest("button, a, input, select, textarea, [role='button'], .block");
    target?.classList.add("hand-hover");
    const label = document.querySelector("#cursor-label");
    if (label) {
      const raw = target?.getAttribute("aria-label") || target?.title || target?.textContent?.trim() || "ชี้ที่นี่";
      label.textContent = raw.slice(0, 28);
      label.classList.toggle("visible", !!target);
    }
  }

  clickAt(x, y) {
    const target = document
      .elementFromPoint(x, y)
      ?.closest(
        "button, a, input, select, textarea, [role='button']"
      );

    if (!target || target.disabled) {
      return;
    }

    try {
      target.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y,
          pointerType: "touch",
          isPrimary: true
        })
      );

      target.dispatchEvent(
        new PointerEvent("pointerup", {
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y,
          pointerType: "touch",
          isPrimary: true
        })
      );
    } catch (error) {
      console.warn("PointerEvent warning:", error);
    }

    target.focus?.({ preventScroll: true });
    target.click();
  }

  drawLandmarks(canvas, landmarks) {
    const video = this.elements.videoElement;
    const width = video?.videoWidth || 640;
    const height = video?.videoHeight || 480;

    if (canvas.width !== width) {
      canvas.width = width;
    }

    if (canvas.height !== height) {
      canvas.height = height;
    }

    const context = canvas.getContext("2d");
    context.clearRect(0, 0, width, height);

    if (!landmarks) {
      return;
    }

    context.save();
    context.translate(width, 0);
    context.scale(-1, 1);

    if (
      typeof window.drawConnectors === "function" &&
      window.HAND_CONNECTIONS
    ) {
      window.drawConnectors(
        context,
        landmarks,
        window.HAND_CONNECTIONS,
        {
          color: "rgba(255,255,255,0.9)",
          lineWidth: 3
        }
      );
    }

    if (typeof window.drawLandmarks === "function") {
      window.drawLandmarks(context, landmarks, {
        color: "#00ffd5",
        lineWidth: 1,
        radius: 4
      });
    } else {
      context.fillStyle = "#00ffd5";
      landmarks.forEach((point) => {
        context.beginPath();
        context.arc(
          point.x * width,
          point.y * height,
          4,
          0,
          Math.PI * 2
        );
        context.fill();
      });
    }

    context.restore();
  }

  setStatus(icon, title, description) {
    if (this.elements.statusIcon) {
      this.elements.statusIcon.textContent = icon;
    }

    if (this.elements.statusTitle) {
      this.elements.statusTitle.textContent = title;
    }

    if (this.elements.statusDescription) {
      this.elements.statusDescription.textContent = description;
    }

    this.elements.statusElement?.classList.remove("hidden");
  }

  stop() {
    this.running = false;
    this.processing = false;

    if (this.frameId) {
      window.cancelAnimationFrame(this.frameId);
    }

    this.frameId = null;
    this.lastVideoTime = -1;
    this.pinching = false;

    this.elements.cursorElement?.classList.remove(
      "visible",
      "pinching"
    );

    this.elements.guideElement?.classList.add("hidden");
    this.elements.statusElement?.classList.add("hidden");

    document
      .querySelectorAll(".hand-hover")
      .forEach((element) => {
        element.classList.remove("hand-hover");
      });

    const canvas = this.elements.canvasElement;

    if (canvas) {
      canvas
        .getContext("2d")
        ?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  async destroy() {
    this.stop();

    if (this.hands) {
      try {
        await this.hands.close?.();
      } catch (error) {
        console.warn("MediaPipe close warning:", error);
      }
    }

    this.hands = null;
  }
}

export const handTracker = new HandTracker();

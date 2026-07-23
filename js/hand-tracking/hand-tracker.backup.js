import { APP_CONFIG } from "../config.js";

const TASKS_VISION_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/+esm";
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm";
const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

class HandTracker {
  constructor() {
    this.elements = {};
    this.landmarker = null;
    this.running = false;
    this.frameId = null;
    this.lastVideoTime = -1;
    this.lastClickAt = 0;
    this.pinching = false;
    this.cursor = { x: innerWidth / 2, y: innerHeight / 2 };
  }

  configure(elements) {
    this.elements = elements || {};
    return this;
  }

  async initializeModel() {
    if (this.landmarker) return;
    this.setStatus("⏳", "กำลังโหลดระบบตรวจจับมือ", "โปรดรอสักครู่");
    const { HandLandmarker, FilesetResolver } = await import(TASKS_VISION_URL);
    const vision = await FilesetResolver.forVisionTasks(WASM_URL);
    this.landmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
      runningMode: "VIDEO",
      numHands: APP_CONFIG.handTracking.numHands,
      minHandDetectionConfidence: APP_CONFIG.handTracking.minHandDetectionConfidence,
      minHandPresenceConfidence: APP_CONFIG.handTracking.minHandPresenceConfidence,
      minTrackingConfidence: APP_CONFIG.handTracking.minTrackingConfidence
    });
  }

  async start() {
    if (this.running) return;
    if (!this.elements.videoElement) throw new Error("ไม่พบวิดีโอสำหรับตรวจจับมือ");
    await this.initializeModel();
    this.running = true;
    this.elements.cursorElement?.classList.add("visible");
    this.elements.guideElement?.classList.remove("hidden");
    this.setStatus("✋", "ระบบตรวจจับมือพร้อมแล้ว", "ชูมือให้อยู่ในกรอบกล้อง");
    this.loop();
  }

  loop = () => {
    if (!this.running) return;
    const video = this.elements.videoElement;
    if (video.readyState >= 2 && video.currentTime !== this.lastVideoTime) {
      this.lastVideoTime = video.currentTime;
      try {
        const result = this.landmarker.detectForVideo(video, performance.now());
        this.processResult(result);
      } catch (error) {
        console.warn("Hand detection frame error:", error);
      }
    }
    this.frameId = requestAnimationFrame(this.loop);
  };

  processResult(result) {
    const landmarks = result?.landmarks?.[0];
    const canvas = this.elements.canvasElement;
    if (canvas) this.drawLandmarks(canvas, landmarks);
    if (!landmarks) {
      this.setStatus("🔎", "กำลังค้นหามือ", "นำมือเข้ามาในภาพกล้อง");
      return;
    }

    const tip = landmarks[8];
    const thumb = landmarks[4];
    const targetX = (1 - tip.x) * innerWidth;
    const targetY = tip.y * innerHeight;
    const alpha = APP_CONFIG.handTracking.smoothing;
    this.cursor.x += (targetX - this.cursor.x) * alpha;
    this.cursor.y += (targetY - this.cursor.y) * alpha;
    this.moveCursor(this.cursor.x, this.cursor.y);

    const distance = Math.hypot(tip.x - thumb.x, tip.y - thumb.y);
    const isPinching = distance < APP_CONFIG.handTracking.pinchThreshold;
    this.elements.cursorElement?.classList.toggle("pinching", isPinching);
    this.setStatus(isPinching ? "👌" : "☝️", isPinching ? "กำลังกด" : "ตรวจพบมือแล้ว", isPinching ? "คลายมือเพื่อกดครั้งต่อไป" : "หนีบนิ้วโป้งกับนิ้วชี้เพื่อกด");

    if (isPinching && !this.pinching && Date.now() - this.lastClickAt > APP_CONFIG.handTracking.clickCooldown) {
      this.lastClickAt = Date.now();
      this.clickAt(this.cursor.x, this.cursor.y);
    }
    this.pinching = isPinching;
  }

  moveCursor(x, y) {
    const cursor = this.elements.cursorElement;
    if (cursor) cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    const target = document.elementFromPoint(x, y);
    document.querySelectorAll(".hand-hover").forEach((el) => el.classList.remove("hand-hover"));
    target?.closest("button, a, input, [role='button']")?.classList.add("hand-hover");
  }

  clickAt(x, y) {
    const target = document.elementFromPoint(x, y)?.closest("button, a, input, [role='button']");
    if (!target) return;
    target.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: x, clientY: y, pointerType: "touch" }));
    target.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, clientX: x, clientY: y, pointerType: "touch" }));
    target.click();
  }

  drawLandmarks(canvas, landmarks) {
    const video = this.elements.videoElement;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    if (!landmarks) return;
    ctx.fillStyle = "rgba(255,255,255,.9)";
    landmarks.forEach((point) => {
      ctx.beginPath();
      ctx.arc((1 - point.x) * width, point.y * height, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  setStatus(icon, title, description) {
    if (this.elements.statusIcon) this.elements.statusIcon.textContent = icon;
    if (this.elements.statusTitle) this.elements.statusTitle.textContent = title;
    if (this.elements.statusDescription) this.elements.statusDescription.textContent = description;
    this.elements.statusElement?.classList.remove("hidden");
  }

  stop() {
    this.running = false;
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.frameId = null;
    this.pinching = false;
    this.elements.cursorElement?.classList.remove("visible", "pinching");
    this.elements.guideElement?.classList.add("hidden");
    this.elements.statusElement?.classList.add("hidden");
    const canvas = this.elements.canvasElement;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
  }

  destroy() {
    this.stop();
    this.landmarker?.close?.();
    this.landmarker = null;
  }
}

export const handTracker = new HandTracker();

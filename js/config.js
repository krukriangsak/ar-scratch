export const APP_CONFIG = {
  loading: { duration: 900 },
  camera: {
    facingMode: "user",
    width: 1280,
    height: 720,
    frameRate: 30
  },
  profile: {
    nicknameMaxLength: 20
  },
  handTracking: {
    numHands: 1,
    minHandDetectionConfidence: 0.55,
    minHandPresenceConfidence: 0.55,
    minTrackingConfidence: 0.55,
    pinchThreshold: 0.055,
    clickCooldown: 550,
    smoothing: 0.35
  }
};

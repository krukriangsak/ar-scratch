const initialState = {
  isInitialized: false,
  currentScreen: "loading-screen",
  profile: null,
  sound: { enabled: true },
  inputMode: "mouse",
  camera: {
    enabled: false,
    permission: "prompt",
    stream: null
  },
  progress: {
    totalStars: 0,
    totalScore: 0,
    completedLevels: 0
  }
};

let state = structuredClone(initialState);
const listeners = new Set();

export function getState() {
  return state;
}

export function setState(updater) {
  const nextState = typeof updater === "function" ? updater(state) : updater;
  if (!nextState || typeof nextState !== "object") return;
  state = nextState;
  listeners.forEach((listener) => {
    try { listener(state); } catch (error) { console.error("State listener error:", error); }
  });
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

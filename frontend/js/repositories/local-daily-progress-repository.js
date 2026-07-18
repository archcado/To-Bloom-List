const DAILY_PROGRESS_STORAGE_KEY = "to-bloom-list.daily-progress.v1";

export const localDailyProgressRepository = Object.freeze({ getState, saveState });

function getState() {
  const fallback = createDefaultState();
  const raw = localStorage.getItem(DAILY_PROGRESS_STORAGE_KEY);
  if (!raw) {
    saveState(fallback);
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw);
    return normalizeState(parsed, fallback);
  } catch (error) {
    console.warn("Invalid daily progress localStorage; created a new state.", error);
    saveState(fallback);
    return fallback;
  }
}

function saveState(state) {
  localStorage.setItem(DAILY_PROGRESS_STORAGE_KEY, JSON.stringify(state));
}

function createDefaultState() {
  return {
    version: 1,
    installationId: createInstallationId(),
    days: {},
    pendingSeedCredits: 0,
    activeSeedOffer: null,
    rewardSequence: 0,
    selectionHistory: [],
  };
}

function normalizeState(value, fallback) {
  if (!value || typeof value !== "object") {
    return fallback;
  }
  return {
    ...fallback,
    installationId: typeof value.installationId === "string" ? value.installationId : fallback.installationId,
    days: value.days && typeof value.days === "object" ? value.days : {},
    pendingSeedCredits: Math.max(0, Number(value.pendingSeedCredits) || 0),
    activeSeedOffer: value.activeSeedOffer && typeof value.activeSeedOffer === "object" ? value.activeSeedOffer : null,
    rewardSequence: Math.max(0, Number(value.rewardSequence) || 0),
    selectionHistory: Array.isArray(value.selectionHistory) ? value.selectionHistory.slice(-100) : [],
  };
}

function createInstallationId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `install-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

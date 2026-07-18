import { PLANT_SPECIES_BY_ID } from "../data/plant-species.js";

const COLLECTION_STORAGE_KEY = "to-bloom-list.collection.v1";

export const localCollectionRepository = Object.freeze({
  getState,
  getUnlockedIds,
  unlock,
  ensureUnlocked,
});

function getState() {
  const fallback = { version: 1, unlocked: { daisy: { unlockedAt: null, source: "starter" } } };
  const raw = localStorage.getItem(COLLECTION_STORAGE_KEY);
  if (!raw) {
    save(fallback);
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.unlocked || typeof parsed.unlocked !== "object") {
      throw new Error("Invalid collection state");
    }
    const unlocked = Object.fromEntries(
      Object.entries({ ...fallback.unlocked, ...parsed.unlocked })
        .filter(([speciesId]) => PLANT_SPECIES_BY_ID.has(speciesId)),
    );
    const state = { version: 1, unlocked };
    const parsedIds = Object.keys(parsed.unlocked);
    const hasInvalidId = parsedIds.some((speciesId) => !PLANT_SPECIES_BY_ID.has(speciesId));
    if (hasInvalidId || !parsed.unlocked.daisy) {
      save(state);
    }
    return state;
  } catch (error) {
    console.warn("Invalid collection localStorage; restored starter collection.", error);
    save(fallback);
    return fallback;
  }
}

function getUnlockedIds() {
  return Object.keys(getState().unlocked);
}

function unlock(speciesId, source = "daily-seed", unlockedAt = new Date().toISOString()) {
  if (!PLANT_SPECIES_BY_ID.has(speciesId)) {
    return getState();
  }
  const state = getState();
  if (!state.unlocked[speciesId]) {
    state.unlocked[speciesId] = { unlockedAt, source };
    save(state);
  }
  return state;
}

function ensureUnlocked(speciesIds, source = "task-migration") {
  const state = getState();
  let changed = false;
  speciesIds.filter(Boolean).forEach((speciesId) => {
    if (PLANT_SPECIES_BY_ID.has(speciesId) && !state.unlocked[speciesId]) {
      state.unlocked[speciesId] = { unlockedAt: null, source };
      changed = true;
    }
  });
  if (changed) {
    save(state);
  }
  return state;
}

function save(state) {
  localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(state));
}

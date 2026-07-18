import { PLANT_SPECIES, PLANT_SPECIES_BY_ID } from "../data/plant-species.js";
import { collectionRepository } from "../repositories/collection-repository.js";
import { dailyProgressRepository } from "../repositories/daily-progress-repository.js";

export const DAILY_GOAL = 4;

export function recordTaskCompletion(taskId, completedAt = new Date().toISOString()) {
  const state = dailyProgressRepository.getState();
  const dateKey = toLocalDateKey(new Date(completedAt));
  const day = normalizeDay(state.days[dateKey]);

  if (!day.completedTaskIds.includes(taskId)) {
    day.completedTaskIds.push(taskId);
  }

  if (day.completedTaskIds.length >= DAILY_GOAL && !day.rewardEarned) {
    day.rewardEarned = true;
    day.rewardEarnedAt = completedAt;
    state.pendingSeedCredits += 1;
    state.rewardSequence += 1;
  }

  state.days[dateKey] = day;
  ensureActiveOffer(state, dateKey);
  dailyProgressRepository.saveState(state);
  return buildView(state, dateKey);
}

export function getDailyRewardView(tasks = []) {
  collectionRepository.ensureUnlocked(tasks.map((task) => task.plant?.type));
  const state = dailyProgressRepository.getState();
  const dateKey = toLocalDateKey(new Date());
  ensureActiveOffer(state, dateKey);
  dailyProgressRepository.saveState(state);
  return buildView(state, dateKey);
}

export function chooseSeed(speciesId) {
  const state = dailyProgressRepository.getState();
  const offer = state.activeSeedOffer;
  if (!offer || !offer.candidateIds.includes(speciesId)) {
    throw new Error("這顆種子不在目前的選項中。");
  }

  const species = PLANT_SPECIES_BY_ID.get(speciesId);
  if (!species) {
    throw new Error("找不到這種植物。");
  }

  collectionRepository.unlock(speciesId, "daily-seed");
  state.pendingSeedCredits = Math.max(0, state.pendingSeedCredits - 1);
  state.selectionHistory.push({
    speciesId,
    offerId: offer.id,
    rewardDate: offer.rewardDate,
    selectedAt: new Date().toISOString(),
  });
  state.activeSeedOffer = null;
  ensureActiveOffer(state, toLocalDateKey(new Date()));
  dailyProgressRepository.saveState(state);
  return { species, view: buildView(state, toLocalDateKey(new Date())) };
}

export function toLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeDay(day) {
  return {
    completedTaskIds: Array.isArray(day?.completedTaskIds) ? [...new Set(day.completedTaskIds)] : [],
    rewardEarned: Boolean(day?.rewardEarned),
    rewardEarnedAt: typeof day?.rewardEarnedAt === "string" ? day.rewardEarnedAt : null,
  };
}

function ensureActiveOffer(state, dateKey) {
  if (state.pendingSeedCredits <= 0) {
    state.activeSeedOffer = null;
    return;
  }

  const unlockedIds = new Set(collectionRepository.getUnlockedIds());
  const lockedSpecies = PLANT_SPECIES.filter((species) => !unlockedIds.has(species.id));
  const regularSpecies = lockedSpecies.filter((species) => !species.finalUnlockOnly);
  const eligibleSpecies = regularSpecies.length > 0 ? regularSpecies : lockedSpecies;

  if (eligibleSpecies.length === 0) {
    state.activeSeedOffer = null;
    return;
  }

  if (isValidOffer(state.activeSeedOffer, eligibleSpecies)) {
    return;
  }

  state.activeSeedOffer = null;
  const seed = hashString(`${state.installationId}:${dateKey}:${state.rewardSequence}`);
  const candidateIds = seededShuffle(eligibleSpecies, seed).slice(0, 3).map((species) => species.id);
  const isFinalOffer = candidateIds.length === 1 && PLANT_SPECIES_BY_ID.get(candidateIds[0])?.finalUnlockOnly === true;
  state.activeSeedOffer = {
    id: `offer-${dateKey}-${state.rewardSequence}`,
    rewardDate: dateKey,
    candidateIds,
    isFinalOffer,
    createdAt: new Date().toISOString(),
  };
}

function isValidOffer(offer, eligibleSpecies) {
  if (!offer || !Array.isArray(offer.candidateIds) || offer.candidateIds.length === 0) {
    return false;
  }
  const eligibleIds = new Set(eligibleSpecies.map((species) => species.id));
  return offer.candidateIds.length <= 3
    && new Set(offer.candidateIds).size === offer.candidateIds.length
    && offer.candidateIds.every((id) => eligibleIds.has(id));
}

function buildView(state, dateKey) {
  const day = normalizeDay(state.days[dateKey]);
  return {
    dateKey,
    completedCount: Math.min(day.completedTaskIds.length, DAILY_GOAL),
    distinctCompletionCount: day.completedTaskIds.length,
    goalReached: day.rewardEarned,
    pendingSeedCredits: state.pendingSeedCredits,
    activeOffer: state.activeSeedOffer
      ? {
          ...state.activeSeedOffer,
          candidates: state.activeSeedOffer.candidateIds.map((id) => PLANT_SPECIES_BY_ID.get(id)).filter(Boolean),
        }
      : null,
  };
}

function seededShuffle(items, seed) {
  const result = [...items];
  let value = seed || 1;
  for (let index = result.length - 1; index > 0; index -= 1) {
    value = (value * 1664525 + 1013904223) >>> 0;
    const swapIndex = value % (index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

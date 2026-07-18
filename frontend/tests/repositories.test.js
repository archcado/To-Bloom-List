import assert from "node:assert/strict";
import test from "node:test";

class MemoryStorage {
  #values = new Map();
  getItem(key) { return this.#values.has(key) ? this.#values.get(key) : null; }
  setItem(key, value) { this.#values.set(key, String(value)); }
  removeItem(key) { this.#values.delete(key); }
  clear() { this.#values.clear(); }
}

globalThis.localStorage = new MemoryStorage();

const taskModule = await import("../js/repositories/local-task-repository.js");
const rewardModule = await import("../js/services/daily-reward-service.js");
const { collectionRepository } = await import("../js/repositories/collection-repository.js");
const { PLANT_SPECIES } = await import("../js/data/plant-species.js");

test.beforeEach(() => localStorage.clear());

test("legacy task data migrates without losing content", () => {
  localStorage.setItem("tasks", JSON.stringify([{ text: "保留舊任務", completed: false }]));
  const tasks = taskModule.loadTasksFromStorage();
  assert.equal(tasks.length, 1);
  assert.equal(tasks[0].text, "保留舊任務");
  assert.equal(tasks[0].syncStatus, "local");
  assert.ok(localStorage.getItem(taskModule.TASK_STORAGE_KEY_V2));
});

test("four distinct completions create only one daily seed credit", () => {
  const now = new Date().toISOString();
  for (const taskId of ["one", "two", "three", "four"]) {
    rewardModule.recordTaskCompletion(taskId, now);
  }
  let view = rewardModule.getDailyRewardView([]);
  assert.equal(view.completedCount, 4);
  assert.equal(view.pendingSeedCredits, 1);
  assert.equal(view.activeOffer.candidates.length, 3);

  rewardModule.recordTaskCompletion("four", now);
  rewardModule.recordTaskCompletion("five", now);
  view = rewardModule.getDailyRewardView([]);
  assert.equal(view.pendingSeedCredits, 1);
});

test("seed offer persists and selected species is unlocked", () => {
  const now = new Date().toISOString();
  ["a", "b", "c", "d"].forEach((id) => rewardModule.recordTaskCompletion(id, now));
  const firstView = rewardModule.getDailyRewardView([]);
  const candidateIds = firstView.activeOffer.candidateIds;
  assert.deepEqual(rewardModule.getDailyRewardView([]).activeOffer.candidateIds, candidateIds);

  const selected = candidateIds[0];
  const result = rewardModule.chooseSeed(selected);
  assert.equal(result.species.id, selected);
  assert.equal(result.view.pendingSeedCredits, 0);
  assert.ok(collectionRepository.getUnlockedIds().includes(selected));
});

test("plant catalog keeps the agreed 01-31 order", () => {
  assert.equal(PLANT_SPECIES.length, 31);
  assert.deepEqual(PLANT_SPECIES.map((species) => species.displayOrder), Array.from({ length: 31 }, (_, index) => index + 1));
  assert.equal(PLANT_SPECIES.at(-1).id, "water-lily");
  assert.equal(PLANT_SPECIES.at(-1).finalUnlockOnly, true);
  for (const removedId of ["marigold", "magnolia", "peony", "lotus"]) {
    assert.equal(PLANT_SPECIES.some((species) => species.id === removedId), false);
  }
});

test("water lily is excluded while regular species remain locked", () => {
  const now = new Date().toISOString();
  ["one", "two", "three", "four"].forEach((id) => rewardModule.recordTaskCompletion(id, now));
  const view = rewardModule.getDailyRewardView([]);
  assert.equal(view.activeOffer.candidates.length, 3);
  assert.equal(view.activeOffer.candidateIds.includes("water-lily"), false);
});

test("water lily becomes the single final seed offer", () => {
  PLANT_SPECIES.filter((species) => species.id !== "water-lily")
    .forEach((species) => collectionRepository.unlock(species.id, "test"));

  const now = new Date().toISOString();
  ["one", "two", "three", "four"].forEach((id) => rewardModule.recordTaskCompletion(id, now));
  const view = rewardModule.getDailyRewardView([]);
  assert.deepEqual(view.activeOffer.candidateIds, ["water-lily"]);
  assert.equal(view.activeOffer.isFinalOffer, true);
});

test("removed species are pruned from an existing local collection", () => {
  localStorage.setItem("to-bloom-list.collection.v1", JSON.stringify({
    version: 1,
    unlocked: {
      daisy: { unlockedAt: null, source: "starter" },
      marigold: { unlockedAt: null, source: "legacy" },
    },
  }));
  assert.deepEqual(collectionRepository.getUnlockedIds(), ["daisy"]);
});

test("a legacy offer containing removed or premature final species is rebuilt", () => {
  localStorage.setItem("to-bloom-list.daily-progress.v1", JSON.stringify({
    version: 1,
    installationId: "legacy-test",
    days: {},
    pendingSeedCredits: 1,
    rewardSequence: 1,
    selectionHistory: [],
    activeSeedOffer: {
      id: "legacy-offer",
      rewardDate: "2026-07-18",
      candidateIds: ["marigold", "water-lily", "tulip"],
      createdAt: "2026-07-18T00:00:00.000Z",
    },
  }));

  const view = rewardModule.getDailyRewardView([]);
  assert.equal(view.activeOffer.candidateIds.length, 3);
  assert.equal(view.activeOffer.candidateIds.includes("marigold"), false);
  assert.equal(view.activeOffer.candidateIds.includes("water-lily"), false);
});

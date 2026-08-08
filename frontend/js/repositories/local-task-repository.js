export const TASK_STORAGE_KEY_V2 = "to-bloom-list.tasks.v2";
export const TASK_STORAGE_KEY_V1 = "to-bloom-list.tasks.v1";
export const TASK_STORAGE_KEY_LEGACY = "tasks";

export const localTaskRepository = Object.freeze({
  getAll: loadTasksFromStorage,
  saveAll: saveTasksToStorage,
});

export function createTaskId() {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getStablePlantVariant(taskId) {
  return getTaskIdHash(taskId) % 3;
}

export function getStablePlantType(taskId, availablePlantIds = ["daisy", "lily"]) {
  const supportedIds = [...new Set(availablePlantIds)].filter((id) => PLANT_SPECIES_BY_ID.has(id));
  const candidates = supportedIds.length > 0 ? supportedIds : ["daisy"];
  return candidates[getTaskIdHash(taskId) % candidates.length];
}

export function normalizeTask(task, index) {
  if (!task || typeof task !== "object") {
    return null;
  }

  const text = typeof task.text === "string" ? task.text.trim() : "";
  if (!text) {
    return null;
  }

  const id = typeof task.id === "string" && task.id ? task.id : createTaskId();
  const completed = Boolean(task.completed);
  const nowIso = new Date().toISOString();
  const createdAt = typeof task.createdAt === "string" && task.createdAt ? task.createdAt : nowIso;
  const completedAt = completed && typeof task.completedAt === "string" && task.completedAt
    ? task.completedAt
    : completed ? nowIso : null;

  return {
    id,
    text,
    description: stringOrNull(task.description),
    completed,
    order: Number.isInteger(task.order) ? task.order : index,
    createdAt,
    completedAt,
    dueDate: stringOrNull(task.dueDate),
    startAt: stringOrNull(task.startAt),
    endAt: stringOrNull(task.endAt),
    timeZone: stringOrNull(task.timeZone) || getCurrentTimeZone(),
    calendarEventId: stringOrNull(task.calendarEventId),
    syncStatus: normalizeSyncStatus(task.syncStatus),
    lastSyncedAt: stringOrNull(task.lastSyncedAt),
    plant: normalizePlant(task.plant, id),
  };
}

export function normalizeTaskList(list) {
  if (!Array.isArray(list)) {
    return null;
  }
  return list
    .map((task, index) => normalizeTask(task, index))
    .filter(Boolean)
    .sort((a, b) => a.order - b.order)
    .map((task, index) => ({ ...task, order: index }));
}

export function loadTasksFromStorage() {
  for (const key of [TASK_STORAGE_KEY_V2, TASK_STORAGE_KEY_V1, TASK_STORAGE_KEY_LEGACY]) {
    const tasks = readTasksByKey(key);
    if (tasks) {
      saveTasksToStorage(tasks);
      return tasks;
    }
  }
  return [];
}

export function saveTasksToStorage(tasks) {
  localStorage.setItem(TASK_STORAGE_KEY_V2, JSON.stringify(normalizeTaskList(tasks) || []));
}

function normalizePlant(plant, taskId) {
  const hasPlantObject = plant && typeof plant === "object";
  const type = hasPlantObject && PLANT_SPECIES_BY_ID.has(plant.type) ? plant.type : getStablePlantType(taskId);
  const storedVariant = hasPlantObject ? Number(plant.variant) : NaN;
  return {
    type,
    variant: Number.isInteger(storedVariant) ? Math.min(2, Math.max(0, storedVariant)) : getStablePlantVariant(taskId),
  };
}

function readTasksByKey(key) {
  const rawValue = localStorage.getItem(key);
  if (!rawValue) {
    return null;
  }
  try {
    return normalizeTaskList(JSON.parse(rawValue));
  } catch (error) {
    console.warn(`Invalid JSON in localStorage key "${key}"`, error);
    return null;
  }
}

function normalizeSyncStatus(value) {
  return ["local", "pending", "synced", "failed", "conflict"].includes(value) ? value : "local";
}

function stringOrNull(value) {
  return typeof value === "string" && value ? value : null;
}

function getCurrentTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Taipei";
}

function getTaskIdHash(taskId) {
  if (typeof taskId !== "string" || !taskId) {
    return 0;
  }
  let hash = 0;
  for (let index = 0; index < taskId.length; index += 1) {
    hash = (hash * 31 + taskId.charCodeAt(index)) % 2147483647;
  }
  return Math.abs(hash);
}
import { PLANT_SPECIES_BY_ID } from "../data/plant-species.js";

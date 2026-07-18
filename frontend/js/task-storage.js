export const TASK_STORAGE_KEY_V2 = "to-bloom-list.tasks.v2";
export const TASK_STORAGE_KEY_V1 = "to-bloom-list.tasks.v1";
export const TASK_STORAGE_KEY_LEGACY = "tasks";

export function createTaskId() {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getStablePlantVariant(taskId) {
  return getTaskIdHash(taskId) % 3;
}

export function getStablePlantType(taskId) {
  return getTaskIdHash(taskId) % 2 === 0 ? "daisy" : "lily";
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
  const createdAt =
    typeof task.createdAt === "string" && task.createdAt ? task.createdAt : nowIso;
  const completedAt =
    completed && typeof task.completedAt === "string" && task.completedAt
      ? task.completedAt
      : completed
        ? nowIso
        : null;

  const plant = normalizePlant(task.plant, id);

  return {
    id,
    text,
    completed,
    order: Number.isInteger(task.order) ? task.order : index,
    createdAt,
    completedAt,
    plant,
  };
}

export function normalizeTaskList(list) {
  if (!Array.isArray(list)) {
    return null;
  }

  return list
    .map((task, index) => normalizeTask(task, index))
    .filter((task) => task !== null)
    .sort((a, b) => a.order - b.order)
    .map((task, index) => ({ ...task, order: index }));
}

export function loadTasksFromStorage() {
  const v2Tasks = readTasksByKey(TASK_STORAGE_KEY_V2);
  if (v2Tasks) {
    saveTasksToStorage(v2Tasks);
    return v2Tasks;
  }

  const v1Tasks = readTasksByKey(TASK_STORAGE_KEY_V1);
  if (v1Tasks) {
    saveTasksToStorage(v1Tasks);
    return v1Tasks;
  }

  const legacyTasks = readTasksByKey(TASK_STORAGE_KEY_LEGACY);
  if (legacyTasks) {
    saveTasksToStorage(legacyTasks);
    return legacyTasks;
  }

  return [];
}

export function saveTasksToStorage(tasks) {
  const normalized = normalizeTaskList(tasks) || [];
  localStorage.setItem(TASK_STORAGE_KEY_V2, JSON.stringify(normalized));
}

function normalizePlant(plant, taskId) {
  const hasPlantObject = plant && typeof plant === "object";
  const supportedTypes = new Set(["daisy", "lily"]);
  const type =
    hasPlantObject && supportedTypes.has(plant.type)
      ? plant.type
      : getStablePlantType(taskId);
  const storedVariant = hasPlantObject ? Number(plant.variant) : NaN;
  const variant = Number.isInteger(storedVariant)
    ? clampVariant(storedVariant)
    : getStablePlantVariant(taskId);

  return {
    type,
    variant,
  };
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

function clampVariant(value) {
  if (value < 0) {
    return 0;
  }
  if (value > 2) {
    return 2;
  }
  return value;
}

function readTasksByKey(key) {
  const rawValue = localStorage.getItem(key);
  if (!rawValue) {
    return null;
  }

  const parsedValue = parseStorageValue(rawValue, key);
  if (!parsedValue) {
    return null;
  }

  const normalized = normalizeTaskList(parsedValue);
  if (!normalized || normalized.length === 0) {
    return normalized;
  }

  return normalized.map((task, index) => ({
    ...task,
    order: index,
    plant: normalizePlant(task.plant, task.id),
  }));
}

function parseStorageValue(rawValue, key) {
  try {
    return JSON.parse(rawValue);
  } catch (error) {
    console.warn(`Invalid JSON in localStorage key "${key}"`, error);
    return null;
  }
}

// Compatibility exports for pages created before the Repository boundary.
// New code should import taskRepository from ./repositories/task-repository.js.
export {
  TASK_STORAGE_KEY_LEGACY,
  TASK_STORAGE_KEY_V1,
  TASK_STORAGE_KEY_V2,
  createTaskId,
  getStablePlantType,
  getStablePlantVariant,
  loadTasksFromStorage,
  normalizeTask,
  normalizeTaskList,
  saveTasksToStorage,
} from "./repositories/local-task-repository.js";

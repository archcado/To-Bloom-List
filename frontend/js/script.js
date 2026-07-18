import {
  createTaskId,
  getStablePlantType,
  getStablePlantVariant,
  loadTasksFromStorage,
  normalizeTaskList,
  saveTasksToStorage,
} from "./task-storage.js";
import {
  clearAllTaskGardenTimers,
  getPlantStageImage,
  preloadTaskGardenImages,
  renderTaskGarden,
} from "./components/task-garden.js";

const RECOMMENDED_TASK_COUNT = 4;

const input = document.getElementById("taskInput");
const addButton = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const taskLimitMessage = document.getElementById("taskLimitMessage");
const taskTotalCount = document.getElementById("taskTotalCount");
const taskCompletedCount = document.getElementById("taskCompletedCount");
const bloomSummaryCount = document.getElementById("bloomSummaryCount");
const taskSummaryStatus = document.getElementById("taskSummaryStatus");

let tasks = loadTasksFromStorage();
let draggedTaskId = null;

if (taskList) {
  bindTaskInteractions();
}

renderApp();
preloadTaskGardenImages();
window.addEventListener("beforeunload", clearAllTaskGardenTimers);

function bindTaskInteractions() {
  if (addButton) {
    addButton.addEventListener("click", addTask);
  }

  if (input) {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        addTask();
      }
    });
  }

  taskList.addEventListener("change", (event) => {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }
    if (!event.target.classList.contains("task-check-input")) {
      return;
    }

    const taskItem = event.target.closest("li[data-task-id]");
    const taskId = taskItem ? taskItem.dataset.taskId : null;
    if (!taskId) {
      return;
    }

    toggleTaskCompletion(taskId, event.target.checked);
  });

  taskList.addEventListener("click", (event) => {
    const clickTarget = event.target;
    if (!(clickTarget instanceof HTMLElement)) {
      return;
    }

    const deleteButton = clickTarget.closest(".delete-btn");
    if (!deleteButton) {
      return;
    }

    const taskItem = deleteButton.closest("li[data-task-id]");
    const taskId = taskItem ? taskItem.dataset.taskId : null;
    if (!taskId) {
      return;
    }

    deleteTask(taskId);
  });

  taskList.addEventListener("dragstart", (event) => {
    const taskItem =
      event.target instanceof HTMLElement ? event.target.closest("li[data-task-id]") : null;
    if (!taskItem) {
      return;
    }

    draggedTaskId = taskItem.dataset.taskId || null;
    taskItem.classList.add("dragging");
  });

  taskList.addEventListener("dragend", (event) => {
    const taskItem =
      event.target instanceof HTMLElement ? event.target.closest("li[data-task-id]") : null;
    if (taskItem) {
      taskItem.classList.remove("dragging");
    }

    clearDragOverStyles();

    if (!draggedTaskId) {
      return;
    }

    syncTaskOrderFromDOM();
    persistAndRender();
    draggedTaskId = null;
  });

  taskList.addEventListener("dragover", (event) => {
    event.preventDefault();

    const afterElement = getDragAfterElement(taskList, event.clientY);
    const draggingItem = taskList.querySelector(".dragging");
    if (!draggingItem) {
      return;
    }

    clearDragOverStyles();

    if (afterElement) {
      afterElement.classList.add("drag-over");
      taskList.insertBefore(draggingItem, afterElement);
      return;
    }

    taskList.appendChild(draggingItem);
  });
}

function addTask() {
  if (!input) {
    return;
  }

  const taskText = input.value.trim();
  if (!taskText) {
    if (taskLimitMessage) {
      taskLimitMessage.textContent = "請輸入任務內容（不可為空白）。";
      taskLimitMessage.classList.add("limit-reached");
    }
    return;
  }

  const now = new Date().toISOString();
  const taskId = createTaskId();
  tasks.push({
    id: taskId,
    text: taskText,
    completed: false,
    order: tasks.length,
    createdAt: now,
    completedAt: null,
    plant: {
      type: getStablePlantType(taskId),
      variant: getStablePlantVariant(taskId),
    },
  });

  tasks = normalizeTaskList(tasks) || [];
  input.value = "";
  persistAndRender();
}

function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  persistAndRender();
}

function toggleTaskCompletion(taskId, completed) {
  const now = new Date().toISOString();
  let changedTaskText = "";

  tasks = tasks.map((task) => {
    if (task.id !== taskId) {
      return task;
    }

    changedTaskText = task.text;
    return {
      ...task,
      completed,
      completedAt: completed ? now : null,
    };
  });

  tasks = normalizeTaskList(tasks) || [];
  persistAndRender({
    animateTaskId: completed ? taskId : null,
    completionMessage: completed ? `任務「${changedTaskText}」已完成，植物開始綻放。` : "",
  });
}

function persistAndRender(options = {}) {
  renderTasks(tasks);
  renderTaskGarden(tasks, options);
  saveTasksToStorage(tasks);
  renderTaskLimitMessage(tasks);
  renderTaskSummary(tasks);
  emitTaskStateUpdated();
}

function renderApp() {
  renderTasks(tasks);
  renderTaskGarden(tasks);
  renderTaskLimitMessage(tasks);
  renderTaskSummary(tasks);
  saveTasksToStorage(tasks);
  emitTaskStateUpdated();
}

function renderTasks(taskItems) {
  if (!taskList) {
    return;
  }

  taskList.innerHTML = "";
  taskItems.forEach((task) => {
    taskList.appendChild(createTaskItem(task));
  });
}

function renderTaskLimitMessage(taskItems) {
  if (!taskLimitMessage) {
    return;
  }

  const total = taskItems.length;
  if (total <= RECOMMENDED_TASK_COUNT) {
    taskLimitMessage.textContent = `建議任務數：${total} / ${RECOMMENDED_TASK_COUNT}`;
    taskLimitMessage.classList.remove("limit-reached");
    return;
  }

  taskLimitMessage.textContent = `目前 ${total} 項，建議精簡至 ${RECOMMENDED_TASK_COUNT} 項以維持專注。`;
  taskLimitMessage.classList.add("limit-reached");
}

function renderTaskSummary(taskItems) {
  const total = taskItems.length;
  const completed = taskItems.filter((task) => task.completed).length;

  if (taskTotalCount) {
    taskTotalCount.textContent = String(total);
  }
  if (taskCompletedCount) {
    taskCompletedCount.textContent = String(completed);
  }
  if (bloomSummaryCount) {
    bloomSummaryCount.textContent = String(completed);
  }

  if (!taskSummaryStatus) {
    return;
  }

  if (total === 0) {
    taskSummaryStatus.textContent = "今天的花圃還是空的，新增第一項任務開始栽種。";
    return;
  }

  if (completed === total) {
    taskSummaryStatus.textContent = "今天的任務全部完成，花園已全面盛開。";
    return;
  }

  taskSummaryStatus.textContent = `已完成 ${completed} / 今日任務 ${total}`;
}

function emitTaskStateUpdated() {
  window.dispatchEvent(
    new CustomEvent("tasks:updated", {
      detail: {
        tasks: [...tasks],
      },
    }),
  );
}

function createTaskItem(task) {
  const listItem = document.createElement("li");
  listItem.dataset.taskId = task.id;
  listItem.setAttribute("draggable", "true");

  const leftBox = document.createElement("div");
  leftBox.className = "task-left";

  const checkInput = document.createElement("input");
  checkInput.type = "checkbox";
  checkInput.className = "task-check-input";
  checkInput.checked = task.completed;
  checkInput.setAttribute("aria-label", `完成任務：${task.text}`);

  const miniPlant = document.createElement("img");
  miniPlant.className = "task-mini-plant";
  miniPlant.alt = "";
  miniPlant.loading = "lazy";
  miniPlant.src = getPlantStageImage(
    task.completed ? "bloom" : "sprout",
    task.plant?.type,
  );

  const text = document.createElement("span");
  text.className = "task-text";
  text.textContent = task.text;
  text.classList.toggle("completed", task.completed);

  const status = document.createElement("span");
  status.className = "task-status";
  status.textContent = task.completed ? "已盛開" : "成長中";

  const deleteButton = document.createElement("button");
  deleteButton.className = "task-delete delete-btn";
  deleteButton.type = "button";
  deleteButton.textContent = "刪除";
  deleteButton.setAttribute("aria-label", `刪除任務：${task.text}`);

  leftBox.appendChild(checkInput);
  leftBox.appendChild(miniPlant);
  leftBox.appendChild(text);
  leftBox.appendChild(status);
  listItem.appendChild(leftBox);
  listItem.appendChild(deleteButton);

  return listItem;
}

function clearDragOverStyles() {
  if (!taskList) {
    return;
  }

  taskList.querySelectorAll(".drag-over").forEach((listItem) => {
    listItem.classList.remove("drag-over");
  });
}

function syncTaskOrderFromDOM() {
  if (!taskList) {
    return;
  }

  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const orderedIds = Array.from(taskList.querySelectorAll("li[data-task-id]")).map(
    (listItem) => listItem.dataset.taskId,
  );

  const orderedTasks = orderedIds
    .map((id) => (id ? taskById.get(id) : null))
    .filter((task) => task !== undefined && task !== null);

  tasks = orderedTasks.map((task, index) => ({ ...task, order: index }));
}

function getDragAfterElement(container, y) {
  const draggableElements = Array.from(
    container.querySelectorAll("li[data-task-id]:not(.dragging)"),
  );

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      }

      return closest;
    },
    { offset: Number.NEGATIVE_INFINITY, element: null },
  ).element;
}

const STORAGE_KEY = "to-bloom-list.tasks.v1";
const LEGACY_STORAGE_KEY = "tasks";
const RECOMMENDED_TASK_COUNT = 4;

const STAGES = [
  {
    name: "種子",
    message: "今天，準備開始了。",
    className: "rose-stage-1",
  },
  {
    name: "發芽",
    message: "枝葉已開始舒展。",
    className: "rose-stage-2",
  },
  {
    name: "葉子",
    message: "花苞正慢慢飽滿。",
    className: "rose-stage-3",
  },
  {
    name: "花蕾",
    message: "距離綻放，只差最後幾步。",
    className: "rose-stage-4",
  },
  {
    name: "綻放",
    message: "今天，已經完整盛開。",
    className: "rose-stage-5",
  },
];

const input = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const taskLimitMessage = document.getElementById("taskLimitMessage");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");
const plantStage = document.getElementById("plantStage");
const progressPercent = document.getElementById("progressPercent");
const stageMessage = document.getElementById("stageMessage");
const rosePlant = document.getElementById("rosePlant");

let tasks = [];
let draggedTaskId = null;

addBtn.addEventListener("click", addTask);

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addTask();
  }
});

taskList.addEventListener("change", (event) => {
  if (!(event.target instanceof HTMLInputElement)) {
    return;
  }
  if (!event.target.classList.contains("task-check-input")) {
    return;
  }

  const li = event.target.closest("li");
  const taskId = li ? li.dataset.taskId : null;
  if (!taskId) {
    return;
  }

  toggleTaskCompletion(taskId, event.target.checked);
});

taskList.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const deleteButton = target.closest(".delete-btn");
  if (!deleteButton) {
    return;
  }

  const li = deleteButton.closest("li");
  const taskId = li ? li.dataset.taskId : null;
  if (!taskId) {
    return;
  }

  deleteTask(taskId);
});

taskList.addEventListener("dragstart", (event) => {
  const li = event.target instanceof HTMLElement ? event.target.closest("li") : null;
  if (!li) {
    return;
  }

  draggedTaskId = li.dataset.taskId || null;
  li.classList.add("dragging");
});

taskList.addEventListener("dragend", (event) => {
  const li = event.target instanceof HTMLElement ? event.target.closest("li") : null;
  if (li) {
    li.classList.remove("dragging");
  }

  clearDragOverStyles();

  if (!draggedTaskId) {
    return;
  }

  syncTaskOrderFromDOM();
  saveTasks();
  renderProgress();
  renderTaskLimitMessage();
  draggedTaskId = null;
});

taskList.addEventListener("dragover", (event) => {
  event.preventDefault();

  const afterElement = getDragAfterElement(taskList, event.clientY);
  const dragging = taskList.querySelector(".dragging");
  if (!dragging) {
    return;
  }

  clearDragOverStyles();

  if (afterElement) {
    afterElement.classList.add("drag-over");
    taskList.insertBefore(dragging, afterElement);
    return;
  }

  taskList.appendChild(dragging);
});

loadTasks();
renderTasks();
renderProgress();
renderTaskLimitMessage();

function addTask() {
  const taskText = input.value.trim();
  if (!taskText) {
    taskLimitMessage.textContent = "請輸入任務內容（不可為空白）。";
    taskLimitMessage.classList.add("limit-reached");
    return;
  }

  const now = new Date().toISOString();
  tasks.push({
    id: createTaskId(),
    text: taskText,
    completed: false,
    order: tasks.length,
    createdAt: now,
    completedAt: null,
  });

  input.value = "";
  persistAndRender();
}

function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  persistAndRender();
}

function toggleTaskCompletion(taskId, completed) {
  const now = new Date().toISOString();

  tasks = tasks.map((task) => {
    if (task.id !== taskId) {
      return task;
    }

    return {
      ...task,
      completed,
      completedAt: completed ? now : null,
    };
  });

  persistAndRender();
}

function persistAndRender() {
  reindexTasks();
  saveTasks();
  renderTasks();
  renderProgress();
  renderTaskLimitMessage();
}

function loadTasks() {
  const currentTasks = readStoredTasks(STORAGE_KEY);
  if (currentTasks) {
    tasks = currentTasks;
    return;
  }

  const legacyTasks = readStoredTasks(LEGACY_STORAGE_KEY);
  if (!legacyTasks) {
    tasks = [];
    return;
  }

  tasks = legacyTasks;
  saveTasks();
}

function saveTasks() {
  reindexTasks();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function readStoredTasks(key) {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return null;
  }

  const parsed = parseStorageValue(raw, key);
  if (!Array.isArray(parsed)) {
    return null;
  }

  return parsed
    .map((task, index) => normalizeTask(task, index))
    .filter((task) => task !== null)
    .sort((a, b) => a.order - b.order)
    .map((task, index) => ({ ...task, order: index }));
}

function parseStorageValue(rawValue, key) {
  try {
    return JSON.parse(rawValue);
  } catch (error) {
    console.warn(`Invalid JSON in localStorage key "${key}"`, error);
    return null;
  }
}

function normalizeTask(task, index) {
  if (!task || typeof task !== "object") {
    return null;
  }

  const text = typeof task.text === "string" ? task.text.trim() : "";
  if (!text) {
    return null;
  }

  const completed = Boolean(task.completed);
  const createdAt =
    typeof task.createdAt === "string" && task.createdAt
      ? task.createdAt
      : new Date().toISOString();

  const completedAt =
    completed && typeof task.completedAt === "string" && task.completedAt
      ? task.completedAt
      : completed
        ? new Date().toISOString()
        : null;

  return {
    id: typeof task.id === "string" && task.id ? task.id : createTaskId(),
    text,
    completed,
    order: Number.isInteger(task.order) ? task.order : index,
    createdAt,
    completedAt,
  };
}

function reindexTasks() {
  tasks = tasks.map((task, index) => ({ ...task, order: index }));
}

function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach((task) => {
    taskList.appendChild(createTaskItem(task));
  });
}

function renderProgress() {
  const total = tasks.length;
  const done = tasks.filter((task) => task.completed).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  progressText.textContent = `進度：${done} / ${total}`;
  progressPercent.textContent = `${percent}%`;
  progressBar.style.width = `${percent}%`;
  progressBar.setAttribute("aria-valuenow", String(percent));

  const stageIndex = getStageIndex(percent, total);
  const currentStage = STAGES[stageIndex];

  plantStage.textContent = currentStage.name;
  stageMessage.textContent = currentStage.message;
  rosePlant.classList.remove(...STAGES.map((stage) => stage.className));
  rosePlant.classList.add(currentStage.className);
  updateStageCards(stageIndex);
}

function renderTaskLimitMessage() {
  const total = tasks.length;

  if (total <= RECOMMENDED_TASK_COUNT) {
    taskLimitMessage.textContent = `建議任務數：${total} / ${RECOMMENDED_TASK_COUNT}`;
    taskLimitMessage.classList.remove("limit-reached");
    return;
  }

  taskLimitMessage.textContent = `目前 ${total} 項，建議精簡至 ${RECOMMENDED_TASK_COUNT} 項以維持專注。`;
  taskLimitMessage.classList.add("limit-reached");
}

function updateStageCards(activeIndex) {
  const cards = document.querySelectorAll(".stage-card");
  cards.forEach((card, index) => {
    card.classList.toggle("active", index === activeIndex);
  });
}

function getStageIndex(percent, total) {
  if (total === 0 || percent === 0) {
    return 0;
  }
  if (percent <= 25) {
    return 1;
  }
  if (percent <= 50) {
    return 2;
  }
  if (percent <= 75) {
    return 3;
  }
  return 4;
}

function createTaskItem(task) {
  const li = document.createElement("li");
  li.dataset.taskId = task.id;
  li.setAttribute("draggable", "true");

  const leftBox = document.createElement("div");
  leftBox.className = "task-left";

  const checkInput = document.createElement("input");
  checkInput.type = "checkbox";
  checkInput.className = "task-check-input";
  checkInput.checked = task.completed;
  checkInput.setAttribute("aria-label", `完成任務：${task.text}`);

  const text = document.createElement("span");
  text.className = "task-text";
  text.textContent = task.text;
  text.classList.toggle("completed", task.completed);

  const status = document.createElement("span");
  status.className = "task-status";
  status.textContent = task.completed ? "（已完成）" : "（進行中）";

  const button = document.createElement("button");
  button.className = "task-delete delete-btn";
  button.type = "button";
  button.textContent = "✕";
  button.setAttribute("aria-label", `刪除任務：${task.text}`);

  leftBox.appendChild(checkInput);
  leftBox.appendChild(text);
  leftBox.appendChild(status);
  li.appendChild(leftBox);
  li.appendChild(button);

  return li;
}

function clearDragOverStyles() {
  taskList.querySelectorAll(".drag-over").forEach((li) => {
    li.classList.remove("drag-over");
  });
}

function syncTaskOrderFromDOM() {
  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const orderedIds = Array.from(taskList.querySelectorAll("li[data-task-id]")).map(
    (li) => li.dataset.taskId,
  );

  const orderedTasks = orderedIds
    .map((id) => (id ? taskById.get(id) : null))
    .filter((task) => task !== undefined && task !== null);

  tasks = orderedTasks.map((task, index) => ({ ...task, order: index }));
}

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll("li[data-task-id]:not(.dragging)"),
  ];

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

function createTaskId() {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

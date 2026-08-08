import {
  createTaskId,
  getStablePlantType,
  getStablePlantVariant,
  normalizeTaskList,
} from "./repositories/local-task-repository.js";
import { taskRepository } from "./repositories/task-repository.js";
import {
  chooseSeed,
  DAILY_GOAL,
  getDailyRewardView,
  recordTaskCompletion,
  toLocalDateKey,
} from "./services/daily-reward-service.js";
import {
  clearAllTaskGardenTimers,
  getPlantStageImage,
  preloadTaskGardenImages,
  renderTaskGarden,
} from "./components/task-garden.js";
import { collectionRepository } from "./repositories/collection-repository.js";

const input = document.getElementById("taskInput");
const addButton = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const taskLimitMessage = document.getElementById("taskLimitMessage");
const taskTotalCount = document.getElementById("taskTotalCount");
const taskCompletedCount = document.getElementById("taskCompletedCount");
const bloomSummaryCount = document.getElementById("bloomSummaryCount");
const taskSummaryStatus = document.getElementById("taskSummaryStatus");
const dailyCompletedCount = document.getElementById("dailyCompletedCount");
const dailyProgressBar = document.getElementById("dailyProgressBar");
const dailyRewardMessage = document.getElementById("dailyRewardMessage");
const pendingSeedCredits = document.getElementById("pendingSeedCredits");
const openSeedOfferButton = document.getElementById("openSeedOffer");
const seedDialog = document.getElementById("seedOfferDialog");
const seedDialogTitle = document.getElementById("seedDialogTitle");
const seedChoices = document.getElementById("seedOfferChoices");
const seedFeedback = document.getElementById("seedOfferFeedback");

let tasks = taskRepository.getAll();
let draggedTaskId = null;
let rewardView = migrateTodayCompletions(tasks);

if (taskList) {
  bindTaskInteractions();
}
bindRewardInteractions();
renderApp();
preloadTaskGardenImages(tasks.map((task) => task.plant?.type));
window.addEventListener("beforeunload", clearAllTaskGardenTimers);

function bindTaskInteractions() {
  addButton?.addEventListener("click", addTask);
  input?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTask();
    }
  });

  taskList.addEventListener("change", (event) => {
    if (!(event.target instanceof HTMLInputElement) || !event.target.classList.contains("task-check-input")) {
      return;
    }
    const taskId = event.target.closest("li[data-task-id]")?.dataset.taskId;
    if (taskId) {
      toggleTaskCompletion(taskId, event.target.checked);
    }
  });

  taskList.addEventListener("click", (event) => {
    const target = event.target instanceof HTMLElement ? event.target : null;
    if (!target) {
      return;
    }

    const actionsToggle = target.closest(".task-actions__toggle");
    if (actionsToggle) {
      const menu = actionsToggle.parentElement?.querySelector(".task-actions__menu");
      closeTaskMenus(menu);
      const willOpen = menu?.hidden ?? false;
      if (menu) {
        menu.hidden = !willOpen;
        actionsToggle.setAttribute("aria-expanded", String(willOpen));
      }
      return;
    }

    const deleteButton = target.closest(".delete-btn");
    const taskId = deleteButton?.closest("li[data-task-id]")?.dataset.taskId;
    if (taskId) {
      deleteTask(taskId);
    }
  });

  taskList.addEventListener("dragstart", (event) => {
    const taskItem = event.target instanceof HTMLElement ? event.target.closest("li[data-task-id]") : null;
    if (!taskItem) {
      return;
    }
    draggedTaskId = taskItem.dataset.taskId || null;
    taskItem.classList.add("dragging");
  });

  taskList.addEventListener("dragend", (event) => {
    const taskItem = event.target instanceof HTMLElement ? event.target.closest("li[data-task-id]") : null;
    taskItem?.classList.remove("dragging");
    clearDragOverStyles();
    if (draggedTaskId) {
      syncTaskOrderFromDOM();
      persistAndRender();
      draggedTaskId = null;
    }
  });

  taskList.addEventListener("dragover", (event) => {
    event.preventDefault();
    const draggingItem = taskList.querySelector(".dragging");
    if (!draggingItem) {
      return;
    }
    const afterElement = getDragAfterElement(taskList, event.clientY);
    clearDragOverStyles();
    if (afterElement) {
      afterElement.classList.add("drag-over");
      taskList.insertBefore(draggingItem, afterElement);
    } else {
      taskList.appendChild(draggingItem);
    }
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element) || !event.target.closest(".task-actions")) {
      closeTaskMenus();
    }
  });
}

function bindRewardInteractions() {
  openSeedOfferButton?.addEventListener("click", () => {
    rewardView = getDailyRewardView(tasks);
    renderSeedChoices(rewardView);
    if (seedDialog instanceof HTMLDialogElement) {
      seedDialog.showModal();
    }
  });

  seedChoices?.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("button[data-species-id]") : null;
    const speciesId = button?.dataset.speciesId;
    if (!speciesId) {
      return;
    }

    try {
      const result = chooseSeed(speciesId);
      rewardView = result.view;
      if (seedFeedback) {
        seedFeedback.textContent = `你選中了「${result.species.name}」——${result.species.meaning}。已收進植物圖鑑。`;
      }
      seedChoices.querySelectorAll("button").forEach((choice) => { choice.disabled = true; });
      renderDailyReward();
      window.dispatchEvent(new CustomEvent("collection:updated", { detail: result.species }));
    } catch (error) {
      if (seedFeedback) {
        seedFeedback.textContent = error instanceof Error ? error.message : "目前無法選擇這顆種子。";
      }
    }
  });
}

function addTask() {
  if (!input) {
    return;
  }
  const taskText = input.value.trim();
  if (!taskText) {
    if (taskLimitMessage) {
      taskLimitMessage.textContent = "請先寫下任務內容。";
    }
    input.focus();
    return;
  }

  const taskId = createTaskId();
  tasks.push({
    id: taskId,
    text: taskText,
    description: null,
    completed: false,
    order: tasks.length,
    createdAt: new Date().toISOString(),
    completedAt: null,
    dueDate: null,
    startAt: null,
    endAt: null,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Taipei",
    calendarEventId: null,
    syncStatus: "local",
    lastSyncedAt: null,
    plant: {
      type: getStablePlantType(taskId, collectionRepository.getUnlockedIds()),
      variant: getStablePlantVariant(taskId),
    },
  });
  tasks = normalizeTaskList(tasks) || [];
  input.value = "";
  persistAndRender();
  input.focus();
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
    return { ...task, completed, completedAt: completed ? now : null, syncStatus: "local" };
  });
  tasks = normalizeTaskList(tasks) || [];
  if (completed) {
    rewardView = recordTaskCompletion(taskId, now);
  }
  persistAndRender({
    animateTaskId: completed ? taskId : null,
    completionMessage: completed ? `任務「${changedTaskText}」已完成，植物開始綻放。` : "",
  });
}

function persistAndRender(options = {}) {
  taskRepository.saveAll(tasks);
  rewardView = getDailyRewardView(tasks);
  renderTasks(tasks);
  renderTaskGarden(tasks, options);
  renderTaskSummary(tasks);
  renderDailyReward();
  emitTaskStateUpdated();
}

function renderApp() {
  taskRepository.saveAll(tasks);
  renderTasks(tasks);
  renderTaskGarden(tasks);
  renderTaskSummary(tasks);
  renderDailyReward();
  emitTaskStateUpdated();
}

function renderTasks(items) {
  if (!taskList) {
    return;
  }
  taskList.replaceChildren(...items.map(createTaskItem));
}

function renderTaskSummary(items) {
  const total = items.length;
  const completed = items.filter((task) => task.completed).length;
  if (taskTotalCount) taskTotalCount.textContent = String(total);
  if (taskCompletedCount) taskCompletedCount.textContent = String(completed);
  if (bloomSummaryCount) bloomSummaryCount.textContent = String(completed);
  if (!taskSummaryStatus) return;
  if (total === 0) taskSummaryStatus.textContent = "頁面空白，也是一個可以從容開始的位置。";
  else if (completed === total) taskSummaryStatus.textContent = "清單上的任務都完成了，讓今天停在一個完整的位置。";
  else taskSummaryStatus.textContent = `目前完成 ${completed} / 清單任務 ${total}`;
}

function renderDailyReward() {
  const completed = rewardView.completedCount;
  if (dailyCompletedCount) dailyCompletedCount.textContent = String(completed);
  if (dailyProgressBar) dailyProgressBar.style.width = `${Math.min(100, (completed / DAILY_GOAL) * 100)}%`;
  if (pendingSeedCredits) pendingSeedCredits.textContent = String(rewardView.pendingSeedCredits);
  if (taskLimitMessage) {
    taskLimitMessage.textContent = rewardView.goalReached ? "今日 4 / 4 · 已獲得種子信" : `今日完成 ${completed} / ${DAILY_GOAL}`;
    taskLimitMessage.classList.toggle("goal-reached", rewardView.goalReached);
  }
  if (dailyRewardMessage) {
    dailyRewardMessage.textContent = rewardView.goalReached
      ? "今天的四件事已完成。你的種子信正在等待選擇。"
      : `再完成 ${DAILY_GOAL - completed} 項不同任務，就能收到一封選種邀請。`;
  }
  if (openSeedOfferButton) {
    openSeedOfferButton.hidden = !rewardView.activeOffer;
  }
}

function renderSeedChoices(view) {
  if (!seedChoices) {
    return;
  }
  if (seedFeedback) seedFeedback.textContent = "";
  const candidates = view.activeOffer?.candidates || [];
  const isFinalOffer = Boolean(view.activeOffer?.isFinalOffer)
    || (candidates.length === 1 && candidates[0]?.finalUnlockOnly === true);
  if (seedDialogTitle) {
    seedDialogTitle.textContent = isFinalOffer ? "最後一封種子信" : "三顆種子，你想帶走哪一顆？";
  }
  seedChoices.classList.toggle("is-final", isFinalOffer);
  seedChoices.replaceChildren(...candidates.map((species, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `seed-choice${isFinalOffer ? " is-final" : ""}`;
    button.dataset.speciesId = species.id;
    button.innerHTML = `
      <span class="seed-choice__number">${isFinalOffer ? "FINAL SEED" : `SEED ${String(index + 1).padStart(2, "0")}`}</span>
      <span class="seed-choice__seed" aria-hidden="true"></span>
      <span><h3>${isFinalOffer ? "最後的種子" : `${species.colorHint}的花`}</h3><p>花語提示：${species.meaning}</p></span>`;
    return button;
  }));
}

function createTaskItem(task) {
  const item = document.createElement("li");
  item.dataset.taskId = task.id;
  item.draggable = true;

  const handle = document.createElement("span");
  handle.className = "task-drag-handle";
  handle.textContent = "⋮⋮";
  handle.setAttribute("aria-hidden", "true");

  const checkInput = document.createElement("input");
  checkInput.type = "checkbox";
  checkInput.className = "task-check-input";
  checkInput.checked = task.completed;
  checkInput.setAttribute("aria-label", `完成任務：${task.text}`);

  const miniPlant = document.createElement("img");
  miniPlant.className = "task-mini-plant";
  miniPlant.alt = "";
  miniPlant.loading = "lazy";
  miniPlant.src = getPlantStageImage(task.completed ? "bloom" : "sprout", task.plant?.type);

  const text = document.createElement("span");
  text.className = "task-text";
  text.textContent = task.text;
  text.classList.toggle("completed", task.completed);

  const status = document.createElement("span");
  status.className = "task-status";
  status.textContent = task.completed ? "已盛開" : "成長中";

  const actions = document.createElement("div");
  actions.className = "task-actions";
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "task-actions__toggle";
  toggle.textContent = "•••";
  toggle.setAttribute("aria-label", `開啟任務操作：${task.text}`);
  toggle.setAttribute("aria-expanded", "false");
  const menu = document.createElement("div");
  menu.className = "task-actions__menu";
  menu.hidden = true;
  const deleteButton = document.createElement("button");
  deleteButton.className = "task-delete delete-btn";
  deleteButton.type = "button";
  deleteButton.textContent = "刪除任務";
  deleteButton.setAttribute("aria-label", `刪除任務：${task.text}`);
  menu.appendChild(deleteButton);
  actions.append(toggle, menu);

  item.append(handle, checkInput, miniPlant, text, status, actions);
  return item;
}

function closeTaskMenus(except = null) {
  taskList?.querySelectorAll(".task-actions__menu").forEach((menu) => {
    if (menu !== except) {
      menu.hidden = true;
      menu.parentElement?.querySelector(".task-actions__toggle")?.setAttribute("aria-expanded", "false");
    }
  });
}

function migrateTodayCompletions(items) {
  const today = toLocalDateKey(new Date());
  items.forEach((task) => {
    if (task.completed && task.completedAt && toLocalDateKey(new Date(task.completedAt)) === today) {
      recordTaskCompletion(task.id, task.completedAt);
    }
  });
  return getDailyRewardView(items);
}

function emitTaskStateUpdated() {
  window.dispatchEvent(new CustomEvent("tasks:updated", { detail: { tasks: [...tasks] } }));
}

function clearDragOverStyles() {
  taskList?.querySelectorAll(".drag-over").forEach((item) => item.classList.remove("drag-over"));
}

function syncTaskOrderFromDOM() {
  if (!taskList) return;
  const taskById = new Map(tasks.map((task) => [task.id, task]));
  tasks = Array.from(taskList.querySelectorAll("li[data-task-id]"))
    .map((item) => taskById.get(item.dataset.taskId))
    .filter(Boolean)
    .map((task, index) => ({ ...task, order: index }));
}

function getDragAfterElement(container, y) {
  return Array.from(container.querySelectorAll("li[data-task-id]:not(.dragging)")).reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      return offset < 0 && offset > closest.offset ? { offset, element: child } : closest;
    },
    { offset: Number.NEGATIVE_INFINITY, element: null },
  ).element;
}

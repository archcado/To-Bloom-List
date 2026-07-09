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

addBtn.addEventListener("click", addTask);

input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    addTask();
  }
});

loadTasks();
updateProgress();
updateTaskLimit();

/* =========================
   點擊事件（完成 / 刪除）
========================= */
taskList.addEventListener("click", function (e) {
  const li = e.target.closest("li");
  if (!li) return;

  if (e.target.classList.contains("delete-btn")) {
    li.remove();
    saveTasks();
    updateProgress();
    updateTaskLimit();
    return;
  }

  if (
    e.target.classList.contains("task-check") ||
    e.target.classList.contains("task-text")
  ) {
    const span = li.querySelector(".task-text");
    const check = li.querySelector(".task-check");

    span.classList.toggle("completed");
    check.classList.toggle("checked");

    check.textContent = check.classList.contains("checked") ? "✓" : "";

    saveTasks();
    updateProgress();
  }
});

/* =========================
   新增任務（已改為不限制）
========================= */
function addTask() {
  const taskText = input.value.trim();
  const totalTasks = document.querySelectorAll("#taskList li").length;

  if (taskText === "") return;

  // 改為「提醒」而不是限制
  if (totalTasks >= 4) {
    taskLimitMessage.textContent = "任務偏多，建議控制在 4 個以維持專注";
  }

  const li = document.createElement("li");
  li.setAttribute("draggable", true);

  const leftBox = document.createElement("div");
  leftBox.className = "task-left";

  const checkBox = document.createElement("div");
  checkBox.className = "task-check";

  const span = document.createElement("span");
  span.className = "task-text";
  span.textContent = taskText;

  const button = document.createElement("button");
  button.className = "task-delete delete-btn";
  button.textContent = "✕";

  leftBox.appendChild(checkBox);
  leftBox.appendChild(span);
  li.appendChild(leftBox);
  li.appendChild(button);

  taskList.appendChild(li);

  input.value = "";
  saveTasks();
  updateProgress();
  updateTaskLimit();
}

/* =========================
   儲存 / 載入
========================= */
function saveTasks() {
  const tasks = [];

  document.querySelectorAll("#taskList li").forEach((li) => {
    const textElement = li.querySelector(".task-text");
    const text = textElement.textContent;
    const completed = textElement.classList.contains("completed");

    tasks.push({ text, completed });
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.setAttribute("draggable", true);

    const leftBox = document.createElement("div");
    leftBox.className = "task-left";

    const checkBox = document.createElement("div");
    checkBox.className = "task-check";

    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = task.text;

    if (task.completed) {
      span.classList.add("completed");
      checkBox.classList.add("checked");
      checkBox.textContent = "✓";
    }

    const button = document.createElement("button");
    button.className = "task-delete delete-btn";
    button.textContent = "✕";

    leftBox.appendChild(checkBox);
    leftBox.appendChild(span);
    li.appendChild(leftBox);
    li.appendChild(button);

    taskList.appendChild(li);
  });
}

/* =========================
   ⭐ 核心修正：動態進度
========================= */
function updateProgress() {
  const done = document.querySelectorAll("#taskList .completed").length;
  const total = document.querySelectorAll("#taskList li").length;

  if (total === 0) {
    progressText.textContent = "進度：0 / 0";
    progressPercent.textContent = "0%";
    progressBar.style.width = "0%";
    return;
  }

  progressText.textContent = `進度：${done} / ${total}`;

  const percent = Math.round((done / total) * 100);
  progressPercent.textContent = `${percent}%`;
  progressBar.style.width = percent + "%";

  rosePlant.classList.remove(
    "rose-stage-1",
    "rose-stage-2",
    "rose-stage-3",
    "rose-stage-4",
    "rose-stage-5",
  );

  if (percent === 0) {
    plantStage.textContent = "種子";
    stageMessage.textContent = "等待開始生長。";
    rosePlant.classList.add("rose-stage-1");
  } else if (percent <= 25) {
    plantStage.textContent = "發芽";
    stageMessage.textContent = "枝葉已開始舒展。";
    rosePlant.classList.add("rose-stage-2");
  } else if (percent <= 50) {
    plantStage.textContent = "葉子";
    stageMessage.textContent = "花苞正慢慢飽滿。";
    rosePlant.classList.add("rose-stage-3");
  } else if (percent <= 75) {
    plantStage.textContent = "花蕾";
    stageMessage.textContent = "距離綻放，只差最後幾步。";
    rosePlant.classList.add("rose-stage-4");
  } else {
    plantStage.textContent = "綻放";
    stageMessage.textContent = "今天，已經完整盛開。";
    rosePlant.classList.add("rose-stage-5");
  }

  updateStageCards(percent);
}

/* =========================
   Stage Cards
========================= */
function updateStageCards(percent) {
  const cards = document.querySelectorAll(".stage-card");
  cards.forEach((card) => card.classList.remove("active"));

  let activeIndex = 0;

  if (percent === 0) activeIndex = 0;
  else if (percent <= 25) activeIndex = 1;
  else if (percent <= 50) activeIndex = 2;
  else if (percent <= 75) activeIndex = 3;
  else activeIndex = 4;

  if (cards[activeIndex]) {
    cards[activeIndex].classList.add("active");
  }
}

/* =========================
   任務數提示（已改）
========================= */
function updateTaskLimit() {
  const totalTasks = document.querySelectorAll("#taskList li").length;

  if (totalTasks <= 4) {
    taskLimitMessage.textContent = `理想任務數：${totalTasks} / 4`;
    input.disabled = false;
    addBtn.disabled = false;
  } else {
    taskLimitMessage.textContent = `任務偏多（${totalTasks}），建議精簡`;
    input.disabled = false;
    addBtn.disabled = false;
  }
}

/* =========================
   拖曳排序
========================= */
let draggedItem = null;

taskList.addEventListener("dragstart", function (e) {
  const li = e.target.closest("li");
  if (!li) return;

  draggedItem = li;
  li.classList.add("dragging");
});

taskList.addEventListener("dragend", function (e) {
  const li = e.target.closest("li");
  if (!li) return;

  li.classList.remove("dragging");

  document.querySelectorAll("#taskList li").forEach((li) => {
    li.classList.remove("drag-over");
  });

  saveTasks();
});

taskList.addEventListener("dragover", function (e) {
  e.preventDefault();

  const afterElement = getDragAfterElement(taskList, e.clientY);
  const dragging = document.querySelector(".dragging");

  document.querySelectorAll("#taskList li").forEach((li) => {
    li.classList.remove("drag-over");
  });

  if (afterElement) {
    afterElement.classList.add("drag-over");
  }

  if (!dragging) return;

  if (afterElement == null) {
    taskList.appendChild(dragging);
  } else {
    taskList.insertBefore(dragging, afterElement);
  }
});

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll("li:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY },
  ).element;
}

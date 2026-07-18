export const PLANT_ASSETS = Object.freeze({
  daisy: createPlantAssetSet("daisy"),
  lily: createPlantAssetSet("lily"),
});

const GROWTH_TIMINGS = Object.freeze({
  bud: 220,
  opening: 620,
  bloom: 1100,
});

const growthTimers = new Map();
let keyboardScrollBound = false;
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

export function getPlantStageImage(stage, plantType = "daisy") {
  const assetSet = PLANT_ASSETS[plantType] || PLANT_ASSETS.daisy;
  return assetSet.stages[stage] || assetSet.stages.sprout;
}

export function preloadTaskGardenImages() {
  Object.values(PLANT_ASSETS).forEach((assetSet) => {
    Object.values(assetSet.stages).forEach((imageUrl) => {
      const image = new Image();
      image.src = imageUrl;
    });
  });
}

export function renderTaskGarden(tasks, options = {}) {
  const garden = document.getElementById("taskGarden");
  const bloomCount = document.getElementById("bloomCount");
  const emptyState = document.getElementById("taskGardenEmpty");
  const completionAnnouncer = document.getElementById("taskCompletionAnnouncer");

  if (!garden) {
    return;
  }

  bindKeyboardScroll();

  const taskList = Array.isArray(tasks) ? [...tasks].sort((a, b) => a.order - b.order) : [];
  const taskIdSet = new Set(taskList.map((task) => task.id));
  pruneStaleTimers(taskIdSet);

  const completedCount = taskList.filter((task) => task.completed).length;
  if (bloomCount) {
    bloomCount.textContent = String(completedCount);
  }
  if (emptyState) {
    emptyState.hidden = taskList.length > 0;
  }

  const existingPlants = new Map(
    Array.from(garden.querySelectorAll(".task-plant")).map((item) => [item.dataset.taskId, item]),
  );

  taskList.forEach((task) => {
    const plant = existingPlants.get(task.id) || createTaskPlant(task);
    updateTaskPlant(plant, task);
    garden.appendChild(plant);
    existingPlants.delete(task.id);

    const shouldAnimate =
      options.animateTaskId === task.id && task.completed && !reducedMotionQuery.matches;

    if (shouldAnimate) {
      playGrowthAnimation(task.id);
      return;
    }

    if (growthTimers.has(task.id) && task.completed) {
      return;
    }

    clearGrowthTimers(task.id);
    applyPlantStage(task.id, task.completed ? "bloom" : "sprout");
  });

  existingPlants.forEach((plant, taskId) => {
    if (taskId) {
      clearGrowthTimers(taskId);
    }
    plant.remove();
  });

  if (completionAnnouncer) {
    completionAnnouncer.textContent = options.completionMessage || "";
  }
}

export function clearAllTaskGardenTimers() {
  Array.from(growthTimers.keys()).forEach((taskId) => clearGrowthTimers(taskId));
}

function createPlantAssetSet(plantType) {
  return Object.freeze({
    stages: Object.freeze({
      sprout: new URL(
        `../../assets/images/plant-stages/${plantType}-stage-1-sprout.webp`,
        import.meta.url,
      ).href,
      bud: new URL(
        `../../assets/images/plant-stages/${plantType}-stage-2-bud.webp`,
        import.meta.url,
      ).href,
      opening: new URL(
        `../../assets/images/plant-stages/${plantType}-stage-3-opening.webp`,
        import.meta.url,
      ).href,
      bloom: new URL(
        `../../assets/images/plant-stages/${plantType}-stage-4-bloom.webp`,
        import.meta.url,
      ).href,
    }),
  });
}

function createTaskPlant(task) {
  const article = document.createElement("article");
  article.className = "task-plant";
  article.dataset.taskId = task.id;
  article.tabIndex = 0;

  const visual = document.createElement("div");
  visual.className = "task-plant-visual";

  const image = document.createElement("img");
  image.className = "task-plant-image";
  image.alt = "";
  image.loading = "lazy";
  image.decoding = "async";
  image.addEventListener("load", () => article.classList.remove("task-plant-image-error"));
  image.addEventListener("error", () => article.classList.add("task-plant-image-error"));
  visual.appendChild(image);

  const title = document.createElement("p");
  title.className = "task-plant-title";

  const status = document.createElement("span");
  status.className = "task-plant-status";

  article.append(visual, title, status);
  article.addEventListener("click", () => focusRelatedTask(task.id));
  article.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      focusRelatedTask(task.id);
    }
  });

  return article;
}

function updateTaskPlant(plant, task) {
  const plantType = PLANT_ASSETS[task.plant?.type] ? task.plant.type : "daisy";
  plant.dataset.taskId = task.id;
  plant.dataset.plantType = plantType;
  plant.dataset.variant = String(task.plant?.variant ?? 0);
  plant.setAttribute(
    "aria-label",
    `任務植物：${task.text}，${task.completed ? "已盛開" : "成長中"}`,
  );

  const title = plant.querySelector(".task-plant-title");
  if (title) {
    title.textContent = task.text;
  }

  const status = plant.querySelector(".task-plant-status");
  if (status && !growthTimers.has(task.id)) {
    status.textContent = task.completed ? "已盛開" : "成長中";
  }
}

function playGrowthAnimation(taskId) {
  clearGrowthTimers(taskId);
  applyPlantStage(taskId, "sprout");
  scheduleGrowthStage(taskId, "bud", GROWTH_TIMINGS.bud);
  scheduleGrowthStage(taskId, "opening", GROWTH_TIMINGS.opening);
  scheduleGrowthStage(taskId, "bloom", GROWTH_TIMINGS.bloom);
}

function scheduleGrowthStage(taskId, stage, delay) {
  const timerId = window.setTimeout(() => {
    applyPlantStage(taskId, stage);
    if (stage === "bloom") {
      clearGrowthTimers(taskId);
    }
  }, delay);

  const timerList = growthTimers.get(taskId) || [];
  timerList.push(timerId);
  growthTimers.set(taskId, timerList);
}

function applyPlantStage(taskId, stage) {
  const plant = findTaskPlant(taskId);
  if (!plant) {
    clearGrowthTimers(taskId);
    return;
  }

  plant.dataset.stage = stage;
  const image = plant.querySelector(".task-plant-image");
  if (image) {
    image.src = getPlantStageImage(stage, plant.dataset.plantType);
  }

  const status = plant.querySelector(".task-plant-status");
  if (status) {
    status.textContent = stage === "bloom" ? "已盛開" : "成長中";
  }
}

function findTaskPlant(taskId) {
  return Array.from(document.querySelectorAll(".task-plant")).find(
    (plant) => plant.dataset.taskId === taskId,
  );
}

function clearGrowthTimers(taskId) {
  const timerList = growthTimers.get(taskId);
  if (!timerList) {
    return;
  }
  timerList.forEach((timerId) => clearTimeout(timerId));
  growthTimers.delete(taskId);
}

function pruneStaleTimers(taskIds) {
  Array.from(growthTimers.keys()).forEach((taskId) => {
    if (!taskIds.has(taskId)) {
      clearGrowthTimers(taskId);
    }
  });
}

function bindKeyboardScroll() {
  if (keyboardScrollBound) {
    return;
  }

  const viewport = document.querySelector(".garden-viewport");
  if (!viewport) {
    return;
  }

  viewport.addEventListener("keydown", (event) => {
    const behavior = reducedMotionQuery.matches ? "auto" : "smooth";
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      viewport.scrollBy({ left: event.key === "ArrowRight" ? 160 : -160, behavior });
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      viewport.scrollTo({ left: event.key === "Home" ? 0 : viewport.scrollWidth, behavior });
    }
  });

  keyboardScrollBound = true;
}

function focusRelatedTask(taskId) {
  const taskItem = Array.from(document.querySelectorAll("li[data-task-id]")).find(
    (item) => item.dataset.taskId === taskId,
  );
  const checkbox = taskItem?.querySelector(".task-check-input");
  if (checkbox instanceof HTMLElement) {
    checkbox.focus();
  } else if (taskItem instanceof HTMLElement) {
    taskItem.focus();
  }
}

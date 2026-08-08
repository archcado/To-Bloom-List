import { loadTasksFromStorage } from "../task-storage.js";
import { getPlantStageImage } from "../components/task-garden.js";
import { collectionRepository } from "../repositories/collection-repository.js";
import { PLANT_SPECIES_BY_ID } from "../data/plant-species.js";

const growingList = document.getElementById("growingPlantsList");
const bloomList = document.getElementById("bloomPlantsList");
const totalPlantsCount = document.getElementById("totalPlantsCount");
const totalBloomsCount = document.getElementById("totalBloomsCount");
const growingPlantsCount = document.getElementById("growingPlantsCount");
const bloomPlantsCount = document.getElementById("bloomPlantsCount");
const collectionCount = document.getElementById("collectionCount");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

function renderPlantsPage() {
  if (!growingList || !bloomList) {
    return;
  }

  const tasks = loadTasksFromStorage();
  collectionRepository.ensureUnlocked(tasks.map((task) => task.plant?.type));
  const growing = tasks.filter((task) => !task.completed);
  const bloomed = tasks.filter((task) => task.completed);

  if (totalPlantsCount) {
    totalPlantsCount.textContent = String(tasks.length);
  }
  if (totalBloomsCount) {
    totalBloomsCount.textContent = String(bloomed.length);
  }
  if (growingPlantsCount) {
    growingPlantsCount.textContent = `${growing.length} 株`;
  }
  if (bloomPlantsCount) {
    bloomPlantsCount.textContent = `${bloomed.length} 株`;
  }
  if (collectionCount) {
    collectionCount.textContent = String(collectionRepository.getUnlockedIds().length);
  }

  renderPlantGroup(growingList, growing, false, "目前沒有成長中的任務植物。");
  renderPlantGroup(bloomList, bloomed, true, "目前尚未有盛開花朵。");
}

function renderPlantGroup(list, tasks, completed, emptyMessage) {
  list.innerHTML = "";
  list.classList.toggle("is-empty", tasks.length === 0);

  if (tasks.length === 0) {
    list.appendChild(createEmptyText(emptyMessage));
    return;
  }

  tasks.forEach((task) => list.appendChild(createPlantItem(task, completed)));
}

function createPlantItem(task, completed) {
  const item = document.createElement("li");
  item.className = "plants-task-item";
  item.dataset.plantType = task.plant?.type || "daisy";

  const image = document.createElement("img");
  image.className = "plants-task-image";
  image.src = getPlantStageImage(completed ? "bloom" : "sprout", task.plant?.type);
  image.alt = "";
  image.loading = "lazy";

  const textWrap = document.createElement("div");
  textWrap.className = "plants-task-text";

  const title = document.createElement("p");
  title.className = "plants-task-title";
  title.textContent = task.text;

  const status = document.createElement("span");
  status.className = "plants-task-status";
  const plantName = PLANT_SPECIES_BY_ID.get(task.plant?.type)?.name || "植物";
  status.textContent = `${plantName} · ${completed ? "已盛開" : "成長中"}`;

  textWrap.appendChild(title);
  textWrap.appendChild(status);
  item.appendChild(image);
  item.appendChild(textWrap);

  return item;
}

function createEmptyText(message) {
  const item = document.createElement("li");
  item.className = "plants-empty";
  item.textContent = message;
  return item;
}

document.querySelectorAll(".plants-bed-viewport").forEach((viewport) => {
  viewport.addEventListener("keydown", (event) => {
    const behavior = reducedMotionQuery.matches ? "auto" : "smooth";
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      viewport.scrollBy({ left: event.key === "ArrowRight" ? 200 : -200, behavior });
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      viewport.scrollTo({ left: event.key === "Home" ? 0 : viewport.scrollWidth, behavior });
    }
  });
});

renderPlantsPage();

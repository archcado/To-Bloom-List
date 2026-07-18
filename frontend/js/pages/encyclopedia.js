import { PLANT_SPECIES } from "../data/plant-species.js";
import { collectionRepository } from "../repositories/collection-repository.js";
import { taskRepository } from "../repositories/task-repository.js";

const grid = document.getElementById("speciesGrid");
const count = document.getElementById("collectionCount");
const dialog = document.getElementById("speciesDialog");
const dialogContent = document.getElementById("speciesDialogContent");
const filterButtons = document.querySelectorAll("button[data-filter]");
let activeFilter = "all";

const tasks = taskRepository.getAll();
collectionRepository.ensureUnlocked(tasks.map((task) => task.plant?.type));

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter || "all";
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    render();
  });
});

grid?.addEventListener("click", (event) => {
  const card = event.target instanceof Element ? event.target.closest("button[data-species-id]") : null;
  const species = PLANT_SPECIES.find((item) => item.id === card?.dataset.speciesId);
  if (species) {
    openDetails(species, collectionRepository.getUnlockedIds().includes(species.id));
  }
});

window.addEventListener("collection:updated", render);
render();

function render() {
  if (!grid) return;
  const unlockedIds = new Set(collectionRepository.getUnlockedIds());
  const items = PLANT_SPECIES.filter((species) => {
    if (activeFilter === "unlocked") return unlockedIds.has(species.id);
    if (activeFilter === "locked") return !unlockedIds.has(species.id);
    return true;
  });
  grid.replaceChildren(...items.map((species) => createCard(species, unlockedIds.has(species.id))));
  if (count) count.textContent = String(unlockedIds.size);
}

function createCard(species, unlocked) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `species-postcard${unlocked ? "" : " is-locked"}`;
  button.dataset.speciesId = species.id;
  button.setAttribute("aria-label", unlocked ? `查看${species.name}資料` : `尚未解鎖的植物，第 ${species.displayOrder} 號`);
  button.innerHTML = `
    <span class="species-postcard__art" style="--species-bg:${species.background}">
      <span class="species-postcard__number">No. ${String(species.displayOrder).padStart(2, "0")}</span>
      ${createBotanicalMark(species)}
      ${unlocked ? "" : '<span class="species-postcard__lock">LOCKED</span>'}
    </span>
    <span class="species-postcard__body">
      <h3>${unlocked ? species.name : "尚未寄達"}</h3>
      <p class="species-postcard__latin">${unlocked ? species.scientificName : "Complete four tasks to discover"}</p>
      <p class="species-postcard__meaning">${unlocked ? species.meaning : `${species.colorHint} · 花語等待揭曉`}</p>
    </span>`;
  return button;
}

function openDetails(species, unlocked) {
  if (!(dialog instanceof HTMLDialogElement) || !dialogContent) return;
  dialogContent.innerHTML = unlocked
    ? `<article class="species-detail">
        <div class="species-detail__art" style="--species-bg:${species.background}">${createBotanicalMark(species)}</div>
        <div><p class="page-eyebrow">COLLECTED POSTCARD</p><h2 id="speciesDialogTitle">${species.name}</h2><p class="species-detail__latin">${species.scientificName}</p>
          <dl><div><dt>花色</dt><dd>${species.colorHint}</dd></div><div><dt>花語</dt><dd>${species.meaning}</dd></div><div><dt>圖鑑筆記</dt><dd>${species.description}</dd></div></dl>
        </div></article>`
    : `<article class="species-detail"><div class="species-detail__art" style="--species-bg:${species.background};filter:grayscale(.7);opacity:.55">${createBotanicalMark(species)}</div>
        <div><p class="page-eyebrow">LOCKED POSTCARD</p><h2 id="speciesDialogTitle">尚未寄達</h2><p class="species-detail__latin">A botanical surprise is waiting.</p>
        <dl><div><dt>花色提示</dt><dd>${species.colorHint}</dd></div><div><dt>解鎖方式</dt><dd>${species.finalUnlockOnly ? "收藏其餘 30 種植物後，完成最後一次每日目標。" : "在一天內完成四個不同任務，從種子信的三個選項中選中它。"}</dd></div></dl></div></article>`;
  dialog.showModal();
}

function createBotanicalMark(species) {
  const petalCount = Math.min(12, Math.max(5, species.petals));
  const petals = Array.from({ length: petalCount }, (_, index) => {
    const angle = (360 / petalCount) * index;
    return `<i class="botanical-mark__petal" style="transform:rotate(${angle}deg)"></i>`;
  }).join("");
  const tilt = ((hash(species.id) % 13) - 6) * 0.8;
  return `<span class="botanical-mark" style="--petal-color:${species.petal};--center-color:${species.center};--stem-tilt:${tilt}deg">
    <span class="botanical-mark__stem"></span><span class="botanical-mark__flower">${petals}<i class="botanical-mark__center"></i></span>
  </span>`;
}

function hash(value) {
  return [...value].reduce((total, character) => total + character.charCodeAt(0), 0);
}

import { taskRepository } from "../repositories/task-repository.js";

const createdCountElement = document.getElementById("calendarCreatedCount");
const completedCountElement = document.getElementById("calendarCompletedCount");
const pendingCountElement = document.getElementById("calendarPendingCount");
const monthLabelElement = document.getElementById("calendarMonthLabel");
const calendarGrid = document.getElementById("calendarGrid");
const previousButton = document.getElementById("previousMonth");
const nextButton = document.getElementById("nextMonth");

const tasks = taskRepository.getAll();
let visibleMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

previousButton?.addEventListener("click", () => {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
  renderCalendar();
});

nextButton?.addEventListener("click", () => {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
  renderCalendar();
});

renderCalendar();

function renderCalendar() {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  if (monthLabelElement) {
    monthLabelElement.textContent = new Intl.DateTimeFormat("zh-TW", { year: "numeric", month: "long" }).format(visibleMonth);
  }

  const createdThisMonth = tasks.filter((task) => isSameMonth(task.createdAt, year, month)).length;
  const completedThisMonth = tasks.filter((task) => isSameMonth(task.completedAt, year, month)).length;
  if (createdCountElement) createdCountElement.textContent = String(createdThisMonth);
  if (completedCountElement) completedCountElement.textContent = String(completedThisMonth);
  if (pendingCountElement) pendingCountElement.textContent = String(tasks.filter((task) => !task.completed).length);
  renderMonthGrid(year, month);
}

function renderMonthGrid(year, month) {
  if (!calendarGrid) return;
  const first = new Date(year, month, 1);
  const gridStart = new Date(year, month, 1 - first.getDay());
  const todayKey = dateKey(new Date());
  const cells = [];

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const key = dateKey(date);
    const events = tasks.filter((task) => dateKeyFromValue(task.dueDate || task.createdAt) === key);
    const cell = document.createElement("article");
    cell.className = "calendar-day";
    cell.classList.toggle("is-outside", date.getMonth() !== month);
    cell.classList.toggle("is-today", key === todayKey);
    cell.setAttribute("aria-label", `${date.getMonth() + 1} 月 ${date.getDate()} 日，${events.length} 項任務`);
    cell.innerHTML = `<span class="calendar-day__number">${date.getDate()}</span><div class="calendar-day__events"></div>`;
    const eventList = cell.querySelector(".calendar-day__events");
    events.slice(0, 3).forEach((task) => {
      const event = document.createElement("span");
      event.className = `calendar-day__event${task.completed ? " is-completed" : ""}`;
      event.textContent = task.text;
      event.title = task.text;
      eventList.appendChild(event);
    });
    cells.push(cell);
  }
  calendarGrid.replaceChildren(...cells);
}

function isSameMonth(value, year, month) {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getFullYear() === year && date.getMonth() === month;
}

function dateKeyFromValue(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : dateKey(date);
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

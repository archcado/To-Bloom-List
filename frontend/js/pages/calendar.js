import { loadTasksFromStorage } from "../task-storage.js";

const createdCountElement = document.getElementById("calendarCreatedCount");
const completedCountElement = document.getElementById("calendarCompletedCount");
const pendingCountElement = document.getElementById("calendarPendingCount");
const monthLabelElement = document.getElementById("calendarMonthLabel");

function renderCalendarSummary() {
  const tasks = loadTasksFromStorage();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const createdThisMonth = tasks.filter((task) => {
    const createdAt = new Date(task.createdAt);
    return createdAt.getFullYear() === currentYear && createdAt.getMonth() === currentMonth;
  }).length;

  const completedThisMonth = tasks.filter((task) => {
    if (!task.completedAt) {
      return false;
    }
    const completedAt = new Date(task.completedAt);
    return completedAt.getFullYear() === currentYear && completedAt.getMonth() === currentMonth;
  }).length;

  const pendingCount = tasks.filter((task) => !task.completed).length;

  if (monthLabelElement) {
    monthLabelElement.textContent = new Intl.DateTimeFormat("zh-TW", {
      year: "numeric",
      month: "long",
    }).format(now);
  }

  if (createdCountElement) {
    createdCountElement.textContent = String(createdThisMonth);
  }
  if (completedCountElement) {
    completedCountElement.textContent = String(completedThisMonth);
  }
  if (pendingCountElement) {
    pendingCountElement.textContent = String(pendingCount);
  }
}

renderCalendarSummary();
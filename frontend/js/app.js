import { loadSharedLayout } from "./components/layout-loader.js";
import { initSidebar } from "./components/sidebar.js";

const PAGE_TITLES = {
  dashboard: "今日總覽",
  tasks: "待辦事項",
  garden: "我的花園",
  encyclopedia: "植物圖鑑",
  calendar: "月曆",
};

document.addEventListener("DOMContentLoaded", async () => {
  await loadSharedLayout();
  setPageTitle();
  setTodayDate();
  setCurrentYear();
  setActiveNavItem();
  initSidebar();
});

function setPageTitle() {
  const pageKey = document.body.dataset.page || "";
  const title = PAGE_TITLES[pageKey] || "To Bloom List";
  const titleElement = document.querySelector("[data-page-title]");
  if (titleElement) {
    titleElement.textContent = title;
  }
}

function setTodayDate() {
  const today = new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).format(new Date());

  document.querySelectorAll("[data-current-date]").forEach((element) => {
    element.textContent = today;
  });
}

function setCurrentYear() {
  const year = String(new Date().getFullYear());
  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = year;
  });
}

function setActiveNavItem() {
  const pageKey = document.body.dataset.page;
  if (!pageKey) {
    return;
  }

  document.querySelectorAll("a[data-page-link]").forEach((link) => {
    const isActive = link.getAttribute("data-page-link") === pageKey;
    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
      return;
    }
    link.removeAttribute("aria-current");
  });
}

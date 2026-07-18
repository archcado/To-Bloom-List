const MOBILE_BREAKPOINT = 992;
let isInitialized = false;

export function initSidebar() {
  if (isInitialized) {
    return;
  }

  const toggleButton = document.getElementById("sidebarToggle");
  const sidebar = document.querySelector(".app-sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  if (!toggleButton || !sidebar || !overlay) {
    return;
  }

  const navLinks = sidebar.querySelectorAll("a[data-page-link]");

  const isMobileView = () => window.innerWidth < MOBILE_BREAKPOINT;

  const closeSidebar = () => {
    sidebar.classList.remove("is-open");
    overlay.hidden = true;
    document.body.classList.remove("sidebar-open");
    toggleButton.setAttribute("aria-expanded", "false");
  };

  const openSidebar = () => {
    if (!isMobileView()) {
      return;
    }

    sidebar.classList.add("is-open");
    overlay.hidden = false;
    document.body.classList.add("sidebar-open");
    toggleButton.setAttribute("aria-expanded", "true");
  };

  const toggleSidebar = () => {
    if (sidebar.classList.contains("is-open")) {
      closeSidebar();
      return;
    }
    openSidebar();
  };

  toggleButton.addEventListener("click", toggleSidebar);

  overlay.addEventListener("click", closeSidebar);

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (isMobileView()) {
        closeSidebar();
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeSidebar();
    }
  });

  window.addEventListener("resize", () => {
    if (!isMobileView()) {
      closeSidebar();
    }
  });

  closeSidebar();
  isInitialized = true;
}
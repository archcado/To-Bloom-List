let isInitialized = false;

export function initSidebar() {
  if (isInitialized) {
    return;
  }

  const toggleButton = document.getElementById("sidebarToggle");
  const sidebar = document.querySelector(".app-sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const closeButton = document.getElementById("sidebarClose");

  if (!toggleButton || !sidebar || !overlay) {
    return;
  }

  const navLinks = sidebar.querySelectorAll("a[data-page-link]");

  const closeSidebar = ({ restoreFocus = false } = {}) => {
    sidebar.classList.remove("is-open");
    sidebar.setAttribute("aria-hidden", "true");
    overlay.hidden = true;
    document.body.classList.remove("sidebar-open");
    toggleButton.setAttribute("aria-expanded", "false");
    if (restoreFocus) {
      toggleButton.focus();
    }
  };

  const openSidebar = () => {
    sidebar.classList.add("is-open");
    sidebar.setAttribute("aria-hidden", "false");
    overlay.hidden = false;
    document.body.classList.add("sidebar-open");
    toggleButton.setAttribute("aria-expanded", "true");
    closeButton?.focus();
  };

  toggleButton.addEventListener("click", () => {
    if (sidebar.classList.contains("is-open")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  closeButton?.addEventListener("click", () => closeSidebar({ restoreFocus: true }));
  overlay.addEventListener("click", () => closeSidebar({ restoreFocus: true }));
  navLinks.forEach((link) => link.addEventListener("click", closeSidebar));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sidebar.classList.contains("is-open")) {
      closeSidebar({ restoreFocus: true });
    }
  });

  closeSidebar();
  isInitialized = true;
}

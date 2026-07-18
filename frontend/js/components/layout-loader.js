const ROOT_URL = new URL("../../", import.meta.url);
const COMPONENTS_BASE_URL = new URL("components/", ROOT_URL);

const COMPONENT_CONFIG = [
  { mountId: "appHeader", fileName: "header.html", fallback: createHeaderFallback },
  { mountId: "appSidebar", fileName: "sidebar.html", fallback: createSidebarFallback },
  { mountId: "appFooter", fileName: "footer.html", fallback: createFooterFallback },
];

export async function loadSharedLayout() {
  const tasks = COMPONENT_CONFIG.map((config) => loadComponent(config));
  await Promise.all(tasks);
}

async function loadComponent(config) {
  const mount = document.getElementById(config.mountId);
  if (!mount) {
    return;
  }

  const componentUrl = new URL(config.fileName, COMPONENTS_BASE_URL);

  try {
    const response = await fetch(componentUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    mount.innerHTML = await response.text();
  } catch (error) {
    console.error(`[layout-loader] Failed to load ${config.fileName}`, error);
    mount.innerHTML = config.fallback();
  }
}

function createHeaderFallback() {
  return `
    <header class="app-header" role="banner">
      <div class="app-header__left">
        <button id="sidebarToggle" class="app-header__menu-btn" type="button" aria-label="開啟側邊導覽" aria-controls="appSidebarNav" aria-expanded="false">
          <span class="app-header__menu-line" aria-hidden="true"></span>
          <span class="app-header__menu-line" aria-hidden="true"></span>
          <span class="app-header__menu-line" aria-hidden="true"></span>
        </button>
        <h1 class="app-header__title" data-page-title>頁面</h1>
      </div>
      <div class="app-header__right">
        <p class="app-header__date">今天：<span data-current-date>--</span></p>
      </div>
    </header>
  `;
}

function createSidebarFallback() {
  return `
    <aside class="app-sidebar" aria-label="主要導覽">
      <div class="app-sidebar__brand">To Bloom List</div>
      <nav id="appSidebarNav" class="app-sidebar__nav" aria-label="網站功能導覽">
        <ul class="app-sidebar__list">
          <li><a data-page-link="dashboard" href="./dashboard.html">今日總覽</a></li>
          <li><a data-page-link="tasks" href="./tasks.html">待辦事項</a></li>
          <li><a data-page-link="plants" href="./plants.html">我的植物</a></li>
          <li><a data-page-link="calendar" href="./calendar.html">月曆</a></li>
        </ul>
      </nav>
    </aside>
  `;
}

function createFooterFallback() {
  return `
    <footer class="app-footer" role="contentinfo">
      <p class="app-footer__name">To Bloom List</p>
      <p class="app-footer__meta"><span data-current-year>----</span>，以日常任務與植物成長視覺陪伴個人成長。</p>
    </footer>
  `;
}
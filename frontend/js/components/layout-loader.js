const ROOT_URL = new URL("../../", import.meta.url);
const COMPONENTS_BASE_URL = new URL("components/", ROOT_URL);

const COMPONENT_CONFIG = [
  { mountId: "appHeader", fileName: "header.html", fallback: createHeaderFallback },
  { mountId: "appSidebar", fileName: "sidebar.html", fallback: createSidebarFallback },
  { mountId: "appFooter", fileName: "footer.html", fallback: createFooterFallback },
];

export async function loadSharedLayout() {
  await Promise.all(COMPONENT_CONFIG.map((config) => loadComponent(config)));
}

async function loadComponent(config) {
  const mount = document.getElementById(config.mountId);
  if (!mount) {
    return;
  }

  try {
    const response = await fetch(new URL(config.fileName, COMPONENTS_BASE_URL));
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
      <div class="app-header__inner">
        <button id="sidebarToggle" class="app-header__menu-btn" type="button" aria-label="開啟導覽選單" aria-controls="appSidebarNav" aria-expanded="false">
          <span class="app-header__menu-line" aria-hidden="true"></span><span class="app-header__menu-line" aria-hidden="true"></span><span class="app-header__menu-line" aria-hidden="true"></span>
        </button>
        <a class="app-header__identity" href="./dashboard.html"><span><span class="app-header__brand">To Bloom List</span><span class="app-header__title" data-page-title>頁面</span></span></a>
        <div class="app-header__right"><p class="app-header__date"><span data-current-date>--</span></p></div>
      </div>
    </header>`;
}

function createSidebarFallback() {
  return `
    <aside class="app-sidebar" aria-label="主要導覽" aria-hidden="true">
      <header class="app-sidebar__header"><a class="app-sidebar__identity" href="./dashboard.html"><span>To Bloom List</span></a><button id="sidebarClose" class="app-sidebar__close" type="button" aria-label="關閉選單">×</button></header>
      <nav id="appSidebarNav" class="app-sidebar__nav" aria-label="網站功能導覽">
        <section class="app-sidebar__group"><p class="app-sidebar__label">清單</p><ul class="app-sidebar__list">
          <li><a data-page-link="dashboard" href="./dashboard.html"><span>01</span>今日總覽</a></li>
          <li><a data-page-link="tasks" href="./tasks.html"><span>02</span>待辦事項</a></li>
          <li><a data-page-link="calendar" href="./calendar.html"><span>03</span>月曆</a></li>
        </ul></section>
        <section class="app-sidebar__group"><p class="app-sidebar__label">花園</p><ul class="app-sidebar__list">
          <li><a data-page-link="garden" href="./plants.html"><span>04</span>我的花園</a></li>
          <li><a data-page-link="encyclopedia" href="./encyclopedia.html"><span>05</span>植物圖鑑</a></li>
        </ul></section>
      </nav>
    </aside>`;
}

function createFooterFallback() {
  return `
    <footer class="app-footer" role="contentinfo"><div class="app-footer__inner"><div><p class="app-footer__name">To Bloom List</p><p class="app-footer__tagline">讓每天完成的小事，慢慢長成一座花園。</p></div><p class="app-footer__meta"><span data-current-year>----</span> · v0.4.1 · Frontend Prototype · LocalStorage</p></div></footer>`;
}

# To Bloom List

To Bloom List 是一個把每日待辦轉成植物成長紀錄的任務花園。`0.4.1` 延續第二階段原型：晴空雛菊視覺、日記式任務清單、固定編號的 31 種植物圖鑑，以及「同日完成四項不同任務後，從三顆種子中選擇一株收藏」的本機獎勵流程。

目前任務、每日進度與收藏仍保存在瀏覽器 localStorage；Backend、PostgreSQL 與 n8n 已建立可驗證的整合邊界，但尚未取代本機資料。

## 目前版本

版本：`0.4.1-final-water-lily`
進度基準：2026-07-18

| 領域 | 狀態 | 目前成果 |
| --- | --- | --- |
| Frontend | Functional prototype | 任務 CRUD、日記清單、漢堡導覽、真正 Footer、花園、月曆日期格、固定 No.01–31 圖鑑、每日獎勵與三選一 |
| Backend | Integration foundation | Express、健康檢查、task automation event 驗證與受保護的 n8n 轉送端點 |
| Database | Schema draft | PostgreSQL 任務、收藏、每日獎勵、三種子候選、Calendar 對照與 automation outbox |
| Plant assets | In progress | 雛菊、百合各四階段，共 8 張 WebP；其餘 29 種先使用原創資料型明信片 |
| n8n | Importable draft | 提供 Task Webhook → Google Calendar create/update/delete workflow JSON，尚未綁定 credentials |
| Google Calendar | Contract ready | 已預留排程、時區、外部 Event ID 與同步狀態，尚未正式連線 |
| Authentication | Planned | 登入頁仍為展示模式 |

完整狀態請見 [docs/development-status.md](docs/development-status.md)。

## 第二階段核心規則

1. 以使用者本地日期計算每日進度。
2. 同一天完成四個不同任務，取得一次選種機會。
3. 每天最多取得一次；取消後再完成同一任務不會重複計數。
4. 三個候選排除已收藏植物，且一旦建立便保存，重新整理不會重抽。
5. 選中一株後，其餘候選回到植物池；未使用的選種機會可保留。
6. No.31 睡蓮不會進入一般三選一；收藏其餘 30 種後，它會以唯一的「最後一封種子信」出現。
7. localStorage 原型只提供產品體驗，正式多人版本仍需由 Backend transaction 和唯一索引防止竄改。

## 專案結構

```text
To-Bloom-List/
├─ frontend/                 Vanilla JavaScript 可操作原型
│  ├─ assets/icons/         原創品牌 SVG 與 favicon
│  ├─ assets/images/        現有四階段 WebP
│  ├─ components/           Header、Drawer、Footer
│  ├─ css/                  Design tokens、元件與頁面樣式
│  ├─ js/data/              31 種植物資料
│  ├─ js/repositories/      localStorage 資料存取邊界
│  ├─ js/services/          每日獎勵與選種規則
│  ├─ pages/                總覽、任務、月曆、花園、圖鑑、登入
│  └─ tests/                Repository 與獎勵規則測試
├─ backend/                  Express 整合骨架
├─ database/                 PostgreSQL schema 與 31 種 seed
├─ automation/n8n/           可匯入 workflow 草稿
├─ shared/                   跨層事件 JSON Schema
├─ docs/                     架構、API 與開發進度
└─ scripts/                  Frontend server 與靜態檢查
```

## 啟動 Frontend

需求：Node.js 18 以上。

Windows CMD 或 PowerShell：

```powershell
cd /d "C:\Users\你的帳號\Desktop\project\To-Bloom-List"
npm.cmd run dev:frontend
```

瀏覽 `http://localhost:5500/`。因為共用元件由 `fetch()` 載入，不可直接以 `file://` 開啟。

Frontend 測試：

```powershell
npm.cmd run test:frontend
```

## 啟動 Backend

```powershell
npm.cmd ci --prefix backend
npm.cmd --prefix backend test
npm.cmd run dev:backend
```

健康檢查：`GET http://localhost:3000/api/health`

Backend 預設不會把事件送到 n8n。必須依 [backend/.env.example](backend/.env.example) 設定 `AUTOMATION_API_KEY`、`N8N_TASK_WEBHOOK_URL` 與 `N8N_WEBHOOK_SECRET` 後才會啟用。

## n8n 與 Google Calendar

可匯入的草稿位於：

```text
automation/n8n/workflows/task-to-google-calendar.json
```

匯入後仍須手動完成：

1. 建立 Google Calendar OAuth credential。
2. 設定 `GOOGLE_CALENDAR_ID` 與 `N8N_WEBHOOK_SECRET`。
3. 檢查 Google Calendar 節點欄位映射。
4. 使用測試 Calendar 驗證 create、update、delete。
5. 確認 Event ID 能回寫 Backend，才能開啟可靠重試。

詳細步驟見 [automation/n8n/README.md](automation/n8n/README.md)。

## 已知限制

- 登入、PostgreSQL 與跨裝置同步尚未啟用。
- 任務介面尚未提供排程時間編輯欄位，因此 Calendar workflow 目前是整合契約，不是完整端到端功能。
- 圖鑑已有 31 種資料與收藏卡片，但只有雛菊、百合具備正式四階段 WebP。
- 新版清單移除萬壽菊、玉蘭花、牡丹／芍藥與荷花，加入桔梗、海芋、伯利恆之星與睡蓮；罌粟花資料亦已更新。
- localStorage 可以由使用者修改，不可視為正式防作弊機制。

## 文件索引

- [Frontend 開發狀態](frontend/README.md)
- [Backend 開發狀態](backend/README.md)
- [Database 開發狀態](database/README.md)
- [整體架構](docs/architecture.md)
- [API 契約](docs/api.md)
- [n8n 操作說明](automation/n8n/README.md)

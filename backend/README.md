# Backend

目前版本：`0.2.0-integration-foundation`
技術：Node.js、Express、REST
狀態：整合骨架；尚未接管 Frontend localStorage 任務

## 已完成

- Express 5 應用程式、JSON body、CORS 與 404 JSON 回應。
- `GET /api/health`。
- `POST /api/automation/task-events` 事件格式驗證。
- `AUTOMATION_API_KEY` 保護 Backend 事件入口。
- 由 Backend 以 `N8N_WEBHOOK_SECRET` 呼叫 n8n task webhook。
- 8 秒 upstream timeout 與 400／401／502／503 錯誤邊界。
- automation service 單元測試。

## API 狀態

| Method | Path | Status | 說明 |
| --- | --- | --- | --- |
| GET | `/api/health` | Implemented | Backend 健康檢查 |
| POST | `/api/automation/task-events` | Implemented foundation | 驗證並轉送 task event；未設定 credentials 時回傳 503 |
| CRUD | `/api/tasks` | Planned | 正式多人任務來源 |
| POST | `/api/daily-rewards/:id/select` | Planned | transaction 內選種與解鎖 |
| POST | `/api/internal/calendar-sync/result` | Planned | 接收 n8n Event ID 與同步結果 |

## 環境變數

複製 `.env.example` 為 `.env`，不要提交真實金鑰。

```text
PORT
FRONTEND_ORIGIN
DATABASE_URL
AUTOMATION_API_KEY
N8N_TASK_WEBHOOK_URL
N8N_WEBHOOK_SECRET
```

## 啟動與測試

```powershell
npm.cmd ci --prefix backend
npm.cmd --prefix backend test
npm.cmd run dev:backend
```

## 安全邊界

- Frontend 不得持有 n8n、Google 或 Database secrets。
- Backend 未設定三個 automation 變數時，端點保持停用並回傳 503。
- n8n 只編排 Google Calendar；任務與解鎖規則仍由 Backend／Database 決定。
- 目前 API key 是開發期 service boundary，不取代未來的使用者 Auth 與內部服務簽章。

## 尚未完成

- 使用者登入、任務所有權與 PostgreSQL Repository。
- 任務 CRUD、outbox worker 與可靠重試。
- 每日四任務 reward transaction。
- Google OAuth、Calendar connection 與同步結果回寫。
- LINE Messaging API 通知。

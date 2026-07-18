# Backend

目前版本：`0.1.0-foundation`  
技術方向：Node.js、Express、REST API  
狀態：Foundation，尚未接管 Frontend 任務資料

## 已完成

- Express 5 專案骨架。
- JSON request body 與指定 Frontend origin 的 CORS 設定。
- `GET /api/health` 健康檢查。
- routes、controllers、services、repositories、middleware 分層目錄。
- n8n integration 預留位置。
- `.env.example`，未包含真實憑證。
- Node 內建測試骨架。

## 尚未完成

- 使用者註冊、登入、JWT 或 Supabase Auth。
- PostgreSQL 連線與 migration runner。
- 任務 CRUD API。
- 植物解鎖交易與防重複領取。
- Google OAuth 與 Calendar connection。
- n8n Webhook 驗證、重試與結果回報。
- LINE Messaging API 通知。

## 預定模組

```text
src/
├─ routes/          HTTP 路由
├─ controllers/     request / response 轉換
├─ services/        任務、解鎖與同步規則
├─ repositories/    PostgreSQL 資料存取
├─ middleware/      驗證、錯誤與權限
├─ integrations/
│  └─ n8n/          自動化事件發送
├─ app.js
└─ server.js
```

## 啟動

```bash
npm install
cp .env.example .env
npm run dev
```

測試：

```bash
npm test
```

目前健康檢查回應範例：

```json
{
  "status": "ok",
  "service": "to-bloom-list-backend",
  "version": "0.1.0"
}
```

## 邊界原則

- Frontend 不直接持有資料庫、Google 或 n8n 的秘密金鑰。
- Backend 負責任務所有權、解鎖規則與資料交易。
- n8n 負責外部服務編排，不直接決定任務是否完成或解鎖哪株植物。
- Google Calendar Event ID 必須回寫 `task_calendar_links`，避免重複事件。


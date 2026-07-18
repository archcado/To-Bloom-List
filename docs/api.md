# API contract

| Method | Path | Status | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | Implemented | Backend health check |
| POST | `/api/automation/task-events` | Implemented foundation | 驗證事件並轉送 n8n；需要 `x-automation-key` |
| GET | `/api/tasks` | Planned | 讀取目前使用者任務 |
| POST | `/api/tasks` | Planned | 建立任務與 automation outbox |
| PATCH | `/api/tasks/:taskId` | Planned | 修改排程或完成狀態 |
| DELETE | `/api/tasks/:taskId` | Planned | 刪除任務並排入 Calendar delete |
| GET | `/api/daily-rewards/today` | Planned | 取得每日進度、credit 與固定候選 |
| POST | `/api/daily-rewards/:rewardId/select` | Planned | transaction 內選種並解鎖收藏 |
| POST | `/api/internal/calendar-sync/result` | Planned | 儲存 Google Event ID 與同步結果 |

## Implemented automation request

Header：

```text
x-automation-key: <AUTOMATION_API_KEY>
content-type: application/json
```

Body 遵循 `shared/schemas/task-automation-event.schema.json`。

回應：

- `202`：n8n 接受事件。
- `400`：事件格式錯誤。
- `401`：Backend automation key 錯誤。
- `502`：n8n upstream 失敗。
- `503`：整合尚未設定。

此端點是開發期整合邊界，不代表 Frontend 已經使用 Backend task API。

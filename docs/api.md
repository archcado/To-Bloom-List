# API draft

目前 Backend 只實作健康檢查；以下端點是下一階段契約草案。

| Method | Path | Status | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | Implemented | Backend health check |
| GET | `/api/tasks` | Planned | Read current user's tasks |
| POST | `/api/tasks` | Planned | Create a task and enqueue automation event |
| PATCH | `/api/tasks/:taskId` | Planned | Update task or completion state |
| DELETE | `/api/tasks/:taskId` | Planned | Delete task and enqueue calendar deletion |
| POST | `/api/integrations/google-calendar/connect` | Planned | Start Google Calendar connection |
| POST | `/api/internal/calendar-sync/result` | Planned | Receive n8n synchronization result |


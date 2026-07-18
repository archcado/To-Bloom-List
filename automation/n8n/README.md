# n8n workflows

此目錄預留存放從 n8n 匯出的 workflow JSON。目前尚未連接正式 n8n 執行環境。

第一條預定工作流程為：

```text
Backend task event webhook
→ validate payload
→ switch by task.created / task.updated / task.deleted
→ Google Calendar create / update / delete event
→ report external event ID and sync result to Backend
```

安全規則：

- Google OAuth 憑證只放在 n8n Credentials。
- Webhook secret 只放在環境變數，不進入 Git。
- Frontend 不直接持有 n8n Webhook secret。
- 以 `eventId` 與 `taskId` 防止重試時建立重複事件。


# n8n workflows

目前版本：`0.2.0-importable-draft`

## 已提供

`workflows/task-to-google-calendar.json` 是可匯入 n8n 的開發草稿：

```text
Task Webhook
→ signature 與 payload 檢查
→ task.created / updated / completed / deleted 分流
→ Google Calendar create / update / delete
→ Webhook JSON response
```

此 JSON 不包含 Google OAuth credential，也維持 `active: false`，匯入後不會自行上線。

## 啟用前設定

1. 在 n8n 匯入 workflow JSON。
2. 建立 Google Calendar OAuth2 credential。
3. 將三個 Google Calendar 節點綁定該 credential。
4. 在 n8n 設定 `GOOGLE_CALENDAR_ID`。
5. 在 n8n 與 Backend 設定相同的 `N8N_WEBHOOK_SECRET`。
6. 將 production webhook URL 寫入 Backend `N8N_TASK_WEBHOOK_URL`。
7. 使用獨立測試 Calendar 驗證事件建立、修改與刪除。
8. 確認 `googleEventId` 可以回寫 Backend 後，再考慮啟用正式同步。

## 目前限制

- Frontend 尚未提供任務開始／結束時間編輯，因此不能直接完成正式 Calendar 建立流程。
- update／delete 需要已有 `calendarEventId`；正式版本必須由 Database `task_calendar_links` 提供。
- workflow 目前回應 Event ID，但 Backend 尚未實作同步結果儲存。
- 尚未建立 retry、dead-letter、rate limit 與 Google Calendar 衝突處理。

## 安全規則

- Google OAuth credential 只放在 n8n Credentials。
- Webhook secret 只放環境變數。
- Frontend 不直接呼叫 n8n。
- 使用 `eventId` 做事件 idempotency，使用 `taskId ↔ googleEventId` 防止重複建立。
- n8n 不決定任務完成或植物解鎖。

## LINE 後續方向

Google Calendar 單向同步穩定後，再建立另一條獨立 workflow：

```text
Schedule Trigger
→ Backend 查詢即將到期且未完成任務
→ LINE Messaging API
→ 回寫通知結果
```

LINE token 同樣只能放在 n8n Credentials 或 Backend secret store。

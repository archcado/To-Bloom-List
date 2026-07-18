# Shared contracts

此目錄保存 Frontend、Backend 與 n8n 共用的資料契約，不放 UI 或業務流程。

`schemas/task-automation-event.schema.json` 定義：

- 唯一事件 ID 與 task ID。
- `task.created / updated / completed / deleted`。
- 排程、時區與 Calendar Event ID。
- `local / pending / synced / failed / conflict` 同步狀態。

Backend 0.2.0 已加入對應的輕量 runtime validator；正式上線前應改成由 JSON Schema 產生或共用同一套 validator，避免契約漂移。

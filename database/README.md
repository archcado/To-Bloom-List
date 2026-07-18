# Database

目前版本：`0.1.0-schema-draft`  
目標資料庫：PostgreSQL  
狀態：Draft，尚未部署、尚未被 Backend 使用

## 已設計資料表

| Table | Purpose | Status |
| --- | --- | --- |
| `users` | 使用者帳號基礎資料 | Draft |
| `tasks` | 任務、狀態、排序與排程時間 | Draft |
| `plant_species` | 植物物種、花語與圖片基礎路徑 | Draft |
| `user_collections` | 使用者解鎖與盛開次數 | Draft |
| `task_completion_events` | 完成紀錄與防重複事件 | Draft |
| `calendar_connections` | Google Calendar 連線對照 | Draft |
| `task_calendar_links` | 任務與 Google Event ID 對照 | Draft |
| `automation_events` | n8n 等外部整合的可靠事件佇列 | Draft |

## Seed 進度

`seeds/001_current_plant_species.sql` 只包含目前 Frontend 確實存在的兩種植物：

- 雛菊 `daisy`
- 百合 `lily`

其餘 29 種尚未確定物種、花語、解鎖順序與圖片，因此沒有補造 seed 資料。

## 執行草案

建立空白 PostgreSQL database 並設定 `DATABASE_URL` 後：

```bash
psql "$DATABASE_URL" -f database/schema.sql
psql "$DATABASE_URL" -f database/seeds/001_current_plant_species.sql
```

目前 `schema.sql` 是開發設計快照，不是已部署 migration。第一次正式部署前，應凍結為不可修改的 `001_initial_schema.sql`。

## 交易規則

未來完成任務與解鎖植物必須在同一個資料庫交易中：

1. 驗證任務屬於目前使用者。
2. 確認完成事件的 `event_key` 尚未處理。
3. 更新任務完成狀態。
4. 寫入 `task_completion_events`。
5. 新增或更新 `user_collections`。
6. 建立 `automation_events`，交由 n8n 同步 Calendar 或發送通知。
7. 一次提交；任一步失敗則整筆回滾。


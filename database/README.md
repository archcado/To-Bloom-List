# Database

目前版本：`0.2.1-plant-order-draft`
目標：PostgreSQL
狀態：設計草案；尚未部署、尚未被 Backend 使用

## 已設計資料表

| Table | 用途 | 狀態 |
| --- | --- | --- |
| `users` | 使用者帳號 | Draft |
| `tasks` | 任務、狀態、排序與 Calendar 排程 | Draft |
| `plant_species` | 31 種植物、固定顯示順序、最終解鎖標記、花語與素材狀態 | Draft |
| `user_collections` | 使用者植物收藏 | Draft |
| `task_completion_events` | 任務完成事件與 idempotency | Draft |
| `daily_goal_rewards` | 每位使用者每天最多一筆 4/4 獎勵 | New draft |
| `seed_offers` | 固定候選組、隨機種子與最終選擇 | New draft |
| `seed_offer_candidates` | 每封種子信最多三株候選 | New draft |
| `calendar_connections` | Google Calendar 連線 | Draft |
| `task_calendar_links` | Task ↔ Google Event ID | Draft |
| `automation_events` | n8n reliable event outbox | Draft |

## 植物 Seed

`seeds/001_current_plant_species.sql` 已建立 31 種植物資料。

- `display_order` 固定對應前端 No.01–31。
- No.31 為睡蓮；`final_unlock_only = true` 明確標記最終植物，不只依賴顯示排序。
- 雛菊與百合：`asset_status = ready`。
- 其餘 29 種：`asset_status = planned`，只有圖鑑資料，尚無四階段 WebP。
- Database 只保存素材路徑和狀態，不保存圖片 binary。

## 每日獎勵約束

- `UNIQUE (user_id, reward_date)` 保證每位使用者每天最多一筆獎勵。
- `UNIQUE (seed_offer_id, position)` 保證每封種子信最多三個不同位置。
- 候選在取得獎勵時寫入 `seed_offer_candidates`，重新載入不重新抽選。
- 一般候選查詢必須排除睡蓮；只有睡蓮是最後一種未收藏植物時，才建立單一候選 offer。
- 正式實作選種時，必須鎖定 reward／offer row，驗證候選、寫入收藏並標記 claimed，一次 transaction 提交。

## 執行草案

```bash
psql "$DATABASE_URL" -f database/schema.sql
psql "$DATABASE_URL" -f database/seeds/001_current_plant_species.sql
```

若已用舊版草案建立資料表，先執行 `database/migrations/002_plant_catalog_v041.sql`，再執行 seed。

目前 `schema.sql` 仍是可調整的開發快照。第一次正式部署前，應凍結為 `001_initial_schema.sql`；部署後只新增 migration，不回頭修改已執行版本。

## 尚未完成

- 實際 PostgreSQL instance 與 migration runner。
- Backend Repository 與 transaction integration test。
- Row-level ownership／權限政策。
- outbox worker、重試與失敗告警。

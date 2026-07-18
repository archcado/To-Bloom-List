# Migrations

目前尚未部署正式資料庫，因此 `../schema.sql` 仍是 0.4.1 開發快照，尚沒有宣稱已執行的 production migration。

`002_plant_catalog_v041.sql` 是供已建立舊草案資料表的本機開發環境使用：新增 `display_order`、`final_unlock_only` 並停用退役植物。它不是 production migration 紀錄；執行後仍須重跑目前的 plant seed。

第一次確定環境時：

1. 將當時的 `schema.sql` 凍結為 `001_initial_schema.sql`。
2. 記錄 checksum 與執行時間。
3. 後續只新增 `002_*.sql`，不修改已執行版本。
4. 在 CI 使用空白 PostgreSQL 驗證完整 migration chain。

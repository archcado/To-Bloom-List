# Migrations

目前尚未部署正式資料庫，因此還沒有不可變更的 production migration。

`../schema.sql` 是 0.3.0 階段的 PostgreSQL 設計草案。第一次確定部署環境後，應將它凍結為 `001_initial_schema.sql`；日後只新增 migration，不修改已執行版本。


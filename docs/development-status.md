# Development status

版本基準：2026-07-18，第二階段 `0.4.1`。

| Area | Status | Current result |
| --- | --- | --- |
| Brand system | Completed for prototype | 晴空雛菊配色、Design Token、原創 SVG 與 favicon |
| App navigation | Completed | 桌面／手機預設收合 Drawer、分組導覽、Escape／遮罩關閉 |
| Footer | Completed | 全寬、語意化、由 flex layout 推至頁面底部 |
| Task CRUD | Functional prototype | localStorage Repository、新增、完成、取消、刪除與排序 |
| Task journal | Completed for prototype | 單張日記紙、穩定任務列、三點操作選單 |
| Task garden | Completed for current assets | 雛菊／百合四階段動畫與晴空花圃 |
| Daily goal | Functional prototype | 四個不同任務、每日一次、重複完成不重複計數 |
| Seed choice | Functional prototype | 三候選固定保存、排除收藏；睡蓮只作為最後一株單獨出現 |
| Plant encyclopedia | Functional prototype | 固定 No.01–31、明信片、篩選、鎖定與詳細 Dialog |
| Plant assets | In progress | 8 張 WebP ready，另外 116 張 planned |
| Calendar page | Functional prototype | 真實任務月份摘要、日期格、月份切換 |
| Authentication | Planned | 登入頁只有前端展示 |
| Backend | Integration foundation | Express 0.2.0、事件驗證與受保護 n8n forwarding route |
| Database | Draft | 31 種 seed、display order、每日 reward／seed offer／Calendar schema |
| n8n | Importable draft | Task → Google Calendar workflow JSON，credentials 未設定 |
| Google Calendar | Contract ready | 任務欄位與 workflow 已預留，尚未端到端連線 |
| LINE | Planned | Calendar 同步穩定後再建立提醒 workflow |

## 下一階段優先順序

1. 任務排程日期、開始、結束與時區編輯 UI。
2. 啟動 PostgreSQL，凍結 initial migration。
3. 實作登入與 Backend task CRUD。
4. 將每日 4/4 與選種移至 Backend transaction。
5. 使用測試 Google Calendar 完成第一條 n8n 技術驗證。
6. 保存 `taskId ↔ googleEventId` 並加入 retry／idempotency。
7. 逐批補齊剩餘四階段植物素材。

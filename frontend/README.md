# Frontend

目前版本：`0.3.0-frontend-prototype`  
技術：HTML5、CSS3、Bootstrap 5、Vanilla JavaScript ES Module、WebP  
資料來源：localStorage

## 已完成

- 新增任務，支援按鈕與 Enter。
- 完成、取消完成與刪除任務。
- 以滑鼠或指標拖曳調整順序。
- 任務順序與花園順序同步。
- 每項任務分配獨立植物。
- 完成任務時播放 `sprout → bud → opening → bloom`。
- 取消完成後回到幼苗；刪除任務同步移除植物。
- Dashboard、待辦事項、我的植物、月曆摘要與展示登入頁。
- 共用 Header、Sidebar、Footer 動態載入。
- localStorage v2 與舊資料遷移。
- 基本響應式導覽與鍵盤操作支援。

## 現有植物素材

| 植物 | 階段數 | 狀態 |
| --- | ---: | --- |
| 雛菊 daisy | 4 | Completed |
| 百合 lily | 4 | Completed |
| 其餘 29 種 | 0 | Planned |

目前共有 8 張 WebP。31 種植物、圖鑑詳細頁、花語、解鎖條件與完整收藏進度尚未實作。

## localStorage v2

Key：

```text
to-bloom-list.tasks.v2
```

目前任務格式：

```json
{
  "id": "task-...",
  "text": "任務內容",
  "completed": false,
  "order": 0,
  "createdAt": "2026-07-18T00:00:00.000Z",
  "completedAt": null,
  "plant": {
    "type": "daisy",
    "variant": 0
  }
}
```

讀取順序為 `to-bloom-list.tasks.v2`、`to-bloom-list.tasks.v1`、`tasks`。舊資料經驗證後寫回 v2；植物種類由任務 ID 穩定產生。

## 尚未完成

- 正式帳號登入與權限。
- 任務排程開始、結束及提醒時間。
- 可互動的月曆日期格。
- Repository 介面與 API Repository。
- 31 種植物圖鑑、詳細頁與解鎖動畫。
- Google Calendar、n8n 與 LINE 串接。
- 跨裝置同步、離線同步衝突處理。

## 啟動

從專案根目錄執行：

```bash
npm run dev:frontend
```

或：

```bash
python -m http.server 5500 --directory frontend
```

瀏覽 `http://localhost:5500/`。不要直接以 `file://` 開啟。


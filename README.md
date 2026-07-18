# To Bloom List 🌸

To Bloom List 是一個小型的任務清單網頁。  
核心理念是：用植物成長視覺化每天任務進度，幫助使用者專注在可完成的步伐。

## 現有功能

- 新增任務（支援按鈕與 Enter）。
- 勾選任務完成 / 取消完成。
- 刪除單筆任務。
- 拖曳排序任務順序。
- 進度文字、百分比、進度條即時更新。
- 依完成比例顯示植物五階段（種子→發芽→葉子→花蕾→綻放）。
- 任務超過 4 項時顯示建議精簡提醒，但不限制新增。
- 任務、完成狀態、排序儲存在 localStorage，重新整理後保留。
- 相容舊版 `tasks` key，首次載入可遷移到新版 key。

## 技術組成

- HTML5
- CSS3 + Bootstrap 5
- Vanilla JavaScript（ES Module）

## 專案結構

```text
To-Bloom-List/
├─ index.html
├─ css/
│  └─ style.css
├─ js/
│  └─ script.js
└─ README.md
```

## 本機啟動方法

由於採用 `<script type="module">`，請透過本機 HTTP Server 啟動，不要直接用 `file://` 開啟。

範例（擇一）：

```bash
python -m http.server 5500
```

```bash
npx http-server -p 5500
```

啟動後開啟 `http://localhost:5500`。

## localStorage 資料說明

### 目前 key

- `to-bloom-list.tasks.v1`

### 任務資料格式

```json
{
  "id": "task-...",
  "text": "任務內容",
  "completed": false,
  "order": 0,
  "createdAt": "2026-07-18T00:00:00.000Z",
  "completedAt": null
}
```

### 舊版相容與遷移

- 舊版 key：`tasks`
- 新版 key 不存在時，會先讀取舊版資料。
- 會驗證、轉換為新版格式，並儲存到 `to-bloom-list.tasks.v1`。
- 若 localStorage 是錯誤 JSON，會忽略該資料並維持頁面可運作。

## 使用方式

1. 在輸入框輸入任務後按 Enter 或「+ 新增」。
2. 勾選核取方塊切換完成狀態。
3. 點擊刪除按鈕移除任務。
4. 以滑鼠拖曳任務調整順序。
5. 觀察進度與植物階段變化。

## 已知限制

- 目前只有單一清單，尚無多清單分類。
- 拖曳排序尚未提供純鍵盤排序操作。
- 資料僅存在瀏覽器 localStorage，不含跨裝置同步。

## 後續發展方向

- 任務篩選（全部 / 進行中 / 已完成）。
- 匯入/匯出 JSON。
- 強化觸控與鍵盤排序體驗。
- 可選主題與植物樣式。
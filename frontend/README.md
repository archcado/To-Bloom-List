# Frontend

目前版本：`0.4.1-final-water-lily`
技術：HTML5、CSS3、Vanilla JavaScript ES Module、WebP、localStorage

## 已完成

- 晴空藍、花瓣白、雛菊黃與奶油紙張 Design Token。
- 原創「清單最後一行長成雛菊」SVG 與 favicon。
- 桌面和手機皆預設收合的漢堡 Drawer，支援遮罩、Escape、焦點回復與捲動鎖定。
- `清單／花園` 分組導覽，以及真正位於頁面底部的全寬 Footer。
- 日記紙形式任務清單；任務列取消獨立浮動卡片，操作收進三點選單。
- 新增、完成、取消完成、刪除與拖曳排序。
- 雛菊、百合四階段植物動畫與我的花園。
- 固定 No.01–31 的植物資料、明信片圖鑑、鎖定／收藏篩選與詳細 Dialog。
- 同日四個不同任務取得一次選種機會。
- 三個候選固定保存、排除已收藏植物、選擇後寫入收藏。
- 睡蓮固定為 No.31，其他植物尚未收齊前不進入候選；最後以單一種子信解鎖。
- 舊收藏會自動移除已退役的植物 ID；失效或過早包含睡蓮的舊候選會自動重建。
- 真實任務資料月曆日期格與月份切換。
- Repository 邊界與舊 localStorage 任務遷移。

## localStorage

| Key | 用途 |
| --- | --- |
| `to-bloom-list.tasks.v2` | 任務、植物、排序與 Calendar 預留欄位 |
| `to-bloom-list.collection.v1` | 已收藏植物及解鎖來源 |
| `to-bloom-list.daily-progress.v1` | 每日不同任務、獎勵、固定候選與選擇歷史 |

任務讀取仍相容 `to-bloom-list.tasks.v1` 與舊 `tasks` key。載入後會正規化並寫回 v2。

Calendar 預留欄位：

```json
{
  "dueDate": null,
  "startAt": null,
  "endAt": null,
  "timeZone": "Asia/Taipei",
  "calendarEventId": null,
  "syncStatus": "local",
  "lastSyncedAt": null
}
```

## 植物素材狀態

| 類型 | 數量 | 狀態 |
| --- | ---: | --- |
| 圖鑑資料與原創程式化明信片 | 31 | Completed for prototype |
| 雛菊 WebP | 4 stages | Ready |
| 百合 WebP | 4 stages | Ready |
| 其餘植物正式 WebP | 116 expected | Planned |

程式化明信片是正式的資料層視覺，不會冒充尚未完成的四階段動畫。

## 測試

```powershell
npm.cmd run test:frontend
```

測試包含靜態路徑、舊任務／收藏遷移、每日獎勵防重複、固定候選、選種收藏及睡蓮最終解鎖。

## 尚未完成

- 正式登入與 API Repository。
- 任務排程時間編輯 UI。
- Google Calendar 實際連線與同步狀態回寫。
- 其餘 29 種植物四階段 WebP。
- Backend 權威式每日獎勵 transaction。

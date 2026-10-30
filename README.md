# 活動報名平台：A 組員模組

React + Vite / Node.js + Express / MySQL。
本包是課堂開發原始碼，完成 A 的新增活動與專案骨架。B、C 頁面只是明確標示的接入位置，沒有假裝實作活動列表或報名功能。

## 需要準備

- Node.js 22.9 以上（建議 24），npm。
- MySQL 8，或 Docker Desktop 的 Compose 功能。
- 三位組員先確認使用此技術組合與 schema，再開始接續開發。

## 啟動方式（Mac / Windows）

1. 解壓縮後用 VS Code 開啟 `activity-platform` 資料夾，開啟終端機。
2. 在專案根目錄執行：

```sh
npm ci
```

3. 選一種方式準備資料庫：

**方式一：Docker Desktop**

先啟動 Docker Desktop，再於根目錄執行：

```sh
docker compose up -d --wait
```

首次建立資料庫時會自動執行 `database/schema.sql`。既有 volume 不會再次自動匯入；更新 schema 時需手動執行 SQL。不要為了重跑 SQL 刪除已有資料的 volume。

**方式二：既有 MySQL**

用 MySQL Workbench 開啟並執行 `database/schema.sql`。在下一步 `.env` 內填寫你自己的帳號與密碼（需有該資料庫 INSERT 等必要權限）。

4. 複製 `server/.env.example` 成 `server/.env`。Docker 使用者可直接用範例值；已有 MySQL 的使用者調整連線設定。不要把 `.env` 提交到 GitHub。
5. 回到專案根目錄執行：

```sh
npm run dev
```

6. 開啟終端機顯示的 Vite 網址，預設 `http://localhost:5173`。
7. 輸入名稱、時間、說明後建立活動；成功訊息會顯示編號。

開發時前端將 `/api` 代理到 `127.0.0.1:3001`，不需要額外設定 CORS。若修改後端 port，也要同步修改 `client/vite.config.js`。

## 建置與單一服務執行

```sh
npm run build
npm start
```

完成建置後可由 `http://127.0.0.1:3001` 同時使用前端與 API。
本包預設只監聽本機，供課堂開發與展示；尚未提供管理者登入或對外部署設定。

## A 完成內容

- React 新增活動畫面、共用導覽列、手機版排版。
- 姓名以外的活動欄位：名稱必填、上限 100 字；活動時間必填；說明選填、上限 2000 字。
- 前後端均驗證；防止連點、顯示成功及失敗狀態。
- `POST /api/activities`，透過參數化 SQL 寫入真實 MySQL，不以 localStorage 假裝資料庫。
- API 與資料庫初始化骨架、`.env.example`、`.gitignore`、依賴鎖定檔。
- 未限制活動一定要在未來，因原始要求未指定；是否增加截止日、名額、重複報名限制由全組討論。

## API 契約

`POST /api/activities`

```json
{"title":"桌遊活動","description":"集合地點：學生活動中心","startsAt":"2026-11-10T10:00"}
```

名稱與說明會去除頭尾空白；時間以台灣 UTC+8 填寫，MySQL `starts_at` 儲存當地時間的 DATETIME。

201 成功：

```json
{"data":{"id":1,"title":"桌遊活動","description":"集合地點：學生活動中心","startsAt":"2026-11-10T10:00:00+08:00"}}
```

400：`{"error":"活動名稱必填，最多 100 字。"}`；413：資料過大；503：資料庫不可用。表單收到成功後才清空；失敗會保留輸入。輸入欄位不可含不符型別的資料。

## B / C 接入

| 負責人 | 建議檔案與工作 | 預留 API |
| --- | --- | --- |
| B | 將 main.jsx 的 list placeholder 換成自己的 React 元件；新增活動列表、報名表單 | GET /api/activities；POST /api/registrations |
| C | 將 registrations placeholder 換成自己的元件；提供報名名單 | GET /api/activities/:id/registrations |

三者可在 `server/src/app.js` 中 API 404 handler **之前**掛載各自 route。建議新建各自 routes / React 元件檔，減少同時改同一檔案。

`activities`: id / title / description / starts_at / created_at。
`registrations`: id / activity_id / name / phone / created_at；activity_id 是 activities.id 的外鍵。
電話使用 VARCHAR，保留開頭的 0。此版本未定義電話唯一性，避免未經討論就禁止家人共用電話。

## GitHub 協作

由一人建立 repository 並邀請另外兩人，A 以自己的帳號提交這些檔案。每人使用自己的分支，例如 `feature/create-activity`、`feature/registration`、`feature/registration-list`；透過 pull request 合併。不要替其他人製造 commit 紀錄。本包沒有建立或推送任何遠端 repository。

## 驗證

```sh
npm test
npm run build
```

API 測試使用注入的測試資料庫介面，涵蓋正確寫入參數、非法輸入、錯誤 JSON、資料庫故障；不代表真實 MySQL 已完成整合測試。

實際驗收請：新增活動後重整頁面，於 MySQL 執行：

```sql
SELECT id, title, description, starts_at FROM activity_platform.activities ORDER BY id DESC;
```

確認資料存在，再試空白名稱與非法日期。待 B、C 完成後共同驗收新增→列表→報名→名單。

## 本次驗證範圍

產製環境沒有 MySQL / Docker，因此未驗證真實資料庫連線與寫入；須依上述步驟在本機完成。未進行瀏覽器視覺驗收。不要在確認這兩項前宣稱整套平台已完成。

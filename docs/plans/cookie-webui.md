# 規劃：前端 Cookie 管理 WebUI

**狀態**：✅ 已實作完成  
**建立日期**：2026-06-20  
**完成日期**：2026-06-20  
**依賴後端**：docs/plans/ytdlp-cookie-api.md ✅

---

## 1. 目標

根據 AGENTS.md 「no over-engineering」原則：
- 不引入 toast 依賴套件（現存無 toast）
- 不抽出獨立 Toast 組件（只有一處需要）
- 在 `Search.vue` 內就地內聯簡易提示
- 提供設定入口，讓使用者上傳 YouTube / Bilibili cookies

## 2. UI 佈局

### 2.1 設定入口
- 在 Search.vue 的 `search-group` 區塊內加一個 **齒輪 icon** `btn-settings`
- 點擊後展開 `settings-panel`（滑入動畫，覆蓋在搜尋結果上方）
- Panel 內放置兩個上傳區塊（YouTube / Bilibili），各含檔案選擇 + 狀態
- 右上角 `btn-close-settings` 關閉

### 2.2 Settings Panel 結構
```
┌─────────────────────────────────┐
│  [x] 關閉                        │
├─────────────────────────────────┤
│ Cookie 設定                     │
│                                 │
│ YouTube  cookies.txt            │
│ [ 選擇檔案 ] [ 上傳 ]            │
│ 狀態：最近更新 3 天前 ● (綠色)   │
│                                 │
│ Bilibili  cookies.txt           │
│ [ 選擇檔案 ] [ 上傳 ]            │
│ 狀態：未設定 ● (灰色)            │
│                                 │
│ [ 關閉面板 ]                    │
└─────────────────────────────────┘
```

### 2.3 Toast 提示
- 固定在右下角的 `.toast-wrap` 容器
- 3 秒自動消失（或 5 秒）
- 錯誤樣式：紅底白字（沿用 `.btn-delete` 紅色 `#f53b3b`）
- 成功樣式：藍底白字（沿用 `.btn-search` 藍色 `#087bff`）

## 3. 觸發條件

### 3.1 Cookie 錯誤 toast
搜尋失敗時後端會回傳 `{ cookieNeed: ["youtube", ...] }`
→ 前端判斷：
```typescript
if (res.cookieNeed?.length) {
  showToast(`需要更新 ${res.cookieNeed.map(v => v === 'youtube' ? 'YouTube' : 'Bilibili').join('、')} 的 Cookie`, "error");
}
```

### 3.2 上傳成功 toast
```
showToast("Cookie 更新成功", "success");
```

## 4. 新增狀態（Search.vue `data()`）

```typescript
{
  // existing ...
  loadingFlag: false,
  searchText: "",
  songList: [],
  
  // new: cookie UI
  showSettings: false,
  cookieStatus: {
    youtube:  { exists: false, updatedAt: null },
    bilibili: { exists: false, updatedAt: null },
  },
  selectedFiles: {
    youtube:  null as File | null,
    bilibili: null as File | null,
  },
  
  // new: toast
  toast: { visible: false, message: "", type: "error" as "success" | "error" },
}
```

## 5. 新增方法

```typescript
// --- Cookie 設定 ---
async fetchCookieStatus()
async onFileChange(platform, event)
async uploadCookie(platform)
async saveCookieFile(platform, file): Promise<void>  // 讀取文字後 POST

// --- Toast ---
showToast(message, type)
startToastTimer()  // setTimeout 3 秒
```

## 6. Hook 時機

- `mounted()` 時呼叫 `fetchCookieStatus()`
- 開啟 Settings Panel 時再次 `fetchCookieStatus()`
- 「搜索」方法內 catch 錯誤時：
  - 後端若回傳 `cookieNeed` → `showToast(cookieNeed + " 的 Cookie 需要更新")`，不設 cookie 為錯誤
  - 其他錯誤維持現有 `alert(res.error)` 或改成 showToast

## 7. SCSS 新增（`_search.scss` 結尾）

```scss
// --- Toast --- (in _search.scss, follow existing palette)
.toast-wrap {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 9999;
  .toast {
    padding: 0.6rem 1rem;
    border-radius: 4px;
    color: #fff;
    min-width: 220px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    font-size: 0.9rem;
    &.toast-error { background: #f53b3b; }
    &.toast-success { background: #087bff; }
  }
}

// --- Settings panel (overlay on top of search-penal) ---
.settings-panel {
  background: #fff;
  padding: 1em;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  
  .settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1em;
    h3 { margin: 0; font-size: 1rem; }
  }
  
  .cookie-block {
    border-top: 1px solid #eee;
    padding: 0.75em 0;
    .cookie-label { font-weight: 500; }
    .cookie-status {
      font-size: 0.8rem;
      .status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; }
      .status-exists { background: #2ecc71; }
      .status-missing { background: #bbb; }
    }
  }
  
  .btn-upload {
    @extend .btn-search;  // reuse blue btn style
  }
}

// --- Settings icon in search-group ---
.btn-settings { @extend .btn; color: #555; }
```

## 8. 檔案變動清單

| 檔案 | 類型 | 說明 |
|------|------|------|
| `src/components/Search.vue` | 修改 | 加設定按鈕、 settings-panel、toast-wrap、data/methods |
| `src/assets/style/_search.scss` | 修改 | 新增 toast / settings / btn-upload 樣式 |
| **不新增** | — | 不新增組件、不新增 service（在 Search.vue 內直接用 axios + qs） |

## 9. 不實作項目

- ❌ 獨立的 Toast.vue（只用一次，不值得抽出）
- ❌ 獨立的 CookieService.ts（前端，只在 Search.vue 用）
- ❌ Cookie 上傳的「拖放」支援
- ❌ Cookie 內容預覽（直接檔名 + 狀態 dot 即可）
- ❌ Cookie 續期提醒（下次迭代）

## 10. 驗證方式

1. 手動 POST Netscape cookies.txt 到 `/api/cookies/youtube`
2. 開啟搜尋面板 → 點齒輪 icon → settings-panel 展開，顯示「最近更新 + 綠點」
3. 選擇新檔案 → 點上傳 → 成功後 `cookieStatus.youtube.exists` 變 true
4. 模擬搜尋失敗（刪除 youtube.txt，後端應回 `cookieNeed: ["youtube"]`）→ toast 顯示在右下角
5. Lint / Build 驗證（Docker 內）

## 11. 依賴確認

無新增 npm 依賴。沿用既有：
- `axios`
- `qs`
- 既有 iconfont （`icon-settings`、`icon-upload` 需要確認是否已存在，若不存在用 Unicode 替代符號）

## 12. 實作成果

### 決策摘要

- ✅ Settings icon：使用 Unicode `⚙`（U+2699），因 iconfont 無對應圖示
- ✅ Settings 位置：Search 面板內（遵循 AGENTS.md「no changing App.vue structure」原則）
- ✅ UI 文字：簡體中文（與既有 UI 一致）

### 已完成項目

| 檔案 | 狀態 |
|------|------|
| `src/components/Search.vue` | ✅ +settings panel / +toast / +cookie 上傳邏輯（維持 Vue Options API）|
| `src/assets/style/_search.scss` | ✅ +.toast-wrap / .settings-panel / .btn-settings / .btn-upload |

### 實作調整
前端 sub agent 在實作時做了以下調整（為符合 ESLint/Vue parser 限制）：
- 移除 template 中所有 `as` 型別斷言（Vue template 不支援 TS assertions）
- method 內移除顯式型別標註（避免 parser 失敗）
- 改用 `res.data.youtube` / `res.data.bilibili`（axios 包裹在 .data 下）
- Toast 顯示條件為 `toast.type === 'error'` ? toast-error : toast-success

### 驗證結果
- `yarn lint`: ✅ 0 errors (12 warnings：ChatService, SearchService, SongService 既有)
- `yarn build`: ✅ compiled successfully (11 pre-existing SCSS deprecation warnings)
- `yarn build:service`: ✅ compiled successfully

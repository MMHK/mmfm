# 規劃：yt-dlp Cookie 管理 API

**狀態**：✅ 已實作完成  
**建立日期**：2026-06-20  
**完成日期**：2026-06-20  
**關聯 issue/bug**：YouTube 3~7 天 / Bilibili 半年 cookie 有效期，需手動更新

---

## 1. 背景與目標

Docker 環境內的 yt-dlp 無法使用 `--cookies-from-browser`，必須以 cookie 檔案（Netscape cookies.txt 格式）搭配 `--cookies` 參數。目標：
- 前端提供上傳 cookie 檔案入口
- 後端 API 管理 cookie（儲存、狀態查詢）
- yt-dlp 搜尋 / 下載時自動帶入 cookie
- yt-dlp 因 cookie 失敗時，拋出特定錯誤，前端 toast 提示更新

## 2. 資料夾規劃

```
public/cache/
  └── cookies/
      ├── youtube.txt    ← POST /api/cookies/youtube 寫入
      └── bilibili.txt   ← POST /api/cookies/bilibili 寫入
```

- 路徑可透過環境變數 `COOKIE_DIR` 覆寫，預設 `cache/cookies/`
- Docker volume 已掛載 `mmfm-cache:/app/public/cache`，不需額外掛載
- 啟動時自動建立資料夾 `mkdirSync(recursive: true)`

## 3. API 規格

### 3.1 上傳 cookie
- **Route**：`POST /api/cookies/:platform`
- **Body**：`{ content: "..." }`，content 為 Netscape cookies.txt 文字
- **Platform**：`youtube` | `bilibili`
- **回應**：
  ```json
  { "status": true, "platform": "youtube", "updatedAt": 1718883600000 }
  ```
- **錯誤**（400）：平台不支援、內容不含任何有效 cookie 行

### 3.2 查詢 cookie 狀態
- **Route**：`GET /api/cookies/status`
- **回應**：
  ```json
  {
    "youtube":  { "exists": true,  "updatedAt": 1718883600000, "age": "3 days ago" },
    "bilibili": { "exists": false, "updatedAt": null }
  }
  ```

### 3.3 刪除 cookie（選用，先不做）

### 3.4 Swagger 更新
新增 `cookies` tag，兩個 endpoint 寫進 `swagger.json`。

## 4. CookieService.ts（新建）

最小化，只做檔案 IO：

```typescript
import fs from "fs";
import path from "path";

const COOKIE_DIR = process.env.COOKIE_DIR || path.join(__dirname, "../public", "cache", "cookies");

const SUPPORTED_PLATFORMS = ["youtube", "bilibili"] as const;
export type CookiePlatform = typeof SUPPORTED_PLATFORMS[number];

export function cookiePath(platform: CookiePlatform): string {
  return path.join(COOKIE_DIR, `${platform}.txt`);
}

export function saveCookie(platform: CookiePlatform, content: string): { updatedAt: number } {
  fs.mkdirSync(COOKIE_DIR, { recursive: true });
  fs.writeFileSync(cookiePath(platform), content.normalize("EOL") === content ? content : content.replace(/(\r\n|\r)/g, "\n"), "utf8");
  return { updatedAt: Date.now() };
}

export function cookieStatus(): Record<CookiePlatform, { exists: boolean; updatedAt: number | null }> {
  // ...
}
```

## 5. YtDlpService.ts 修改

`runYtDlp` 接收可選 `platform` 參數：

```typescript
function runYtDlp(args: string[], platform?: CookiePlatform): Promise<string> {
  const cookieFile = platform ? cookiePath(platform) : null;
  if (cookieFile && fs.existsSync(cookieFile)) {
    args = [...args, "--cookies", cookieFile];
  }
  // ...
}
```

`search` 內部呼叫 `runYtDlp` 時帶入對應 platform：
```typescript
runYtDlp(["--dump-json", "--no-download", q], p);
```

## 6. Cookie 錯誤辨識（WebService.ts）

yt-dlp 會回傳的 cookie 相關錯誤訊息（關鍵字清單）：

| 關鍵字 / regex | 來源 |
|----------------|------|
| `Sign in to confirm` | YouTube bot 偵測 |
| `members-only` / `channel members` | 需要登入 |
| `age-restricted` / `Sign in to view this video` | YouTube 年齡驗證 |
| `HTTP Error 403` | Cloudflare / 反爬蟲 |
| `HTTP Error 412` / `Request is blocked by server` | Bilibili 反爬蟲 |
| `HTTP Error 401` | 未授權 |
| `This video is only available for registered users` | 需登入 |
| `use --cookies` | yt-dlp 自己建議 |

抽取成函式：

```typescript
function isCookieRelatedError(stderr: string): boolean {
  const patterns = [
    /sign in/i,
    /members.only/i,
    /age.restricted/i,
    /HTTP Error 403/i,
    /HTTP Error 412/i,
    /HTTP Error 401/i,
    /registered users/i,
    /--cookies/i,
  ];
  return patterns.some((p) => p.test(stderr));
}
```

`search` 的 platform 參數決定嘗試的平台，錯誤發生時判斷：

```typescript
// YtDlpService.ts
export class CookieError extends Error {
  platform: CookiePlatform;
  constructor(platform: CookiePlatform, stderr: string) {
    super(`yt-dlp cookie error (${platform}): ${stderr}`);
    this.platform = platform;
  }
}
```

`search` 內部 `.catch((err) => { if (isCookieRelatedError(err.message)) throw new CookieError(p, err.message); throw err; })`。

WebService 層捕獲 `CookieError` 時回傳：
```json
{ "status": false, "cookieNeed": ["youtube"], "error": "YouTube cookie expired or missing" }
```

## 7. 前端 Search.vue 修改

搜尋失敗且 `res.cookieNeed` 存在時，彈出 toast：

```typescript
if (res.cookieNeed) {
  const list = res.cookieNeed.join(", ");
  alert(`需要更新 ${list} 的 cookie，請從瀏覽器重新匯出並上傳`);
}
```

（如果專案內已有 toast 元件，使用現有元件；否則用 `alert` 作為最小化實作）

## 8. 步驟總表

| # | 項目 | 檔案 |
|---|------|------|
| 1 | 新增 CookieService（檔案 IO） | 新建 `src/services/CookieService.ts` |
| 2 | YtDlpService 帶 cookie + CookieError | 修改 `src/services/YtDlpService.ts` |
| 3 | WebService 新增 cookie API + 捕獲錯誤 | 修改 `src/services/WebService.ts` |
| 4 | Swagger 文件更新 | 修改 `src/services/swagger.json` |
| 5 | 前端 toast 提示 | 修改 `src/components/Search.vue` |

## 9. 不實作項目（本次範圍外）

- ❌ 刪除 cookie API（不需要就先不做）
- ❌ 前端上傳 UI（本次只處理後端 API + 錯誤提示；UI 獨立成後續 task）
- ❌ Cookie 自動續期 / 定時重新驗證
- ❌ 登入狀態主動探測（先靠 yt-dlp 失敗後才回傳錯誤）

## 10. 驗證方式

1. 手動用 curl POST cookie 到 `/api/cookies/youtube` 與 `/api/cookies/bilibili`
2. `GET /api/cookies/status` 確認狀態
3. `GET /api/song/search?keyword=xxx` 正常應回傳 results
4. 移除 youtube.txt 後搜尋，應回傳 `{ cookieNeed: ["youtube"] }`
5. `docker run --rm -v "$PWD":/app -w /app node:20-alpine sh -c "yarn install && yarn lint"`
6. `docker run --rm -v "$PWD":/app -w /app node:20-alpine sh -c "yarn install && yarn build"`
7. `docker run --rm -v "$PWD":/app -w /app node:20-alpine sh -c "yarn install && yarn build:service"`

## 11. 實作成果

### 已完成項目

| 檔案 | 狀態 |
|------|------|
| `src/services/CookieService.ts` | ✅ 新建（31 行）|
| `src/services/YtDlpService.ts` | ✅ +CookieError / +isCookieRelatedError / runYtDlp 帶 --cookies |
| `src/services/WebService.ts` | ✅ +POST /api/cookies/:platform / GET /api/cookies/status / CookieError 捕獲 |
| `src/services/swagger.json` | ✅ +cookies tag + 兩個 paths |

### 驗證結果
- `yarn lint`: ✅ 0 errors (12 warnings：ChatService, SearchService, SongService 既有)
- `yarn build`: ✅ compiled successfully (11 pre-existing SCSS deprecation warnings)
- `yarn build:service`: ✅ compiled successfully

### ⚠ COOKIE_DIR Edge Case
**問題**：CookieService 預設路徑用 `__dirname + ../../public/cache/cookies`。
- Dev (`yarn web`)：`__dirname` = `src/services/`，路徑解析到 `public/cache/cookies` ✓
- Prod (`cd dist && node service.js`)：`__dirname` = `dist/`，路徑解析錯誤（project/../public）✗
- Docker：`__dirname` = `/app/`，需顯式設定 COOKIE_DIR

**解決**：Docker 部署必須設定環境變數。docker-compose.yml 需加入：
```yaml
environment:
  - COOKIE_DIR=/app/public/cache/cookies
```

Host production 模式啟動需加：
```bash
COOKIE_DIR=./public/cache/cookies node service.js
```

---

## 12. 開放問題（保留）

- (Q1) 前端 toast 使用現有元件還是 `alert` 臨時替代？→ 實作為 inline toast 元件（見 cookie-webui.md）
- (Q2) B 站 `bilisearch5:` 是否需要帶 `--extractor-args` 才能正確使用 SESSDATA？→ 待實測
- (Q3) Cookie 內容是否需要最小化驗證 → 實作為只檢查非空，不做 domain 驗證

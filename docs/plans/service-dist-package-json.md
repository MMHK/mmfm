# dist/package.json 自動產生 + bundle 修復

## 背景

原始 `rspack.config.service.js` 有兩個問題：
1. **bundle 完全無效** — `dist/service.js` 只有 46 行/1KB，實際上是 `require("./src/services/WebService.ts")` 的 wrapper
2. **無 dist/package.json** — 部署時缺運行期依賴聲明

> **注意**：`src/services/package.json` 和 `src/services/Dockerfile` 後續已刪除，後端不再需要獨立的部署配置。

## 問題分析

### Bundle 失效原因
`externals` 函數使用有缺陷的 allowlist：
- 只匹配頂層包名，子依賴（如 body-parser 內部的 `bytes`, `qs`, `type-is` 等）全部漏出為 `require()`
- 未排除相對路徑 (`./`, `../`)，導致 entry 本身也被外部化

### dist/package.json 問題
原本從根 `package.json` dependencies 過濾產生，會列出大量未實際使用的依賴。

## 實作方式

### 1. externals 修復
移除失效的 allowlist，標準 Node.js bundle 模式：**所有 npm 模組皆為外部 require，只 bundle 源碼**。

```js
externals: [
  function ({ request }, callback) {
    if (/^\./.test(request)) return callback();
    return callback(null, "commonjs " + request);
  },
],
```

### 2. GenerateDistPkgPlugin 重寫
改為**掃描 `src/services/` 的實際 imports**（而非讀根 package.json）：

- 遞迴掃描所有 `.ts`/`.js` 檔案
- 提取 `import ... from "..."` 和 `require("...")` 字串
- 過濾掉：相對路徑 (`./`, `../`)、Node.js 內建模組
- 從根 `package.json` 的 dependencies + devDependencies 查找版本號
- 產生 `dist/package.json`

## 最終產出

### dist/service.js
- 876 行 / 34KB（原本 46 行/1KB，含完整 src/services/ 源碼）

### dist/package.json
```json
{
  "name": "mmfm-service",
  "version": "0.1.4",
  "private": true,
  "main": "service.js",
  "dependencies": {
    "axios": "^0.21.1",
    "body-parser": "^1.19.0",
    "cli": "^1.0.1",
    "dotenv": "^17.4.2",
    "express": "^4.17.1",
    "flat-cache": "^3.0.4",
    "mitt": "^3.0.0",
    "socket.io": "^4.7.0",
    "socket.io-client": "^4.7.0",
    "swagger-ui-express": "^4.1.1"
  }
}
```

### Bundle require() 清單（已清理）
```
require("body-parser")    ← npm
require("cli")            ← npm
require("dotenv")         ← npm
require("express")        ← npm
require("flat-cache")     ← npm
require("socket.io")      ← npm
require("swagger-ui-express") ← npm
require("child_process")  ← Node.js
require("crypto")         ← Node.js
require("fs")             ← Node.js
require("http")           ← Node.js
require("os")             ← Node.js
require("path")           ← Node.js
```
無 sub-dependency 洩漏 (bytes, content-type, debug, qs, raw-body 等全部 clean)

## 驗證

| 項目 | 狀態 |
|------|------|
| `yarn build:service` | ✅ 成功 |
| `yarn lint` | ✅ 0 errors |
| dist/service.js bundle 正確打包源碼 | ✅ 876 行 |
| dist/package.json 內容正確 | ✅ 10 項實際 runtime deps |
| bundle 無 sub-dependency require 洩漏 | ✅ |

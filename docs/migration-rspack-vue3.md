# MMFM 遷移計畫：Rspack + Vue 3

> 目標：將 MMFM 前後端從 Vue CLI 3 + webpack 遷移到 Rspack，前端從 Vue 2 升級到 Vue 3，並統一使用 yarn 作為唯一 package manager。
> 參考專案：`D:\projects\search-agent-go\webroot\rspack.config.js`
>
> **整體狀態：✅ 遷移完成（2026-06-20 確認）**

---

## 0. 遷移前現狀（歸檔）

### 前端（遷移前）
| 項目 | 遷移前 | 遷移後 |
|---|---|---|
| 框架 | Vue 2.6 + core-js 2 | ✅ Vue 3.4+ (Options API) |
| 打包工具 | Vue CLI 3 + webpack | ✅ Rspack (`rspack.config.js`) |
| 元件 | `App.vue`, `Player.vue` (342行), `Search.vue` (109行) | ✅ 同左，已迁移 Vue 3 寫法 |
| 樣式 | SCSS (`sass` dart implementation) | ✅ 不變 |
| 通訊 | EventBus (`new Vue()`) + Socket.IO client v2 | ✅ mitt v3 + Socket.IO client v4 |
| 拖曳 | `vuedraggable` v2 (Vue 2 版) | ✅ `vuedraggable` v4 (slot API) |
| HTTP | `axios` + `qs` | ✅ 不變 |
| 模板 | `public/index.html` 使用 EJS `<%= BASE_URL %>` | ✅ 靜態路徑 `/favicon.ico` |

### 後端（遷移前）
| 項目 | 遷移前 | 遷移後 |
|---|---|---|
| 框架 | Express + Socket.IO 2 | ✅ Express + Socket.IO 4 |
| 打包工具 | webpack (`target: "node"`) + `webpack-node-externals` | ✅ Rspack (`rspack.config.service.js`) |
| 入口 | `src/services/WebService.js` | ✅ 不變 |
| 輸出 | `dist/service.js` | ✅ 不變 |
| 附加檔案 | `swagger.json`, `Dockerfile`, `package.json` 複製到 `dist/` | ✅ 同左 + `.dockerignore` |
| Docker | `node:13-alpine` | ✅ `node:18-alpine` |

### Vue 2 特有寫法遷移追蹤
| 檔案 | Vue 2 寫法 | Vue 3 處理方式 | 狀態 |
|---|---|---|---|
| `Bus.js` | `new Vue()` 作為 EventBus | 改用 `mitt` | ✅ |
| `main.js` | `new Vue({ render: h => h(App) }).$mount('#app')` | `createApp(App).mount('#app')` | ✅ |
| `Player.vue` | `this.$set(array, index, value)` | 直接索引賦值 `array[index] = value` | ✅ |
| `Player.vue` | `import draggable from "vuedraggable"` (v2) | `vuedraggable` v4 slot API (`<template #item>`) | ✅ |
| `Player.vue` | `EventBus.$on` / `EventBus.$emit` | `EventBus.on` / `EventBus.emit` | ✅ |
| `Player.vue` | `beforeDestroy` | `beforeUnmount` (Vue 3 生命週期) | ✅ |
| `Search.vue` | `import { Promise } from 'q'` | 移除，改用原生 `Promise` | ✅ |
| `Search.vue` | `EventBus.$emit` | `EventBus.emit` | ✅ |
| `App.vue` | `EventBus.$on` | `EventBus.on` | ✅ |
| `ChatService.js` | `EventBus.$emit` | `EventBus.emit` | ✅ |
| `ChatService.js` | `socket.io-client` v2 (`import io`) | v4 (`import { io }`) + transports 設定 | ✅ |
| `public/index.html` | `<%= BASE_URL %>favicon.ico` (EJS) | 靜態路徑 `/favicon.ico` | ✅ |

---

## 1. 執行階段

### Phase 1 — 基礎設施 & 依賴更新 ✅

**目標**：建立 Rspack 設定檔，更新 `package.json`，禁用 npm，清理舊設定。

#### 1.1 新增檔案 ✅

| 檔案 | 說明 |
|---|---|
| `rspack.config.js` | ✅ 前端 Rspack 設定（97 行） |
| `rspack.config.service.js` | ✅ 後端 Rspack 設定（44 行，target: node） |

#### 1.2 刪除檔案 ✅

| 檔案 | 原因 | 狀態 |
|---|---|---|
| `vue.config.js` | 被 `rspack.config.js` 取代 | ✅ 已刪除 |
| `babel.config.js` | Rspack 使用內建 swc-loader | ✅ 已刪除 |
| `webpack.config.js` | 被 `rspack.config.service.js` 取代 | ✅ 已刪除 |
| `postcss.config.js` | 不需要 | ✅ 已刪除 |
| `.browserslistrc` | 不再使用 babel | ✅ 已刪除 |

#### 1.3 `package.json` 變更 ✅

**已移除的依賴：** ✅
```
@vue/cli-plugin-babel, @vue/cli-plugin-eslint, @vue/cli-service,
@babel/core, @babel/preset-env, babel-eslint, babel-plugin-add-module-exports,
core-js, vue (v2), vue-template-compiler, vuedraggable (v2),
webpack-cli, webpack-node-externals, copy-webpack-plugin (v5),
sass-loader (v7), eslint (v5), eslint-plugin-vue (v5), esm
```

**已新增的依賴：** ✅
```
dependencies:
  vue@^3.4.0
  mitt@^3.0.0
  vuedraggable@^4.1.0
  socket.io-client@^4.7.0

devDependencies:
  @rspack/cli@^1.0.0
  @rspack/core@^1.0.0
  rspack-vue-loader@^17.5.0
  html-webpack-plugin@^5.6
  sass@^1.69.0
  sass-loader@^16.0
  eslint@^9.0.0
  eslint-plugin-vue@^9.0.0
  @babel/eslint-parser@^7
```

**scripts：** ✅
```json
{
  "scripts": {
    "serve": "rspack serve --mode development",
    "build": "rspack build --mode production",
    "web": "node ./src/services/WebService.js -d ./dist/public",
    "build:service": "cross-env NODE_ENV=production rspack --config rspack.config.service.js",
    "lint": "eslint src/",
    "test": "mocha ./tests/mocha.webserice.test.js"
  }
}
```

#### 1.4 禁用 npm ✅

`preinstall: "npx only-allow yarn"` 已加入。

#### 1.5 修正 `.npmrc` ✅

```
registry=https://registry.npmmirror.com
```

---

### Phase 2 — 前端 Rspack 設定 ✅

**目標**：建立 `rspack.config.js`，等效現有 `vue.config.js` 功能。

#### 關鍵對應 ✅

| vue.config.js 功能 | rspack.config.js 實作 | 狀態 |
|---|---|---|
| `outputDir: dist/public` | `output.path: path.resolve(__dirname, 'dist/public')` | ✅ |
| `chainWebpack: delete splitChunks` | `optimization.splitChunks: false` | ✅ |
| `css.loaderOptions.sass` | `module.rules` scss rule + `sass-loader` | ✅ |
| `devServer.proxy` | `devServer.proxy` (Rspack 內建) | ✅ |
| EJS 模板 `<%= BASE_URL %>` | `HtmlWebpackPlugin` + 靜態路徑 | ✅ |
| — | `DefinePlugin` 注入 `LOCAL_PLAYER_MODE` | ✅ |
| — | `builtin:swc-loader` 取代 babel | ✅ |

---

### Phase 3 — Vue 2 到 Vue 3 遷移 ✅

**目標**：修改所有前端元件，消除 Vue 2 特有寫法。

#### 3.1 `src/main.js` ✅

```js
import { createApp } from 'vue'
import App from './App.vue'
createApp(App).mount('#app')
```

#### 3.2 `src/services/Bus.js` ✅

```js
import mitt from "mitt";
const emitter = mitt();
export { emitter as EventBus };
```

#### 3.3 `src/App.vue` ✅

- `EventBus.on("search.open", ...)` — mitt API
- Options API 寫法，Vue 3 完全相容

#### 3.4 `src/components/Player.vue` ✅ (414 行)

| 變更項 | 狀態 |
|---|---|
| `this.$set()` → 直接索引賦值 | ✅ |
| `EventBus.$on`/`$emit` → `.on`/`.emit` | ✅ |
| `vuedraggable` v4 slot API (`<template #item>`) | ✅ |
| `beforeDestroy` → `beforeUnmount` | ✅ |
| `LOCAL_PLAYER_MODE` env 注入 + HTML5 `<audio>` | ✅ |

#### 3.5 `src/components/Search.vue` ✅ (108 行)

| 變更項 | 狀態 |
|---|---|
| 移除 `import { Promise } from 'q'` | ✅ |
| `EventBus.$emit` → `EventBus.emit` | ✅ |

#### 3.6 `src/services/ChatService.js` ✅ (100 行)

| 變更項 | 狀態 |
|---|---|
| `EventBus.$emit` → `EventBus.emit` | ✅ |
| `socket.io-client` v4 (`import { io }`) | ✅ |
| transports: `['websocket', 'polling']` | ✅ |

#### 3.7 `public/index.html` ✅

```html
<link rel="icon" href="/favicon.ico">
```

全域變數 `API_URL`, `WS_URL`, `SEARCH_API_URL` 透過 `<script>` 定義，由 `global.X` 讀取。

---

### Phase 4 — 後端 Rspack 打包 ✅

**目標**：建立 `rspack.config.service.js`，等效現有 `webpack.config.js`。

#### 關鍵對應 ✅

| webpack.config.js | rspack.config.service.js | 狀態 |
|---|---|---|
| `target: "node"` | `target: "node"` | ✅ |
| `nodeExternals({ allowlist })` | `externalsPresets: { node: true }` + 手動 externals | ✅ |
| `CopyWebpackPlugin` | `copy-webpack-plugin` | ✅ |
| `webpack.ProgressPlugin()` | 不需要（Rspack 內建） | ✅ |
| `optimization.minimize: false` | `optimization.minimize: false` | ✅ |
| `devtool: "none"` | `devtool: false` | ✅ |

複製檔案：`swagger.json`, `Dockerfile`, `package.json`, `.dockerignore` → `dist/`

---

### Phase 5 — ESLint & 工具鏈更新 ✅

| 檔案 | 變更 | 狀態 |
|---|---|---|
| `.eslintrc.js` | `plugin:vue/vue3-essential` + `@babel/eslint-parser` | ✅ |
| `postcss.config.js` | 已移除 | ✅ |

---

### Phase 6 — Socket.IO v2 到 v4 升級 ✅

**目標**：前後端 Socket.IO 同步升級到 v4。

#### 6.1 後端 `src/services/WebService.js` ✅

| 變更項 | 狀態 |
|---|---|
| `const { Server: SocketIO } = require('socket.io')` | ✅ |
| `new SocketIO(server, { path: "/io" })` | ✅ |
| socket.io `^4.7.0` | ✅ |

#### 6.2 前端 `src/services/ChatService.js` ✅

| 變更項 | 狀態 |
|---|---|
| `import { io } from 'socket.io-client'` | ✅ |
| `io(this.API, { path: "/io", transports: ["websocket", "polling"] })` | ✅ |
| socket.io-client `^4.7.0` | ✅ |

---

### Phase 7 — Docker Image 升級 ✅

`node:13-alpine` → `node:18-alpine` ✅

---

### Phase 8 — 驗證 ✅

| 步驟 | 命令 | 狀態 |
|---|---|---|
| 1. Lint | `yarn lint` | ✅ |
| 2. 前端打包 | `yarn build` | ✅ |
| 3. 後端打包 | `yarn build:service` | ✅ |
| 4. Dev server | `yarn serve` | ✅ |
| 5. 後端啟動 | `yarn web` | ✅ |
| 6. 手動測試 | 瀏覽器開啟前端 | ✅ |

---

## 2. 決策記錄（已確認）
| # | 問題 | 決策 | 原因 |
|---|---|---|---|
| 1 | 是否引入 TypeScript？ | **否** | 現有程式碼全 JS，引入 TS 會大幅增加工作量 |
| 2 | 是否改用 Composition API？ | **否** | Vue 3 完全相容 Options API，改動量最小 |
| 3 | Socket.IO 是否升級到 v4？ | **是** | v2 已過時，前後端需同步升級 |
| 4 | `vuedraggable` 升級方案？ | **vuedraggable v4** | 最接近舊 v2 API，改動最小 |
| 5 | 是否引入 `q` 的替代？ | **移除 `q`** | 可直接用原生 Promise 取代 |
| 6 | Docker base image 是否升級？ | **是，node:18-alpine** | node:13 已 EOL |

---

## 3. 風險評估

| 風險 | 原始影響 | 狀態 |
|---|---|---|
| `vuedraggable` v4 API 差異 | 拖曳功能可能需調整 | ✅ 已解決（slot API `#item` 已實作） |
| Socket.IO v2→v4 breaking changes | 前後端通訊可能中斷 | ✅ 已解決（前後端同步升級到 v4） |
| Rspack 對 SCSS 的處理方式不同 | 樣式可能異常 | ✅ 已解決（sass + sass-loader 正常運作） |
| `listen1_chrome_extension` git 依賴 | yarn install 可能失敗 | ✅ 已解決 |
| `global` 物件（前端） | Vue 3 不再使用 `global` | ⚠️ 仍使用 `global.X`（`ChatService.js`, `SearchService.js`, `SongService.js`），靠 Rspack bundler 行為運作，非標準但可用 |

---

## 4. 檔案影響範圍

### 已修改（15 個檔案）✅
- `package.json` ✅
- `.npmrc` ✅
- `.eslintrc.js` ✅
- `public/index.html` ✅
- `src/main.js` ✅
- `src/App.vue` ✅
- `src/components/Player.vue` ✅
- `src/components/Search.vue` ✅
- `src/services/Bus.js` ✅
- `src/services/ChatService.js` ✅
- `src/services/SearchService.js` ✅
- `src/services/SongService.js` ✅
- `src/services/WebService.js` ✅
- `src/services/Dockerfile` ✅
- `src/services/package.json` ✅

### 已新增（2 個檔案）✅
- `rspack.config.js` ✅
- `rspack.config.service.js` ✅

### 已刪除（5 個檔案）✅
- `vue.config.js` ✅
- `babel.config.js` ✅
- `webpack.config.js` ✅
- `postcss.config.js` ✅
- `.browserslistrc` ✅

### 未改动
- 後端 provider 模組（`src/services/provider/*`）
- 測試檔案（`tests/*`）
- `src/services/MusieApi.js`
- SCSS 樣式檔案

---

## 5. 殘留技術債

| 項目 | 說明 | 嚴重度 |
|---|---|---|
| `global.X` 模式 | `ChatService.js`, `SearchService.js`, `SongService.js` 使用 `global.API_URL` 等，依賴 bundler 將 `index.html` script 變數掛到 global。標準做法應改為 `window.X` 或 ES module imports | 低（可運作） |
| `qs` 未在 `package.json` | `SongService.js` import `qs` 但未列為依賴，可能靠 transitive install | 中 |
| `dotenv` 未在 `package.json` | `rspack.config.js` 使用 `require('dotenv')` 但未列為 devDependency | 中 |
| `.eslintrc.js` 格式 | ESLint 9 建議 flat config (`eslint.config.js`)，目前用 legacy 格式仍可運作 | 低 |
| `test` script 指向不存在檔案 | `mocha ./tests/mocha.webserice.test.js` 檔案不存在 | 低 |

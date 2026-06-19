?# MMFM 遷移計畫：Rspack + Vue 3

> 目標：將 MMFM 前後端從 Vue CLI 3 + webpack 遷移�?Rspack，前端從 Vue 2 升級�?Vue 3，並統一使用 yarn 作為唯一 package manager�?> 參考專案：`D:\projects\search-agent-go\webroot\rspack.config.js`

---

## 0. 現狀分析

### 前端
| 項目 | 現狀 |
|---|---|
| 框架 | Vue 2.6 + core-js 2 |
| 打包工具 | Vue CLI 3 (`vue-cli-service`) + webpack |
| 元件 | `App.vue`, `Player.vue` (342�?, `Search.vue` (109�? |
| 樣式 | SCSS (`sass` dart implementation) |
| 通訊 | EventBus (`new Vue()` 實作) + Socket.IO client v2 |
| 拖曳 | `vuedraggable` v2 (Vue 2 �? |
| HTTP | `axios` + `qs` |
| 模板 | `public/index.html` 使用 EJS 語法 `<%= BASE_URL %>` |

### 後端
| 項目 | 現狀 |
|---|---|
| 框架 | Express + Socket.IO 2 |
| 打包工具 | webpack (`target: "node"`) + `webpack-node-externals` |
| 入口 | `src/services/WebService.js` |
| 輸出 | `dist/service.js` |
| 附加檔案 | `swagger.json`, `Dockerfile`, `package.json` 複製�?`dist/` |

### 需遷移�?Vue 2 特有寫法（已逐一盤點�?
| 檔案 | Vue 2 寫法 | Vue 3 處理方式 |
|---|---|---|
| `Bus.js` | `new Vue()` 作為 EventBus | 改用 `mitt` �?|
| `main.js` | `new Vue({ render: h => h(App) }).$mount('#app')` | `createApp(App).mount('#app')` |
| `Player.vue` | `this.$set(array, index, value)` (多處) | Vue 3 移除 `$set`，改用直接索引賦�?`array[index] = value` |
| `Player.vue` | `import draggable from "vuedraggable"` (v2) | 改用 `vuedraggable` v4 (`vue-draggable-plus` 亦可) |
| `Player.vue` | `EventBus.$on` / `EventBus.$emit` | `emitter.on` / `emitter.emit` (mitt API) |
| `Search.vue` | `import { Promise } from 'q'` | 改用原生 `Promise` (移除 `q` 依賴) |
| `Search.vue` | `EventBus.$emit` | `emitter.emit` (mitt API) |
| `ChatService.js` | `EventBus.$emit` | `emitter.emit` |
| `ChatService.js` | `socket.io-client` v2 | 升級�?v4 (需與後�?Socket.IO 同步升級) |
| `public/index.html` | `<%= BASE_URL %>favicon.ico` (EJS 模板) | 改為靜態路徑 `/favicon.ico` |

---

## 1. 執行階段

### Phase 1 �?基礎設施 & 依賴更新

**目標**：建�?Rspack 設定檔，更新 `package.json`，禁�?npm，清理舊設定�?
#### 1.1 新增檔案

| 檔案 | 說明 |
|---|---|
| `rspack.config.js` | 前端 Rspack 設定（參�?search-agent-go 的設定） |
| `rspack.config.service.js` | 後端 Rspack 設定（target: node�?|

#### 1.2 刪除檔案

| 檔案 | 原因 |
|---|---|
| `vue.config.js` | �?`rspack.config.js` 取代 |
| `babel.config.js` | Rspack 使用內建 swc-loader，不需�?babel |
| `webpack.config.js` | �?`rspack.config.service.js` 取代 |
| `postcss.config.js` | 若不需�?autoprefixer 可移除；若保留則更新�?Rspack 相容格式 |
| `.browserslistrc` | 不再使用 babel，可移除 |

#### 1.3 `package.json` 變更

**移除的依�?*�?```
@vue/cli-plugin-babel
@vue/cli-plugin-eslint
@vue/cli-service
@babel/core
@babel/preset-env
babel-eslint
babel-plugin-add-module-exports
core-js
vue (v2)
vue-template-compiler
vuedraggable (v2)
webpack-cli
webpack-node-externals
copy-webpack-plugin (v5)
sass-loader (v7)
eslint (v5)
eslint-plugin-vue (v5)
esm
```

**新增的依�?*�?```
dependencies:
  vue@^3.4
  mitt@^3.0
  vuedraggable@^4.1.0  (Vue 3 版，�?vue-draggable-plus �?vuedraggable next)
  socket.io-client@^4.7

devDependencies:
  @rspack/cli@^1.0
  @rspack/core@^1.0
  rspack-vue-loader@^17.5
  html-webpack-plugin@^5.6
  sass@^1.69
  sass-loader@^16.0
  eslint@^9
  eslint-plugin-vue@^9
  @babel/eslint-parser@^7
  dotenv@^17
```

**更新 script**�?```json
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

#### 1.4 禁用 npm

�?`package.json` 加入 `preinstall` script�?```json
"scripts": {
  "preinstall": "npx only-allow yarn"
}
```

#### 1.5 修正 `.npmrc`

taobao mirror 已失效，需更新為可�?mirror 或直接移除自�?mirror�?```
registry=https://registry.npmmirror.com
```

---

### Phase 2 �?前端 Rspack 設定

**目標**：建�?`rspack.config.js`，等效現�?`vue.config.js` 功能�?
#### 關鍵對應

| vue.config.js 功能 | rspack.config.js 實作 |
|---|---|
| `outputDir: dist/public` | `output.path: path.resolve(__dirname, 'dist/public')` |
| `chainWebpack: delete splitChunks` | 預設不啟�?splitChunks（或按需設定�?|
| `css.loaderOptions.sass` | `module.rules` 中設�?scss rule + `sass-loader` |
| `devServer.proxy` | `devServer.proxy` (Rspack 內建支援) |
| EJS 模板 `<%= BASE_URL %>` | `HtmlWebpackPlugin` + 修改 `index.html` 為靜態路�?|
| �?splitChunks 單一 bundle | 保持 `optimization.splitChunks: false` |

#### `rspack.config.js` 草案

```js
require('dotenv').config();
const rspack = require('@rspack/core');
const path = require('path');
const { VueLoaderPlugin } = require('rspack-vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const IS_DEV = process.env.NODE_ENV === 'development';

module.exports = {
  entry: './src/main.js',

  output: {
    filename: 'static/js/[name].[contenthash:8].js',
    path: path.resolve(__dirname, 'dist/public'),
    clean: true,
    assetModuleFilename: 'static/assets/[name].[contenthash:8][ext]'
  },

  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },

  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'rspack-vue-loader',
        options: { experimentalInlineMatchResource: true }
      },
      {
        test: /\.js$/,
        use: [{
          loader: 'builtin:swc-loader',
          options: {
            jsc: { parser: { syntax: 'ecmascript' } }
          }
        }],
        type: 'javascript/auto'
      },
      {
        test: /\.css$/,
        type: 'css'
      },
      {
        test: /\.scss$/,
        type: 'css',
        use: ['sass-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg|ico)$/i,
        type: 'asset/resource',
        generator: { filename: 'static/img/[name].[hash:8][ext]' }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: { filename: 'static/fonts/[name].[hash:8][ext]' }
      }
    ]
  },

  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html'
    }),
    new rspack.DefinePlugin({
      'process.env.LOCAL_PLAYER_MODE': JSON.stringify(process.env.LOCAL_PLAYER_MODE || 'false')
    })
  ],

  optimization: {
    splitChunks: false,
    minimize: !IS_DEV
  },

  experiments: {
    css: true
  },

  devServer: {
    port: 8080,
    hot: true,
    proxy: [
      { context: ['/api'], target: 'http://127.0.0.1:8011', changeOrigin: true },
      { context: ['/io'], target: 'http://127.0.0.1:8011', changeOrigin: true, ws: true },
      { context: ['/song'], target: 'http://127.0.0.1:8011', changeOrigin: true },
      { context: ['/cache'], target: 'http://127.0.0.1:8011', changeOrigin: true }
    ]
  },

  devtool: IS_DEV ? 'source-map' : false
};
```

---

### Phase 3 �?Vue 2 �?Vue 3 遷移

**目標**：修改所有前端元件，消除 Vue 2 特有寫法�?
#### 3.1 `src/main.js`

```js
// Before (Vue 2)
import Vue from 'vue'
import App from './App.vue'
Vue.config.productionTip = false
new Vue({ render: h => h(App) }).$mount('#app')

// After (Vue 3)
import { createApp } from 'vue'
import App from './App.vue'
createApp(App).mount('#app')
```

#### 3.2 `src/services/Bus.js`

```js
// Before (Vue 2)
import Vue from "vue";
if (!global.bus) { global.bus = new Vue(); }
let EventBus = global.bus;
export { EventBus }

// After (Vue 3 + mitt)
import mitt from "mitt";
const emitter = mitt();
export { emitter as EventBus };
```

**API 對應**�?| Vue 2 EventBus | mitt |
|---|---|
| `EventBus.$on(event, handler)` | `EventBus.on(event, handler)` |
| `EventBus.$off(event, handler)` | `EventBus.off(event, handler)` |
| `EventBus.$emit(event, ...args)` | `EventBus.emit(event, ...args)` |

#### 3.3 `src/App.vue`

- `$on` �?`on`（配�?mitt�?- 其餘 Options API 寫法 Vue 3 完全相容，不需改動

#### 3.4 `src/components/Player.vue`

| 變更�?| 說明 |
|---|---|
| `this.$set(array, index, value)` | 全部改為 `array[index] = value`（Vue 3 Proxy-based reactivity 支援直接索引�?|
| `EventBus.$on` / `$emit` | 改為 `EventBus.on` / `EventBus.emit` |
| `import draggable from "vuedraggable"` | 確認 v4 版本�?import 方式 |
| `<draggable v-model="playlist">` | v4 �?`v-model` 語法可能略有不同，需確認 |

#### 3.5 `src/components/Search.vue`

| 變更�?| 說明 |
|---|---|
| `import { Promise } from 'q'` | 移除，改用原�?`Promise` |
| `EventBus.$emit` | 改為 `EventBus.emit` |

#### 3.6 `src/services/ChatService.js`

| 變更�?| 說明 |
|---|---|
| `EventBus.$emit` | 改為 `EventBus.emit` |
| `socket.io-client` v2 | 升級�?v4，API 基本相容但需確認 `transports` 選項 |

#### 3.7 `public/index.html`

```html
<!-- Before -->
<link rel="icon" href="<%= BASE_URL %>favicon.ico">

<!-- After -->
<link rel="icon" href="/favicon.ico">
```

---

### Phase 4 �?後端 Rspack 打包

**目標**：建�?`rspack.config.service.js`，等效現�?`webpack.config.js`�?
#### 關鍵對應

| webpack.config.js | rspack.config.service.js |
|---|---|
| `target: "node"` | `target: "node"` |
| `nodeExternals({ allowlist: [...] })` | `externalsPresets: { node: true }` + 手動 `externals` |
| `CopyWebpackPlugin` | `copy-webpack-plugin` (Rspack 相容) |
| `webpack.ProgressPlugin()` | 不需要（Rspack 內建進度�?|
| `optimization.minimize: false` | `optimization.minimize: false` |
| `devtool: "none"` | `devtool: false` |

#### `rspack.config.service.js` 草案

```js
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/services/WebService.js',
  target: 'node',

  output: {
    path: path.resolve('dist'),
    filename: 'service.js'
  },

  node: {
    __dirname: false,
    __filename: false
  },

  externalsPresets: { node: true },
  externals: [
    // 保留需�?bundle 的模組（等效�?allowlist�?    function({ request }, callback) {
      const allowlist = [/^core-js/, /^@babel/, /webpack/, /^regenerator-runtime/,
                         'body-parser', 'swagger-ui-express', /^fetch/];
      if (allowlist.some(p => p instanceof RegExp ? p.test(request) : p === request)) {
        return callback();
      }
      return callback(null, 'commonjs ' + request);
    }
  ],

  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/services/swagger.json', to: '.' },
        { from: 'src/services/Dockerfile', to: '.' },
        { from: 'src/services/package.json', to: '.' }
      ]
    })
  ],

  optimization: { minimize: false },
  devtool: false
};
```

---

### Phase 5 �?ESLint & 工具鏈更�?
| 檔案 | 變更 |
|---|---|
| `.eslintrc.js` | `plugin:vue/essential` �?`plugin:vue/vue3-essential`；`babel-eslint` �?`@babel/eslint-parser` |
| `postcss.config.js` | 保留（autoprefixer 仍可用於 Rspack）或移除 |

---

### Phase 6 �?Socket.IO v2 �?v4 升級（前後端同步�?
**目標**：前後端 Socket.IO 同步升級�?v4�?
#### 6.1 後端 `src/services/WebService.js`

| 變更�?| Before (v2) | After (v4) |
|---|---|---|
| 引入 | `const SocketIO = require('socket.io')` | `const { Server } = require('socket.io')` |
| 初始�?| `new SocketIO(server, { path: "/io" })` | `new Server(server, { path: "/io", cors: { origin: "*" } })` |
| 廣播 | `socket.to("chat").emit("msg", msg)` | 不變（v4 仍支援此語法�?|

#### 6.2 前端 `src/services/ChatService.js`

| 變更�?| Before (v2) | After (v4) |
|---|---|---|
| 引入 | `import io from 'socket.io-client'` | `import { io } from 'socket.io-client'` |
| 連線 | `io(this.API, { path: "/io", transports: [...] })` | `io(this.API, { path: "/io", transports: ["websocket", "polling"] })` |

---

### Phase 7 �?Docker Image 升級

**目標**：`node:13-alpine` �?`node:18-alpine`�?
#### `src/services/Dockerfile`

```dockerfile
# Before
FROM node:13-alpine

# After
FROM node:18-alpine
```

---

### Phase 8 �?驗證

| 步驟 | 命令 | 預期結果 |
|---|---|---|
| 1. Lint | `yarn lint` | 無錯�?|
| 2. 前端打包 | `yarn build` | `dist/public/` 產出成功 |
| 3. 後端打包 | `yarn build:service` | `dist/service.js` 產出成功 |
| 4. Dev server | `yarn serve` | 前端 dev server 啟動，proxy 正常 |
| 5. 後端啟動 | `yarn web` | Express �?:8011 正常啟動 |
| 6. 手動測試 | 瀏覽器開啟前�?| 播放、搜尋、拖曳功能正�?|

---

## 2. 決策記錄（已確認�?
| # | 問題 | 決策 | 原因 |
|---|---|---|---|
| 1 | 是否引入 TypeScript�?| **�?* | 現有程式碼全 JS，引�?TS 會大幅增加工作量 |
| 2 | 是否改用 Composition API�?| **�?* | Vue 3 完全相容 Options API，改動量最�?|
| 3 | Socket.IO 是否升級�?v4�?| **�?* | v2 已過時，前後端需同步升級 |
| 4 | `vuedraggable` 升級方案�?| **vuedraggable v4** (SortableJS/vue.draggable.next) | 最接近�?v2 API，改動最�?|
| 5 | 是否引入 `q` 的替代？ | **移除 `q`** | Search.vue �?`import { Promise } from 'q'` 可直接用原生 Promise 取代 |
| 6 | Docker base image 是否升級�?| **是，升級�?node:18-alpine** | node:13 �?EOL，一併處�?|

---

## 3. 風險評估

| 風險 | 影響 | 緩解措施 |
|---|---|---|
| `vuedraggable` v4 API 差異 | 拖曳功能可能需調整 | 先驗�?v4 �?`v-model` �?event 語法 |
| Socket.IO v2→v4 breaking changes | 前後端通訊可能中斷 | 需同時升級前後端；測試 WebSocket 連線 |
| Rspack �?SCSS 的處理方式不�?| 樣式可能異常 | 參考專案已驗證 SCSS 可用 |
| `listen1_chrome_extension` git 依賴 | yarn install 可能失敗 | 確認 git URL 可存�?|
| `global` 物件（前端） | Vue 3 不再使用 `global` | `ChatService.js` / `SearchService.js` / `SongService.js` 中的 `global.WS_URL` 等需改為 `window.WS_URL` 或從 `index.html` �?script 變數讀�?|

---

## 4. 檔案影響範圍

### 修改（~15 個檔案）
- `package.json`
- `.npmrc`
- `.eslintrc.js`
- `public/index.html`
- `src/main.js`
- `src/App.vue`
- `src/components/Player.vue`
- `src/components/Search.vue`
- `src/services/Bus.js`
- `src/services/ChatService.js`（EventBus API + Socket.IO v4�?- `src/services/SearchService.js`（`global` �?`window`�?- `src/services/SongService.js`（`global` �?`window`�?- `src/services/WebService.js`（Socket.IO v4 API�?- `src/services/Dockerfile`（node:13 �?node:18�?- `src/services/package.json`（socket.io v2 �?v4�?
### 新增�? 個檔案）
- `rspack.config.js`
- `rspack.config.service.js`

### 刪除�?~5 個檔案）
- `vue.config.js`
- `babel.config.js`
- `webpack.config.js`
- `postcss.config.js`（可選）
- `.browserslistrc`（可選）

### 不改�?- 後端 provider 模組（`src/services/provider/*`�?- 測試檔案（`tests/*`�?- `src/services/MusieApi.js`
- SCSS 樣式檔案

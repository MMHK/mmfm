# MMFM 閬风Щ瑷堢暙锛歊spack + Vue 3

> 鐩锛氬皣 MMFM 鍓嶅緦绔緸 Vue CLI 3 + webpack 閬风Щ鑷?Rspack锛屽墠绔緸 Vue 2 鍗囩礆鑷?Vue 3锛屼甫绲变竴浣跨敤 yarn 浣滅偤鍞竴 package manager銆?> 鍙冭€冨皥妗堬細`D:\projects\search-agent-go\webroot\rspack.config.js`

---

## 0. 鐝剧媭鍒嗘瀽

### 鍓嶇
| 闋呯洰 | 鐝剧媭 |
|---|---|
| 妗嗘灦 | Vue 2.6 + core-js 2 |
| 鎵撳寘宸ュ叿 | Vue CLI 3 (`vue-cli-service`) + webpack |
| 鍏冧欢 | `App.vue`, `Player.vue` (342琛?, `Search.vue` (109琛? |
| 妯ｅ紡 | SCSS (`sass` dart implementation) |
| 閫氳▕ | EventBus (`new Vue()` 瀵︿綔) + Socket.IO client v2 |
| 鎷栨洺 | `vuedraggable` v2 (Vue 2 鐗? |
| HTTP | `axios` + `qs` |
| 妯℃澘 | `public/index.html` 浣跨敤 EJS 瑾炴硶 `<%= BASE_URL %>` |

### 寰岀
| 闋呯洰 | 鐝剧媭 |
|---|---|
| 妗嗘灦 | Express + Socket.IO 2 |
| 鎵撳寘宸ュ叿 | webpack (`target: "node"`) + `webpack-node-externals` |
| 鍏ュ彛 | `src/services/WebService.js` |
| 杓稿嚭 | `dist/service.js` |
| 闄勫姞妾旀 | `swagger.json`, `Dockerfile`, `package.json` 瑜囪＝鑷?`dist/` |

### 闇€閬风Щ鐨?Vue 2 鐗规湁瀵硶锛堝凡閫愪竴鐩ら粸锛?
| 妾旀 | Vue 2 瀵硶 | Vue 3 铏曠悊鏂瑰紡 |
|---|---|---|
| `Bus.js` | `new Vue()` 浣滅偤 EventBus | 鏀圭敤 `mitt` 搴?|
| `main.js` | `new Vue({ render: h => h(App) }).$mount('#app')` | `createApp(App).mount('#app')` |
| `Player.vue` | `this.$set(array, index, value)` (澶氳檿) | Vue 3 绉婚櫎 `$set`锛屾敼鐢ㄧ洿鎺ョ储寮曡肠鍊?`array[index] = value` |
| `Player.vue` | `import draggable from "vuedraggable"` (v2) | 鏀圭敤 `vuedraggable` v4 (`vue-draggable-plus` 浜﹀彲) |
| `Player.vue` | `EventBus.$on` / `EventBus.$emit` | `emitter.on` / `emitter.emit` (mitt API) |
| `Search.vue` | `import { Promise } from 'q'` | 鏀圭敤鍘熺敓 `Promise` (绉婚櫎 `q` 渚濊炒) |
| `Search.vue` | `EventBus.$emit` | `emitter.emit` (mitt API) |
| `ChatService.js` | `EventBus.$emit` | `emitter.emit` |
| `ChatService.js` | `socket.io-client` v2 | 鍗囩礆鑷?v4 (闇€鑸囧緦绔?Socket.IO 鍚屾鍗囩礆) |
| `public/index.html` | `<%= BASE_URL %>favicon.ico` (EJS 妯℃澘) | 鏀圭偤闈滄厠璺緫 `/favicon.ico` |

---

## 1. 鍩疯闅庢

### Phase 1 鈥?鍩虹瑷柦 & 渚濊炒鏇存柊

**鐩**锛氬缓绔?Rspack 瑷畾妾旓紝鏇存柊 `package.json`锛岀鐢?npm锛屾竻鐞嗚垔瑷畾銆?
#### 1.1 鏂板妾旀

| 妾旀 | 瑾槑 |
|---|---|
| `rspack.config.js` | 鍓嶇 Rspack 瑷畾锛堝弮鑰?search-agent-go 鐨勮ō瀹氾級 |
| `rspack.config.service.js` | 寰岀 Rspack 瑷畾锛坱arget: node锛?|

#### 1.2 鍒櫎妾旀

| 妾旀 | 鍘熷洜 |
|---|---|
| `vue.config.js` | 琚?`rspack.config.js` 鍙栦唬 |
| `babel.config.js` | Rspack 浣跨敤鍏у缓 swc-loader锛屼笉闇€瑕?babel |
| `webpack.config.js` | 琚?`rspack.config.service.js` 鍙栦唬 |
| `postcss.config.js` | 鑻ヤ笉闇€瑕?autoprefixer 鍙Щ闄わ紱鑻ヤ繚鐣欏墖鏇存柊鐐?Rspack 鐩稿鏍煎紡 |
| `.browserslistrc` | 涓嶅啀浣跨敤 babel锛屽彲绉婚櫎 |

#### 1.3 `package.json` 璁婃洿

**绉婚櫎鐨勪緷璩?*锛?```
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

**鏂板鐨勪緷璩?*锛?```
dependencies:
  vue@^3.4
  mitt@^3.0
  vuedraggable@^4.1.0  (Vue 3 鐗堬紝鍗?vue-draggable-plus 鎴?vuedraggable next)
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

**鏇存柊 script**锛?```json
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

#### 1.4 绂佺敤 npm

鍦?`package.json` 鍔犲叆 `preinstall` script锛?```json
"scripts": {
  "preinstall": "npx only-allow yarn"
}
```

#### 1.5 淇 `.npmrc`

taobao mirror 宸插け鏁堬紝闇€鏇存柊鐐哄彲鐢?mirror 鎴栫洿鎺ョЩ闄よ嚜瑷?mirror锛?```
registry=https://registry.npmmirror.com
```

---

### Phase 2 鈥?鍓嶇 Rspack 瑷畾

**鐩**锛氬缓绔?`rspack.config.js`锛岀瓑鏁堢従鏈?`vue.config.js` 鍔熻兘銆?
#### 闂滈嵉灏嶆噳

| vue.config.js 鍔熻兘 | rspack.config.js 瀵︿綔 |
|---|---|
| `outputDir: dist/public` | `output.path: path.resolve(__dirname, 'dist/public')` |
| `chainWebpack: delete splitChunks` | 闋愯ō涓嶅暉鐢?splitChunks锛堟垨鎸夐渶瑷畾锛?|
| `css.loaderOptions.sass` | `module.rules` 涓ō瀹?scss rule + `sass-loader` |
| `devServer.proxy` | `devServer.proxy` (Rspack 鍏у缓鏀彺) |
| EJS 妯℃澘 `<%= BASE_URL %>` | `HtmlWebpackPlugin` + 淇敼 `index.html` 鐐洪潨鎱嬭矾寰?|
| 鐒?splitChunks 鍠竴 bundle | 淇濇寔 `optimization.splitChunks: false` |

#### `rspack.config.js` 鑽夋

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

### Phase 3 鈥?Vue 2 鈫?Vue 3 閬风Щ

**鐩**锛氫慨鏀规墍鏈夊墠绔厓浠讹紝娑堥櫎 Vue 2 鐗规湁瀵硶銆?
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

**API 灏嶆噳**锛?| Vue 2 EventBus | mitt |
|---|---|
| `EventBus.$on(event, handler)` | `EventBus.on(event, handler)` |
| `EventBus.$off(event, handler)` | `EventBus.off(event, handler)` |
| `EventBus.$emit(event, ...args)` | `EventBus.emit(event, ...args)` |

#### 3.3 `src/App.vue`

- `$on` 鈫?`on`锛堥厤鍚?mitt锛?- 鍏堕 Options API 瀵硶 Vue 3 瀹屽叏鐩稿锛屼笉闇€鏀瑰嫊

#### 3.4 `src/components/Player.vue`

| 璁婃洿闋?| 瑾槑 |
|---|---|
| `this.$set(array, index, value)` | 鍏ㄩ儴鏀圭偤 `array[index] = value`锛圴ue 3 Proxy-based reactivity 鏀彺鐩存帴绱㈠紩锛?|
| `EventBus.$on` / `$emit` | 鏀圭偤 `EventBus.on` / `EventBus.emit` |
| `import draggable from "vuedraggable"` | 纰鸿獚 v4 鐗堟湰鐨?import 鏂瑰紡 |
| `<draggable v-model="playlist">` | v4 鐨?`v-model` 瑾炴硶鍙兘鐣ユ湁涓嶅悓锛岄渶纰鸿獚 |

#### 3.5 `src/components/Search.vue`

| 璁婃洿闋?| 瑾槑 |
|---|---|
| `import { Promise } from 'q'` | 绉婚櫎锛屾敼鐢ㄥ師鐢?`Promise` |
| `EventBus.$emit` | 鏀圭偤 `EventBus.emit` |

#### 3.6 `src/services/ChatService.js`

| 璁婃洿闋?| 瑾槑 |
|---|---|
| `EventBus.$emit` | 鏀圭偤 `EventBus.emit` |
| `socket.io-client` v2 | 鍗囩礆鑷?v4锛孉PI 鍩烘湰鐩稿浣嗛渶纰鸿獚 `transports` 閬搁爡 |

#### 3.7 `public/index.html`

```html
<!-- Before -->
<link rel="icon" href="<%= BASE_URL %>favicon.ico">

<!-- After -->
<link rel="icon" href="/favicon.ico">
```

---

### Phase 4 鈥?寰岀 Rspack 鎵撳寘

**鐩**锛氬缓绔?`rspack.config.service.js`锛岀瓑鏁堢従鏈?`webpack.config.js`銆?
#### 闂滈嵉灏嶆噳

| webpack.config.js | rspack.config.service.js |
|---|---|
| `target: "node"` | `target: "node"` |
| `nodeExternals({ allowlist: [...] })` | `externalsPresets: { node: true }` + 鎵嬪嫊 `externals` |
| `CopyWebpackPlugin` | `copy-webpack-plugin` (Rspack 鐩稿) |
| `webpack.ProgressPlugin()` | 涓嶉渶瑕侊紙Rspack 鍏у缓閫插害锛?|
| `optimization.minimize: false` | `optimization.minimize: false` |
| `devtool: "none"` | `devtool: false` |

#### `rspack.config.service.js` 鑽夋

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
    // 淇濈暀闇€瑕?bundle 鐨勬ā绲勶紙绛夋晥鍘?allowlist锛?    function({ request }, callback) {
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

### Phase 5 鈥?ESLint & 宸ュ叿閺堟洿鏂?
| 妾旀 | 璁婃洿 |
|---|---|
| `.eslintrc.js` | `plugin:vue/essential` 鈫?`plugin:vue/vue3-essential`锛沗babel-eslint` 鈫?`@babel/eslint-parser` |
| `postcss.config.js` | 淇濈暀锛坅utoprefixer 浠嶅彲鐢ㄦ柤 Rspack锛夋垨绉婚櫎 |

---

### Phase 6 鈥?Socket.IO v2 鈫?v4 鍗囩礆锛堝墠寰岀鍚屾锛?
**鐩**锛氬墠寰岀 Socket.IO 鍚屾鍗囩礆鑷?v4銆?
#### 6.1 寰岀 `src/services/WebService.js`

| 璁婃洿闋?| Before (v2) | After (v4) |
|---|---|---|
| 寮曞叆 | `const SocketIO = require('socket.io')` | `const { Server } = require('socket.io')` |
| 鍒濆鍖?| `new SocketIO(server, { path: "/io" })` | `new Server(server, { path: "/io", cors: { origin: "*" } })` |
| 寤ｆ挱 | `socket.to("chat").emit("msg", msg)` | 涓嶈畩锛坴4 浠嶆敮鎻存瑾炴硶锛?|

#### 6.2 鍓嶇 `src/services/ChatService.js`

| 璁婃洿闋?| Before (v2) | After (v4) |
|---|---|---|
| 寮曞叆 | `import io from 'socket.io-client'` | `import { io } from 'socket.io-client'` |
| 閫ｇ窔 | `io(this.API, { path: "/io", transports: [...] })` | `io(this.API, { path: "/io", transports: ["websocket", "polling"] })` |

---

### Phase 7 鈥?Docker Image 鍗囩礆

**鐩**锛歚node:13-alpine` 鈫?`node:18-alpine`銆?
#### `src/services/Dockerfile`

```dockerfile
# Before
FROM node:13-alpine

# After
FROM node:18-alpine
```

---

### Phase 8 鈥?椹楄瓑

| 姝ラ | 鍛戒护 | 闋愭湡绲愭灉 |
|---|---|---|
| 1. Lint | `yarn lint` | 鐒￠尟瑾?|
| 2. 鍓嶇鎵撳寘 | `yarn build` | `dist/public/` 鐢㈠嚭鎴愬姛 |
| 3. 寰岀鎵撳寘 | `yarn build:service` | `dist/service.js` 鐢㈠嚭鎴愬姛 |
| 4. Dev server | `yarn serve` | 鍓嶇 dev server 鍟熷嫊锛宲roxy 姝ｅ父 |
| 5. 寰岀鍟熷嫊 | `yarn web` | Express 鍦?:8011 姝ｅ父鍟熷嫊 |
| 6. 鎵嬪嫊娓│ | 鐎忚鍣ㄩ枊鍟熷墠绔?| 鎾斁銆佹悳灏嬨€佹嫋鏇冲姛鑳芥甯?|

---

## 2. 姹虹瓥瑷橀寗锛堝凡纰鸿獚锛?
| # | 鍟忛 | 姹虹瓥 | 鍘熷洜 |
|---|---|---|---|
| 1 | 鏄惁寮曞叆 TypeScript锛?| **鍚?* | 鐝炬湁绋嬪紡纰煎叏 JS锛屽紩鍏?TS 鏈冨ぇ骞呭鍔犲伐浣滈噺 |
| 2 | 鏄惁鏀圭敤 Composition API锛?| **鍚?* | Vue 3 瀹屽叏鐩稿 Options API锛屾敼鍕曢噺鏈€灏?|
| 3 | Socket.IO 鏄惁鍗囩礆鑷?v4锛?| **鏄?* | v2 宸查亷鏅傦紝鍓嶅緦绔渶鍚屾鍗囩礆 |
| 4 | `vuedraggable` 鍗囩礆鏂规锛?| **vuedraggable v4** (SortableJS/vue.draggable.next) | 鏈€鎺ヨ繎鍘?v2 API锛屾敼鍕曟渶灏?|
| 5 | 鏄惁寮曞叆 `q` 鐨勬浛浠ｏ紵 | **绉婚櫎 `q`** | Search.vue 涓?`import { Promise } from 'q'` 鍙洿鎺ョ敤鍘熺敓 Promise 鍙栦唬 |
| 6 | Docker base image 鏄惁鍗囩礆锛?| **鏄紝鍗囩礆鑷?node:18-alpine** | node:13 宸?EOL锛屼竴浣佃檿鐞?|

---

## 3. 棰ㄩ毆瑭曚及

| 棰ㄩ毆 | 褰遍熆 | 绶╄В鎺柦 |
|---|---|---|
| `vuedraggable` v4 API 宸暟 | 鎷栨洺鍔熻兘鍙兘闇€瑾挎暣 | 鍏堥璀?v4 鐨?`v-model` 鍜?event 瑾炴硶 |
| Socket.IO v2鈫抳4 breaking changes | 鍓嶅緦绔€氳▕鍙兘涓柗 | 闇€鍚屾檪鍗囩礆鍓嶅緦绔紱娓│ WebSocket 閫ｇ窔 |
| Rspack 灏?SCSS 鐨勮檿鐞嗘柟寮忎笉鍚?| 妯ｅ紡鍙兘鐣板父 | 鍙冭€冨皥妗堝凡椹楄瓑 SCSS 鍙敤 |
| `listen1_chrome_extension` git 渚濊炒 | yarn install 鍙兘澶辨晽 | 纰鸿獚 git URL 鍙瓨鍙?|
| `global` 鐗╀欢锛堝墠绔級 | Vue 3 涓嶅啀浣跨敤 `global` | `ChatService.js` / `SearchService.js` / `SongService.js` 涓殑 `global.WS_URL` 绛夐渶鏀圭偤 `window.WS_URL` 鎴栧緸 `index.html` 鐨?script 璁婃暩璁€鍙?|

---

## 4. 妾旀褰遍熆绡勫湇

### 淇敼锛垀15 鍊嬫獢妗堬級
- `package.json`
- `.npmrc`
- `.eslintrc.js`
- `public/index.html`
- `src/main.js`
- `src/App.vue`
- `src/components/Player.vue`
- `src/components/Search.vue`
- `src/services/Bus.js`
- `src/services/ChatService.js`锛圗ventBus API + Socket.IO v4锛?- `src/services/SearchService.js`锛坄global` 鈫?`window`锛?- `src/services/SongService.js`锛坄global` 鈫?`window`锛?- `src/services/WebService.js`锛圫ocket.IO v4 API锛?- `src/services/Dockerfile`锛坣ode:13 鈫?node:18锛?- `src/services/package.json`锛坰ocket.io v2 鈫?v4锛?
### 鏂板锛? 鍊嬫獢妗堬級
- `rspack.config.js`
- `rspack.config.service.js`

### 鍒櫎锛?~5 鍊嬫獢妗堬級
- `vue.config.js`
- `babel.config.js`
- `webpack.config.js`
- `postcss.config.js`锛堝彲閬革級
- `.browserslistrc`锛堝彲閬革級

### 涓嶆敼鍕?- 寰岀 provider 妯＄祫锛坄src/services/provider/*`锛?- 娓│妾旀锛坄tests/*`锛?- `src/services/MusieApi.js`
- SCSS 妯ｅ紡妾旀

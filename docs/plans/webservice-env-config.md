# WebService 引入 env 配置

## 需求
為 `src/services/WebService.ts` 引入環境變數配置，優先級為：
**CLI args > .env file > OS env**

## 實作方案

### 1. 新增 dotenv 依賴
在 `src/services/package.json` 加入 `dotenv` 依賴。

### 2. WebService.ts 修改
在檔案開頭載入 dotenv，並將 `process.env` 作為 `cli.parse()` 的預設值：

```ts
import dotenv from "dotenv";

// 載入 .env，覆蓋 OS env（.env 優先於 OS env）
dotenv.config({ override: true });

// CLI args 優先於 env（cli.parse 會用 env 值作為 default，但有傳 CLI 時回傳 CLI 值）
const options = cli.parse({
  host: ["b", "web server listen on address", "ip", process.env.HOST || "0.0.0.0"],
  port: ["p", "listen on port", "string", process.env.PORT || "8011"],
  webroot: ["d", "web root path", "string", process.env.WEBROOT || "./public"],
});
```

### 3. 更新 package.json script
將 `service` script 中的 env 變數名稱統一：
```json
"service": "node ./service.js -b $HOST -d $WEBROOT -p $PORT"
```

## 優先級說明
1. **CLI args**（最高）：`cli.parse()` 解析命令列參數，有傳就用
2. **.env file**：`dotenv.config({ override: true })` 載入 `.env`，覆蓋 OS env
3. **OS env**（最低）：系統環境變數作為最終 fallback

## 驗證步驟
1. `yarn lint`
2. `yarn build:service`
3. 測試優先級：
   - 設定 OS env `HOST=1.2.3.4`
   - 設定 .env `HOST=5.6.7.8`
   - 不傳 CLI → 應使用 5.6.7.8
   - 傳 `--host 9.9.9.9` → 應使用 9.9.9.9

## 完成狀態
- [x] 新增 dotenv 依賴至 `src/services/package.json`
- [x] 修改 `WebService.ts` 引入 dotenv 並設定優先級
- [x] 更新 `package.json` script 使用 `$WEBROOT`
- [x] Lint 驗證通過（0 errors）
- [x] Build 驗證通過（compiled successfully）

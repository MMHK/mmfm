# WebService 增強：參數輸出、優雅退出、日誌級別

## 需求
1. 啟動時輸出完整參數資訊
2. 加入優雅退出（graceful shutdown）
3. 增強 debug log 及 log level 支援

## 實作方案

### 1. 新增簡易 Logger 模組
建立 `src/services/logger.ts`，提供分級日誌（error/warn/info/debug），由 `LOG_LEVEL` 環境變數控制：

```ts
const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL || "info"] ?? 2;

export const logger = {
  error: (...args) => currentLevel >= 0 && console.error("[ERROR]", ...args),
  warn:  (...args) => currentLevel >= 1 && console.warn("[WARN]", ...args),
  info:  (...args) => currentLevel >= 2 && console.log("[INFO]", ...args),
  debug: (...args) => currentLevel >= 3 && console.log("[DEBUG]", ...args),
};
```

### 2. WebService.ts 修改

#### 2.1 加入 LOG_LEVEL 到 env 配置
```ts
const logLevel = process.env.LOG_LEVEL || "info";
```

#### 2.2 啟動時輸出完整參數資訊
```ts
logger.info("=== MMFM Server Started ===");
logger.info(`Host     : ${options.host}`);
logger.info(`Port     : ${options.port}`);
logger.info(`Web Root : ${webRoot}`);
logger.info(`Log Level: ${logLevel}`);
logger.info(`PID      : ${process.pid}`);
```

#### 2.3 優雅退出
監聽 SIGINT/SIGTERM，關閉 Socket.IO、HTTP server，記錄關閉日誌：
```ts
function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  io.close();
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 5000);
}
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
```

#### 2.4 替換既有 console.* 為 logger.*
將檔案中所有 `console.log` / `console.error` 替換為對應的 `logger.info` / `logger.error`。

#### 2.5 加入 debug 級別日誌
在關鍵位置加入 debug log：
- Socket.IO 連線/斷線事件
- API 請求進入
- 檔案下載開始/完成

### 3. 新增 LOG_LEVEL 到 .env.example
```
# 日誌級別: error, warn, info, debug
LOG_LEVEL=info
```

### 4. 更新 package.json script
service script 加入 LOG_LEVEL 環境變數支援（可選）。

## 驗證步驟
1. `yarn lint`
2. `yarn build:service`
3. 測試不同 LOG_LEVEL 的輸出
4. 測試 SIGINT 優雅退出

## 完成狀態
- [x] 建立 `src/services/logger.ts` 分級日誌模組
- [x] 修改 `WebService.ts`：import logger、替換 console.* 為 logger.*、加入 debug log
- [x] 新增啟動參數輸出（host, port, webroot, logLevel, PID）
- [x] 新增優雅退出（SIGINT/SIGTERM handler）
- [x] 新增 `logLevel` CLI 選項 (`-l`)
- [x] 更新 `.env.example` 加入 `LOG_LEVEL=info`
- [x] Lint 驗證通過（0 errors）
- [x] Build 驗證通過（compiled successfully）

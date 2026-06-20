# Add Debug Logs to YtDlpService

## Problem
`runYtDlp` 函數缺少詳細 debug log，無法排查 yt-dlp 執行問題。

## Solution
加入 debug level logging（需設定 `LOG_LEVEL=debug` 啟用）：

1. **spawn 前**: 記錄 CMD + 完整 args
2. **stderr 即時輸出**: 逐行 debug log（yt-dlp 把進度資訊寫到 stderr）
3. **close 時**: 記錄 exit code + PID + 執行耗時
4. **error 時**: 補充 PID

## Changes

### File: `src/services/YtDlpService.ts`

修改 `runYtDlp` 函數：

```ts
function runYtDlp(args: string[], platform?: CookiePlatform): Promise<string> {
  if (platform && cookieExists(platform)) {
    args = ["--cookies", cookiePath(platform), ...args];
  }
  return new Promise((resolve, reject) => {
    logger.debug(`[yt-dlp] spawn: ${CMD} ${args.join(" ")}`);
    const startTime = Date.now();
    const proc = spawn(CMD, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    proc.stderr.on("data", (chunk) => {
      const msg = chunk.toString();
      stderr += msg;
      logger.debug(`[yt-dlp:stderr] ${msg.trim()}`);
    });

    proc.on("close", (code) => {
      const elapsed = Date.now() - startTime;
      const pidMsg = `pid=${proc.pid}`;
      if (code !== 0) {
        logger.error(`[yt-dlp] exited code=${code} ${pidMsg} (${elapsed}ms): ${stderr.trim()}`);
        return reject(
          new Error(`yt-dlp exited with code ${code}: ${stderr.trim()}`),
        );
      }
      logger.debug(`[yt-dlp] exited code=0 ${pidMsg} (${elapsed}ms) stdout=${stdout.length}bytes`);
      resolve(stdout);
    });

    proc.on("error", (err) => {
      logger.error(`[yt-dlp] spawn failed pid=${proc.pid}: ${err.message}`);
      reject(err);
    });
  });
}
```

## Verification
1. `yarn lint`
2. `yarn build`

## Status
- [x] Delegate to sub agent
- [x] Verify lint passes
- [x] Verify build passes

**完成日期**: 2026-06-20

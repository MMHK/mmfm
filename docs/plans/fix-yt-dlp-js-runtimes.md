# Fix: yt-dlp --js-runtimes Configuration

## Problem
`src/services/YtDlpService.ts` 中硬編碼了 Unix 路徑 `deno:/usr/local/bin/deno`，但：
1. 部署環境 deno 已在 PATH 中，不需要指定路徑
2. Windows 環境下此路徑無效
3. yt-dlp 預設使用 deno runtime，可完全移除此參數

## Solution
移除所有 `--js-runtimes deno:/usr/local/bin/deno` 參數，使用預設配置。

## Changes Required

### File: `src/services/YtDlpService.ts`

**Line 91-98** (`resolve` function):
```ts
// Before
const args = [
  "--js-runtimes",
  "deno:/usr/local/bin/deno",
  "--dump-json",
  ...
];

// After
const args = [
  "--dump-json",
  ...
];
```

**Line 112-119** (`search` function):
```ts
// Before
runYtDlp([
  "--js-runtimes",
  "deno:/usr/local/bin/deno",
  "--dump-json",
  ...
])

// After
runYtDlp([
  "--dump-json",
  ...
])
```

**Line 140-154** (`download` function):
```ts
// Before
const args = [
  "--js-runtimes",
  "deno:/usr/local/bin/deno",
  "-x",
  ...
];

// After
const args = [
  "-x",
  ...
];
```

## Verification
1. `yarn lint`
2. `yarn build`
3. `yarn build:service`

## Status
- [x] Delegate to sub agent
- [x] Verify lint passes
- [x] Verify build passes

**完成日期**: 2026-06-20

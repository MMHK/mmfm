# Fix: JS Runtime Configuration

## Problem
1. Dockerfile 中 deno 安裝失敗 - `/root/.deno/bin/deno` 不存在
2. YouTube signature 解決需要 JS runtime
3. 容器中已有 Node.js v22，可作為替代

## Solution
- **主要**: 使用 node 作為 JS runtime（已存在 v22）
- **備用**: 修復 deno 安裝

## Changes

### 1. YtDlpService.ts
加入 `--js-runtimes node` 到所有 yt-dlp 調用，明確指定 node 為主 runtime

### 2. Dockerfile (可選)
修復 deno 安裝，作為備用 runtime

## Verification
1. lint + build
2. 在容器內測試 YouTube 搜索

## Final Solution

### Root Cause
Alpine Linux 用 musl libc，deno 二進制用 glibc 編譯，導致 "no such file or directory" 錯誤。

### Fix
1. **Dockerfile**: 改用 `apk add deno` 安裝 Alpine 原生 musl 版本
2. **YtDlpService.ts**: 移除 `--js-runtimes` 參數，使用 yt-dlp 預設的 deno runtime

### Verification
- `deno 2.3.1 (stable, release, x86_64-alpine-linux-musl)` ✅
- `yt-dlp --dump-json ytsearch1:test` ✅ 搜索成功，無 signature 警告

## Status
- [x] Delegate sub agent for YtDlpService.ts
- [x] Delegate sub agent for Dockerfile
- [x] Verify - YouTube search with deno runtime works!

**完成日期**: 2026-06-20

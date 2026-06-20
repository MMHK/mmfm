# search timeout

**Status**: completed
**Date**: 2026-06-20

## Goal
Add timeout mechanism to `src/services/YtDlpService.ts` `search()` function so that slow/hanging vendors do not block collection of results from other vendors.

## Problem
- Each vendor (youtube/bilibili) calls `runYtDlp` which spawns a yt-dlp process
- No timeout exists on the spawned process
- If one vendor hangs, `Promise.all` waits forever
- Currently `.catch(() => [])` already handles errors, so "collect as many results as possible" is already handled — only the hang/timeout case is missing

## Plan
Single file change: `src/services/YtDlpService.ts`

1. Add optional `timeout?: number` parameter to `runYtDlp`
2. When set, use `setTimeout` to call `proc.kill()` after timeout, rejecting with a timeout error
3. Clear timeout on normal close/error to avoid leaks
4. In `search()`, pass a per-vendor timeout (default `30000` ms)

## Notes
- Keep per-vendor timeout independent — one timeout must not affect others
- `Promise.all` + per-promise timeout + existing `.catch(() => [])` already collects results from all non-timed-out vendors

## Tasks
- [x] Add timeout param to `runYtDlp`
- [x] Pass timeout in `search()` per vendor
- [x] Run lint + build to verify

## Outcome
- Added `timeout?: number` param to `runYtDlp` with `timedOut` guard to prevent double-settlement
- Added `SEARCH_TIMEOUT = 30000` (30s) per-vendor timeout in `search()`
- Timed-out vendors are caught by existing `.catch(() => [])` — results from other vendors still collected
- Lint: 0 errors (13 pre-existing warnings, none in YtDlpService.ts)
- Build: successful

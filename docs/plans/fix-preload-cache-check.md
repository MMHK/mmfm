# Fix preload API cache file check

## Problem
1. Cache hit check uses wrong path: `fs.existsSync(cacheDir/<hash>)` (no extension), but yt-dlp writes `cacheDir/<hash>.mp3`
2. No file existence check after download completes

## Fix (2 changes in `WebService.ts:200-236`)
1. Add `cachedFile = path.join(cacheDir, \`${hash}.mp3\`)` 
2. Change cache hit: `fs.existsSync(cachedFile)`
3. After download, verify `fs.existsSync(cachedFile)` before returning success

## Status
- [x] Implementation
- [x] Verification (lint + build)

## Additional Fix (SongService.ts)
- [x] Propagate error message in preload rejection

Changed `Promise.reject()` to `Promise.reject(data.error)` so callers get the actual error.
Also added `error?: string` to `PreloadResponse` interface.

Verification passed: lint + frontend build.
1. Added `cachedFile` variable with `.mp3` extension
2. Cache hit check now uses `cachedFile` (correct path)
3. After download, verifies `cachedFile` exists before returning success

Verification passed:
- Lint: 0 errors
- Frontend build: success
- Backend build: success

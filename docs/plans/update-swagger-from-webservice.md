# Plan: Update swagger.json to match WebService.ts

## Background
`src/services/swagger.json` is outdated relative to the actual `src/services/WebService.ts` implementation. The API now uses yt-dlp to resolve YouTube/Bilibili tracks instead of QQ/NetEase/Xiami providers, and several endpoint signatures have changed.

---

## Task List

### Task 1 — Fix outdated info block
- Change `info.description` and `info.title` to reflect current MMFM + yt-dlp API (remove references to QQ/NetEase/Xiami)

### Task 2 — Update tag description
- Change `song` tag description to match current service (remove "QQ NetEase Xiami")

### Task 3 — Fix `/api/song/search`
- Remove `offset` query parameter (not present in WebService.ts anymore)
- Keep `keyword` (required, string)

### Task 4 — Fix `/api/song/detail`
- Remove `vendor` query parameter (not present in WebService.ts; only `id` is used)
- Change `id` type from `number` to `string` (Web service reads it as a string URL)

### Task 5 — Fix `/api/song/url`
- Change `id` type from `number` to `string` (id is a URL string, not numeric)

### Task 6 — Fix `/song/preload`
- Change `consumes` to `application/json` (TS uses `bodyParser.json()`, reads `req.body.url`)
- Add response schema

### Task 7 — Fix `/song/save`
- Confirm `consumes` matches `bodyParser.json()` usage — update to `application/json`
- (TS uses `req.body.list`, read from JSON body)

### Task 8 — Add response schemas (definitions block)
Define reusable schemas under `definitions`:
- `Song`: `{ id, name, artists: [{name}], album: {cover}, link, vendor }`
- `SongGroup`: `{ total: number, songs: Song[] }`
- `SearchResponse`: `{ status: boolean, data: { youtube: SongGroup, bilibili: SongGroup } }`
- `DetailResponse`: `{ status: boolean, data: Song }`
- `UrlResponse`: `{ status: boolean, data: string }`
- `PreloadResponse`: `{ status: number|boolean, url?: string, error?: string }`
- `ErrorResponse`: `{ status: false, error: string }`

### Task 9 — Add Socket.IO WebSocket note
- Add a top-level `x-websocket` or `description` field documenting Socket.IO on path `/io` (events: `msg`, `disconnect`, `error`) since Swagger 2.0 cannot natively express WebSocket protocols

---

## Status

| Task | Status     | Notes                                                |
|------|------------|------------------------------------------------------|
| 1    | ✅ Done    | `info.title` → `"MMFM Music API"`, description updated |
| 2    | ✅ Done    | Tag description updated                              |
| 3    | ✅ Done    | Removed `offset` param from `/api/song/search`      |
| 4    | ✅ Done    | Removed `vendor` from `/api/song/detail`; `id` → `string` |
| 5    | ✅ Done    | `id` → `string` in `/api/song/url`                  |
| 6    | ✅ Done    | `/song/preload`: `consumes` → `application/json`, body schema |
| 7    | ✅ Done    | `/song/save`: `consumes` → `application/json`, body schema  |
| 8    | ✅ Done    | Added `definitions` block with all reusable schemas  |
| 9    | ✅ Done    | Added `x-websocket` vendor extension for Socket.IO   |

## Outcome
`swagger.json` now accurately reflects all HTTP endpoints in `WebService.ts`, with correct parameters, types, consumes, and response schemas.

## Verification
- JSON syntax: ✅ valid
- `yarn build:service`: ✅ compiled successfully

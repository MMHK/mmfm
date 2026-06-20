# JS to TS Migration + Remove Dead Providers

## Status: Completed

---

## Phase 1: Remove Dead Providers (migu, kuwo, qq) — COMPLETED

### Tasks
- [x] Delete `src/services/provider/migu.js`
- [x] Delete `src/services/provider/kuwo.js`
- [x] Delete `src/services/provider/qq.js`
- [x] Delete `tests/mocha.migu.test.js`
- [x] Delete `tests/mocha.kuwo.test.js`
- [x] Delete `tests/mocha.qq.test.js`
- [x] Update `src/services/MusieApi.ts` — removed imports, search aggregation, url switch cases for migu/kuwo/qq
- [x] Clean `package.json` — removed `uuidjs` (only used by deleted migu provider)

### Outcome
- 6 files deleted, MusieApi.js updated to only use netease/bilibili/kugou
- `uuidjs` removed from both root and backend package.json
- `tests/mocha.musicApi.test.js` updated with valid netease track IDs

---

## Phase 2: JS → TypeScript Migration — COMPLETED

### Config
- [x] Add `tsconfig.json` (strict: false, allowJs: true, target: ES2020)
- [x] Install `typescript ^5.4.0`, `@typescript-eslint/parser ^7.0.0`, `@typescript-eslint/eslint-plugin ^7.0.0`
- [x] Update `rspack.config.js` — resolve `.ts`, SWC loader handles `[jt]s`, entry → `main.ts`
- [x] Update `rspack.config.service.js` — resolve `.ts`, entry → `WebService.ts`
- [x] Update ESLint flat config with TS parser + plugin for `**/*.ts` files

### Backend Core Conversion
- [x] `Bus.js` → `Bus.ts` — Added mitt Event types
- [x] `MusieApi.js` → `MusieApi.ts` — Defined Track, SearchResult, SearchResponse interfaces
- [x] `WebService.js` → `WebService.ts` — Express/Socket.IO typed handlers

### Provider Conversion
- [x] `bilibili.js` → `bilibili.ts`
- [x] `netease.js` → `netease.ts`
- [x] `kugou.js` → `kugou.ts`
- [x] `runtime.js` → `runtime.ts` (unused, converted for consistency)

### Frontend Services Conversion
- [x] `SearchService.js` → `SearchService.ts` — Added interfaces for search responses
- [x] `SongService.js` → `SongService.ts` — Added PlaylistItem, SongInput interfaces
- [x] `ChatService.js` → `ChatService.ts` — Typed Socket.IO client and control methods

### Vue Components Conversion
- [x] `App.vue` — `<script lang="ts">`
- [x] `Player.vue` — `<script lang="ts">`
- [x] `Search.vue` — `<script lang="ts">`
- [x] `main.js` → `main.ts`

### Verification
- [x] `yarn lint` — 0 errors (81 warnings for `no-explicit-any` / `no-unused-vars`, set to warn)
- [x] `yarn build` — compiled successfully (11 pre-existing Sass/size warnings)
- [x] `yarn build:service` — compiled successfully

### Outcome
All source files converted from JS to TS. `strict: false` mode with `any` usage allowed as warnings. Build pipeline fully operational.

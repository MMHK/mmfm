# Plan: Frontend Promise to Async/Await Conversion

## Goal
Convert all Promise chain usage (`.then()`, `.catch()`, `.finally()`) to `async/await` syntax in the frontend codebase.

## Scope: 5 files, 11 chain blocks, 17 chain call sites

---

## Task 1 — `src/components/Search.vue` (HIGH)

### Method: `add()` (lines 143-162)
- Convert `.then().finally()` to `async/await` with `try/finally`

### Method: `fetchSearch()` (lines 164-183)
- Convert `.then().catch().finally()` to `async/await` with `try/catch/finally`

---

## Task 2 — `src/components/Player.vue` (HIGH)

### Method: `addSong()` (lines 293-311)
- Convert nested `.then().then()` to sequential `await` calls (flattens callback pyramid)
- Add `try/catch` (currently missing error handling)

### Method: `updatePlaylist()` (lines 318-331)
- Convert single `.then()` to `async/await`

### Method: `sortPlayList()` (lines 334-357)
- Convert single `.then()` to `async/await`

---

## Task 3 — `src/services/SearchService.ts` (MEDIUM)

### Method: `search()` (lines 70-104)
- Convert `.then()` to `async/await`
- Replace `Promise.resolve()` / `Promise.reject()` anti-patterns with `return` / `throw`

### Method: `detail()` (lines 107-121)
- Convert `.then()` to `async/await`
- Replace `Promise.resolve()` / `Promise.reject()` anti-patterns

---

## Task 4 — `src/services/SongService.ts` (MEDIUM)

### Method: `preload()` (lines 56-69)
- Convert `.then()` to `async/await`
- Replace `Promise.resolve()` / `Promise.reject()` anti-patterns

---

## Task 5 — `src/services/YtDlpService.ts` (LOW)

### Function: `resolve()` (line 95)
- Convert single-line `.then()` to `async/await`

### Function: `search()` (lines 107-129)
- Convert `.map()` callback with `.then().catch()` to `async` arrow function
- Convert final `Promise.all().then()` to `await Promise.all()`

### Function: `download()` (line 150)
- Convert single-line `.then()` to `async/await`

---

## Constraints
- No behavior changes — pure syntactic transformation only
- Preserve all existing error handling semantics
- Methods on Vue components become `async` methods (safe in Vue 3 Options API)
- Service methods remain returning `Promise<T>` (async functions are still Promise-returning)
- No new dependencies or abstractions added

## Verification
1. `yarn lint` — ensure no lint errors
2. `yarn build` — ensure frontend builds successfully

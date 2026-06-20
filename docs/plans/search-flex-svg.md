# Search.vue flex layout + SVG vendor icons

## Goal
Replace the `<table>` layout in Search.vue result list with CSS flex columns,
and replace the vendor PNG `<img>` tags with inline SVG icons (Simple Icons).

---

## Tasks

### Task 1 — Add SVG files for YouTube and Bilibili
- Create `src/assets/image/youtube.svg` and `src/assets/image/bilibili.svg`
- Use Simple Icons SVG paths (viewBox 0 0 24 24, single `<path>` each)
- These are loaded as `asset/resource` by rspack (same rule as PNG/GIF/SVG)

### Task 2 — Replace table template with flex layout
**File:** `src/components/Search.vue`

Replace `<table class="table">` with a `<div class="song-list">` container,
each row `<div class="song-row">` containing three flex columns:
```
<div class="song-list">
  <div class="song-row" v-for="item in songList" :key="item.id">
    <div class="col-vendor"> <!-- vendor SVG --> </div>
    <div class="col-cover"> <!-- cover image --> </div>
    <div class="col-info">  <!-- title + author + add button --> </div>
  </div>
</div>
```

- Replace `<img :src="'image/' + item.vendor + '.png'">` with an `<svg>` element
  or a computed `:src` that imports the SVG files via `require()`

### Task 3 — Update SCSS styles
**File:** `src/assets/style/_search.scss`
- Remove `.table` styles
- Add `.song-list`, `.song-row` with `display: flex`
- Add `.col-vendor`, `.col-cover`, `.col-info` column styles

### Task 4 — Verification
- `yarn lint` — must pass
- `yarn build` — must succeed, no errors

---

## Files changed
| File | Change |
|------|--------|
| `src/assets/image/youtube.svg` | new file |
| `src/assets/image/bilibili.svg` | new file |
| `src/components/Search.vue` | template change: table → flex |
| `src/assets/style/_search.scss` | style change: table → flex |

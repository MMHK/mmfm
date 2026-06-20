# Cookie Panel Enhancement Plan

## Task
Enhance the Cookie 設定 (Cookie Settings) panel in `src/components/Search.vue` to:
1. Add a simple instruction about using a Chrome extension to export cookies to cookie.txt
2. Add homepage links for each vendor (YouTube and Bilibili)

## Current State
The cookie settings panel (lines 24-49) currently contains:
- A header "Cookie 設定"
- Two cookie blocks for YouTube and Bilibili, each with:
  - Vendor name and status indicator
  - File input for .txt cookie file
  - Upload button

## Implementation Plan

### Changes to `src/components/Search.vue`

#### 1. Add instruction text
- Add a small instruction section after the panel header (after line 26)
  - Suggest using a Chrome extension "Get cookies.txt LOCALLY"
  - Explain the workflow: visit YouTube/Bilibili → export cookies → save as cookie.txt → upload

#### 2. Add vendor homepage links
- Add links to each vendor's homepage in their cookie block
- YouTube: https://www.youtube.com
- Bilibili: https://www.bilibili.com
- Links should open in new tab (target="_blank")

### Code Structure

```
settings-panel
├── settings-header (existing)
│   ├── h3: "Cookie 設定"
│   └── close button
├── settings-description (NEW)
│   └── instruction text about Chrome extension
└── cookie-block × 2 (enhanced)
    ├── cookie-label (existing)
    │   ├── vendor name
    │   ├── homepage link (NEW)
    │   └── status indicator
    ├── file input (existing)
    └── upload button (existing)
```

### Implementation Details

#### Description Text (simplified Chinese)
```
使用 Chrome 扩展 "Get cookies.txt LOCALLY"：
1. 打开对应平台首页并登录
2. 点击扩展图标 → 导出/下载 cookies.txt
3. 在下方上传 .txt 档案
```

#### Homepage Links
- YouTube: `[YouTube 首页](https://www.youtube.com)` 
- Bilibili: `[哔哩哔哩 首页](https://www.bilibili.com)`

#### Styling
- Follow existing patterns in the file
- Small, muted text for description
- Links should be visually distinct and accessible

## Verification
1. Run `yarn lint` to check code style
2. Run `yarn build` to verify no build errors
3. Manual test: verify the UI displays correctly with helpful instructions

## File Changes
- `src/components/Search.vue`: 2 sections modified (add description + add links)

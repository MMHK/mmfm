# Qwen Plus 模型加速配置

## 問題分析

當前配置中，三個 Qwen plus 模型（qwen3.5-plus、qwen3.6-plus、qwen3.7-plus）都有以下問題：

1. **`budgetTokens: 2048` 無效**：API endpoint (`coding.dashscope.aliyuncs.com`) 的 reasoning_options 僅支援 `toggle` 類型，不支援 `budget_tokens`。此配置可能被忽略或導致意外行為。
2. **缺乏速度控制**：無法在需要速度時快速切換到無思考模式。

## 解決方案

### 修改內容

對每個 plus 模型進行以下調整：

1. **修正 thinking 配置**：移除 `budgetTokens`，保留 `type: "enabled"`
2. **新增 fast variant**：建立 `fast` variant，設定 `thinking.type: "disabled"`

### 配置變更

**變更前**：
```json
"qwen3.7-plus": {
    "name": "Qwen3.7 Plus (通用/多模態強，帶思考)",
    "options": {
        "thinking": {
            "type": "enabled",
            "budgetTokens": 2048
        }
    },
    "modalities": { "input": ["text", "image"] }
}
```

**變更後**：
```json
"qwen3.7-plus": {
    "name": "Qwen3.7 Plus (通用/多模態強，帶思考)",
    "options": {
        "thinking": {
            "type": "enabled"
        }
    },
    "variants": {
        "fast": {
            "thinking": {
                "type": "disabled"
            }
        }
    },
    "modalities": { "input": ["text", "image"] }
}
```

### 使用方式

- **預設模式**：思考開啟（較慢但品質高）
- **快速模式**：使用 `ctrl+t` 切換到 `fast` variant（無思考，速度快）
- 在模型選擇器中會顯示為：
  - `bailian-coding-plan-test/qwen3.7-plus`（預設）
  - `bailian-coding-plan-test/qwen3.7-plus:fast`（快速）

## 受影響的模型

- `qwen3.5-plus`
- `qwen3.6-plus`
- `qwen3.7-plus`

## 驗證步驟

1. 修改 `opencode.json`
2. 重啟 opencode
3. 使用 `/models` 確認 variant 出現
4. 使用 `ctrl+t` 測試切換

## 預期效果

- 移除無效的 `budgetTokens` 參數
- 可透過 `ctrl+t` 快速切換思考/無思考模式
- 無思考模式下回應速度顯著提升

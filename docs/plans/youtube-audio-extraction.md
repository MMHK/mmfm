# YouTube 音频信息获取功能规划

## 概述

实现从 YouTube URL 提取音频信息的功能，包括：
- 后端新增 `/youtube/audio-info` 接口
- 前端 Player 组件支持粘贴 YouTube 链接并添加歌曲
- 加入 loading 状态和 toast 提示

## 涉及文件

1. `src/services/YtDlpService.ts` - 新增 audioInfo 方法
2. `src/services/WebService.ts` - 新增 /youtube/audio-info 路由
3. `src/services/swagger.json` - 同步 API 文档
4. `src/components/Player.vue` - 前端交互逻辑

## 详细实施步骤

### 步骤 1: YtDlpService.ts

新增 `audioInfo(url: string): Promise<PlaylistItem>` 方法：

```typescript
// 在文件顶部 import 区添加
import type { PlaylistItem } from "./SongService";

// 在文件末尾新增
export async function audioInfo(url: string): Promise<PlaylistItem> {
  const meta = await resolve(url);  // 沿用现有 resolve() 方法
  // 返回 PlaylistItem 格式，src 保留为原始 URL（后续通过 preload 解析）
  return {
    id: meta.webpage_url,
    name: meta.title,
    author: meta.uploader,
    cover: meta.thumbnail || "",
    src: url  // 保留原始 URL
  };
}
```

### 步骤 2: WebService.ts

新增路由分组 `/youtube`：

```typescript
// 在文件顶部 import 区添加 audioInfo
import {
  resolve,
  search,
  download,
  audioInfo,  // 新增
  CookieError,
  type YtDlpMetadata,
} from "./YtDlpService";

// 在 /song/* 路由之后、Socket.IO 初始化之前添加新路由组
app.get("/youtube/audio-info", async (req: Request, res: Response) => {
  const url = req.query.url as string;

  if (!url) {
    res.status(400).send({ status: false, error: "Missing url parameter" });
    return;
  }

  try {
    const audioItem = await audioInfo(url);
    res.send(audioItem);
  } catch (e) {
    if (e instanceof CookieError) {
      res.status(400).send({
        status: false,
        cookieNeed: [e.platform],
        error: `Cookie 驗證失敗: ${e.platform}`,
      });
      return;
    }
    res.status(500).send({ status: false, error: (e as Error).message });
  }
});
```

### 步骤 3: swagger.json

增量更新现有 `src/services/swagger.json`：

**3.1** 在 `tags` 数组中新增 `youtube` 标签：

```json
{ "name": "youtube", "description": "YouTube audio extraction" }
```

**3.2** 在 `paths` 对象中新增 `/youtube/audio-info`：

```json
"/youtube/audio-info": {
  "get": {
    "tags": ["youtube"],
    "summary": "get YouTube audio info (PlaylistItem format)",
    "produces": ["application/json"],
    "parameters": [
      {
        "name": "url",
        "in": "query",
        "type": "string",
        "description": "YouTube video URL",
        "required": true
      }
    ],
    "responses": {
      "200": {
        "description": "Success",
        "schema": { "$ref": "#/definitions/PlaylistItem" }
      },
      "400": {
        "description": "Bad request",
        "schema": { "$ref": "#/definitions/ErrorResponse" }
      },
      "500": {
        "description": "Server error",
        "schema": { "$ref": "#/definitions/ErrorResponse" }
      }
    }
  }
}
```

**3.3** 在 `definitions` 中新增 `PlaylistItem`：

```json
"PlaylistItem": {
  "type": "object",
  "properties": {
    "id": { "type": "string", "description": "Video page URL" },
    "name": { "type": "string", "description": "Track title" },
    "author": { "type": "string", "description": "Uploader" },
    "cover": { "type": "string", "description": "Thumbnail URL" },
    "src": { "type": "string", "description": "Original page URL (resolved to real audio via /song/preload)" }
  }
}
```

**3.4** 修复 `/song/preload`：
- `consumes` 从 `application/json` 改为 `application/x-www-form-urlencoded`（因为后端用 `body-parser.urlencoded`）
- 在 `properties` 中添加 `platform` 字段：

```json
"properties": {
  "url": { "type": "string", "description": "Audio URL to preload" },
  "platform": {
    "type": "string",
    "enum": ["youtube", "bilibili"],
    "description": "Platform hint; auto-detected from URL if omitted"
  }
}
```

### 步骤 4: Player.vue

#### 4.1 模板修改

在现有 `#url` input（~第44行）添加 `placeholder` 属性：

```vue
<input
  id="url"
  name="url"
  class="fm-add-url"
  type="text"
  v-model="playURL"
  placeholder="貼上 YouTube 連結..."
  :disabled="loading"
/>
```

在 `.fm-tools` 区块结束标签之后添加 toast 模板（与 Search.vue 风格一致）：

```vue
<div class="toast-wrap" v-if="toast.visible">
  <div
    :class="[
      'toast',
      toast.type === 'error' ? 'toast-error' : 'toast-success',
    ]"
  >
    {{ toast.message }}
  </div>
</div>
```

#### 4.2 脚本修改

新增数据和方法（Options API 风格，与现有代码一致）：

```typescript
// 在 script 区 import 区新增 axios（现有代码未直接 import axios）
import axios from "axios";

// data() 新增字段
data() {
  return {
    // ... 现有字段保留不变
    loading: false,
    toast: { visible: false, message: "", type: "info" },
    toastTimer: null,
  };
},

// methods 区新增方法
methods: {
  // 复用 Search.vue 的 toast 模式
  showToast(message, type = "info") {
    this.toast = { visible: true, message, type };
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toast.visible = false;
    }, 3000);
  },

  // 替代/修改原有 addSong() 方法
  async handleAddYouTube() {
    const url = (this.playURL || "").trim();
    if (!url) return;

    // 验证是否为 YouTube URL
    if (!this.isYouTubeUrl(url)) {
      this.showToast("請輸入有效的 YouTube 連結", "error");
      return;
    }

    this.loading = true;
    this.showToast("正在獲取音頻信息...", "info");

    try {
      // 调用 /youtube/audio-info 接口获取 PlaylistItem
      const { data: audioItem } = await axios.get("/api/youtube/audio-info", {
        params: { url },
      });

      // 调用 /song/preload 获取实际音频 URL
      const item: any = await song.preload({ 
        src: audioItem.src, 
        ...audioItem 
      });

      // 添加到播放列表
      this.playlist.push(item);
      this.playURL = "";
      this.sortPlayList();
      this.showToast("添加成功", "success");
    } catch (error) {
      console.error("[handleAddYouTube] Error:", error);
      this.showToast("添加失敗", "error");
    } finally {
      this.loading = false;
    }
  },

  isYouTubeUrl(url) {
    return /^https?:\/\/(www\.youtube\.com|youtu\.be)\/.+/i.test(url);
  },
}
```

> **注意**：将 template 中添加按钮的 `@click` 由 `addSong` 改为 `handleAddYouTube`

#### 4.3 样式修改

**注意**：toast `.toast-wrap` 样式已存在于 `_search.scss`，全局复用，不需要重复定义。

在 `src/assets/style/_player.scss` 追加 placeholder 和 disabled 样式：

```scss
// 在文件末尾追加
.fm-tools .fm-add-url::placeholder {
    color: #b0c4d4;
    font-size: 0.85em;
}

.fm-tools .fm-add-url:disabled {
    background: #f0f0f0;
    cursor: not-allowed;
}
```

## 验收标准

### 任务状态：全部完成

1. **后端接口**
   - [x] `/youtube/audio-info?url=xxx` 接口正常响应
   - [x] 响应格式为 `PlaylistItem`: `{id, name, author, cover, src}`
   - [x] `id` 和 `src` 为原始 YouTube URL（后续通过 preload 解析为真实音频）
   - [x] 错误处理：参数缺失返回 400，yt-dlp 失败返回 500

2. **Swagger 文档**
   - [x] `/youtube/audio-info` 路径出现在 swagger.json
   - [x] `/song/preload` 包含 `platform` 参数
   - [x] 访问 `/swagger` 页面能正常渲染并显示新接口

3. **前端交互**
   - [x] 输入框有 placeholder 提示
   - [x] 输入 YouTube 链接并点击添加后：
     - [x] 显示 "正在获取音频信息..." toast（loading 状态）
     - [x] input 和 button 为 disabled
     - [x] 加载完成后自动调用 preload 解析真实音频 URL
     - [x] 成功显示 "添加成功" toast，歌曲自动加入列表
     - [x] 失败显示 "添加失败" toast
   - [x] toast 3秒后自动消失

4. **验证流程**
   - [x] `yarn lint` 通过（无新增错误）
   - [x] `yarn build` 前端编译成功（仅有 pre-existing sass 警告）
   - [x] `yarn build:service` 后端编译成功
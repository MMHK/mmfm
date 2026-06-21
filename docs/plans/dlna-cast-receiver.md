# DLNA Cast Receiver - Implementation Plan

## Goal
LAN 中其他設備透過 DLNA 投屏到 MMFM，截獲 URL、下載音訊（mp3 + loudnorm）、追加到播放列表。
**核心設計變更：** SetAVTransportURI 收到後先返回 TRANSITIONING，download 完畢才 NOTIFY PLAYING；error 則 NOTIFY ERROR。

---

## 1. DLNA 投屏相容性研究結果

### 1.1 實測相容性矩陣

| App | 協議 | DIDL Metadata 品質 | 格式 | 結果 |
|---|---|---|---|---|
| **網易雲音樂** | DLNA ✅ | ⭐⭐⭐⭐⭐ (title/artist/album/cover/musicId) | MP3 直連 | ✅ 成功 |
| **B 站** | DLNA ✅ | ⭐⭐ (僅 title, class=videoItem) | MP4 CDN | ✅ 成功 |
| **小紅書** | DLNA ✅ | ⭐ (通用 "DLNA-Video") | MP4 CDN | ✅ 成功 |
| **微信视频号** | DLNA ✅ | ⭐ ("Video" / "QGame" 佔位) | MP4 CDN | ✅ 成功 |
| **FreeOK 追劇 / Cling** | DLNA ✅ | ⭐⭐⭐ (title + date) | MP4 雲端 | ✅ 成功 |
| **QQ Music** | Qplay (私有) | - | DRM 加密 | ❌ 失敗 |
| **YouTube App** | DIAL / Cast (非 DLNA) | - | 加密 gRPC | ❌ 失敗 |

### 1.2 User-Agent 記錄

| App | User-Agent | 備註 |
|---|---|---|
| 網易雲音樂 | `Linux/3.0.0 UPnP/1.0 Platinum/1.0.5.13` | 完整 UA |
| B 站 | `Linux/3.0.0 UPnP/1.0 Platinum/1.0.5.13` | 同網易雲（同一套 DLNA 庫） |
| 小紅書 | `UPnP/1.0` | 最簡 |
| 微信视频号 | (空字串) | 無 UA |
| FreeOK 追劇 | `Android/16 UPnP/1.0 Cling/2.0` | Cling 開源庫 |

### 1.3 失敗原因分析

- **QQ Music**：Qplay 是騰訊閉源認證協議。需要與騰訊簽 NDA、通過百佳泰認證實驗室測試。無法用開源 DLNA 繞過。
- **YouTube App**：使用 DIAL 協定（Discovery and Launch）+ Google Cast，不是標準 DLNA。YouTube app 本身必須存在於接收裝置，無法被第三方模擬。

### 1.4 DIDL-Lite XML 解析要點

- `CurrentURIMetaData` 內的 XML 是 **HTML entity encoded**（`&lt;`, `&quot;`），需先 decode
- `&#25670;` 是 Unicode 十進位編碼（= 搖），需支援 decode
- namespace 前綴不固定（`dc:title` 有時是 `dc:title`，有時帶 `s:` 前綴）

### 1.5 Metadata 來源優先級

```
DIDL-Lite (來自投送端)
  → ffprobe (遠端媒體檔案探測)
    → URL path fallback
```

- 網易雲：DIDL 提供 title, artist, album, cover
- B 站/小紅書/微信：DIDL 只有 title，ffprobe 提供 codec/bitrate/duration
- 所有來源：audio stream 的 ID3 tags 通常為空（CDN 串流不 embed metadata）

---

## 2. 架構設計

### 2.1 同步下載 + NOTIFY 機制

**核心變更（與原計劃不同）：**

```
SetAVTransportURI 收到
  ↓
回覆 SOAP: 200 OK (接受 URI)
  ↓
立即 NOTIFY: TransportState = TRANSITIONING
  ↓
開始下載 (yt-dlp / ffmpeg)
  ├─ 成功 → NOTIFY: TransportState = PLAYING
  │          追加到 playlist + Socket.IO 廣播
  └─ 失敗 → NOTIFY: TransportState = STOPPED
             TransportStatus = ERROR_OCCURRED
             記錄錯誤日誌，不加入 playlist
```

**優點：**
- 控制端可以看到真實狀態（正在下載 vs 已就緒 vs 失敗）
- 避免失敗的 URL 被誤加入 playlist
- 符合 DLNA 規範的狀態流

**缺點：**
- 控制端 UI 可能顯示較長時間的 TRANSITIONING
- 長影片下載時間可能較久（但對於音樂電台場景可接受）

### 2.2 NOTIFY LastChange 格式（修正版）

基於 DLNA AVTransport:1 規範和實測抓包：

```xml
<e:propertyset xmlns:e="urn:schemas-upnp-org:event-1-0">
  <e:property>
    <LastChange>
      &lt;Event xmlns="urn:schemas-upnp-org:metadata-1-0/AVT/"&gt;
        &lt;InstanceID val="0"&gt;
          &lt;TransportState val="TRANSITIONING"/&gt;
          &lt;TransportStatus val="OK"/&gt;
          &lt;CurrentTrackMetaData val=""/&gt;
          &lt;AVTransportURI val="http://..."/&gt;
          &lt;CurrentTrack val="0"/&gt;
          &lt;CurrentTrackDuration val="00:00:00"/&gt;
          &lt;CurrentTransportActions val="Play,Stop,Pause"/&gt;
        &lt;/InstanceID&gt;
      &lt;/Event&gt;
    </LastChange>
  </e:property>
</e:propertyset>
```

注意：LastChange 內的 XML 需要被 HTML entity escape。

### 2.3 User-Agent 記錄與白名單

**階段 1（現階段）：完整記錄，不做過濾**
- 記錄所有 HTTP 請求的 UA + IP + timestamp + action
- 累積數據

**階段 2（未來）：基於數據的白名單**
- 只允許測試過的 UA patterns
- 不支援的 UA 返回 SOAP 401 或 503

---

## 3. DLNA 投送數據結構

### 3.1 SetAVTransportURI 格式（網易雲範例）
```xml
<u:SetAVTransportURI xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">
  <InstanceID>0</InstanceID>
  <CurrentURI>http://m701.music.126.net/.../xxxx.mp3?vuutv=...&dlna=1</CurrentURI>
  <CurrentURIMetaData>
    &lt;DIDL-Lite xmlns:dc="..." xmlns:upnp="..." xmlns:netease="..."&gt;
      &lt;item id="1955884501"&gt;
        &lt;dc:title&gt;水蒸气亲吻Disco&lt;/dc:title&gt;
        &lt;dc:creator&gt;李昂LeeOn/张蔷/后千禧浪潮&lt;/dc:creator&gt;
        &lt;upnp:artist&gt;李昂LeeOn/张蔷/后千禧浪潮&lt;/upnp:artist&gt;
        &lt;upnp:album&gt;水蒸气亲吻Disco&lt;/upnp:album&gt;
        &lt;upnp:albumArtURI&gt;http://p2.music.126.net/...jpg&lt;/upnp:albumArtURI&gt;
        &lt;upnp:class&gt;object.item.audioItem.musicTrack&lt;/upnp:class&gt;
        &lt;res protocolInfo="http-get:*:audio/mpeg:DLNA.ORG_PN=MP3;..."
             duration="00:03:06.000"&gt;URL&lt;/res&gt;
        &lt;netease:musicId&gt;1955884501&lt;/netease:musicId&gt;
      &lt;/item&gt;
    &lt;/DIDL-Lite&gt;
  </CurrentURIMetaData>
</u:SetAVTransportURI>
```

### 3.2 B 站範例（videoItem）
```xml
<DIDL-Lite ...>
  <item id="0" parentID="-1" restricted="1">
    <dc:title>JW - 凡人不懂爱</dc:title>
    <upnp:class>object.item.videoItem</upnp:class>
    <res protocolInfo="http-get:*:video/mp4:...">URL</res>
    <!-- 無 dc:creator, 無 upnp:album, 無 albumArtURI -->
  </item>
</DIDL-Lite>
```

### 3.3 小紅書範例
```xml
<DIDL-Lite ... xmlns:sec="http://www.sec.co.kr/">
  <item id="0" parentID="0" restricted="0">
    <dc:title>DLNA-Video</dc:title>
    <dc:creator>unknown</dc:creator>
    <upnp:class>object.item.videoItem</upnp:class>
    <dc:uri>32C0A47EC4BC68D2ADDEAB25E2ADE8B1</dc:uri>
    <dc:channel>23864</dc:channel>
    <dc:uid>10002534685518</dc:uid>
    <res protocolInfo="http-get:*:video/mp4:...">URL</res>
  </item>
</DIDL-Lite>
```

### 3.4 微信视频号範例
```xml
<DIDL-Lite ... xmlns:sec="http://www.sec.co.kr/">
  <item id="123" parentID="-1" restricted="1">
    <dc:title>Video</dc:title>
    <dc:creator>QGame</dc:creator>
    <upnp:class>object.item.videoItem</upnp:class>
    <res protocolInfo="http-get:*:video/*:...">https://finder.video.qq.com/...?token=...</res>
  </item>
</DIDL-Lite>
```

---

## 4. 音訊處理流程

### 4.1 yt-dlp 路徑（YouTube/Bilibili/1700+ 支援站點）
```bash
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  --embed-thumbnail --embed-metadata \
  -o "{md5}.%(ext)s" \
  --postprocessor-args "extractaudio:-filter:a loudnorm=I=-16:TP=-1.5:LRA=11" \
  --no-playlist \
  {URL}
```

### 4.2 ffmpeg 路徑（直連 HTTP 音訊/影片 URL）
```bash
ffmpeg -i {URL} [-i {cover_url}] \
  [-map 0:a -map 1:v -disposition:v:0 attached_pic | -vn] \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11" \
  -codec:a libmp3lame -q:a 0 \
  -map_metadata -1 -id3v2_version 3 \
  -metadata "title={title}" \
  -metadata "artist={artist}" \
  -metadata "album={album}" \
  -y {outputPath}.mp3
```

注意：所有 `-i` 必須放在最前面，避免 ffmpeg 「input option to output file」錯誤。

### 4.3 所有音訊統一規範
- 必須通過 loudnorm 過濾器：`I=-16:TP=-1.5:LRA=11`
- 輸出格式：MP3, VBR quality 0（最高品質）
- 檔案路徑：`cache/{md5(url)}.mp3`
- 重複 URL 跳過下載（檔案已存在則直接使用）

---

## 5. 實作任務

### Task 1: 建立 `src/services/DlnaRenderer.ts`
- DlnaRenderer 類別
- SSDP advertisement: `urn:schemas-upnp-org:device:MediaRenderer:1`
- HTTP 路由（Express app 層）：
  - `GET /dlna/device.xml` — 裝置描述
  - `GET /dlna/service.xml` — AVTransport 服務描述
  - `GET /dlna/rendering-service.xml` — RenderingControl 服務描述
  - `POST /dlna/avtransport` — SOAP AVTransport actions
  - `POST /dlna/rendering` — SOAP RenderingControl actions
  - `SUBSCRIBE/UNSUBSCRIBE /dlna/event` — 事件訂閱 + NOTIFY
- SOAP action handlers:
  - `SetAVTransportURI` → parse DIDL + URL → 回覆 OK → NOTIFY TRANSITIONING → 下載 → NOTIFY PLAYING/STOPPED
  - `GetTransportInfo` → 返回當前 state
  - `Play` / `Stop` / `Pause` → 更新 state + NOTIFY
  - `GetVolume` / `SetVolume` → 返回 50
- 整合到 WebService 的 SongList + playlist.json + Socket.IO

### Task 2: 整合到 `src/services/WebService.ts`
- Import DlnaRenderer
- 在 Express app 註冊 `/dlna/*` 路由
- 取得 `SongList`、`playlist.json`、`cacheDir`、`io` 的引用，傳給 DlnaRenderer
- server.listen 後啟動 SSDP
- graceful shutdown 時停止 SSDP

### Task 3: 依賴更新
- `package.json` 新增: `node-ssdp`, `@types/node-ssdp`, `fast-xml-parser`
- ffmpeg/ffprobe 已存在於 Dockerfile

### Task 4: Docker 更新
- `docker-compose.yml`:
  - mmfm service: `network_mode: host`
  - 移除 `ports` 映射
  - 維持 env, volumes, restart policy

### Task 5: 驗證
- `yarn lint`
- `yarn build`
- `yarn build:service`
- 測試：網易雲投送 → 確認 playlist 更新 + Socket.IO 廣播

---

## 6. Key Constraints

| 項目 | 說明 |
|---|---|
| **SSDP 網絡** | 必須 `network_mode: host`（UDP multicast port 1900）|
| **端口共用** | DLNA HTTP 端點共用 Express port 8011 |
| **同步下載** | SetAVTransportURI → TRANSITIONING → download → NOTIFY PLAYING/STOPPED |
| **音訊規範** | 所有音訊必須通過 `loudnorm=I=-16:TP=-1.5:LRA=11` |
| **yt-dlp 優先** | 1700+ 支援站點用 yt-dlp；直連 URL 用 ffmpeg |
| **錯誤處理** | 下載失敗 → NOTIFY STOPPED + ERROR_OCCURRED，不加入 playlist |
| **重複 URL** | hash 碰撞時跳過（檔案已存在）|
| **代碼風格** | TypeScript, camelCase, child_process spawn pattern 同 YtDlpService |
| **函數長度** | ≤ 40 行 |

---

## 7. File Changes

| File | Change | Lines |
|---|---|---|
| `src/services/DlnaRenderer.ts` | NEW | ~400 |
| `src/services/WebService.ts` | MODIFY - 整合 + 路由 + start/stop | +30 |
| `package.json` | MODIFY - 新增 3 個依賴 | +3 |
| `docker-compose.yml` | MODIFY - host networking | ±5 |

---

## 8. 不支持的平台（明確記錄）

| 平台 | 原因 | 替代方案 |
|---|---|---|
| QQ Music | Qplay 閉源認證，需要與騰訊簽 NDA + 百佳泰認證 | 無法繞過 |
| YouTube App | 使用 DIAL/Google Cast，非標準 DLNA | 透過 BubbleUPnP Server 橋接（用戶端方案）|
| iOS YouTube | AirPlay 2 協議 | 未來可整合 UxPlay |

---

## 9. Architecture Diagram

```
┌─────────────────────┐
│  LAN Device (Phone) │
│  網易雲/B站/小紅書/微信 │
└──────────┬──────────┘
           │ SSDP discovery → HTTP SOAP
           ▼
┌──────────────────────────────────────────────────┐
│  MMFM Server (port 8011, network_mode: host)     │
│                                                  │
│  DlnaRenderer                                    │
│  ├── SSDP Server (announce MediaRenderer)        │
│  ├── GET  /dlna/device.xml    (device desc)      │
│  ├── GET  /dlna/service.xml   (AVTransport SCPD) │
│  ├── POST /dlna/avtransport   (SOAP actions)     │
│  └── SUB  /dlna/event         (event + NOTIFY)   │
│                                                  │
│  SetAVTransportURI 流程:                          │
│  ┌─────────────────────────────────────────┐     │
│  │ 1. Parse DIDL-Lite XML (decode entities)│     │
│  │ 2. Extract CurrentURI                   │     │
│  │ 3. SOAP Response: 200 OK               │     │
│  │ 4. NOTIFY: TransportState=TRANSITIONING │     │
│  └────────────────────┬────────────────────┘     │
│                       ▼                          │
│  ┌─────────────────────────────────────────┐     │
│  │ Download Pipeline (同步等待)            │     │
│  │                                         │     │
│  │ URL matches yt-dlp sites?              │     │
│  │  YES → yt-dlp dump-json + download     │     │
│  │         -x --audio-format mp3          │     │
│  │         --embed-thumbnail --embed-meta │     │
│  │         loudnorm filter                │     │
│  │  NO  → ffprobe 探測 metadata           │     │
│  │         ffmpeg 下載 + 轉換 MP3         │     │
│  │         -af loudnorm + ID3 metadata    │     │
│  │                                         │     │
│  │ Output: cache/{md5}.mp3                │     │
│  └────────────────────┬────────────────────┘     │
│                       ▼                          │
│  ┌─────────────────────────────────────────┐     │
│  │ 成功 → NOTIFY: TransportState=PLAYING  │     │
│  │        Append PlaylistItem to SongList  │     │
│  │        Persist playlist.json            │     │
│  │        Broadcast via Socket.IO          │     │
│  │                                         │     │
│  │ 失敗 → NOTIFY: TransportState=STOPPED  │     │
│  │        TransportStatus=ERROR_OCCURRED   │     │
│  │        Log error, skip playlist         │     │
│  └─────────────────────────────────────────┘     │
└──────────────────────────────────────────────────┘
```

---

## Status

| Task | Status |
|---|---|
| Task 1: DlnaRenderer.ts | pending |
| Task 2: WebService.ts 整合 | pending |
| Task 3: 依賴更新 | pending |
| Task 4: Docker 更新 | pending |
| Task 5: 驗證 | pending |

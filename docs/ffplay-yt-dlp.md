# Linux 音訊播放、下載與音量均衡一體化解決方案指南

在 Linux 環境下播放與下載音訊（如 YouTube、B 站等）時，經常會遇到**不同檔案音量忽大忽小（一首歌大聲、一首歌小聲）**的問題。本文件提供了一套完整的解決方案，涵蓋「實時播放均衡」、「後端批處理預處理」、「yt-dlp 整合下載」以及「基於 Rust `uv` 的極速 Docker 部署方案」。

---

## 一、 播放端實時音量均衡 (ffplay)

若你不想修改原始檔案，只希望在播放時解決音量起伏問題，可以使用 `ffplay` 的內置音訊濾鏡（`-af`）。

### 1. 解決「歌與歌之間音量不一致」：`loudnorm`（推薦）
基於 EBU R128 標準的響度歸一化。它會計算人耳聽覺上的平均響度，並等比例調整音量，最適合解決跨檔案的音量差異。
```bash
ffplay -af "loudnorm=I=-16" input.mp3
```
*註：`I=-16` 為目標響度（單位 LUFS）。數值越接近 0 聲音越大（如 -16 比 -24 響亮）。*

### 2. 解決「單一檔案內忽大忽小」：`dynaudnorm`
動態音訊歸一化。它使用滑動窗口實時調整局部音量，適合處理人聲太小、背景音太大的影片。
```bash
ffplay -af dynaudnorm input.mp3
```

### 3. 配置為默認別名 (Alias)
編輯 `~/.bashrc` 或 `~/.zshrc`，在末尾加入以下內容，即可讓 `ffplay` 默認啟用音量均衡：
```bash
alias ffplay="ffplay -af loudnorm=I=-16"
```

---

## 二、 解決方案選擇：響度歸一化 vs 壓限器

當我們需要下載並保存音訊時，**預處理（Preprocessing）** 是最省 CPU 資源且聽感最佳的方案。

* **不建議使用 `acompressor`（壓限器/DynamicsCompressorNode）**：它主要作用於單首歌內部，會強行壓縮音樂的動態範圍（讓大鼓變悶、人聲變平扁），用來對付不同的歌會嚴重破壞音樂品質。
* **推薦使用 `loudnorm`（響度歸一化）**：它是 Spotify、Apple Music、YouTube 等各大平台的標準做法。它整體放大或縮小整首歌的音量，完整保留歌曲內部的強弱起伏，聽感最自然。

---

## 三、 Node.js 整合 yt-dlp 搜尋、下載與自動歸一化

`yt-dlp` 本身並未內置 `ffmpeg`，但它支援將 `ffmpeg` 的 `loudnorm` 濾鏡作為後處理參數（`--ppa`）直接注入。

透過以下 Node.js 腳本，你可以實現：**「輸入關鍵字 -> 自動在 YouTube 搜尋 -> 下載最高畫質 -> 轉為 MP3 -> 透過 ffmpeg 進行音量歸一化」** 一鍵完成。

### 1. 安裝系統依賴
確保系統中已安裝 `yt-dlp` 和 `ffmpeg`，且能在終端直接調用。

### 2. Node.js 整合腳本 (`download.js`)

```javascript
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * 搜尋並下載 YouTube/B站 音訊，並自動進行響度歸一化
 * @param {string} query - 搜尋關鍵字或影片鏈結
 * @param {string} outputDir - 儲存目錄
 */
function searchAndDownload(query, outputDir = './downloads') {
    if (!fs.existsSync(outputDir)){
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // 若傳入的是關鍵字，則使用 ytsearch1: 搜尋並獲取第 1 條結果；若傳入的是 URL 則直接下載
    const isUrl = query.startsWith('http://') || query.startsWith('https://');
    const searchTarget = isUrl ? query : `ytsearch1:${query}`;
    
    const args = [
        searchTarget,
        '-x',                             // 提取音訊
        '--audio-format', 'mp3',          // 轉為 MP3
        '--audio-quality', '0',           // 最高音訊質量 (VBR 0)
        
        // 自動從本地 Chrome 讀取 Cookies（解決 B 站未登入只能下載低音質的問題）
        '--cookies-from-browser', 'chrome', 
        
        // 核心：在音訊提取後，調用 ffmpeg 進行 EBU R128 音量均衡
        '--ppa', 'extractaudio:-filter:a loudnorm=I=-16:TP=-1.5:LRA=11',
        
        '-o', path.join(outputDir, '%(title)s.%(ext)s'),
        '--no-playlist'
    ];

    console.log(`正在搜尋/分析並準備下載: "${query}"...`);

    const ytDlp = spawn('yt-dlp', args);

    // 監聽標準輸出
    ytDlp.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output.includes('[download]') || output.includes('[ExtractAudio]') || output.includes('[ffmpeg]')) {
            console.log(output);
        }
    });

    // 監聽標準錯誤
    ytDlp.stderr.on('data', (data) => {
        const errorMsg = data.toString();
        if (errorMsg.includes('ERROR')) {
            console.error(`[yt-dlp 錯誤]: ${errorMsg.trim()}`);
            console.log('💡 提示：若下載報錯，請嘗試在終端運行 "yt-dlp -U" 或 "yt-dlp --update-to nightly" 升級核心工具。');
        }
    });

    ytDlp.on('close', (code) => {
        if (code === 0) {
            console.log(`\n🎉 下載並音量均衡處理完成！檔案保存在: ${outputDir}`);
        } else {
            console.error(`\n❌ 處理失敗，退出代碼: ${code}`);
        }
    });
}

// 運行測試 (支援 YouTube 關鍵字搜尋、YouTube 鏈結、B 站鏈結)
searchAndDownload("Imagine Dragons Believer");
```

---

## 四、 現代 Docker 部署方案 (Node.js + Alpine + Rust `uv`)

在 Docker 容器（特別是輕量化的 Alpine Linux）中部署該服務時，推薦使用由 Astral 公司用 Rust 建立的 **`uv`** 套件管理器。

`uv` 的優勢：
* **體積輕量**：不需要安裝 Alpine 官方笨重的 `py3-pip` 及其依賴。
* **極速構建**：`uv` 的安裝和解析速度比 `pip` 快 10 到 100 倍，`yt-dlp` 的安裝通常可在 1 秒內完成。
* **安全性高**：自動管理 Python 虛擬環境（`venv`），避免污染全局系統。

### 優化後的 `Dockerfile`

```dockerfile
# 使用輕量級的 Node.js Alpine 映像檔
FROM node:20-alpine

# 1. 多階段建構：直接從官方 uv 映像檔中拷貝 Rust 編譯好的 uv 二進位檔案
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# 2. 安裝必要的系統套件：ffmpeg (音訊處理核心) 與 python3 (yt-dlp 執行環境)
RUN apk update && apk add --no-cache \
    ffmpeg \
    python3

# 3. 設置 Python 虛擬環境路徑（Docker 最佳實踐）
ENV VIRTUAL_ENV=/opt/venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# 4. 用 uv 建立虛擬環境，並極速安裝最新版本的 yt-dlp
RUN uv venv $VIRTUAL_ENV && \
    uv pip install --no-cache-dir -U yt-dlp

# 5. 配置 Node.js 專案工作目錄
WORKDIR /app

# 6. 安裝 Node.js 專案依賴
COPY package*.json ./
RUN npm install

# 7. 複製原始碼
COPY . .

# 8. 啟動 Node.js 應用
CMD ["node", "index.js"]
```

---

## 五、 常見問題 (FAQ)

#### Q1: 為什麼 B 站下載的音訊音質很低？
**A**: B 站限制了未登入用戶的媒體流質量。請確保你在執行腳本的環境中，已經登入過瀏覽器（如 Chrome），且 Dockerfile 或主機中配置了 `--cookies-from-browser chrome`。

#### Q2: 下載 B 站時突然報錯 HTTP Error 412 或解析失敗？
**A**: B 站經常會變動其 API 接口。這並不是代碼問題，只需在主機中運行 `yt-dlp -U`，或在 Dockerfile 的 `uv pip install` 步驟中重新構建映像檔，將 `yt-dlp` 更新至官方最新修正版即可。
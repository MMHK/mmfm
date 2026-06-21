/**
 * DLNA DMR 測試接收器
 * 
 * 功能：
 * - SSDP 宣告自己為 MediaRenderer
 * - 處理 SetAVTransportURI 截獲投屏 URL
 * - 嘗試下載/轉換媒體
 * 
 * 用法：
 * node tests/dlna-test-receiver.js
 */

const http = require("http");
const os = require("os");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawn } = require("child_process");
const { Server: SsdpServer } = require("node-ssdp");
const { XMLParser, XMLBuilder } = require("fast-xml-parser");

const FFMPEG_DIR = "D:\\green\\ffmpeg\\bin";
const FFMPEG_CMD = path.join(FFMPEG_DIR, "ffmpeg.exe");
const FFPROBE_CMD = path.join(FFMPEG_DIR, "ffprobe.exe");
const YTDLP_CMD = "yt-dlp";

// ============ 配置 ============
const PORT = 8012;
const DEVICE_NAME = "MMFM-Test";
const TEST_OUTPUT_DIR = path.join("tests", "dlna-test-output");
const RAW_LOG_FILE = path.join(TEST_OUTPUT_DIR, "raw-soap-dump.log");

// 確保輸出目錄存在
if (!fs.existsSync(TEST_OUTPUT_DIR)) {
    fs.mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
}

// Raw dump 函數
let requestCounter = 0;
function dumpRawRequest(type, data, meta) {
    requestCounter++;
    const timestamp = new Date().toISOString();
    const logEntry = `\n${"=".repeat(60)}\n` +
        `[${timestamp}] Request #${requestCounter} - ${type}\n` +
        `Meta: ${JSON.stringify(meta, null, 2)}\n` +
        `${"-".repeat(60)}\n` +
        `${typeof data === "string" ? data : JSON.stringify(data, null, 2)}\n` +
        `${"=".repeat(60)}\n`;
    
    console.log(logEntry);
    fs.appendFileSync(RAW_LOG_FILE, logEntry);
}
// ============ 取得區域 IP ============
function getLocalIp() {
    const nets = os.networkInterfaces();
    let found = "127.0.0.1";
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === "IPv4" && !net.internal) {
                found = net.address;
                if (net.address.startsWith("192.168.") || net.address.startsWith("10.")) {
                    return net.address;
                }
            }
        }
    }
    return found;
}

const LOCAL_IP = getLocalIp();
const BASE_URL = `http://${LOCAL_IP}:${PORT}`;

// ============ XML 模板 ============
const DEVICE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<root xmlns="urn:schemas-upnp-org:device-1-0"
      xmlns:dlna="urn:schemas-dlna-org:device-1-0">
  <specVersion>
    <major>1</major>
    <minor>0</minor>
  </specVersion>
  <device>
    <deviceType>urn:schemas-upnp-org:device:MediaRenderer:1</deviceType>
    <friendlyName>${DEVICE_NAME}</friendlyName>
    <manufacturer>MMFM Test</manufacturer>
    <modelName>MMFM DMR Test</modelName>
    <UDN>uuid:dlna-test-${crypto.randomBytes(4).toString("hex")}</UDN>
    <serviceList>
      <service>
        <serviceType>urn:schemas-upnp-org:service:AVTransport:1</serviceType>
        <serviceId>urn:upnp-org:serviceId:AVTransport</serviceId>
        <controlURL>/dlna/avtransport</controlURL>
        <eventSubURL>/dlna/event</eventSubURL>
        <SCPDURL>/dlna/service.xml</SCPDURL>
      </service>
      <service>
        <serviceType>urn:schemas-upnp-org:service:RenderingControl:1</serviceType>
        <serviceId>urn:upnp-org:serviceId:RenderingControl</serviceId>
        <controlURL>/dlna/rendering</controlURL>
        <eventSubURL>/dlna/event</eventSubURL>
        <SCPDURL>/dlna/rendering-service.xml</SCPDURL>
      </service>
    </serviceList>
  </device>
</root>`;

const AVTRANSPORT_SERVICE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<scpd xmlns="urn:schemas-upnp-org:service-1-0">
  <specVersion>
    <major>1</major>
    <minor>0</minor>
  </specVersion>
  <actionList>
    <action>
      <name>SetAVTransportURI</name>
      <argumentList>
        <argument>
          <name>InstanceID</name>
          <direction>in</direction>
          <relatedStateVariable>A_ARG_TYPE_InstanceID</relatedStateVariable>
        </argument>
        <argument>
          <name>CurrentURI</name>
          <direction>in</direction>
          <relatedStateVariable>AVTransportURI</relatedStateVariable>
        </argument>
        <argument>
          <name>CurrentURIMetaData</name>
          <direction>in</direction>
          <relatedStateVariable>AVTransportURIMetaData</relatedStateVariable>
        </argument>
      </argumentList>
    </action>
    <action>
      <name>GetTransportInfo</name>
      <argumentList>
        <argument>
          <name>InstanceID</name>
          <direction>in</direction>
          <relatedStateVariable>A_ARG_TYPE_InstanceID</relatedStateVariable>
        </argument>
        <argument>
          <name>CurrentTransportState</name>
          <direction>out</direction>
          <relatedStateVariable>TransportState</relatedStateVariable>
        </argument>
        <argument>
          <name>CurrentTransportStatus</name>
          <direction>out</direction>
          <relatedStateVariable>CurrentTransportStatus</relatedStateVariable>
        </argument>
        <argument>
          <name>CurrentSpeed</name>
          <direction>out</direction>
          <relatedStateVariable>TransportPlaySpeed</relatedStateVariable>
        </argument>
      </argumentList>
    </action>
    <action>
      <name>Play</name>
      <argumentList>
        <argument>
          <name>InstanceID</name>
          <direction>in</direction>
          <relatedStateVariable>A_ARG_TYPE_InstanceID</relatedStateVariable>
        </argument>
        <argument>
          <name>Speed</name>
          <direction>in</direction>
          <relatedStateVariable>TransportPlaySpeed</relatedStateVariable>
        </argument>
      </argumentList>
    </action>
    <action>
      <name>Stop</name>
      <argumentList>
        <argument>
          <name>InstanceID</name>
          <direction>in</direction>
          <relatedStateVariable>A_ARG_TYPE_InstanceID</relatedStateVariable>
        </argument>
      </argumentList>
    </action>
    <action>
      <name>Pause</name>
      <argumentList>
        <argument>
          <name>InstanceID</name>
          <direction>in</direction>
          <relatedStateVariable>A_ARG_TYPE_InstanceID</relatedStateVariable>
        </argument>
      </argumentList>
    </action>
  </actionList>
  <serviceStateTable>
    <stateVariable sendEvents="yes">
      <name>LastChange</name>
      <dataType>string</dataType>
    </stateVariable>
    <stateVariable sendEvents="no">
      <name>AVTransportURI</name>
      <dataType>string</dataType>
    </stateVariable>
    <stateVariable sendEvents="no">
      <name>AVTransportURIMetaData</name>
      <dataType>string</dataType>
    </stateVariable>
    <stateVariable sendEvents="no">
      <name>TransportState</name>
      <dataType>string</dataType>
      <allowedValueList>
        <allowedValue>STOPPED</allowedValue>
        <allowedValue>PLAYING</allowedValue>
        <allowedValue>PAUSED_PLAYBACK</allowedValue>
        <allowedValue>TRANSITIONING</allowedValue>
        <allowedValue>NO_MEDIA_PRESENT</allowedValue>
      </allowedValueList>
    </stateVariable>
    <stateVariable sendEvents="no">
      <name>CurrentTransportStatus</name>
      <dataType>string</dataType>
    </stateVariable>
    <stateVariable sendEvents="no">
      <name>TransportPlaySpeed</name>
      <dataType>string</dataType>
    </stateVariable>
    <stateVariable sendEvents="no">
      <name>A_ARG_TYPE_InstanceID</name>
      <dataType>ui4</dataType>
    </stateVariable>
  </serviceStateTable>
</scpd>`;

const RENDERING_SERVICE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<scpd xmlns="urn:schemas-upnp-org:service-1-0">
  <specVersion>
    <major>1</major>
    <minor>0</minor>
  </specVersion>
  <actionList>
    <action>
      <name>GetVolume</name>
      <argumentList>
        <argument><name>InstanceID</name><direction>in</direction><relatedStateVariable>A_ARG_TYPE_InstanceID</relatedStateVariable></argument>
        <argument><name>Channel</name><direction>in</direction><relatedStateVariable>A_ARG_TYPE_Channel</relatedStateVariable></argument>
        <argument><name>CurrentVolume</name><direction>out</direction><relatedStateVariable>Volume</relatedStateVariable></argument>
      </argumentList>
    </action>
    <action>
      <name>SetVolume</name>
      <argumentList>
        <argument><name>InstanceID</name><direction>in</direction><relatedStateVariable>A_ARG_TYPE_InstanceID</relatedStateVariable></argument>
        <argument><name>Channel</name><direction>in</direction><relatedStateVariable>A_ARG_TYPE_Channel</relatedStateVariable></argument>
        <argument><name>DesiredVolume</name><direction>in</direction><relatedStateVariable>Volume</relatedStateVariable></argument>
      </argumentList>
    </action>
  </actionList>
  <serviceStateTable>
    <stateVariable sendEvents="no"><name>Volume</name><dataType>ui2</dataType></stateVariable>
    <stateVariable sendEvents="no"><name>A_ARG_TYPE_InstanceID</name><dataType>ui4</dataType></stateVariable>
    <stateVariable sendEvents="no"><name>A_ARG_TYPE_Channel</name><dataType>string</dataType></stateVariable>
  </serviceStateTable>
</scpd>`;

// ============ XML 解析器 ============
const xmlParser = new XMLParser({
    ignoreAttributes: false,
    parseAttributeValue: true,
    trimValues: false,
});

const xmlBuilder = new XMLBuilder({
    ignoreAttributes: false,
    format: true,
    suppressEmptyNode: true,
});

// ============ SOAP 回應構建 ============
function soapEnvelope(body) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
  <s:Body>${body}</s:Body>
</s:Envelope>`;
}

function extractSoapAction(body) {
    const match = body.match(/<u:(\w+)[^>]*xmlns:u="([^"]+)"/);
    return match ? { action: match[1], ns: match[2] } : null;
}

function extractArgument(body, argName) {
    const regex = new RegExp(`<${argName}>[\\s\\S]*?</${argName}>`, "i");
    // 提取完整元素（包含標籤內的所有原始字元）
    const match = body.match(regex);
    if (!match) return "";
    // 去掉開結標籤，取得內部內容
    const inner = match[0].replace(new RegExp(`^<${argName}>|</${argName}>$`, "gi"), "");
    // SOAP XML 內 &amp; 要 decode 成 &，但只 decode標準XML entities
    return inner
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
}

// ============ DIDL-Lite 解析 ============
function decodeHtmlEntities(str) {
    return str
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
        .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function parseDidlLite(xml) {
    if (!xml) return null;
    try {
        const decoded = decodeHtmlEntities(xml);
        const parsed = xmlParser.parse(decoded);
        const didl = parsed["DIDL-Lite"] || parsed["s:DIDL-Lite"] || parsed;
        const item = didl?.item || didl?.["s:item"];
        if (!item) {
            console.log("[DIDL] No <item> found. Keys:", Object.keys(didl || {}));
            return null;
        }

        const res = item.res;
        const resUrl = typeof res === "object" ? res["#text"] || res : res;
        const resDuration = typeof res === "object" ? res["@_duration"] : null;

        return {
            id: item["@_id"] || null,
            title: item["dc:title"] || item.title || "",
            creator: item["dc:creator"] || item.creator || item["upnp:artist"] || "",
            artist: item["upnp:artist"] || item["dc:creator"] || "",
            album: item["upnp:album"] || item.album || "",
            albumArtURI: item["upnp:albumArtURI"] || null,
            duration: resDuration || null,
            class: item["upnp:class"] || null,
            res: resUrl || null,
            musicId: item["netease:musicId"] || null,
        };
    } catch (e) {
        console.log("[DIDL] Parse error:", e.message);
        return null;
    }
}

// ============ 媒體下載 ============
async function probeUrl(url) {
    console.log(`[Probe] Probing: ${url}`);
    return new Promise((resolve, reject) => {
        const proc = spawn(FFPROBE_CMD, [
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            url,
        ], { stdio: ["ignore", "pipe", "pipe"] });
        
        let stdout = "";
        let stderr = "";
        
        proc.stdout.on("data", (chunk) => stdout += chunk.toString());
        proc.stderr.on("data", (chunk) => stderr += chunk.toString());
        
        proc.on("close", (code) => {
            if (code === 0 && stdout) {
                try {
                    resolve(JSON.parse(stdout));
                } catch (e) {
                    reject(new Error("ffprobe JSON parse error"));
                }
            } else {
                reject(new Error(`ffprobe failed: ${stderr.slice(0, 200)}`));
            }
        });
        
        proc.on("error", reject);
        
        setTimeout(() => {
            proc.kill();
            reject(new Error("ffprobe timeout"));
        }, 10000);
    });
}

async function downloadWithFfmpeg(url, outputPath, metadata) {
    console.log(`[Download] ffmpeg -i ${url} → ${outputPath}`);
    const args = ["-i", url];
    
    const cover = metadata?.cover || metadata?.thumbnail;
    if (cover) {
        args.push("-i", cover);
        args.push("-map", "0:a", "-map", "1:v", "-disposition:v:0", "attached_pic");
    } else {
        args.push("-vn");
    }
    
    args.push(
        "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
        "-codec:a", "libmp3lame",
        "-q:a", "0",
        "-map_metadata", "-1",
        "-id3v2_version", "3",
    );

    if (metadata) {
        if (metadata.title)  args.push("-metadata", `title=${metadata.title}`);
        if (metadata.artist) args.push("-metadata", `artist=${metadata.artist}`);
        if (metadata.album)  args.push("-metadata", `album=${metadata.album}`);
    }

    args.push("-y", outputPath);

    return new Promise((resolve, reject) => {
        const proc = spawn(FFMPEG_CMD, args, { stdio: ["ignore", "pipe", "pipe"] });
        
        let stderr = "";
        proc.stderr.on("data", (chunk) => {
            stderr += chunk.toString();
            if (stderr.includes("time=")) {
                const lastLine = stderr.split("\n").filter(Boolean).pop();
                process.stdout.write(`\r  ${lastLine.slice(0, 80)}`);
            }
        });
        
        proc.on("close", (code) => {
            console.log("");
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`ffmpeg failed: ${stderr.slice(-300)}`));
            }
        });
        
        proc.on("error", reject);
        
        setTimeout(() => {
            proc.kill();
            reject(new Error("ffmpeg timeout"));
        }, 120000);
    });
}

async function downloadWithYtdlp(url, outputPath) {
    console.log(`[Download] yt-dlp ${url} → ${outputPath}`);
    return new Promise((resolve, reject) => {
        const proc = spawn(YTDLP_CMD, [
            "-x",
            "--audio-format", "mp3",
            "--audio-quality", "0",
            "-o", `${outputPath}.%(ext)s`,
            "--postprocessor-args", "extractaudio:-filter:a loudnorm=I=-16:TP=-1.5:LRA=11",
            "--embed-thumbnail",
            "--embed-metadata",
            "--no-playlist",
            url,
        ], { stdio: ["ignore", "pipe", "pipe"] });
        
        let stderr = "";
        proc.stderr.on("data", (chunk) => {
            stderr += chunk.toString();
            const lines = stderr.split("\n").filter(Boolean);
            if (lines.length) process.stdout.write(`\r  ${lines[lines.length - 1].slice(0, 80)}`);
        });
        
        proc.on("close", (code) => {
            console.log("");
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`yt-dlp failed: ${stderr.slice(-300)}`));
            }
        });
        
        proc.on("error", reject);
        
        setTimeout(() => {
            proc.kill();
            reject(new Error("yt-dlp timeout"));
        }, 180000);
    });
}

function isYtdlpUrl(url) {
    return /^(https?:\/\/)?(www\.youtube\.com|youtu\.be|www\.bilibili\.com|m\.bilibili\.com|soundcloud\.com|vimeo\.com|bandcamp\.com)\//i.test(url);
}

async function processMedia(mediaUrl, didlMeta) {
    if (!fs.existsSync(TEST_OUTPUT_DIR)) {
        fs.mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
    }
    
    const hash = crypto.createHash("md5").update(mediaUrl).digest("hex").slice(0, 12);
    const outputPath = path.join(TEST_OUTPUT_DIR, hash);
    const metaPath = `${outputPath}.json`;
    
    console.log("\n" + "=".repeat(60));
    console.log("[Process] Media URL:", mediaUrl);
    console.log("[Process] DIDL:", JSON.stringify(didlMeta, null, 2));
    
    try {
        let metadata = {};
        let probeInfo = {};
        
        if (isYtdlpUrl(mediaUrl)) {
            console.log("[Process] Detected yt-dlp supported URL, using yt-dlp");
            
            await new Promise((resolve, reject) => {
                const proc = spawn(YTDLP_CMD, [
                    "--dump-json", "--no-download", "--no-playlist", mediaUrl
                ], { stdio: ["ignore", "pipe", "pipe"] });
                
                let stdout = "";
                proc.stdout.on("data", (chunk) => stdout += chunk.toString());
                proc.on("close", (code) => {
                    if (code === 0 && stdout) {
                        try {
                            const json = JSON.parse(stdout);
                            metadata = {
                                source: "yt-dlp",
                                title: json.title,
                                uploader: json.uploader || json.channel,
                                artist: json.artist,
                                album: json.album,
                                thumbnail: json.thumbnail,
                                duration: json.duration,
                                description: json.description?.slice(0, 200),
                                tags: json.tags?.slice(0, 10),
                            };
                            dumpRawRequest("yt-dlp-metadata", json, { url: mediaUrl });
                            resolve();
                        } catch (e) { reject(e); }
                    } else {
                        reject(new Error("yt-dlp metadata failed"));
                    }
                });
                proc.on("error", reject);
            });
            
            console.log(`[Process] Title: ${metadata.title}`);
            console.log(`[Process] Uploader: ${metadata.uploader}`);
        } else {
            // 直接 URL：DIDL metadata 為主，ffprobe 補技術欄位
            console.log("[Process] Direct URL — DIDL first, ffprobe supplement");
            
            if (didlMeta) {
                metadata = {
                    source: "dlna-didl",
                    id: didlMeta.id || null,
                    musicId: didlMeta.musicId || null,
                    title: didlMeta.title || null,
                    artist: didlMeta.artist || didlMeta.creator || null,
                    album: didlMeta.album || null,
                    cover: didlMeta.albumArtURI || null,
                    duration: didlMeta.duration || null,
                };
            }
            
            try {
                const probeResult = await probeUrl(mediaUrl);
                const format = probeResult.format;
                const audioStream = (probeResult.streams || []).find(s => s.codec_type === "audio");
                
                // ffprobe 的 tags 補充 DIDL 缺失的欄位
                const tags = format?.tags || {};
                const streamTags = audioStream?.tags || {};
                
                // DIDL title 優先，ffprobe tags 補位
                if (!metadata.title) {
                    metadata.title = tags.title || tags.Title || streamTags.title;
                }
                // DIDL artist 優先，ffprobe 補位
                if (!metadata.artist) {
                    metadata.artist = tags.artist || tags.Artist || streamTags.artist;
                }
                if (!metadata.album) {
                    metadata.album = tags.album || tags.Album || streamTags.album;
                }
                
                // 技術資訊（總是從 ffprobe 取得）
                probeInfo = {
                    codec: audioStream?.codec_name,
                    sampleRate: audioStream?.sample_rate,
                    channels: audioStream?.channels,
                    bitrate: format?.bit_rate ? Math.round(format.bit_rate / 1000) + " kbps" : null,
                    duration: format?.duration ? Math.round(parseFloat(format.duration) * 100) / 100 : null,
                    size: format?.size ? Math.round(format.size / 1024) + " KB" : null,
                };
                
                dumpRawRequest("ffprobe-metadata", probeResult, { url: mediaUrl });
            } catch (e) {
                console.log("[Process] ffprobe failed:", e.message);
            }
            
            // Fallback title
            if (!metadata.title) {
                metadata.title = path.basename(new URL(mediaUrl).pathname).split(".")[0] || mediaUrl;
            }
            
            console.log(`[Process] Title: ${metadata.title}`);
            console.log(`[Process] Artist: ${metadata.artist}`);
            console.log(`[Process] Album: ${metadata.album}`);
            console.log(`[Process] Cover: ${metadata.cover ? "yes" : "no"}`);
            console.log(`[Process] Duration: ${metadata.duration}`);
            console.log(`[Process] Codec: ${probeInfo.codec} | ${probeInfo.sampleRate}Hz | ${probeInfo.channels}ch | ${probeInfo.bitrate}`);
        }
        
        const finalPath = `${outputPath}.mp3`;
        const metaFile = `${outputPath}.json`;
        const finalMeta = { ...metadata, ...probeInfo, url: mediaUrl, downloadedAt: new Date().toISOString() };
        
        if (fs.existsSync(finalPath)) {
            console.log("[Process] Already downloaded:", finalPath);
            fs.writeFileSync(metaFile, JSON.stringify(finalMeta, null, 2));
            return { metadata: finalMeta, outputPath: finalPath };
        }
        
        console.log("[Process] Starting download...");
        
        if (isYtdlpUrl(mediaUrl)) {
            await downloadWithYtdlp(mediaUrl, outputPath);
        } else {
            await downloadWithFfmpeg(mediaUrl, finalPath, metadata);
        }
        
        const stats = fs.statSync(finalPath);
        console.log(`[Process] Output: ${finalPath} (${Math.round(stats.size / 1024)} KB)`);
        
        fs.writeFileSync(metaFile, JSON.stringify(finalMeta, null, 2));
        console.log(`[Process] Metadata saved: ${metaFile}`);
        console.log(`[Process] Playlist entry:`, JSON.stringify({
            id: finalMeta.id || finalMeta.musicId || mediaUrl,
            name: finalMeta.title,
            author: finalMeta.artist || finalMeta.uploader || "Unknown",
            cover: finalMeta.cover || finalMeta.thumbnail || "",
            src: finalMeta.url,
        }, null, 2));
        
        return { metadata: finalMeta, outputPath: finalPath };
    } catch (e) {
        console.error("[Process] Failed:", e.message);
        return { metadata: didlMeta || { title: mediaUrl }, outputPath: null, error: e.message };
    }
}

// ============ HTTP 伺服器 ============
let currentUri = "";
let currentMetaData = null;
let transportState = "NO_MEDIA_PRESENT";

const server = http.createServer(async (req, res) => {
    console.log(`[HTTP] ${req.method} ${req.url} from ${req.socket.remoteAddress}`);
    
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, SUBSCRIBE");
    res.setHeader("Access-Control-Allow-Headers", "content-type, soapaction, callback");
    
    if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
        return;
    }
    
    if (req.url === "/dlna/device.xml") {
        res.writeHead(200, { 
            "Content-Type": "application/xml; charset=utf-8",
            "Server": "MMFM-Test UPnP/1.0",
        });
        res.end(DEVICE_XML);
        return;
    }
    
    if (req.url === "/dlna/service.xml") {
        res.writeHead(200, { "Content-Type": "application/xml; charset=utf-8" });
        res.end(AVTRANSPORT_SERVICE_XML);
        return;
    }
    
    if (req.url === "/dlna/rendering-service.xml") {
        res.writeHead(200, { "Content-Type": "application/xml; charset=utf-8" });
        res.end(RENDERING_SERVICE_XML);
        return;
    }
    
    if (req.url === "/dlna/avtransport" && req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => body += chunk.toString());
        req.on("end", async () => {
            const parsed = extractSoapAction(body);
            console.log(`[SOAP] Action: ${parsed?.action}`);
            
            if (parsed?.action === "SetAVTransportURI") {
                const uri = extractArgument(body, "CurrentURI");
                const metaDataXml = extractArgument(body, "CurrentURIMetaData");
                const didlMeta = parseDidlLite(metaDataXml);
                
                // 完整 dump SOAP 請求
                dumpRawRequest("SetAVTransportURI", {
                    rawBody: body,
                    parsedUri: uri,
                    metaDataXml: metaDataXml,
                    parsedDidl: didlMeta
                }, {
                    userAgent: req.headers["user-agent"],
                    contentType: req.headers["content-type"],
                    host: req.headers["host"],
                });
                
                currentUri = uri;
                currentMetaData = didlMeta;
                transportState = "PLAYING";
                
                console.log("\n" + "*".repeat(60));
                console.log("[SetAVTransportURI] URI:", uri);
                console.log("[SetAVTransportURI] DIDL:", JSON.stringify(didlMeta, null, 2));
                console.log("*".repeat(60) + "\n");
                
                processMedia(uri, didlMeta).then((result) => {
                    if (result.outputPath) {
                        console.log(`[Result] Downloaded: ${result.outputPath}`);
                    } else {
                        console.log(`[Result] Failed: ${result.error}`);
                    }
                });
                
                res.writeHead(200, { "Content-Type": "text/xml; charset=utf-8" });
                res.end(soapEnvelope(
                    `<u:SetAVTransportURIResponse xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"/>`
                ));
                return;
            }
            
            if (parsed?.action === "GetTransportInfo") {
                res.writeHead(200, { "Content-Type": "text/xml; charset=utf-8" });
                res.end(soapEnvelope(
                    `<u:GetTransportInfoResponse xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">
                        <CurrentTransportState>${transportState}</CurrentTransportState>
                        <CurrentTransportStatus>OK</CurrentTransportStatus>
                        <CurrentSpeed>1</CurrentSpeed>
                    </u:GetTransportInfoResponse>`
                ));
                return;
            }
            
            if (parsed?.action === "Play" || parsed?.action === "Stop" || parsed?.action === "Pause") {
                if (parsed.action === "Stop") transportState = "STOPPED";
                if (parsed.action === "Pause") transportState = "PAUSED_PLAYBACK";
                if (parsed.action === "Play") transportState = "PLAYING";
                
                res.writeHead(200, { "Content-Type": "text/xml; charset=utf-8" });
                res.end(soapEnvelope(`
                    <u:${parsed.action}Response xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"/>
                `));
                return;
            }
            
            res.writeHead(200, { "Content-Type": "text/xml; charset=utf-8" });
            res.end(soapEnvelope(""));
        });
        return;
    }
    
    if (req.url === "/dlna/rendering" && req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => body += chunk.toString());
        req.on("end", () => {
            res.writeHead(200, { "Content-Type": "text/xml; charset=utf-8" });
            res.end(soapEnvelope(
                `<u:GetVolumeResponse xmlns:u="urn:schemas-upnp-org:service:RenderingControl:1">
                    <CurrentVolume>50</CurrentVolume>
                </u:GetVolumeResponse>`
            ));
        });
        return;
    }
    
    if (req.url === "/dlna/event" && (req.method === "SUBSCRIBE" || req.method === "UNSUBSCRIBE")) {
        const sid = `uuid:test-sid-${crypto.randomBytes(4).toString("hex")}`;
        const callback = req.headers.callback?.replace(/[<>]/g, "");
        console.log(`[Event] ${req.method} SID: ${sid} Callback: ${callback}`);
        
        res.writeHead(200, {
            "SID": sid,
            "TIMEOUT": "Second-infinity",
        });
        res.end();
        
        if (req.method === "SUBSCRIBE" && callback) {
            const currentMeta = currentMetaData
                ? `&lt;CurrentTrackMetaData val="${currentMetaData.title || ""}"/&gt;`
                : `&lt;CurrentTrackMetaData val=""/&gt;`;
            const uri = currentUri
                ? `&lt;AVTransportURI val="${currentUri}"/&gt;`
                : `&lt;AVTransportURI val=""/&gt;`;

            const eventXml =
                "&lt;?xml version=\"1.0\"?&gt;\n" +
                "&lt;Event xmlns=\"urn:schemas-upnp-org:metadata-1-0/AVT/\"&gt;\n" +
                "  &lt;InstanceID val=\"0\"&gt;\n" +
                "    &lt;TransportState val=\"" + transportState + "\"/&gt;\n" +
                "    &lt;TransportStatus val=\"OK\"/&gt;\n" +
                "    " + currentMeta + "\n" +
                "    " + uri + "\n" +
                "    &lt;CurrentTrack val=\"0\"/&gt;\n" +
                "    &lt;CurrentTrackDuration val=\"00:00:00\"/&gt;\n" +
                "    &lt;CurrentTransportActions val=\"Play,Stop,Pause,Seek,Next,Previous\"/&gt;\n" +
                "  &lt;/InstanceID&gt;\n" +
                "&lt;/Event&gt;";

            dumpRawRequest("NOTIFY", eventXml, { callback, sid });

            const callbackUrl = new URL(callback);
            const notifyOpts = {
                hostname: callbackUrl.hostname,
                port: callbackUrl.port,
                path: callbackUrl.pathname,
                method: "NOTIFY",
                headers: {
                    "Content-Type": "text/xml; charset=utf-8",
                    "NT": "upnp:event",
                    "NTS": "upnp:propchange",
                    "SID": sid,
                    "SEQ": "0",
                },
            };
            
            const notifyBody =
                `<?xml version="1.0"?>\n` +
                `<e:propertyset xmlns:e="urn:schemas-upnp-org:event-1-0">\n` +
                `  <e:property>\n` +
                `    <LastChange>${eventXml}</LastChange>\n` +
                `  </e:property>\n` +
                `</e:propertyset>`;

            const notifyReq = http.request(notifyOpts, (notifyRes) => {
                console.log(`[Event] Notify response: ${notifyRes.statusCode}`);
            });
            notifyReq.on("error", (e) => {
                console.log(`[Event] Notify error: ${e.message}`);
            });
            notifyReq.write(notifyBody);
            notifyReq.end();
        }
        return;
    }
    
    res.writeHead(404);
    res.end("Not Found");
});

// ============ SSDP ============
const UDN = DEVICE_XML.match(/<UDN>(.+?)<\/UDN>/)[1];
const LOCATION = `${BASE_URL}/dlna/device.xml`;

const ssdp = new SsdpServer({
    logLevel: "ERROR",
    unicastHost: "0.0.0.0",
    location: LOCATION,
    allowWildcards: true,
    suppressRootDeviceEvents: false,
});

ssdp.addUSN("upnp:rootdevice");
ssdp.addUSN(UDN);
ssdp.addUSN("urn:schemas-upnp-org:device:MediaRenderer:1");
ssdp.addUSN("urn:schemas-upnp-org:service:AVTransport:1");
ssdp.addUSN("urn:schemas-upnp-org:service:RenderingControl:1");

ssdp.on("request", function (data) {
    console.log(`[SSDP] Received M-SEARCH from ${data.address}:${data.port}`);
});

// ============ 啟動 ============
server.listen(PORT, "0.0.0.0", async () => {
    console.log("\n" + "=".repeat(60));
    console.log("  DLNA DMR Test Receiver");
    console.log("=".repeat(60));
    console.log(`  Local IP  : ${LOCAL_IP}`);
    console.log(`  HTTP Port : ${PORT}`);
    console.log(`  UDN       : ${UDN}`);
    console.log(`  Location  : ${LOCATION}`);
    console.log(`  Output Dir: ${TEST_OUTPUT_DIR}`);
    console.log("=".repeat(60));
    console.log("\nWaiting for DLNA cast...\n");
    
    ssdp.start(() => {
        console.log("[SSDP] Started");
    });
});

process.on("SIGINT", () => {
    console.log("\nShutting down...");
    ssdp.stop();
    server.close(() => process.exit(0));
});

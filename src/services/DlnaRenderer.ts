import { Server as SsdpServer } from "node-ssdp";
import { XMLParser } from "fast-xml-parser";
import { Router, type Request, type Response, type Application } from "express";
import type { Server as SocketIOServer } from "socket.io";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import http from "http";
import { URL } from "url";
import { spawn } from "child_process";
import { logger } from "./logger";
import * as YtDlp from "./YtDlpService";

export interface DidlMetadata {
  id: string | null;
  title: string;
  creator: string;
  artist: string;
  album: string;
  albumArtURI: string | null;
  duration: string | null;
  res: string | null;
  musicId: string | null;
}

export interface PlaylistItem {
  id: string;
  name: string;
  author: string;
  src: string;
  cover: string;
}

export interface DlnaRendererOptions {
  port: number;
  host: string;
  deviceName: string;
  cacheDir: string;
  onSongAdded: (song: PlaylistItem) => void;
  broadcastPlaylist: () => void;
  io: SocketIOServer;
}

const FFMPEG_CMD = "ffmpeg";
const FFPROBE_CMD = "ffprobe";
const NS_AVT = "urn:schemas-upnp-org:service:AVTransport:1";
const NS_RC = "urn:schemas-upnp-org:service:RenderingControl:1";

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  parseAttributeValue: true,
  trimValues: false,
});

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(+code))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, c) => String.fromCharCode(
      parseInt(c, 16),
    ));
}

function generateUuid(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return crypto.randomBytes(16).toString("hex")
    .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
}

function isYtdlpUrl(url: string): boolean {
  return /^(https?:\/\/)?(www\.youtube\.com|youtu\.be|www\.bilibili\.com|soundcloud\.com|vimeo\.com|bandcamp\.com)\//i
    .test(url);
}

function soapEnvelope(body: string): string {
  return '<?xml version="1.0"?>' +
    '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"' +
    ' s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' +
    `<s:Body>${body}</s:Body></s:Envelope>`;
}

function extractSoapAction(body: string): string | null {
  const m = body.match(/<u:(\w+)[\s\S]*?xmlns:u="([^"]+)"/);
  return m ? m[1] : null;
}

function extractArgument(body: string, name: string): string {
  const re = new RegExp(`<${name}>[\\s\\S]*?</${name}>`, "i");
  const match = body.match(re);
  if (!match) return "";
  const inner = match[0]
    .replace(new RegExp(`^<${name}>|</${name}>$`, "gi"), "");
  return decodeHtmlEntities(inner);
}

function parseDidlLite(xml: string): DidlMetadata | null {
  if (!xml) return null;
  try {
    const decoded = decodeHtmlEntities(xml);
    const parsed = xmlParser.parse(decoded);
    const didl = parsed["DIDL-Lite"] || parsed["s:DIDL-Lite"] || parsed;
    const item = didl?.item || didl?.["s:item"];
    if (!item) return null;
    const res = item.res;
    const resUrl = typeof res === "object" ? res["#text"] || res : res;
    const resDur = typeof res === "object" ? res["@_duration"] : null;
    return {
      id: item["@_id"] || null,
      title: item["dc:title"] || item.title || "",
      creator: item["dc:creator"] || item.creator || "",
      artist: item["upnp:artist"] || item["dc:creator"] || "",
      album: item["upnp:album"] || item.album || "",
      albumArtURI: item["upnp:albumArtURI"] || null,
      duration: resDur || null,
      class: item["upnp:class"] || null,
      res: resUrl || null,
      musicId: item["netease:musicId"] || null,
    };
  } catch (e) {
    logger.error("[DLNA] DIDL parse error:", (e as Error).message);
    return null;
  }
}

function getDeviceXml(
  deviceName: string, udn: string, port: number, host: string,
): string {
  const location = `http://${host}:${port}/dlna/device.xml`;
  return '<?xml version="1.0" encoding="UTF-8"?>' +
    '<root xmlns="urn:schemas-upnp-org:device-1-0">' +
    "<specVersion><major>1</major><minor>0</minor></specVersion>" +
    "<device>" +
    "<deviceType>urn:schemas-upnp-org:device:MediaRenderer:1</deviceType>" +
    `<friendlyName>${deviceName}</friendlyName>` +
    "<manufacturer>MMFM</manufacturer>" +
    "<modelName>MMFM DMR</modelName>" +
    `<UDN>${udn}</UDN>` +
    `<presentationURL>${location}</presentationURL>` +
    "<serviceList>" +
    getServiceXml("AVTransport", NS_AVT, "/dlna/avtransport", "/dlna/service.xml") +
    getServiceXml("RenderingControl", NS_RC, "/dlna/rendering", "/dlna/rendering-service.xml") +
    "</serviceList></device></root>";
}

function getServiceXml(
  name: string, serviceType: string, control: string, scpd: string,
): string {
  return "<service>" +
    `<serviceType>${serviceType}</serviceType>` +
    `<serviceId>urn:upnp-org:serviceId:${name}</serviceId>` +
    `<controlURL>${control}</controlURL>` +
    `<eventSubURL>/dlna/event</eventSubURL>` +
    `<SCPDURL>${scpd}</SCPDURL>` +
    "</service>";
}

function getAvTransportXml(): string {
  const spec = "<specVersion><major>1</major><minor>0</minor></specVersion>";
  const arg = (n: string, d: string, r: string) =>
    `<argument><name>${n}</name><direction>${d}</direction>` +
    `<relatedStateVariable>${r}</relatedStateVariable></argument>`;
  const action = (n: string, args: string) =>
    `<action><name>${n}</name><argumentList>${args}</argumentList></action>`;
  const sv = (n: string, t: string, send?: boolean) =>
    `<stateVariable sendEvents="${send ? "yes" : "no"}">` +
    `<name>${n}</name><dataType>${t}</dataType></stateVariable>`;
  const actions = [
    action("SetAVTransportURI",
      arg("InstanceID", "in", "A_ARG_TYPE_InstanceID") +
      arg("CurrentURI", "in", "AVTransportURI") +
      arg("CurrentURIMetaData", "in", "AVTransportURIMetaData"),
    ),
    action("GetTransportInfo",
      arg("InstanceID", "in", "A_ARG_TYPE_InstanceID") +
      arg("CurrentTransportState", "out", "TransportState") +
      arg("CurrentTransportStatus", "out", "CurrentTransportStatus") +
      arg("CurrentSpeed", "out", "TransportPlaySpeed"),
    ),
    action("Play",
      arg("InstanceID", "in", "A_ARG_TYPE_InstanceID") +
      arg("Speed", "in", "TransportPlaySpeed"),
    ),
    action("Stop", arg("InstanceID", "in", "A_ARG_TYPE_InstanceID")),
    action("Pause", arg("InstanceID", "in", "A_ARG_TYPE_InstanceID")),
  ].join("");
  const vars = [
    sv("LastChange", "string", true),
    sv("AVTransportURI", "string"),
    sv("AVTransportURIMetaData", "string"),
    sv("TransportState", "string"),
    sv("CurrentTransportStatus", "string"),
    sv("TransportPlaySpeed", "string"),
    sv("A_ARG_TYPE_InstanceID", "ui4"),
  ].join("");
  return `<?xml version="1.0"?>` +
    `<scpd xmlns="urn:schemas-upnp-org:service-1-0">${spec}` +
    `<actionList>${actions}</actionList>` +
    `<serviceStateTable>${vars}</serviceStateTable></scpd>`;
}

function getRenderingControlXml(): string {
  const spec = "<specVersion><major>1</major><minor>0</minor></specVersion>";
  const arg = (n: string, d: string, r: string) =>
    `<argument><name>${n}</name><direction>${d}</direction>` +
    `<relatedStateVariable>${r}</relatedStateVariable></argument>`;
  const actions =
    "<action><name>GetVolume</name><argumentList>" +
    arg("InstanceID", "in", "A_ARG_TYPE_InstanceID") +
    arg("Channel", "in", "A_ARG_TYPE_Channel") +
    arg("CurrentVolume", "out", "Volume") +
    "</argumentList></action>" +
    "<action><name>SetVolume</name><argumentList>" +
    arg("InstanceID", "in", "A_ARG_TYPE_InstanceID") +
    arg("Channel", "in", "A_ARG_TYPE_Channel") +
    arg("DesiredVolume", "in", "Volume") +
    "</argumentList></action>";
  const vars =
    '<stateVariable sendEvents="no"><name>Volume</name>' +
    "<dataType>ui2</dataType></stateVariable>" +
    '<stateVariable sendEvents="no"><name>A_ARG_TYPE_InstanceID</name>' +
    "<dataType>ui4</dataType></stateVariable>" +
    '<stateVariable sendEvents="no"><name>A_ARG_TYPE_Channel</name>' +
    "<dataType>string</dataType></stateVariable>";
  return '<?xml version="1.0"?>' +
    `<scpd xmlns="urn:schemas-upnp-org:service-1-0">${spec}` +
    `<actionList>${actions}</actionList>` +
    `<serviceStateTable>${vars}</serviceStateTable></scpd>`;
}

function buildLastChangeXml(
  state: string, status: string, uri: string, meta: string,
): string {
  const esc = (s: string) =>
    s.replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  const inner = '<Event xmlns="urn:schemas-upnp-org:metadata-1-0/AVT/">' +
    '<InstanceID val="0">' +
    `<TransportState val="${state}"/>` +
    `<TransportStatus val="${status}"/>` +
    `<CurrentTrackMetaData val="${esc(meta)}"/>` +
    `<AVTransportURI val="${esc(uri)}"/>` +
    '<CurrentTrack val="0"/>' +
    '<CurrentTrackDuration val="00:00:00"/>' +
    '<CurrentTransportActions val="Play,Stop,Pause"/>' +
    "</InstanceID></Event>";
  return "<?xml version=\"1.0\"?>" +
    '<e:propertyset xmlns:e="urn:schemas-upnp-org:event-1-0">' +
    "<e:property>" +
    `<LastChange>${esc(inner)}</LastChange>` +
    "</e:property></e:propertyset>";
}

function getAvtResponse(action: string, inner: string): string {
  return soapEnvelope(
    `<u:${action}Response xmlns:u="${NS_AVT}">${inner}</u:${action}Response>`,
  );
}

function handleSetAvTransport(
  self: DlnaRenderer, body: string, res: Response,
): void {
  const uri = extractArgument(body, "CurrentURI");
  const metaDataXml = extractArgument(body, "CurrentURIMetaData");
  logger.info("[DLNA] SetAVTransportURI:", uri);
  self.currentUri = uri;
  self.currentMeta = parseDidlLite(metaDataXml);
  logger.debug("[DLNA] DIDL:", JSON.stringify(self.currentMeta));
  res.set("Content-Type", "text/xml; charset=utf-8");
  res.send(getAvtResponse("SetAVTransportURI", ""));
  self.notifySubscribers("TRANSITIONING", "OK");
  self.processMedia(uri).catch((e) => {
    logger.error("[DLNA] processMedia error:", e);
    self.transportState = "STOPPED";
    self.notifySubscribers("STOPPED", "ERROR_OCCURRED");
  });
}

function handleTransportAction(
  self: DlnaRenderer, action: string, res: Response,
): void {
  if (action === "Stop") self.transportState = "STOPPED";
  else if (action === "Pause") self.transportState = "PAUSED_PLAYBACK";
  else if (action === "Play") self.transportState = "PLAYING";
  self.notifySubscribers(self.transportState, "OK");
  res.set("Content-Type", "text/xml; charset=utf-8");
  res.send(getAvtResponse(action, ""));
}

function handleAvTransport(
  self: DlnaRenderer, body: string, res: Response,
): void {
  const action = extractSoapAction(body);
  logger.debug("[DLNA] AVT action:", action);
  if (action === "SetAVTransportURI")
    return handleSetAvTransport(self, body, res);
  if (action === "GetTransportInfo") {
    res.set("Content-Type", "text/xml; charset=utf-8");
    res.send(getAvtResponse("GetTransportInfo",
      `<CurrentTransportState>${self.transportState}</CurrentTransportState>` +
      "<CurrentTransportStatus>OK</CurrentTransportStatus>" +
      "<CurrentSpeed>1</CurrentSpeed>"));
    return;
  }
  if (action === "Play" || action === "Stop" || action === "Pause")
    return handleTransportAction(self, action, res);
  res.set("Content-Type", "text/xml; charset=utf-8");
  res.send(getAvtResponse(action || "Unknown", ""));
}

function handleRendering(body: string, res: Response): void {
  const action = extractSoapAction(body);
  logger.debug("[DLNA] RC action:", action);
  if (action === "GetVolume") {
    res.set("Content-Type", "text/xml; charset=utf-8");
    res.send(soapEnvelope(
      `<u:GetVolumeResponse xmlns:u="${NS_RC}">` +
      "<CurrentVolume>50</CurrentVolume></u:GetVolumeResponse>",
    ));
    return;
  }
  res.set("Content-Type", "text/xml; charset=utf-8");
  res.send(soapEnvelope(
    `<u:SetVolumeResponse xmlns:u="${NS_RC}"/>`,
  ));
}

function buildFfmpegArgs(
  url: string, output: string, meta: Record<string, string>,
): string[] {
  const args = ["-i", url];
  if (meta.cover) {
    args.push("-i", meta.cover, "-map", "0:a",
      "-map", "1:v", "-disposition:v:0", "attached_pic");
  } else {
    args.push("-map", "0:a", "-vn");
  }
  args.push("-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
    "-codec:a", "libmp3lame", "-q:a", "0",
    "-map_metadata", "-1", "-id3v2_version", "3");
  if (meta.title) args.push("-metadata", `title=${meta.title}`);
  if (meta.artist) args.push("-metadata", `artist=${meta.artist}`);
  if (meta.album) args.push("-metadata", `album=${meta.album}`);
  args.push("-y", output);
  return args;
}

function runFfmpeg(
  cmd: string, args: string[], timeoutMs: number,
): Promise<string> {
  return new Promise((resolveP, reject) => {
    const proc = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    let timer: ReturnType<typeof setTimeout> | null = setTimeout(() => {
      timer = null;
      proc.kill();
      reject(new Error(`${cmd} timeout`));
    }, timeoutMs);
    proc.stdout.on("data", (c: Buffer) => { stdout += c.toString(); });
    proc.stderr.on("data", (c: Buffer) => { stderr += c.toString(); });
    proc.on("close", (code) => {
      if (timer) clearTimeout(timer);
      code === 0 ? resolveP(stdout)
        : reject(new Error(`${cmd} failed (${code}): ${stderr.slice(-200)}`));
    });
    proc.on("error", (err) => {
      if (timer) clearTimeout(timer);
      reject(err);
    });
  });
}

function runFfmpegProbe(url: string): Promise<Record<string, unknown>> {
  return runFfmpeg(FFPROBE_CMD, [
    "-v", "quiet", "-print_format", "json",
    "-show_format", "-show_streams", url,
  ], 15000).then(JSON.parse);
}

function buildPlaylistItem(
  url: string, meta: Record<string, string>,
): PlaylistItem {
  return {
    id: meta.musicId || url,
    name: meta.title || url,
    author: meta.artist || "Unknown",
    src: url,
    cover: meta.cover || "",
  };
}

async function resolveYtdlpMeta(
  url: string, didl: DidlMetadata | null,
): Promise<Record<string, string>> {
  const meta: Record<string, string> = {
    title: didl?.title, artist: didl?.artist || didl?.creator,
    album: didl?.album, cover: didl?.albumArtURI || undefined,
    musicId: didl?.musicId || undefined,
  };
  try {
    const info = await YtDlp.resolve(url);
    meta.title = meta.title || info.title;
    meta.artist = meta.artist || info.uploader;
    meta.cover = meta.cover || info.thumbnail;
  } catch (e) {
    logger.warn("[DLNA] yt-dlp resolve failed:", (e as Error).message);
  }
  return meta;
}

async function processDirectUrl(
  self: DlnaRenderer, url: string, didl: DidlMetadata | null,
): Promise<void> {
  const baseMeta: Record<string, string> = {
    title: didl?.title, artist: didl?.artist || didl?.creator,
    album: didl?.album, cover: didl?.albumArtURI || undefined,
    musicId: didl?.musicId || undefined,
  };
  let probeInfo: Record<string, string> = {};
  try { probeInfo = await buildProbeInfo(url); }
  catch (e) { logger.warn("[DLNA] ffprobe failed:", (e as Error).message); }
  const finalMeta = { ...baseMeta };
  for (const k of ["title", "artist", "album"])
    if (!finalMeta[k]) finalMeta[k] = probeInfo[k];
  if (!finalMeta.title)
    finalMeta.title = path.basename(new URL(url).pathname).split(".")[0] || url;
  const args = buildFfmpegArgs(url, self.outputPath, finalMeta);
  await runFfmpeg(FFMPEG_CMD, args, 180000);
  logger.info("[DLNA] ffmpeg download complete:", self.outputPath);
  const item = buildPlaylistItem(url, finalMeta);
  self.opts.onSongAdded(item);
  self.opts.broadcastPlaylist();
}

async function buildProbeInfo(
  url: string,
): Promise<Record<string, string>> {
  const probe = await runFfmpegProbe(url) as { format?: { tags?: Record<string, string> }, streams?: { codec_type: string; tags?: Record<string, string> }[] };
  const tags = probe.format?.tags || {};
  const audio = probe.streams?.find(s => s.codec_type === "audio");
  const sTags = audio?.tags || {};
  return {
    codec: audio?.codec_name,
    sampleRate: String(audio?.sample_rate),
    channels: String(audio?.channels),
    bitrate: probe.format?.bit_rate
      ? `${Math.round(+probe.format.bit_rate / 1000)} kbps` : "",
    duration: probe.format?.duration
      ? String(Math.round(+probe.format.duration * 100) / 100) : "",
    title: tags.title || tags.Title || sTags.title,
    artist: tags.artist || tags.Artist || sTags.artist,
    album: tags.album || tags.Album || sTags.album,
  };
}

interface DlnaSubscription {
  sid: string;
  callback: string;
  seq: number;
  timer: ReturnType<typeof setTimeout>;
}

async function handleSubscribe(
  self: DlnaRenderer, req: Request, res: Response,
): Promise<void> {
  const callback = String(req.headers.callback || "")
    .replace(/[<>]/g, "");
  const sid = `uuid:${generateUuid()}`;
  const body = buildLastChangeXml(
    self.transportState, "OK", self.currentUri,
    self.currentMeta?.title || "",
  );
  try {
    await sendNotify(callback, sid, 0, body);
  } catch (e) {
    logger.warn("[DLNA] Initial NOTIFY failed:", (e as Error).message);
  }
  const timer = setTimeout(() => {
    self.subscriptions = self.subscriptions.filter(s => s.sid !== sid);
  }, 1800000);
  self.subscriptions.push({ sid, callback, seq: 0, timer });
  res.set({ SID: sid, TIMEOUT: "Second-1800" });
  res.status(200).end();
}

function handleUnsubscribe(
  self: DlnaRenderer, req: Request, res: Response,
): void {
  const sid = String(req.headers.sid || "");
  const sub = self.subscriptions.find(s => s.sid === sid);
  if (sub) {
    clearTimeout(sub.timer);
    self.subscriptions = self.subscriptions.filter(s => s.sid !== sid);
  }
  res.status(200).end();
}

function sendNotify(
  callback: string, sid: string, seq: number, body: string,
): Promise<boolean> {
  return new Promise((resolveP, reject) => {
    const url = new URL(callback);
    const req = http.request({
      hostname: url.hostname, port: url.port,
      path: url.pathname, method: "NOTIFY",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        NT: "upnp:event", NTS: "upnp:propchange",
        SID: sid, SEQ: String(seq),
      },
    }, (res) => {
      res.resume();
      resolveP(true);
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

export class DlnaRenderer {
  opts: DlnaRendererOptions;
  transportState = "NO_MEDIA_PRESENT";
  currentUri = "";
  currentMeta: DidlMetadata | null = null;
  subscriptions: DlnaSubscription[] = [];
  ssdp: SsdpServer | null = null;
  udn: string;
  baseUrl: string;
  outputPath: string;

  constructor(opts: DlnaRendererOptions) {
    this.opts = opts;
    this.udn = `uuid:${generateUuid()}`;
    this.baseUrl = `http://${opts.host}:${opts.port}`;
    this.outputPath = "";
  }

  async start(): Promise<void> {
    const location = `${this.baseUrl}/dlna/device.xml`;
    this.ssdp = new SsdpServer({
      logLevel: "ERROR", unicastHost: "0.0.0.0", location,
    });
    this.ssdp.addUSN("upnp:rootdevice");
    this.ssdp.addUSN(this.udn);
    this.ssdp.addUSN("urn:schemas-upnp-org:device:MediaRenderer:1");
    this.ssdp.addUSN(NS_AVT);
    this.ssdp.addUSN(NS_RC);
    await new Promise<void>((resolveP) =>
      this.ssdp!.start(() => resolveP()),
    );
    logger.info(`[DLNA] SSDP started. UDN=${this.udn}`);
    logger.info(`[DLNA] Location: ${location}`);
  }

  stop(): void {
    if (this.ssdp) {
      this.ssdp.stop();
      this.ssdp = null;
    }
    this.subscriptions.forEach(s => clearTimeout(s.timer));
    this.subscriptions = [];
    logger.info("[DLNA] Stopped");
  }

  registerRoutes(app: Application): void {
    const router = Router();
    router.get("/dlna/device.xml", (_req: Request, res: Response) => {
      res.set("Content-Type", "application/xml; charset=utf-8");
      res.send(getDeviceXml(
        this.opts.deviceName, this.udn,
        this.opts.port, this.opts.host,
      ));
    });
    router.get("/dlna/service.xml", (_req: Request, res: Response) => {
      res.set("Content-Type", "application/xml; charset=utf-8");
      res.send(getAvTransportXml());
    });
    router.get("/dlna/rendering-service.xml",
      (_req: Request, res: Response) => {
        res.set("Content-Type", "application/xml; charset=utf-8");
        res.send(getRenderingControlXml());
      });
    router.post("/dlna/avtransport", (req: Request, res: Response) => {
      handleAvTransport(this, req.body, res);
    });
    router.post("/dlna/rendering", (req: Request, res: Response) => {
      handleRendering(req.body, res);
    });
    router.all("/dlna/event", (req: Request, res: Response) => {
      if (req.method === "SUBSCRIBE") handleSubscribe(this, req, res);
      else if (req.method === "UNSUBSCRIBE") handleUnsubscribe(this, req, res);
      else res.status(405).end();
    });
    app.use(router);
  }

  async notifySubscribers(state: string, status: string): Promise<void> {
    this.transportState = state;
    const body = buildLastChangeXml(
      state, status, this.currentUri, this.currentMeta?.title || "",
    );
    for (const sub of this.subscriptions) {
      sub.seq++;
      try { await sendNotify(sub.callback, sub.sid, sub.seq, body); }
      catch (e) {
        logger.warn(
          `[DLNA] NOTIFY failed sid=${sub.sid}:`, (e as Error).message,
        );
      }
    }
  }

  async processMedia(url: string): Promise<void> {
    const hash = crypto.createHash("md5").update(url).digest("hex");
    this.outputPath = path.join(this.opts.cacheDir, `${hash}.mp3`);
    if (fs.existsSync(this.outputPath)) {
      logger.info("[DLNA] Already cached:", this.outputPath);
      const item = buildPlaylistItem(url, {
        title: this.currentMeta?.title || url,
        artist: this.currentMeta?.artist || "Unknown",
      });
      this.opts.onSongAdded(item);
      this.opts.broadcastPlaylist();
      this.notifySubscribers("PLAYING", "OK");
      return;
    }
    try {
      if (isYtdlpUrl(url)) await this.processYtdlpUrl(url);
      else await processDirectUrl(this, url, this.currentMeta);
      await this.notifySubscribers("PLAYING", "OK");
    } catch (e) {
      logger.error("[DLNA] Download failed:", (e as Error).message);
      this.transportState = "STOPPED";
      await this.notifySubscribers("STOPPED", "ERROR_OCCURRED");
    }
  }

  private async processYtdlpUrl(url: string): Promise<void> {
    const meta = await resolveYtdlpMeta(url, this.currentMeta);
    if (!fs.existsSync(this.outputPath))
      await YtDlp.download(url, this.outputPath.replace(/\.mp3$/, ""));
    const item = buildPlaylistItem(url, meta);
    this.opts.onSongAdded(item);
    this.opts.broadcastPlaylist();
  }
}

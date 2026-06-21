import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cli from "cli";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import http from "http";
import { Server as SocketIO } from "socket.io";
import swaggerDocument from "./swagger.json";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import os from "os";
import flatCache from "flat-cache";
import dotenv from "dotenv";
import { logger } from "./logger";
import {
  resolve,
  search,
  download,
  audioInfo,
  CookieError,
  type YtDlpMetadata,
} from "./YtDlpService";
import {
  cookieStatus,
  isSupportedPlatform,
  saveCookie,
  type CookiePlatform,
} from "./CookieService";
import { DlnaRenderer, type PlaylistItem } from "./DlnaRenderer";
import { stringify } from "querystring";

const app = express();

dotenv.config({ override: true, quiet: true });

const options = cli.parse({
  host: [
    "b",
    "web server listen on address",
    "ip",
    process.env.HOST || "0.0.0.0",
  ],
  port: ["p", "listen on port", "string", process.env.PORT || "8011"],
  webroot: ["d", "web root path", "string", process.env.WEBROOT || "./public"],
  logLevel: [
    "l",
    "log level (error, warn, info, debug)",
    "string",
    process.env.LOG_LEVEL || "info",
  ],
});

const webRoot: string = options.webroot;
const cacheDir = path.join(webRoot, "cache");
const trackCache = flatCache.load("yt-track-cache", os.tmpdir());

app.use(bodyParser.urlencoded({ extended: false, limit: "10mb" }));
app.use(bodyParser.json({ limit: "10mb" }));

app.use(
  "/swagger",
  (req: Request, res: Response, next: NextFunction) => {
    swaggerDocument.host = req.get("host");
    req.swaggerDoc = swaggerDocument;
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup(),
);

const isVideoUrl =
  /^(https?:\/\/)?(www\.youtube\.com|youtu\.be|www\.bilibili\.com|m\.bilibili\.com)\//i;

function mapExtractor(extractor: string): "youtube" | "bilibili" {
  if (extractor.includes("youtube") || extractor.includes("Youtube"))
    return "youtube";
  return "bilibili";
}

function toSongFormat(meta: YtDlpMetadata) {
  return {
    id: meta.webpage_url,
    name: meta.title,
    artists: [{ name: meta.uploader }],
    album: { cover: meta.thumbnail || "" },
    link: meta.webpage_url,
    vendor: mapExtractor(meta.extractor),
  };
}

function cacheTrack(meta: YtDlpMetadata) {
  trackCache.setKey(meta.webpage_url, meta);
  trackCache.save();
}

function groupByVendor(songs: ReturnType<typeof toSongFormat>[]) {
  const groups: Record<string, { total: number; songs: typeof songs }> = {
    youtube: { total: 0, songs: [] },
    bilibili: { total: 0, songs: [] },
  };
  for (const song of songs) {
    groups[song.vendor].songs.push(song);
    groups[song.vendor].total++;
  }
  return groups;
}

app.get("/api/song/search", async (req: Request, res: Response) => {
  const keyword = req.query.keyword as string;
  logger.debug("GET /api/song/search", { keyword });

  if (!keyword) {
    res.status(400).send({ status: false, error: "参数错误" });
    return;
  }

  try {
    if (isVideoUrl.test(keyword)) {
      const meta = await resolve(keyword);
      cacheTrack(meta);
      res.send({ status: true, data: groupByVendor([toSongFormat(meta)]) });
    } else {
      const results = await search(keyword);
      results.forEach(cacheTrack);
      res.send({
        status: true,
        data: groupByVendor(results.map(toSongFormat)),
      });
    }
  } catch (e) {
    if (e instanceof CookieError) {
      const need = [e.platform];
      res.status(400).send({
        status: false,
        cookieNeed: need,
        error: `Cookie 驗證失敗: ${e.platform}`,
      });
      return;
    }
    res.status(500).send({ status: false, error: (e as Error).message });
  }
});

app.get("/api/song/detail", async (req: Request, res: Response) => {
  const id = req.query.id as string;
  logger.debug("GET /api/song/detail", { id });

  if (!id) {
    res.status(400).send({ status: false, error: "参数错误" });
    return;
  }

  const cached = trackCache.getKey(id) as YtDlpMetadata | undefined;
  if (cached) {
    res.send({ status: true, data: toSongFormat(cached) });
  } else {
    res.status(404).send({ status: false, error: "not found" });
  }
});

app.get("/api/song/url", async (req: Request, res: Response) => {
  const vendor = req.query.vendor;
  const id = req.query.id as string;
  logger.debug("GET /api/song/url", { vendor, id });

  if (!id || !vendor) {
    res.status(400).send({ status: false, error: "参数错误" });
    return;
  }

  const cached = trackCache.getKey(id) as YtDlpMetadata | undefined;
  if (cached) {
    res.send({ status: true, data: cached.webpage_url });
  } else {
    res.status(404).send({ status: false, error: "not found" });
  }
});

let SongList: unknown[] = [];
const playlistFile = path.join(cacheDir, "playlist.json");

if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

try {
  if (fs.existsSync(playlistFile)) {
    const data = fs.readFileSync(playlistFile, "utf8");
    SongList = JSON.parse(data);
    logger.debug(`Loaded ${SongList.length} songs from playlist.json`);
  }
} catch (err: unknown) {
  logger.error("Failed to load playlist:", (err as Error).message);
}

app.post("/song/preload", async (req: Request, res: Response) => {
  const url: string = req.body.url || "";
  let platform: string = req.body.platform || "";

  if (!platform) {
    // detect from url
    platform = url.includes("youtube") ? "youtube" : "bilibili";
  }

  if (!url) {
    res.send(JSON.stringify({ status: 0, url: "" }));
    return;
  }

  const hash = crypto.createHash("md5").update(url).digest("hex");
  const localPath = path.join(cacheDir, hash);
  const cachedFile = path.join(cacheDir, `${hash}.mp3`);

  if (fs.existsSync(cachedFile)) {
    const host = req.get("host");
    res.send(
      JSON.stringify({ status: 1, url: `http://${host}/cache/${hash}.mp3` }),
    );
    return;
  }

  try {
    await download(url, localPath, platform);
  } catch (err) {
    res.send(JSON.stringify({ status: false, error: (err as Error).message }));
    return;
  }

  if (!fs.existsSync(cachedFile)) {
    res.send(JSON.stringify({ status: false, error: "Download failed: cache file not created" }));
    return;
  }

  const host = req.get("host");
  res.send(
    JSON.stringify({ status: 1, url: `http://${host}/cache/${hash}.mp3` }),
  );
});

app.post("/song/save", async (req: Request, res: Response) => {
  SongList = JSON.parse(req.body.list || "[]") || [];

  try {
    fs.writeFileSync(playlistFile, JSON.stringify(SongList, null, 2), "utf8");
  } catch (err: unknown) {
    logger.error("Failed to save playlist:", (err as Error).message);
  }

  await res.send(JSON.stringify(SongList));
});

app.get("/song/get", async (req: Request, res: Response) => {
  await res.send(SongList);
});

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

interface ClientToServerEvents {
  msg: (data: string) => void;
  disconnect: () => void;
  error: (error: unknown) => void;
}

interface ServerToClientEvents {
  msg: (data: string) => void;
}

const server = http.createServer(app);
const io = new SocketIO<ClientToServerEvents, ServerToClientEvents>(server, {
  path: "/io",
});

const dlna = new DlnaRenderer({
  port: parseInt(options.port),
  host: options.host === "0.0.0.0" ? "0.0.0.0" : options.host,
  deviceName: process.env.DLNA_DEVICE_NAME || "MMFM",
  cacheDir,
  onSongAdded: (item: PlaylistItem) => {
    SongList.push(item);
    try {
      fs.writeFileSync(playlistFile, JSON.stringify(SongList, null, 2), "utf8");
    } catch (err: unknown) {
      logger.error("[DLNA] Failed to save playlist:", (err as Error).message);
    }
    logger.info("[DLNA] Song added to playlist:", item.name);
  },
  broadcastPlaylist: () => {
    io.to("chat").emit("msg", JSON.stringify({
      type: "chat",
      command: "playlist",
      action: "update",
    }));
  },
  io,
});
dlna.registerRoutes(app);

io.on("connection", (socket) => {
  logger.debug("Socket connected:", socket.id, "from", socket.handshake.address);
  socket.join("chat");
  logger.debug("Socket", socket.id, "joined chat room");
  socket.on("msg", (msg) => {
    logger.debug("msg from", socket.id, "len:", msg.length);
    socket.to("chat").emit("msg", msg);
  });
  socket.on("disconnect", () => {
    logger.debug("Socket disconnected:", socket.id);
  });

  socket.on("error", (error) => {
    logger.error("Socket error from", socket.id, error);
  });
});

app.post("/api/cookies/:platform", (req: Request, res: Response) => {
  const platform = req.params.platform;
  if (!isSupportedPlatform(platform)) {
    res
      .status(400)
      .send({ status: false, error: `Unsupported platform: ${platform}` });
    return;
  }
  const content = req.body?.content;
  if (!content || typeof content !== "string" || !content.trim()) {
    res
      .status(400)
      .send({ status: false, error: "参数错误: content 必须为非空字符串" });
    return;
  }
  try {
    const result = saveCookie(platform as CookiePlatform, content);
    res.send({ status: true, platform, updatedAt: result.updatedAt });
  } catch (err) {
    res.status(500).send({ status: false, error: (err as Error).message });
  }
});

app.get("/api/cookies/status", (_req: Request, res: Response) => {
  res.send(cookieStatus());
});

app.use(express.static(webRoot));

server.listen(options.port, options.host, () => {
  logger.info("=== MMFM Server Started ===");
  logger.info(`Host     : ${options.host}`);
  logger.info(`Port     : ${options.port}`);
  logger.info(`Web Root : ${webRoot}`);
  logger.info(`Log Level: ${options.logLevel}`);
  logger.info(`Cache Dir: ${cacheDir}`);
  logger.info(`Playlist : ${playlistFile} (${SongList.length} songs)`);
  logger.info(`PID      : ${process.pid}`);
  dlna.start().catch((e) => {
    logger.error("[DLNA] SSDP start failed:", e);
  });
});

function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  dlna.stop();
  io.close();
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 5000);
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

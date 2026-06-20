import express, { type Request, type Response, type NextFunction } from "express";
import cli from "cli";
import bodyParser from "body-parser";
import musicApi from "./MusieApi";
import swaggerUi from "swagger-ui-express";
import http from "http";
import { Server as SocketIO } from "socket.io";
import swaggerDocument from "./swagger.json";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { FetchStream } from "fetch";
import dotenv from "dotenv";
import { logger } from "./logger";

const app = express();

dotenv.config({ override: true });

const options = cli.parse({
  host: ["b", "web server listen on address", "ip", process.env.HOST || "0.0.0.0"],
  port: ["p", "listen on port", "string", process.env.PORT || "8011"],
  webroot: ["d", "web root path", "string", process.env.WEBROOT || "./public"],
  logLevel: ["l", "log level (error, warn, info, debug)", "string", process.env.LOG_LEVEL || "info"],
});

const webRoot: string = options.webroot;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
  "/swagger",
  (req: Request, res: Response, next: NextFunction) => {
    swaggerDocument.host = req.get("host");
    req.swaggerDoc = swaggerDocument;
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup()
);

app.get("/api/song/search", async (req: Request, res: Response) => {
  const search = req.query.keyword as string;
  logger.debug("GET /api/song/search", { keyword: search });

  if (!search) {
    res.status(400).send({
      status: false,
      error: "参数错误",
    });
    return;
  }
  let data;
  try {
    data = await musicApi.search(search);
  } catch (e) {
    res.status(500).send({
      status: false,
      error: e,
    });
    return;
  }

  res.send({
    status: true,
    data,
  });
});

app.get("/api/song/detail", async (req: Request, res: Response) => {
  const vendor = req.query.vendor;
  const id = req.query.id || 0;
  logger.debug("GET /api/song/detail", { vendor, id });

  if (!id || !vendor) {
    res.status(400).send({
      status: false,
      error: "参数错误",
    });
    return;
  }
  let data;
  try {
    data = await musicApi.song(id as string);
  } catch (e) {
    res.status(500).send({
      status: false,
      error: e,
    });
    return;
  }
  res.send({
    status: true,
    data,
  });
});

app.get("/api/song/url", async (req: Request, res: Response) => {
  const vendor = req.query.vendor;
  const id = req.query.id || 0;
  logger.debug("GET /api/song/url", { vendor, id });

  if (!id || !vendor) {
    res.status(400).send({
      status: false,
      error: "参数错误",
    });
    return;
  }
  let data;
  try {
    data = await musicApi.url(id as string);
  } catch (e) {
    res.status(500).send({
      status: false,
      error: e,
    });
    return;
  }

  res.send({
    status: true,
    data,
  });
});

let SongList: unknown[] = [];
const cacheDir = path.join(webRoot, "cache");
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

function downloadFile(url: string, saveAs: string): Promise<void> {
  logger.debug("Downloading file:", url);
  const fileStream = fs.createWriteStream(saveAs);

  return new Promise((resolve, reject) => {
    let headers: Record<string, string> = {
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language":
        "en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3",
      "Cache-Control": "max-age=0",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36",
    };
    if (url.includes("bilivideo.com")) {
      headers["Referer"] = "https://www.bilibili.com/";
    }
    const req = new FetchStream(url, {
      headers,
    });

    req.on("meta", (meta: { status: number }) => {
      if (meta.status != 200) {
        reject();
      }
    });
    req.on("end", () => {
      logger.debug(`The file is finished downloading.`);
      resolve();
    });
    req.on("error", (error: unknown) => {
      reject(error);
    });

    req.pipe(fileStream);
  });
}

app.post("/song/preload", async (req: Request, res: Response) => {
  let url: string = req.body.url || "";
  let md5 = crypto.createHash("md5");
  let hash = md5.update(url).digest("hex");

  if (url.length <= 0) {
    await res.send(
      JSON.stringify({
        status: 0,
        url: "",
      })
    );
  }

  try {
    await downloadFile(url, path.join(cacheDir, hash));
  } catch (err) {
    await res.send(
      JSON.stringify({
        status: false,
        error: err,
      })
    );
    return;
  }

  let host = req.get("host");

  await res.send(
    JSON.stringify({
      status: 1,
      url: `http://${host}/cache/${hash}`,
    })
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

io.on("connection", (socket) => {
  logger.debug("Socket connected:", socket.id);
  socket.join("chat");
  socket.on("msg", (msg) => {
    socket.to("chat").emit("msg", msg);
  });
  socket.on("disconnect", () => {
    logger.debug("on disconnect");
  });

  socket.on("error", (error) => {
    logger.error(error);
  });
});

app.use(express.static(webRoot));

if (require && require.main === module) {
  server.listen(options.port, options.host, () => {
    logger.info("=== MMFM Server Started ===");
    logger.info(`Host     : ${options.host}`);
    logger.info(`Port     : ${options.port}`);
    logger.info(`Web Root : ${webRoot}`);
    logger.info(`Log Level: ${options.logLevel}`);
    logger.info(`Cache Dir: ${cacheDir}`);
    logger.info(`Playlist : ${playlistFile} (${SongList.length} songs)`);
    logger.info(`PID      : ${process.pid}`);
  });

  function gracefulShutdown(signal: string) {
    logger.info(`Received ${signal}, shutting down gracefully...`);
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
}

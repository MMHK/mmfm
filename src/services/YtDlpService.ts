import { spawn } from "child_process";
import { logger } from "./logger";
import { cookiePath, cookieExists, type CookiePlatform } from "./CookieService";

export interface YtDlpMetadata {
  id: string;
  title: string;
  uploader: string;
  thumbnail?: string;
  duration?: number;
  webpage_url: string;
  extractor: string;
}

export class CookieError extends Error {
  platform: CookiePlatform;
  stderr: string;
  constructor(platform: CookiePlatform, stderr: string) {
    super(`Cookie required for ${platform}: ${stderr}`);
    this.name = "CookieError";
    this.platform = platform;
    this.stderr = stderr;
  }
}

const CMD = process.platform === "win32" ? "yt-dlp.cmd" : "yt-dlp";

function runYtDlp(args: string[], platform?: CookiePlatform): Promise<string> {
  if (platform && cookieExists(platform)) {
    args = ["--cookies", cookiePath(platform), ...args];
  }
  return new Promise((resolve, reject) => {
    logger.debug(`[yt-dlp] spawn: ${CMD} ${args.join(" ")}`);
    const startTime = Date.now();
    const proc = spawn(CMD, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    proc.stderr.on("data", (chunk) => {
      const msg = chunk.toString();
      stderr += msg;
      logger.debug(`[yt-dlp:stderr] ${msg.trim()}`);
    });

    proc.on("close", (code) => {
      const elapsed = Date.now() - startTime;
      const pidMsg = `pid=${proc.pid}`;
      const hasData = stdout.trim().length > 0;

      if (code !== 0 && !hasData) {
        logger.error(`[yt-dlp] exited code=${code} ${pidMsg} (${elapsed}ms), no output: ${stderr.trim()}`);
        return reject(new Error(`code=${code}: ${stderr.trim()}`));
      }
      if (code !== 0) {
        logger.warn(`[yt-dlp] exited code=${code} ${pidMsg} (${elapsed}ms), partial data returned`);
      } else {
        logger.debug(`[yt-dlp] exited code=0 ${pidMsg} (${elapsed}ms) stdout=${stdout.length}bytes`);
      }
      resolve(stdout);
    });

    proc.on("error", (err) => {
      logger.error(`[yt-dlp] spawn failed pid=${proc.pid}: ${err.message}`);
      reject(err);
    });
  });
}

function parseMetadata(data: string): YtDlpMetadata {
  const json = JSON.parse(data);
  return {
    id: json.id,
    title: json.title,
    uploader: json.uploader || json.channel || "",
    thumbnail: json.thumbnail,
    duration: json.duration,
    webpage_url: json.webpage_url,
    extractor: json.extractor,
  };
}

export function resolve(
  url: string,
  platform?: CookiePlatform,
): Promise<YtDlpMetadata> {
  const args = [
    "--dump-json",
    "--no-download",
    "--no-playlist",
    url,
  ];
  return runYtDlp(args, platform).then((stdout) => parseMetadata(stdout));
}

export function search(
  keyword: string,
  platforms: string[] = ["youtube", "bilibili"],
): Promise<YtDlpMetadata[]> {
  const prefixMap: Record<string, string> = { youtube: "yt", bilibili: "bili" };
  const queries = platforms.map((p) => ({
    prefix: prefixMap[p] || p,
    platform: p as CookiePlatform,
  }));
  const promises = queries.map(({ prefix, platform }) =>
    runYtDlp(
      [
        "--dump-json",
        "--no-download",
        `${prefix}search5:${keyword}`,
      ],
      platform,
    )
      .then((stdout) =>
        stdout.trim().split("\n").filter(Boolean)
          .map((line) => {
            try { return parseMetadata(line); }
            catch { logger.debug(`[yt-dlp] parse failed: ${line.slice(0, 100)}`); return null; }
          })
          .filter((m): m is YtDlpMetadata => m !== null),
      )
      .catch((err) => {
        logger.warn(`[yt-dlp] ${platform} search failed: ${err.message}`);
        return [];
      }),
  );
  return Promise.all(promises).then((results) => results.flat());
}

export function download(
  url: string,
  outputPath: string,
  platform?: CookiePlatform,
): Promise<void> {
  const args = [
    "-x",
    "--audio-format",
    "mp3",
    "--audio-quality",
    "0",
    "--no-playlist",
    "-o",
    `${outputPath}.%(ext)s`,
    "--ppa",
    "extractaudio:-filter:a loudnorm=I=-16:TP=-1.5:LRA=11",
    url,
  ];
  return runYtDlp(args, platform).then(() => undefined);
}

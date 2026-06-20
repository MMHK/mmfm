import fs from "fs";
import path from "path";

const COOKIE_DIR = process.env.COOKIE_DIR || path.join(__dirname, "..", "..", "public", "cache", "cookies");

const SUPPORTED_PLATFORMS = ["youtube", "bilibili"] as const;
export type CookiePlatform = typeof SUPPORTED_PLATFORMS[number];

export function isSupportedPlatform(p: string): p is CookiePlatform {
  return (SUPPORTED_PLATFORMS as readonly string[]).includes(p);
}

export function cookiePath(platform: CookiePlatform): string {
  return path.join(COOKIE_DIR, `${platform}.txt`);
}

export function cookieExists(platform: CookiePlatform): boolean {
  return fs.existsSync(cookiePath(platform));
}

export function saveCookie(platform: CookiePlatform, content: string): { updatedAt: number } {
  fs.mkdirSync(COOKIE_DIR, { recursive: true });
  fs.writeFileSync(cookiePath(platform), content, "utf8");
  const stat = fs.statSync(cookiePath(platform));
  return { updatedAt: stat.mtimeMs };
}

export function cookieStatus(): Record<CookiePlatform, { exists: boolean; updatedAt: number | null }> {
  const result = {} as Record<CookiePlatform, { exists: boolean; updatedAt: number | null }>;
  for (const p of SUPPORTED_PLATFORMS) {
    if (fs.existsSync(cookiePath(p))) {
      const stat = fs.statSync(cookiePath(p));
      result[p] = { exists: true, updatedAt: stat.mtimeMs };
    } else {
      result[p] = { exists: false, updatedAt: null };
    }
  }
  return result;
}

const LOG_LEVELS: Record<string, number> = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL || "info"] ?? 2;

export const logger = {
  error: (...args: unknown[]) => currentLevel >= 0 && console.error("[ERROR]", ...args),
  warn:  (...args: unknown[]) => currentLevel >= 1 && console.warn("[WARN]", ...args),
  info:  (...args: unknown[]) => currentLevel >= 2 && console.log("[INFO]", ...args),
  debug: (...args: unknown[]) => currentLevel >= 3 && console.log("[DEBUG]", ...args),
};

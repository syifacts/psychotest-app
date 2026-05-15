import { Redis } from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
export const redis = new Redis(redisUrl);

redis.on("connect", () => console.log("[Redis] Berhasil terhubung ke server."));
redis.on("error", (err) =>
  console.error("[Redis] Gagal terhubung ke server:", err),
);

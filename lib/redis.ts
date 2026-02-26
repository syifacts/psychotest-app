import { Redis } from "ioredis";

// Inisialisasi koneksi ke Redis Server (In-Memory Data Store).
// Digunakan untuk menangani operasi berkecepatan tinggi seperti Idempotency Lock.
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redis = new Redis(redisUrl);

redis.on("connect", () => {
  console.log("[Redis] Berhasil terhubung ke server.");
});

redis.on("error", (err) => {
  console.error("[Redis] Gagal terhubung ke server:", err);
});

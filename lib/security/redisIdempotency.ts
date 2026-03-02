import { redis } from "@/lib/redis";

export async function checkIdempotency(merchantRef: string): Promise<boolean> {
  const lockKey = `payment_lock:${merchantRef}`;

  // Coba gembok ID Transaksi ini selama 5 menit (300 detik)
  // 'NX' artinya Not eXists = Hanya digembok kalau belum ada yang ngegembok!
  const isLocked = await redis.set(lockKey, "PROCESSING", "EX", 300, "NX");

  // Kalau isLocked isinya null/false, berarti udah digembok duluan sama request lain (Replay Attack!)
  if (!isLocked) {
    console.warn(
      `⚠️ [REPLAY ATTACK BLOCKED] Transaksi ${merchantRef} sedang diproses!`,
    );
    return false;
  }

  return true; // Lolos, aman diproses
}

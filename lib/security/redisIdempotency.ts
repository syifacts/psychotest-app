import { redis } from "@/lib/redis";
import crypto from "crypto";

export async function checkIdempotency(
  merchantRef: string,
  rawBody: string,
): Promise<boolean> {
  const idempotencyKey = `idempotency:tripay:${merchantRef}`;

  // 1. [ADVANCED] Buat "Sidik Jari" dari seluruh payload mentah menggunakan SHA-256
  // Jadi bukan cuma ngunci ID-nya aja, tapi ngunci "isi" datanya juga.
  const payloadFingerprint = crypto
    .createHash("sha256")
    .update(rawBody)
    .digest("hex");

  // 2. [ATOMIC OPERATION] Coba pasang gembok selama 24 Jam (86400 detik)
  // Value yang disimpan bukan "TRUE", melainkan Sidik Jari payload-nya.
  const isLocked = await redis.set(
    idempotencyKey,
    payloadFingerprint,
    "EX",
    86400,
    "NX",
  );

  // Jika isLocked false, berarti gembok sudah terpasang sebelumnya oleh request lain
  if (!isLocked) {
    // 3. [DEFENSE-IN-DEPTH FORENSIC] Selidiki kenapa request ini ditolak!
    const existingFingerprint = await redis.get(idempotencyKey);

    if (existingFingerprint === payloadFingerprint) {
      // Sidik jari sama persis: Ini murni Replay Attack dari JMeter atau Tripay nge-retry.
      console.warn(
        `⚠️ [REPLAY ATTACK BLOCKED] Payload duplikat identik ditolak untuk ref: ${merchantRef}`,
      );
    } else {
      // Sidik jari BEDA: Hacker menggunakan Merchant Ref lama tapi isinya diubah!
      console.error(
        `🚨 [HYBRID ATTACK DETECTED] Replay Attack dengan payload yang dimodifikasi pada ref: ${merchantRef}!`,
      );
    }

    return false; // Apapun jenis serangannya, tetap tolak!
  }

  return true; // Lolos, request pertama yang sah
}

import { redis } from "@/lib/redis";
import crypto from "crypto";

export async function checkIdempotency(
  merchantRef: string,
  rawBody: string,
): Promise<boolean> {
  const idempotencyKey = `idempotency:tripay:${merchantRef}`;

  const payloadFingerprint = crypto
    .createHash("sha256")
    .update(rawBody)
    .digest("hex");

  const isLocked = await redis.set(
    idempotencyKey,
    payloadFingerprint,
    "EX",
    86400,
    "NX",
  );

  if (!isLocked) {
    const existingFingerprint = await redis.get(idempotencyKey);

    if (existingFingerprint === payloadFingerprint) {
      console.warn(
        `⚠️ [REPLAY BLOCKED] Payload duplikat ditolak: ${merchantRef}`,
      );
    } else {
      console.error(
        `🚨 [HYBRID ATTACK] Payload dimodifikasi pada ref: ${merchantRef}!`,
      );
    }
    return false;
  }

  return true; // Lolos, ini adalah request pertama yang sah
}

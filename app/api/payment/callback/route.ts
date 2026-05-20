import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { verifyTripaySignature } from "@/lib/security/hmacVerifier";
import { checkIdempotency } from "@/lib/security/redisIdempotency";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown_ip";

  try {
    const rateLimitKey = `rate_limit:callback:${ip}`;
    const requestCount = await redis.incr(rateLimitKey);

    if (requestCount === 1) {
      await redis.expire(rateLimitKey, 60);
    }

    if (requestCount > 50) {
      console.warn(`🚨 [DDoS BLOCKED] Terlalu banyak request dari IP: ${ip}`);
      return NextResponse.json(
        { success: false, message: "Too many requests" },
        { status: 429 },
      );
    }

    // -------------------------------------------------------------------------
    // 1. Ekstraksi dan Validasi Payload Dasar
    // -------------------------------------------------------------------------
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    const { reference, status, total_amount, merchant_ref } = body;

    if (!reference || !merchant_ref || !status) {
      return NextResponse.json(
        { success: false, message: "Payload incomplete" },
        { status: 400 },
      );
    }

    const headerSignature = req.headers.get("x-callback-signature");

    console.log(
      `\n[Webhook HTTP POST] Menerima payload untuk: ${merchant_ref}`,
    );
    console.log(`[Signature Header] ${headerSignature}`);
    console.log(headerSignature);
    console.log(`[BODY JSON RAW]`);
    console.log(rawBody);

    const isAuthentic = verifyTripaySignature(rawBody, body, headerSignature);
    if (!isAuthentic) {
      console.error(
        "❌ [SECURITY BREACH] Invalid HMAC Signature terdeteksi! Akses ditolak.",
      );
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 },
      );
    }

    // -------------------------------------------------------------------------
    // LAYER 2: Idempotency Lock (Mitigasi Race Condition & Replay Attack)
    // -------------------------------------------------------------------------
    const isSafeToProcess = await checkIdempotency(merchant_ref, rawBody);
    if (!isSafeToProcess) {
      console.warn(
        `⚠️ [SECURITY WARNING] Duplicate Request dicegah untuk transaksi: ${merchant_ref}`,
      );
      return NextResponse.json(
        { success: false, message: "Conflict / Duplicate Request Detected" },
        { status: 409 },
      );
    }

    console.log(
      "✅ [Security] Transaksi lolos verifikasi berlapis (HMAC & Redis).",
    );

    // -------------------------------------------------------------------------
    // 3. Proses Update Database (Sistem Utama).
    // -------------------------------------------------------------------------
    const paymentId = Number(merchant_ref.split("-")[1]);
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Payment not found" },
        { status: 404 },
      );
    }

    if (payment.status === "SUCCESS") {
      console.warn(
        `🛡️ [DB BLOCKED] Payment ID ${paymentId} sudah LUNAS di Database! Replay Attack (TTL Expiry) digagalkan.`,
      );
      return NextResponse.json(
        {
          success: false,
          message: "Payment already processed / Replay Attack Blocked",
        },
        { status: 409 },
      );
    }

    const tripayStatus = status.toUpperCase();
    let newStatus = "PENDING";
    if (["PAID", "SETTLED", "SUCCESS"].includes(tripayStatus))
      newStatus = "SUCCESS";
    else if (["EXPIRED", "FAILED", "REFUND", "UNPAID"].includes(tripayStatus))
      newStatus = "FAILED";

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: newStatus,
        reference,
        payload: body,
        paidAt: newStatus === "SUCCESS" ? new Date() : null,
      },
    });

    // -------------------------------------------------------------------------
    // 4. Akses Token Tes
    // -------------------------------------------------------------------------
    if (newStatus === "SUCCESS") {
      await prisma.testAttempt.create({
        data: {
          userId: payment.userId!,
          testTypeId: payment.testTypeId,
          paymentId: payment.id,
          companyId: payment.companyId,
          status: "RESERVED",
        },
      });
      console.log(
        `[System Info] Akses Token Tes berhasil dicetak untuk Transaksi ${paymentId}.`,
      );
    }

    return NextResponse.json({ success: true, payment: updatedPayment });
  } catch (err: any) {
    console.error("[System Error] Terjadi kesalahan pada proses webhook:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

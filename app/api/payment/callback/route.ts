import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis"; // TAMBAHAN: Import redis untuk Rate Limiting Layer 0
import { verifyTripaySignature } from "@/lib/security/hmacVerifier";
import { checkIdempotency } from "@/lib/security/redisIdempotency";

export async function POST(req: NextRequest) {
  // Dapatkan IP address untuk keperluan Rate Limiting
  const ip = req.headers.get("x-forwarded-for") || "unknown_ip";

  try {
    // -------------------------------------------------------------------------
    // LAYER 0: Rate Limiting (Mencegah DDoS & Spam Request dari JMeter)
    // -------------------------------------------------------------------------
    const rateLimitKey = `rate_limit:callback:${ip}`;
    const requestCount = await redis.incr(rateLimitKey);

    // Set expired 60 detik (1 menit) pada request pertama
    if (requestCount === 1) {
      await redis.expire(rateLimitKey, 60);
    }

    // Batasi 50 request per menit per IP (Limit yang pas buat demo JMeter)
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

    // Logging payload untuk keperluan audit sistem
    console.log(
      `\n[Webhook HTTP POST] Menerima payload untuk: ${merchant_ref}`,
    );
    console.log(`[Signature Header] ${headerSignature}`);
    // console.log(`[RAW BODY ASLI DARI TRIPAY]:\n${rawBody}`); // Boleh di-comment biar terminal ga penuh pas di-spam JMeter

    // -------------------------------------------------------------------------
    // LAYER 1: Autentikasi Kriptografi HMAC (Anti Webhook Spoofing)
    // -------------------------------------------------------------------------
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
    // 3. Proses Update Database (Sistem Utama)
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

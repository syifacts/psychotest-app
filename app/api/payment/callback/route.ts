import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTripaySignature } from "@/lib/security/hmacVerifier";
import { checkIdempotency } from "@/lib/security/redisIdempotency";

export async function POST(req: NextRequest) {
  try {
    // 1. Ekstraksi dan Validasi Payload Dasar
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
    console.log(`[RAW BODY ASLI DARI TRIPAY]:\n${rawBody}`);

    // 2. Lapisan Keamanan 1: Autentikasi Kriptografi HMAC (Anti-Spoofing)
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

    // 3. Lapisan Keamanan 2: Idempotency Lock (Mitigasi Race Condition & Replay Attack)
    const isSafeToProcess = await checkIdempotency(merchant_ref);
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

    // 4. Proses Update Database
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

    // 5. Akses Token Tes
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

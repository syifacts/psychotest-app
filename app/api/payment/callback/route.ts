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

    // 2. Environment Switch (Pengujian Kerentanan Sistem)
    const isSecurityOn = process.env.SECURITY_MODE === "ON";

    if (isSecurityOn) {
      // Lapisan Keamanan 1: Autentikasi Kriptografi HMAC
      const isAuthentic = verifyTripaySignature(rawBody, body, headerSignature);
      if (!isAuthentic) {
        return NextResponse.json(
          { success: false, message: "Invalid signature" },
          { status: 400 },
        );
      }

      // Lapisan Keamanan 2: Idempotency Lock (Mitigasi Race Condition)
      const isSafeToProcess = await checkIdempotency(merchant_ref);
      if (!isSafeToProcess) {
        return NextResponse.json(
          { success: false, message: "Conflict / Duplicate Request Detected" },
          { status: 409 },
        );
      }
      console.log(
        "[Security] Transaksi lolos verifikasi berlapis (HMAC & Redis).",
      );
    } else {
      console.warn(
        "[System Alert] Sistem berjalan tanpa perlindungan keamanan (SECURITY_MODE=OFF).",
      );
    }

    // 3. Eksekusi Kueri Pembaruan Database (Prisma ORM)
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

    let newStatus: "SUCCESS" | "FAILED" | "PENDING" = "PENDING";
    if (["PAID", "SETTLED", "SUCCESS"].includes(status)) newStatus = "SUCCESS";
    else if (["EXPIRED", "FAILED", "REFUND"].includes(status))
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

    // 4. Eksekusi Logika Bisnis (Pencetakan Akses Tes)
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

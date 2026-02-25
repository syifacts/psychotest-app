import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTripaySignature } from "@/lib/security/hmacVerifier";
import { checkIdempotency } from "@/lib/security/redisIdempotency";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    const { reference, status, total_amount, merchant_ref } = body;

    // Pengecekan data kosong
    if (!reference || !merchant_ref || !status) {
      return NextResponse.json(
        { success: false, message: "Payload incomplete" },
        { status: 400 },
      );
    }

    // ==========================================
    // 🛡️ LAPIS 1: VERIFIKASI HMAC (Anti Webhook Spoofing)
    // ==========================================
    const headerSignature = req.headers.get("x-callback-signature");
    const isAuthentic = verifyTripaySignature(rawBody, body, headerSignature);

    if (!isAuthentic) {
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 },
      );
    }

    // ==========================================
    // 🛡️ LAPIS 2: REDIS IDEMPOTENCY (Anti Replay Attack & Race Condition)
    // ==========================================
    const isSafeToProcess = await checkIdempotency(merchant_ref);

    if (!isSafeToProcess) {
      return NextResponse.json(
        { success: false, message: "Conflict / Duplicate Request Detected" },
        { status: 409 },
      );
    }

    // ==========================================
    // 💾 LAPIS 3: PROSES UPDATE DATABASE MYSQL
    // ==========================================
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

    return NextResponse.json({ success: true, payment: updatedPayment });
  } catch (err: any) {
    console.error("❌ Payment callback error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

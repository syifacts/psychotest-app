import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const TRIPAY_API_KEY = process.env.TRIPAY_API_KEY ?? "";
const TRIPAY_PRIVATE_KEY = process.env.TRIPAY_PRIVATE_KEY ?? "";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);

    const { reference, status, total_amount, merchant_ref, sign } = body;

    if (!reference || !merchant_ref || !status) {
      return NextResponse.json(
        { success: false, message: "Payload incomplete" },
        { status: 400 },
      );
    }

    let valid = false;
    const headerSignature = req.headers.get("x-callback-signature");

    if (headerSignature) {
      const calc = crypto
        .createHmac("sha256", TRIPAY_PRIVATE_KEY)
        .update(rawBody)
        .digest("hex");

      valid = headerSignature.toLowerCase() === calc;

      console.log("🔎 Payment Callback check:", {
        rawBody,
        calc,
        headerSignature,
        privateKey: TRIPAY_PRIVATE_KEY.slice(0, 6) + "...",
      });
    } else if (sign) {
      const str = `${reference}${merchant_ref}${total_amount}`;
      const calc = crypto
        .createHmac("sha256", TRIPAY_PRIVATE_KEY)
        .update(str)
        .digest("hex");

      valid = calc === sign;
      console.log("🔎 Transaction Callback check:", {
        str,
        calc,
        sign,
        privateKey: TRIPAY_PRIVATE_KEY.slice(0, 6) + "...",
      });
    }

    if (!valid) {
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 },
      );
    }

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

// app/api/payment/latest/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const testTypeId = url.searchParams.get("testTypeId");
    const userId = url.searchParams.get("userId");

    if (!testTypeId || !userId) {
      return NextResponse.json(
        { error: "Missing testTypeId or userId" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findFirst({
      where: {
        testTypeId: Number(testTypeId),
        userId: Number(userId),
        status: "SUCCESS",
      },
      orderBy: { createdAt: "desc" },
      include: {
        attempts: true, // cek apakah payment ini sudah dipakai untuk attempt
      },
    });

    return NextResponse.json({
      payment: payment
        ? {
            ...payment,
            attemptUsed: payment.attempts.length > 0,
          }
        : null,
    });
  } catch (err: any) {
    console.error("❌ Error di /api/payment/latest:", err);
    return NextResponse.json(
      { error: "Gagal ambil payment terakhir", message: err.message },
      { status: 500 }
    );
  }
}

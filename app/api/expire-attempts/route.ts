// app/api/expire-attempts/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // cari attempt yang sudah lebih dari 1 hari sejak reservedAt
    const expiredAttempts = await prisma.testAttempt.findMany({
      where: {
        status: "RESERVED",
        reservedAt: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // lebih dari 1 hari
        },
      },
    });

    for (const attempt of expiredAttempts) {
      await prisma.testAttempt.update({
        where: { id: attempt.id },
        data: { status: "EXPIRED" },
      });

      // kembalikan kuota ke perusahaan
      if (attempt.packagePurchaseId) {
        await prisma.packagePurchase.update({
          where: { id: attempt.packagePurchaseId },
          data: { quantity: { increment: 1 } },
        });
      } else if (attempt.paymentId) {
        await prisma.payment.update({
          where: { id: attempt.paymentId },
          data: { quantity: { increment: 1 } },
        });
      }
    }

    return NextResponse.json({
      message: "Expired attempts processed",
      expiredCount: expiredAttempts.length,
    });
  } catch (err) {
    console.error("Error expiring attempts:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

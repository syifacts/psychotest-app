// app/api/attempts/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// === POST: buat attempt baru (setelah payment success / assign perusahaan) ===
export async function POST(req: NextRequest) {
  try {
    const { userId, testTypeId, paymentId, packagePurchaseId } = await req.json();

    if (!userId || !testTypeId) {
      return NextResponse.json({ error: "userId & testTypeId wajib diisi" }, { status: 400 });
    }

    // 🔎 Cek apakah user sudah punya attempt aktif untuk testType ini
    const existingAttempt = await prisma.testAttempt.findFirst({
      where: { userId, testTypeId, finishedAt: null },
    });

    if (existingAttempt) {
      return NextResponse.json(existingAttempt); // balikin yg lama, bukan bikin baru
    }

    // === Cek TestType valid ===
    const testType = await prisma.testType.findUnique({ where: { id: testTypeId } });
    if (!testType) {
      return NextResponse.json({ error: "TestType tidak ditemukan" }, { status: 404 });
    }

    // === Jika perusahaan assign dari PackagePurchase ===
    if (packagePurchaseId) {
      const pkg = await prisma.packagePurchase.findUnique({
        where: { id: packagePurchaseId },
      });

      if (!pkg || pkg.quantity <= 0) {
        return NextResponse.json(
          { error: "Kuota paket habis atau tidak ditemukan" },
          { status: 400 }
        );
      }

      const attempt = await prisma.$transaction(async (tx) => {
        const newAttempt = await tx.testAttempt.create({
          data: { userId, testTypeId, packagePurchaseId },
        });

        await tx.packagePurchase.update({
          where: { id: packagePurchaseId },
          data: { quantity: { decrement: 1 } },
        });

        return newAttempt;
      });

      return NextResponse.json(attempt);
    }

    // === Jika perusahaan assign dari Payment (single test) ===
    if (paymentId) {
      const payment = await prisma.payment.findUnique({ where: { id: paymentId } });

      if (!payment || payment.quantity <= 0) {
        return NextResponse.json(
          { error: "Kuota payment habis atau tidak ditemukan" },
          { status: 400 }
        );
      }

      const attempt = await prisma.$transaction(async (tx) => {
        const newAttempt = await tx.testAttempt.create({
          data: { userId, testTypeId, paymentId },
        });

        await tx.payment.update({
          where: { id: paymentId },
          data: { quantity: { decrement: 1 } },
        });

        return newAttempt;
      });

      return NextResponse.json(attempt);
    }

    // === Default (USER biasa tanpa payment/paket) ===
    const attempt = await prisma.testAttempt.create({
      data: { userId, testTypeId },
    });

    return NextResponse.json(attempt);
  } catch (err) {
    console.error("❌ Gagal membuat attempt:", err);
    return NextResponse.json({ error: "Gagal membuat attempt" }, { status: 500 });
  }
}
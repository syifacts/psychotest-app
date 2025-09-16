// app/api/tes/check-access/route.ts
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = Number(url.searchParams.get("userId"));
    const type = url.searchParams.get("type"); // contoh: "IST" / "CPMI"

    if (!userId || !type) {
      return NextResponse.json({ error: "userId dan type wajib diisi" }, { status: 400 });
    }

    const test = await prisma.testType.findUnique({ where: { name: type } });
    if (!test) return NextResponse.json({ error: "Tes tidak ditemukan" }, { status: 404 });

    // Gratis → langsung akses
    if (!test.price || test.price === 0) {
      return NextResponse.json({ access: true, reason: "Gratis" });
    }

    // -----------------------------
    // 1️⃣ Cek apakah user didaftarkan oleh perusahaan
    // -----------------------------
    const companyAttempt = await prisma.testAttempt.findFirst({
      where: {
        userId,
        testTypeId: test.id,
        Payment: { status: PaymentStatus.SUCCESS, companyId: { not: null } },
      },
      include: { Payment: { include: { company: true } } },
      orderBy: { id: "desc" },
    });

    if (companyAttempt && companyAttempt.Payment?.company) {
      if (!companyAttempt.isCompleted) {
        // Attempt perusahaan masih berjalan
        return NextResponse.json({
          access: true,
          reason: `Sudah didaftarkan oleh perusahaan (${companyAttempt.Payment.company.fullName})`,
        });
      } else {
        // Attempt perusahaan sudah selesai → harus bayar / mulai attempt baru
        return NextResponse.json({
          access: false,
          reason: `Sudah selesai sebelumnya. Bisa memulai attempt baru / beli lagi`,
        });
      }
    }

    // -----------------------------
    // 2️⃣ Cek apakah ada attempt pribadi belum selesai (bukan perusahaan)
    // -----------------------------
    const unfinishedPersonalAttempt = await prisma.testAttempt.findFirst({
      where: { 
        userId, 
        testTypeId: test.id, 
        isCompleted: false,
        Payment: { companyId: null } // pastikan bukan attempt perusahaan
      },
      include: { Payment: true },
    });

    if (unfinishedPersonalAttempt) {
      return NextResponse.json({
        access: true,
        reason: "Masih ada attempt berjalan",
      });
    }

    // -----------------------------
    // 3️⃣ Cek payment sukses terbaru untuk user pribadi
    // -----------------------------
    const lastPayment = await prisma.payment.findFirst({
      where: { userId, testTypeId: test.id, status: PaymentStatus.SUCCESS, companyId: null },
      orderBy: { id: "desc" },
    });

    if (lastPayment) {
      // Pastikan payment belum digunakan untuk attempt baru
      const attemptWithPayment = await prisma.testAttempt.findFirst({
        where: { paymentId: lastPayment.id },
      });

      if (!attemptWithPayment) {
        return NextResponse.json({
          access: false, // frontend akan tampil tombol "Mulai Tes"
          reason: "Sudah bayar, klik 'Mulai Tes' untuk memulai attempt baru",
        });
      }
    }

    // -----------------------------
    // 4️⃣ Default → belum bayar
    // -----------------------------
    return NextResponse.json({
      access: false,
      reason: "Belum bayar",
    });
  } catch (err) {
    console.error("❌ Error cek akses tes:", err);
    return NextResponse.json({ error: "Gagal cek akses tes" }, { status: 500 });
  }
}

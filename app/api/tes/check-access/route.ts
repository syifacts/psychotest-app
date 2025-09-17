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
    if (!test) {
      return NextResponse.json({ error: "Tes tidak ditemukan" }, { status: 404 });
    }

    // -----------------------------
    // 🚀 Early check: ada attempt aktif (unfinished) apapun sumbernya
    // -----------------------------
    const activeAttempt = await prisma.testAttempt.findFirst({
      where: { userId, testTypeId: test.id, isCompleted: false },
      include: { Payment: { include: { company: true } } },
      orderBy: { id: "desc" },
    });

    if (activeAttempt) {
      return NextResponse.json({
        access: true,
        reason: activeAttempt.Payment?.company
          ? `Sudah didaftarkan oleh perusahaan (${activeAttempt.Payment.company.fullName})`
          : "Masih ada attempt berjalan",
      });
    }

    // -----------------------------
    // Gratis → langsung akses
    // -----------------------------
    if (!test.price || test.price === 0) {
      return NextResponse.json({ access: true, reason: "Gratis" });
    }

    // -----------------------------
    // Cek payment sukses terbaru untuk user pribadi
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
    // Default → belum bayar
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

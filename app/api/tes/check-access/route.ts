import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = Number(url.searchParams.get("userId"));
    const type = url.searchParams.get("type"); // contoh: "IST"

    if (!userId || !type) {
      return NextResponse.json({ error: "userId dan type wajib diisi" }, { status: 400 });
    }

    const test = await prisma.testType.findUnique({ where: { name: type } });
    if (!test) return NextResponse.json({ error: "Tes tidak ditemukan" }, { status: 404 });

    if (!test.price || test.price === 0) {
      return NextResponse.json({ access: true, reason: "Gratis" });
    }

    const payment = await prisma.payment.findFirst({
      where: { userId, testTypeId: test.id, status: PaymentStatus.SUCCESS },
      orderBy: { createdAt: "desc" },
    });

    if (!payment) {
      return NextResponse.json({ access: false, reason: "Belum bayar" });
    }

    return NextResponse.json({ access: true, reason: "Sudah bayar" });
  } catch (err) {
    return NextResponse.json({ error: "Gagal cek akses tes" }, { status: 500 });
  }
}

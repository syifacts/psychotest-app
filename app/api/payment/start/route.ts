import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, testTypeId } = await req.json();
    if (!userId || !testTypeId) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // Ambil harga dari TestType
    const test = await prisma.testType.findUnique({ where: { id: testTypeId } });
    if (!test) return NextResponse.json({ error: "Tes tidak ditemukan" }, { status: 404 });

    // Simpan payment langsung success (sederhana dulu, tanpa gateway)
    const payment = await prisma.payment.create({
      data: {
        userId,
        testTypeId,
        amount: test.price || 0,
        status: PaymentStatus.SUCCESS,
      },
    });

    return NextResponse.json({ success: true, payment });
  } catch (err) {
    return NextResponse.json({ error: "Gagal buat payment" }, { status: 500 });
  }
}

import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, testTypeId, quantity } = await req.json();
    if (!userId || !testTypeId) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // Ambil harga dari TestType
    const test = await prisma.testType.findUnique({ where: { id: testTypeId } });
    if (!test) {
      return NextResponse.json({ error: "Tes tidak ditemukan" }, { status: 404 });
    }

    // default quantity = 1 kalau tidak dikirim
    const qty = quantity && quantity > 0 ? quantity : 1;
    const totalAmount = (test.price || 0) * qty;

    // Simpan payment (langsung success untuk simple case)
    const payment = await prisma.payment.create({
      data: {
        userId,
        testTypeId,
        quantity: qty,
        amount: totalAmount,
        status: PaymentStatus.SUCCESS,
      },
    });

    return NextResponse.json({ success: true, payment });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal buat payment" }, { status: 500 });
  }
}

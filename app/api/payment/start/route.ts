import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

export async function POST(req: NextRequest) {
  try {
    const { testTypeId, quantity = 1, userId: targetUserId } = await req.json();

    // Ambil token dari cookie
    const cookie = req.headers.get("cookie");
    const token = cookie
      ?.split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };

    // Ambil harga dari TestType
    const test = await prisma.testType.findUnique({ where: { id: testTypeId } });
    if (!test) return NextResponse.json({ error: "Tes tidak ditemukan" }, { status: 404 });

    const qty = quantity > 0 ? quantity : 1;
    const totalAmount = (test.price || 0) * qty;

    // Siapkan data payment
    const paymentData: any = {
      testTypeId,
      quantity: qty,
      amount: totalAmount,
      status: PaymentStatus.SUCCESS,
    };

    // Tentukan siapa yang bayar
    if (decoded.role === "PERUSAHAAN") {
      paymentData.companyId = decoded.id;

      // Jika perusahaan daftarkan user tertentu
      if (targetUserId) paymentData.userId = targetUserId;
    } else {
      paymentData.userId = decoded.id;
    }

    const payment = await prisma.payment.create({ data: paymentData });

    return NextResponse.json({
      success: true,
      payment,
      reason:
        decoded.role === "PERUSAHAAN"
          ? targetUserId
            ? "Perusahaan bayar & daftarkan user"
            : "Perusahaan bayar sendiri"
          : "User bayar sendiri",
    });
  } catch (err) {
    console.error("❌ Gagal buat payment:", err);
    return NextResponse.json({ error: "Gagal buat payment" }, { status: 500 });
  }
}

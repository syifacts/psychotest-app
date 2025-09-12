import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

export async function POST(req: NextRequest) {
  try {
    const { testTypeId, quantity } = await req.json();

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

    const qty = quantity && quantity > 0 ? quantity : 1;
    const totalAmount = (test.price || 0) * qty;

    // Buat payment
    const paymentData: any = {
      testTypeId,
      quantity: qty,
      amount: totalAmount,
      status: PaymentStatus.SUCCESS,
    };
    if (decoded.role === "PERUSAHAAN") paymentData.companyId = decoded.id;
    else paymentData.userId = decoded.id;

    const payment = await prisma.payment.create({ data: paymentData });

    // Buat TestAttempt langsung
    if (decoded.role === "PERUSAHAAN") {
      // misal ada input jumlah karyawan = qty, buat dummy attempt untuk karyawan
      // di sini asumsi kamu punya relasi user-company, atau daftar user yg ikut paket
      const users = await prisma.user.findMany({
        where: { role: "USER" }, // ganti dengan filter karyawan perusahaan
        take: qty,              // sesuai jumlah
      });

      for (const u of users) {
        const existing = await prisma.testAttempt.findFirst({
          where: { userId: u.id, testTypeId },
        });
        if (!existing) {
          await prisma.testAttempt.create({
            data: { userId: u.id, testTypeId, paymentId: payment.id },
          });
        }
      }
    } else {
      // user individual
      await prisma.testAttempt.create({
        data: { userId: decoded.id, testTypeId, paymentId: payment.id },
      });
    }

    return NextResponse.json({
      success: true,
      payment,
      reason: decoded.role === "PERUSAHAAN" ? "Dibayar perusahaan" : "Sudah bayar sendiri",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal buat payment" }, { status: 500 });
  }
}

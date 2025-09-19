import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie");
    const token = cookie
      ?.split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };
    if (decoded.role !== "PERUSAHAAN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const companyId = decoded.id;

    // --- Paket yang dibeli ---
    const packagePurchases = await prisma.packagePurchase.findMany({
      where: { companyId },
      include: {
        package: { include: { tests: { include: { testType: true } } } },
        userPackages: { include: { User: true } }, // hanya user yang sudah didaftarkan
      },
    });

    // --- Test satuan (single payment) ---
    const singlePaymentsRaw = await prisma.payment.findMany({
      where: { companyId, status: "SUCCESS" },
      include: { TestType: true }, // informasi testType
    });

    // Mapping user yang sudah didaftarkan ke test
    const singlePayments = await Promise.all(
      singlePaymentsRaw.map(async (payment) => {
        // Ambil TestAttempt yang sudah dibuat untuk user tertentu
        const registeredAttempts = await prisma.testAttempt.findMany({
          where: { paymentId: payment.id },
          include: { User: true },
        });

        return {
          ...payment,
          userPackages: registeredAttempts.map(a => a.User ?? {}), // tampilkan user terdaftar
          remainingQuota: payment.quantity - registeredAttempts.length, 
        };
      })
    );

    return NextResponse.json({
      packagePurchases,
      singlePayments,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

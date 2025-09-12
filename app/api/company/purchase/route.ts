// app/api/company/dashboard/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

export async function GET(req: Request) {
  try {
    // Ambil token dari cookie
    const cookie = req.headers.get("cookie");
    const token = cookie
      ?.split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      role: string;
    };

    // Pastikan user adalah perusahaan
    if (decoded.role !== "PERUSAHAAN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const companyId = decoded.id;

    // Ambil semua paket yang dibeli perusahaan
    const packagePurchases = await prisma.packagePurchase.findMany({
      where: { companyId },
      include: {
        package: {
          include: {
            tests: {
              include: { testType: true },
            },
          },
        },
        userPackages: { include: { User: true } },
      },
    });

    // Ambil semua test satuan (Payment) yang dibeli perusahaan
    const singlePayments = await prisma.payment.findMany({
      where: {
        companyId,
        status: "SUCCESS",
      },
      include: {
        TestType: true,
        attempts: { include: { User: true } }, // opsional, lihat user yg ikut test
      },
    });

    return NextResponse.json({ packagePurchases, singlePayments });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

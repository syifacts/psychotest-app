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
        userPackages: {
          include: {
            User: {
              include: {
                tokens: {
                  select: { token: true },
                  take: 1,
                  orderBy: { createdAt: "desc" }, // ambil token terbaru
                },
              },
            },
          },
        },
      },
    });

    // --- Test satuan (single payment) ---
    const singlePaymentsRaw = await prisma.payment.findMany({
      where: { companyId, status: "SUCCESS" },
      include: { TestType: true },
    });

    // Mapping user yang sudah didaftarkan ke test
    const singlePayments = await Promise.all(
    //  singlePaymentsRaw.map(async (payment) => {
      singlePaymentsRaw.map(async (payment: any) => {

        const registeredAttempts = await prisma.testAttempt.findMany({
          where: { paymentId: payment.id },
          include: { User: { include: { tokens: { take: 1, orderBy: { createdAt: "desc" }, select: { token: true } } } } },
        });

        return {
          ...payment,
          userPackages: registeredAttempts.map(a => ({
            ...a.User,
            token: a.User?.tokens?.[0]?.token ?? null,
          })),
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

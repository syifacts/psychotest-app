import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const companyIdParam = req.nextUrl.searchParams.get("companyId");
    if (!companyIdParam) {
      return NextResponse.json({ error: "companyId missing" }, { status: 400 });
    }
    const companyId = parseInt(companyIdParam);

    // --- Ambil pembelian paket ---
    const packagePurchases = await prisma.packagePurchase.findMany({
      where: { companyId },
      include: {
        package: {
          include: {
            tests: { include: { testType: true } },
          },
        },
        userPackages: { include: { User: true } },
      },
    });

    // const formattedPackages = packagePurchases.map(p => ({
    const formattedPackages = packagePurchases.map((p: any) => ({
      id: `package-${p.id}`,
      type: "package",
      name: p.package.name,
      description: p.package.description,
      price: p.package.price,
      quantity: p.quantity,
      used: p.userPackages.length,
      remaining: p.quantity - p.userPackages.length,
      // users: p.userPackages.map(up => ({
        users: p.userPackages.map((up: any) => ({
        id: up.User.id,
        name: up.User.fullName,
        email: up.User.email,
      })),
      // tests: p.package.tests.map(t => t.testType.name),
        tests: p.package.tests.map((t: any) => t.testType.name),
    }));

    // --- Ambil pembelian tes satuan ---
    const payments = await prisma.payment.findMany({
      where: { userId: companyId, status: "SUCCESS" }, // user perusahaan yang beli
      include: {
        TestType: true,
        attempts: { include: { User: true } },
      },
    });

    // const formattedPayments = payments.map(pay => ({
    const formattedPayments = payments.map((pay: any) => ({
      id: `payment-${pay.id}`,
      type: "single",
      name: pay.TestType.name,
      description: pay.TestType.desc,
      price: pay.amount,
      quantity: pay.quantity,
      used: pay.attempts.length,
      remaining: pay.quantity - pay.attempts.length,
      // users: pay.attempts.map(a => ({
        users: pay.attempts.map((a: any) => ({
        id: a.User.id,
        name: a.User.fullName,
        email: a.User.email,
      })),
      tests: [pay.TestType.name],
    }));

    // Gabungin keduanya
    const allPurchases = [...formattedPackages, ...formattedPayments];

    return NextResponse.json(allPurchases);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

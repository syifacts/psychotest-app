// app/api/companies/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Ambil semua user dengan role PERUSAHAAN atau USER
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { role: "PERUSAHAAN" },
          { role: "USER" } // tambahkan user biasa
        ]
      },
      select: {
        id: true,
        fullName: true,
        role: true,
        tokens: {
      select: { token: true },
      take: 1,
      orderBy: { createdAt: "desc" },
    },
        purchasedPackagesAsCompany: { select: { id: true } },
        companyPayments: { select: { id: true } },
        attempts: { select: { id: true } } // untuk user biasa, jumlah test yang mereka lakukan
      },
    });

    // const mapped = users.map((u) => ({
    //   id: u.id,
    //   fullName: u.fullName,
    //   role: u.role,
    //   token: u.tokens[0]?.token || null,
    //   totalPackagePurchases: u.purchasedPackagesAsCompany.length,
    //   totalPayments: u.companyPayments.length,
    //   totalAttempts: u.role === "USER" ? u.attempts.length : 0, // jumlah test untuk user
    // }));
const mapped = users.map((u: any) => ({
  id: u.id,
  fullName: u.fullName,
  role: u.role,
  token: u.tokens[0]?.token || null,
  totalPackagePurchases: u.purchasedPackagesAsCompany.length,
  totalPayments: u.companyPayments.length,
  totalAttempts: u.role === "USER" ? u.attempts.length : 0,
}));

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("❌ Gagal ambil companies:", err);
    return NextResponse.json({ error: "Gagal ambil companies" }, { status: 500 });
  }
}

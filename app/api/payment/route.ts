import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
   const payments = await prisma.payment.findMany({
where: {
  OR: [
    // ✅ 1. Pembayaran perusahaan langsung (bukan user)
    { userId: null },

    // ✅ 2. Karyawan yang beli sendiri (punya userId & companyId, tapi payment.companyId null)
    {
      userId: { not: null },
      companyId: null,
      User: {
        companyId: { not: null }, // dia karyawan perusahaan
      },
    },

    // ✅ 3. Individu umum (bukan karyawan perusahaan)
    {
      userId: { not: null },
      User: {
        companyId: null, // bukan karyawan perusahaan
      },
    },
  ],
},

  select: { // 🔹 pakai select agar kita eksplisit ambil semua relasi dan id yang dibutuhkan
    id: true,
    amount: true,
    quantity: true,
    method: true,
    status: true,
    paymentUrl: true,
    paidAt: true,
    companyId: true,
    companyPricingId: true, // ✅ WAJIB: ini kunci biar relasi CompanyPricing jalan
    User: { select: { fullName: true } },
    company: { select: { fullName: true } },
    TestType: {
      select: {
         name: true,
        price: true,
        priceDiscount: true,
        percentDiscount: true,
      },
    },
    
    CompanyPricing: {
      select: {
        id: true,
        customPrice: true,
        discountNominal: true,
        discountNote: true,
      },
    },
    attempts: {
      select: {
        results: {
          select: {
            ValidatedBy: {
              select: {
                fullName: true, // nama psikolog
              },
            },
          },
        },
      },
    },
  },
  orderBy: { createdAt: "desc" },
});

    return NextResponse.json(payments);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal mengambil data pembayaran" },
      { status: 500 }
    );
  }
}
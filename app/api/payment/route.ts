import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        OR: [
          { userId: null },

          {
            userId: { not: null },
            companyId: null,
            User: {
              companyId: { not: null },
            },
          },

          {
            userId: { not: null },
            User: {
              companyId: null,
            },
          },
        ],
      },

      select: {
        id: true,
        amount: true,
        quantity: true,
        method: true,
        status: true,
        paymentUrl: true,
        paidAt: true,
        companyId: true,
        companyPricingId: true,
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
                    fullName: true,
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
      { status: 500 },
    );
  }
}

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json({ error: "companyId missing" }, { status: 400 });
    }

    const tests = await prisma.testType.findMany({
      include: {
        companyPricings: {
          where: { companyId: Number(companyId) },
          select: {
            customPrice: true,
            discountNominal: true,
            discountNote: true,
          },
        },
      },
    });

  const result = tests.map((test) => {
  const cp = test.companyPricings[0];
  const basePrice = test.price ?? 0; 
  const customPrice = cp?.customPrice ?? null;
  const discount = cp?.discountNominal ?? 0;

const finalPrice = customPrice !== null
  ? customPrice
  : discount !== null && discount > 0
    ? Math.round(basePrice * (1 - discount / 100))
    : basePrice;


  return {
    id: test.id,
    name: test.name,
    desc: test.desc,
    price: finalPrice,             // harga final setelah customPrice / discount
    originalPrice: basePrice,      // harga dasar dari testType
    customPrice: customPrice,      // nilai customPrice dari companyPricing
    discountNominal: discount,     // nilai discountNominal dari companyPricing
    discountNote: cp?.discountNote ?? null,
  };
});



    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching company testtypes:", error);
    return NextResponse.json({ error: "Failed to fetch testtypes" }, { status: 500 });
  }
}

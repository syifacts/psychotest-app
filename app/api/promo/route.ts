import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 🔹 CREATE PROMO
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, code, type, value, minPurchase, maxDiscount, validFrom, validUntil } = body;

    const promo = await prisma.promo.create({
      data: {
        name,
        code: code || "PROMO" + Math.floor(1000 + Math.random() * 9000),
        type,
        value: Number(value),
        minPurchase: minPurchase ? Number(minPurchase) : null,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        validFrom: validFrom ? new Date(validFrom) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
      },
    });

    return NextResponse.json(promo);
  } catch (error) {
    console.error("❌ Error creating promo:", error);
    return NextResponse.json({ error: "Failed to create promo" }, { status: 500 });
  }
}

// 🔹 GET ALL PROMOS
export async function GET() {
  try {
    const promos = await prisma.promo.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(promos);
  } catch (error) {
    console.error("❌ Error fetching promos:", error);
    return NextResponse.json({ error: "Failed to fetch promos" }, { status: 500 });
  }
}

// 🔹 PATCH PROMO (update)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Promo ID is required" }, { status: 400 });
    }

    const promo = await prisma.promo.update({
      where: { id },
      data: {
        ...updates,
        validFrom: updates.validFrom ? new Date(updates.validFrom) : undefined,
        validUntil: updates.validUntil ? new Date(updates.validUntil) : undefined,
      },
    });

    return NextResponse.json(promo);
  } catch (error) {
    console.error("❌ Error updating promo:", error);
    return NextResponse.json({ error: "Failed to update promo" }, { status: 500 });
  }
}

// 🔹 DELETE PROMO
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Promo ID is required" }, { status: 400 });
    }

    await prisma.promo.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Promo deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting promo:", error);
    return NextResponse.json({ error: "Failed to delete promo" }, { status: 500 });
  }
}

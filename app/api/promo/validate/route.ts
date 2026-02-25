import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, currentTotal } = body;

    if (!code) {
      return NextResponse.json(
        { valid: false, error: "Kode promo tidak boleh kosong" },
        { status: 400 },
      );
    }

    // ✅ FIX: Hapus mode insensitive, ubah jadi pencarian langsung
    const promo = await prisma.promo.findFirst({
      where: {
        code: code.trim(),
      },
    });

    if (!promo) {
      return NextResponse.json(
        { valid: false, error: "Kode promo tidak valid atau tidak ditemukan" },
        { status: 404 },
      );
    }

    if (promo.isActive === false) {
      return NextResponse.json(
        { valid: false, error: "Kode promo ini sudah tidak aktif" },
        { status: 400 },
      );
    }

    const now = new Date();
    if (promo.validFrom && new Date(promo.validFrom) > now) {
      return NextResponse.json(
        { valid: false, error: "Kode promo ini belum bisa digunakan" },
        { status: 400 },
      );
    }
    if (promo.validUntil && new Date(promo.validUntil) < now) {
      return NextResponse.json(
        { valid: false, error: "Kode promo ini sudah kedaluwarsa" },
        { status: 400 },
      );
    }

    if (promo.minPurchase && currentTotal < promo.minPurchase) {
      return NextResponse.json(
        {
          valid: false,
          error: `Promo ini berlaku untuk minimal transaksi Rp ${promo.minPurchase.toLocaleString("id-ID")}`,
        },
        { status: 400 },
      );
    }

    let discountAmount = 0;

    if (promo.type === "PERCENT") {
      discountAmount = (currentTotal * promo.value) / 100;

      if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
        discountAmount = promo.maxDiscount;
      }
    } else {
      discountAmount = promo.value;
    }

    if (discountAmount > currentTotal) {
      discountAmount = currentTotal;
    }

    const finalPrice = currentTotal - discountAmount;

    return NextResponse.json({
      valid: true,
      promoId: promo.id,
      discountAmount: discountAmount,
      finalPrice: finalPrice,
      message: "Kode promo berhasil diterapkan!",
    });
  } catch (error) {
    console.error("❌ Error API Promo Validate:", error);
    return NextResponse.json(
      { valid: false, error: "Terjadi kesalahan server saat mengecek promo" },
      { status: 500 },
    );
  }
}

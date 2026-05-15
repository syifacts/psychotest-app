import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Endpoint publik untuk mengambil detail dan status tagihan berdasarkan Reference ID Tripay
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    // Validasi input parameter
    if (!reference) {
      return NextResponse.json(
        { success: false, error: "Nomor referensi tidak ditemukan di URL" },
        { status: 400 },
      );
    }

    // Cari tagihan di database berdasarkan reference
    const payment = await prisma.payment.findFirst({
      where: { reference: reference },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Data tagihan tidak ditemukan di sistem" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      payment: payment,
      data: payment.payload,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server internal" },
      { status: 500 },
    );
  }
}

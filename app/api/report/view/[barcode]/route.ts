// app/api/report/view/[barcode]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { barcode: string } }) {
  try {
    const { barcode } = params;

    if (!barcode) return NextResponse.json({ error: "Barcode tidak diberikan" }, { status: 400 });

    const result = await prisma.result.findUnique({
      where: { barcode },
      include: {
        Attempt: {
          include: { User: true }
        },
        ValidatedBy: true
      }
    });

    if (!result) return NextResponse.json({ error: "Report tidak ditemukan" }, { status: 404 });

    // cek expired
    const now = new Date();
    if (result.expiresAt && result.expiresAt < now) {
      return NextResponse.json({ error: "QR Code ini sudah kadaluarsa." }, { status: 400 });
    }

    // Buat validationNotes dinamis
    const validationNotes = `Hasil divalidasi oleh ${result.ValidatedBy?.fullName || "Psikolog"} pada ${result.validatedAt?.toLocaleDateString("id-ID")}. Berlaku sampai: ${result.expiresAt?.toLocaleDateString("id-ID")}`;

    return NextResponse.json({
      attempt: result.Attempt,
      result,
      kesimpulan: result.kesimpulan,
      ttd: result.ttd,
      barcode: result.barcode,
      expiresAt: result.expiresAt,
      validationNotes
    });
  } catch (err) {
    console.error("Error fetching report by barcode:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { barcode: string } }
) {
  const { barcode } = params;

  if (!barcode) {
    return NextResponse.json({ error: "Barcode tidak valid" }, { status: 400 });
  }

  try {
    // Cari result berdasarkan barcode
    const result = await prisma.result.findUnique({
      where: { barcode },
      include: {
        User: true,
        Attempt: {
          include: {
            TestType: true,
            User: true,
          },
        },
        ValidatedBy: true,
      },
    });

    if (!result) {
      return NextResponse.json(
        { error: "Report tidak ditemukan" },
        { status: 404 }
      );
    }

    if (result.expiresAt && result.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "QR Code ini sudah kadaluarsa." },
        { status: 410 }
      );
    }

    return NextResponse.json({
  attempt: result.Attempt,
  result,
  kesimpulan: result.kesimpulan,
  ttd: result.User?.ttdUrl,
  barcode: result.barcode,
  expiresAt: result.expiresAt,
  validationNotes: result.validated
    ? `Hasil divalidasi oleh ${result.ValidatedBy?.fullName || "Psikolog"}, pada ${result.validatedAt ? result.validatedAt.toLocaleDateString("id-ID") : "-"}.
Berlaku sampai: ${result.expiresAt ? result.expiresAt.toLocaleDateString("id-ID") : "-"}`
    : null, // 🔥 kalau belum validasi → null aja
});

  } catch (err) {
    console.error("Error get report:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

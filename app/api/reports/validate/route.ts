import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

async function getLoggedUserId(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  return userId ? parseInt(userId) : null;
}

export async function POST(req: NextRequest) {
  try {
    const { reportId, kesimpulan, ttd } = await req.json();
    const userId = await getLoggedUserId(req);

    if (!reportId || !userId) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const result = await prisma.result.findUnique({ where: { id: reportId }, include: { ValidatedBy: true } });
    if (!result) return NextResponse.json({ error: "Result tidak ditemukan" }, { status: 404 });
    if (result.validated) return NextResponse.json({ error: "Sudah divalidasi" }, { status: 400 });

    // Generate barcode unik
    const barcodeId = nanoid(10);
    const barcodeURL = `${process.env.NEXT_PUBLIC_BASE_URL}/report/view/${barcodeId}`;

    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);

    // Update result (simpan info penting saja)
    await prisma.result.update({
      where: { id: reportId },
      data: {
        validated: true,
        validatedById: userId,
        validatedAt: new Date(),
        kesimpulan: kesimpulan ?? result.kesimpulan,
        ttd: ttd ?? result.ttd,
        barcode: barcodeId,
        expiresAt: expiry,
        isCompleted: true,
      },
    });

    // Buat validationNotes dinamis, tidak disimpan di DB

const validationNotes = `Hasil divalidasi oleh ${result.ValidatedBy?.fullName || "Psikolog"} pada ${new Date().toLocaleDateString("id-ID")}. Berlaku sampai: ${expiry.toLocaleDateString("id-ID")}`;


    return NextResponse.json({
      success: true,
      barcodeURL,
      barcodeId,
      expiresAt: expiry,
      validationNotes, // kirim langsung ke frontend/PDF
    });
  } catch (err: any) {
    console.error("Error validating report:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

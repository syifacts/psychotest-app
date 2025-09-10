// app/api/reports/validate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Asumsikan userId psikolog didapat dari session / JWT
async function getLoggedUserId(req: NextRequest) {
  // Contoh: ambil dari header
  const userId = req.headers.get("x-user-id");
  return userId ? parseInt(userId) : null;
}

export async function POST(req: NextRequest) {
  try {
    const { reportId, ttd } = await req.json();
    const userId = await getLoggedUserId(req);

    if (!reportId || !userId) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // Ambil Result
    const result = await prisma.result.findUnique({ where: { id: reportId } });
    if (!result) {
      return NextResponse.json({ error: "Result tidak ditemukan" }, { status: 404 });
    }

    if (result.validated) {
      return NextResponse.json({ error: "Sudah divalidasi" }, { status: 400 });
    }

    // Update Result
    await prisma.result.update({
      where: { id: reportId },
      data: {
        validated: true,
        validatedById: userId,
        validatedAt: new Date(),
        ttd: ttd || null, // optional, base64 image misal
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error validating report:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

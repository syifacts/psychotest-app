// app/api/reports/validate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Ambil userId (contoh dari header)
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

    // 🔹 Ambil result lama dulu
    const result = await prisma.result.findUnique({ where: { id: reportId } });
    if (!result) {
      return NextResponse.json({ error: "Result tidak ditemukan" }, { status: 404 });
    }

    if (result.validated) {
      return NextResponse.json({ error: "Sudah divalidasi" }, { status: 400 });
    }

    // 🔹 Update dengan merge
    await prisma.result.update({
      where: { id: reportId },
      data: {
        validated: true,
        validatedById: userId,
        validatedAt: new Date(),
        kesimpulan: kesimpulan ?? result.kesimpulan, // ✅ tetap pakai lama kalau ga dikirim
        ttd: ttd ?? result.ttd,                      // ✅ tetap pakai lama kalau ga dikirim
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error validating report:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

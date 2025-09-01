import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, type } = await req.json();

    if (!userId || !type) {
      return NextResponse.json({ error: "userId dan type wajib diisi" }, { status: 400 });
    }

    const testType = await prisma.testType.findUnique({ where: { name: type } });
    if (!testType) {
      return NextResponse.json({ error: "Test type tidak ditemukan" }, { status: 400 });
    }

    // 🔹 Ambil semua skor subtest user untuk tipe tes ini
    const subtestResults = await prisma.subtestResult.findMany({
      where: { userId, SubTest: { testTypeId: testType.id } },
    });

    // 🔹 Hitung total skor
    const totalScore = subtestResults.reduce((sum, r) => sum + r.score, 0);

    // 🔹 Simpan/Update Result tipe tes
    await prisma.result.upsert({
      where: { userId_testTypeId: { userId, testTypeId: testType.id } },
      update: { totalScore, isCompleted: true },
      create: { userId, testTypeId: testType.id, totalScore, isCompleted: true },
    });

    return NextResponse.json({ message: "Tes selesai, hasil akhir disimpan", totalScore });
  } catch (err) {
    console.error("❌ Gagal finish test:", err);
    return NextResponse.json({ error: "Gagal selesai tes" }, { status: 500 });
  }
}

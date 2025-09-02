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

    // Ambil semua subtest untuk testType ini
    const subtests = await prisma.subTest.findMany({
      where: { testTypeId: testType.id },
      select: { id: true },
    });
    const subtestIds = subtests.map(st => st.id);

    // Ambil semua subtestResult user untuk subtests ini
    const subtestResults = await prisma.subtestResult.findMany({
      where: { userId, subTestId: { in: subtestIds } },
    });

    // Hitung total RW & SW
    const totalRw = subtestResults.reduce((sum, r) => sum + r.rw, 0);
    const totalSw = subtestResults.reduce((sum, r) => sum + r.sw, 0);

    // Simpan/Update Result tipe tes
    await prisma.result.upsert({
      where: { userId_testTypeId: { userId, testTypeId: testType.id } },
      update: { totalRw, totalSw, isCompleted: true },
      create: { userId, testTypeId: testType.id, totalRw, totalSw, isCompleted: true },
    });

    return NextResponse.json({
      message: "Tes selesai, hasil akhir disimpan",
      totalRw,
      totalSw,
    });
  } catch (err) {
    console.error("❌ Gagal finish test:", err);
    return NextResponse.json({ error: "Gagal selesai tes" }, { status: 500 });
  }
}

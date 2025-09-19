import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, subtest, attemptId } = await req.json();
    if (!userId || !subtest || !attemptId) {
      return NextResponse.json(
        { error: "userId, subtest, dan attemptId wajib diisi" },
        { status: 400 }
      );
    }

    // Simpan startTime pertama kali atau ambil yang sudah ada
    const progress = await prisma.userProgress.upsert({
      where: {
        userId_subtest_attemptId: { userId, subtest, attemptId },
      },
      update: {}, // kalau sudah ada, tidak reset startTime
      create: {
        userId,
        subtest,
        attemptId, // wajib sesuai unique constraint
        startTime: new Date(),
      },
    });

    return NextResponse.json(progress);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal mulai subtest" }, { status: 500 });
  }
}

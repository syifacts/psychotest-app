import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, subtest } = await req.json();
    if (!userId || !subtest) {
      return NextResponse.json({ error: "userId dan subtest wajib diisi" }, { status: 400 });
    }

    // Simpan startTime pertama kali
    const progress = await prisma.userProgress.upsert({
      where: { userId_subtest: { userId, subtest } },
      update: {}, // kalau sudah ada, tidak reset startTime
      create: {
        userId,
        subtest,
        startTime: new Date(),
      },
    });

    return NextResponse.json(progress);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal mulai subtest" }, { status: 500 });
  }
}

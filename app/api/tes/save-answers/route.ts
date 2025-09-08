// app/api/tes/save-answer/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, attemptId, questionCode, choice } = body;

    if (!userId || !attemptId || !questionCode || !choice) {
      return NextResponse.json(
        { error: "userId, attemptId, questionCode, dan choice wajib diisi" },
        { status: 400 }
      );
    }

    // Cek apakah sudah ada jawaban untuk user + attempt + questionCode ini
    const existing = await prisma.answer.findFirst({
      where: { userId, attemptId, questionCode },
    });

    if (existing) {
      // update kalau sudah ada
      await prisma.answer.update({
        where: { id: existing.id },
        data: { choice },
      });
    } else {
      // insert kalau belum ada
      await prisma.answer.create({
        data: {
          userId,
          attemptId,
          questionCode,
          choice,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Gagal simpan jawaban:", err);
    return NextResponse.json({ error: "Gagal simpan jawaban" }, { status: 500 });
  }
}

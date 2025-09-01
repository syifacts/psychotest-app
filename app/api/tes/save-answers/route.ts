// app/api/tes/save-answer/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, questionId, choice } = body;

    if (!userId || !questionId || !choice) {
      return NextResponse.json({ error: "userId, questionId, dan choice wajib diisi" }, { status: 400 });
    }

    // Cek apakah sudah ada jawaban untuk user + question ini
    const existing = await prisma.answer.findFirst({
      where: { userId, questionId }
    });

    if (existing) {
      // update kalau sudah ada
      await prisma.answer.update({
        where: { id: existing.id },
        data: { choice }
      });
    } else {
      // insert kalau belum ada
      await prisma.answer.create({
        data: {
          userId,
          questionId,
          choice
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal simpan jawaban" }, { status: 500 });
  }
}

// app/api/tes/save-answer/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, questionId, choice } = body;

    if (!userId || !questionId || !choice) {
      return NextResponse.json(
        { error: "userId, questionId, dan choice wajib diisi" },
        { status: 400 }
      );
    }

    // Cari Question berdasarkan questionId
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question tidak ditemukan" },
        { status: 404 }
      );
    }

    const questionCode = question.code;

    // Gunakan upsert untuk otomatis create atau update
    await prisma.answer.upsert({
      where: {
        userId_questionCode: {
          userId,
          questionCode,
        },
      },
      update: {
        choice,
      },
      create: {
        userId,
        questionCode,
        choice,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Gagal simpan jawaban" },
      { status: 500 }
    );
  }
}

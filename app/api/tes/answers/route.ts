import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// === POST: Simpan jawaban user ===
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, answers } = body as {
      userId: number;
      answers: { questionId: number; choice: string }[];
    };

    if (!userId || !answers?.length) {
      return NextResponse.json(
        { error: "userId dan answers wajib diisi" },
        { status: 400 }
      );
    }

    // Ambil jawaban benar dari database
    const questionIds = answers.map((a) => a.questionId);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, answer: true },
    });

    // Bentuk data untuk disimpan
    const answerData = answers.map((a) => {
      const question = questions.find((q) => q.id === a.questionId);
      const isCorrect = question ? question.answer === a.choice : false;
      return {
        userId,
        questionId: a.questionId,
        choice: a.choice,
        isCorrect,
      };
    });

    // Simpan (upsert)
    await Promise.all(
      answerData.map((a) =>
        prisma.answer.upsert({
          where: {
            userId_questionId: { userId: a.userId, questionId: a.questionId },
          },
          update: {
            choice: a.choice,
            isCorrect: a.isCorrect,
          },
          create: a,
        })
      )
    );

    // Ambil ulang semua jawaban user supaya konsisten response
    const savedAnswers = await prisma.answer.findMany({
      where: { userId },
      select: { questionId: true, choice: true },
      orderBy: { questionId: "asc" },
    });

    const formatted: Record<number, string> = {};
    savedAnswers.forEach((a) => {
      formatted[a.questionId] = a.choice;
    });

    return NextResponse.json({
      message: "Jawaban berhasil disimpan",
      answers: formatted,
      alreadyTaken: true,
    });
  } catch (error) {
    console.error("Gagal menyimpan jawaban:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan jawaban" },
      { status: 500 }
    );
  }
}

// === GET: Ambil jawaban user berdasarkan subtest ===
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = Number(url.searchParams.get("userId"));
    const sub = url.searchParams.get("sub");

    if (!userId || !sub) {
      return NextResponse.json(
        { error: "userId dan sub wajib diisi" },
        { status: 400 }
      );
    }

    const answers = await prisma.answer.findMany({
      where: {
        userId,
        Question: { SubTest: { name: sub } },
      },
      select: { questionId: true, choice: true },
      orderBy: { questionId: "asc" },
    });

    const formatted: Record<number, string> = {};
    answers.forEach((a) => {
      formatted[a.questionId] = a.choice;
    });

    return NextResponse.json({
      answers: formatted,
      alreadyTaken: answers.length > 0,
    });
  } catch (err) {
    console.error("Gagal ambil jawaban:", err);
    return NextResponse.json(
      { error: "Gagal ambil jawaban" },
      { status: 500 }
    );
  }
}

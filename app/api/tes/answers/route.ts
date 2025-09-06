import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// === POST: Simpan jawaban user ===
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, attemptId, answers } = body as {
      userId: number;
      attemptId: number;
      answers: { questionId?: number; preferenceQuestionId?: number; choice: string }[];
    };

    if (!userId || !attemptId || !answers?.length) {
      return NextResponse.json(
        { error: "userId, attemptId, dan answers wajib diisi" },
        { status: 400 }
      );
    }

    // Ambil kode & kunci jawaban dari Question
    const questionIds = answers.map((a) => a.questionId).filter(Boolean) as number[];
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, code: true, answer: true },
    });

    // Ambil kode untuk PreferenceQuestion
    const prefIds = answers.map((a) => a.preferenceQuestionId).filter(Boolean) as number[];
    const prefQuestions = await prisma.preferenceQuestion.findMany({
      where: { id: { in: prefIds } },
      select: { id: true, code: true },
    });

    // Bentuk data untuk upsert
    const answerData = answers.map((a) => {
      if (a.questionId) {
        const question = questions.find((q) => q.id === a.questionId);
        const isCorrect = question ? question.answer === a.choice : null;
        return {
          userId,
          attemptId,
          questionCode: question?.code ?? null,
          preferenceQuestionCode: null,
          choice: a.choice,
          isCorrect,
        };
      } else if (a.preferenceQuestionId) {
        const pref = prefQuestions.find((p) => p.id === a.preferenceQuestionId);
        return {
          userId,
          attemptId,
          questionCode: null,
          preferenceQuestionCode: pref?.code ?? null,
          choice: a.choice,
          isCorrect: null, // preference biasanya ga ada benar/salah
        };
      }
      return null;
    }).filter(Boolean) as any[];

    // Simpan jawaban
    await Promise.all(
      answerData.map((a) =>
        prisma.answer.upsert({
          where: a.questionCode
            ? { attemptId_questionCode: { attemptId: a.attemptId, questionCode: a.questionCode } }
            : { attemptId_preferenceQuestionCode: { attemptId: a.attemptId, preferenceQuestionCode: a.preferenceQuestionCode } },
          update: { choice: a.choice, isCorrect: a.isCorrect },
          create: a,
        })
      )
    );

    return NextResponse.json({
      message: "Jawaban berhasil disimpan",
    });
  } catch (error) {
    console.error("Gagal simpan jawaban:", error);
    return NextResponse.json({ error: "Gagal simpan jawaban" }, { status: 500 });
  }
}

// === GET: Ambil jawaban user berdasarkan subtest ===
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const attemptId = Number(url.searchParams.get("attemptId"));

    if (!attemptId) {
      return NextResponse.json({ error: "attemptId wajib diisi" }, { status: 400 });
    }

    // Ambil semua jawaban untuk attempt ini
    const answers = await prisma.answer.findMany({
      where: { attemptId },
      select: { questionCode: true, preferenceQuestionCode: true, choice: true },
      orderBy: [{ questionCode: "asc" }, { preferenceQuestionCode: "asc" }],
    });

    const formatted: Record<string, string> = {};
    answers.forEach((a) => {
      if (a.questionCode) {
        formatted[a.questionCode] = a.choice;
      } else if (a.preferenceQuestionCode) {
        formatted[a.preferenceQuestionCode] = a.choice;
      }
    });

    return NextResponse.json({
      answers: formatted,
      alreadyTaken: answers.length > 0,
    });
  } catch (err) {
    console.error("Gagal ambil jawaban:", err);
    return NextResponse.json({ error: "Gagal ambil jawaban" }, { status: 500 });
  }
}

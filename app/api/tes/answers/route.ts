import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// === POST: Simpan jawaban user ===
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { attemptId, answers } = body as {
      attemptId: number;
      answers: { questionId?: number; preferenceQuestionId?: number; choice: string }[];
    };

    if (!attemptId || !answers?.length) {
      return NextResponse.json(
        { error: "attemptId dan answers wajib diisi" },
        { status: 400 }
      );
    }

    // Ambil userId dari TestAttempt
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      select: { userId: true },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt tidak ditemukan" }, { status: 404 });
    }

    const userId = attempt.userId;

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
    const answerData = answers
      .map((a) => {
        if (a.questionId) {
const question = questions.find((q: any) => q.id === a.questionId);
          const normalizedChoice =
  Array.isArray(a.choice) ? a.choice[0] : String(a.choice);
const isCorrect = question ? question.answer === normalizedChoice : null;

return {
  userId,
  attemptId,
  questionCode: question?.code ?? null,
  preferenceQuestionCode: null,
  choice: normalizedChoice,
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
            isCorrect: null,
          };
        }
        return null;
      })
      .filter(Boolean) as any[];

    // Simpan jawaban
    await Promise.all(
      answerData.map((a) =>
        prisma.answer.upsert({
          where: a.questionCode
            ? { attemptId_questionCode: { attemptId, questionCode: a.questionCode } }
            : {
                attemptId_preferenceQuestionCode: {
                  attemptId,
                  preferenceQuestionCode: a.preferenceQuestionCode,
                },
              },
          update: { choice: a.choice, isCorrect: a.isCorrect },
          create: {
            userId,
            attemptId,
            questionCode: a.questionCode,
            preferenceQuestionCode: a.preferenceQuestionCode,
            choice: a.choice,
            isCorrect: a.isCorrect,
          },
        })
      )
    );

    return NextResponse.json({ message: "Jawaban berhasil disimpan" });
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
    const subtest = url.searchParams.get("subtest"); // ✅ ambil subtest

    if (!attemptId) {
      return NextResponse.json({ error: "attemptId wajib diisi" }, { status: 400 });
    }

    const answers = await prisma.answer.findMany({
  where: { attemptId }, // hapus filter subtest
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

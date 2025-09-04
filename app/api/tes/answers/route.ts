import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// === POST: Simpan jawaban user ===
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, attemptId, answers } = body as {
      userId: number;
      attemptId: number;
      answers: { questionId: number; choice: string }[];
    };

    if (!userId || !attemptId || !answers?.length) {
      return NextResponse.json(
        { error: "userId, attemptId, dan answers wajib diisi" },
        { status: 400 }
      );
    }

    // Ambil kode & kunci jawaban
    const questionIds = answers.map((a) => a.questionId);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, code: true, answer: true },
    });

    // Bentuk data untuk upsert
    const answerData = answers.map((a) => {
      const question = questions.find((q) => q.id === a.questionId);
      const isCorrect = question ? question.answer === a.choice : false;
      return {
        userId,
        attemptId,
        questionCode: question?.code ?? "",
        choice: a.choice,
        isCorrect,
      };
    });

    // Simpan (upsert per attemptId + questionCode)
    await Promise.all(
      answerData.map((a) =>
        prisma.answer.upsert({
          where: {
            attemptId_questionCode: {
              attemptId: a.attemptId,
              questionCode: a.questionCode,
            },
          },
          update: { choice: a.choice, isCorrect: a.isCorrect },
          create: a,
        })
      )
    );

    // Ambil ulang jawaban user untuk attempt ini
    const savedAnswers = await prisma.answer.findMany({
      where: { attemptId },
      select: { questionCode: true, choice: true },
      orderBy: { questionCode: "asc" },
    });

    const formatted: Record<string, string> = {};
    savedAnswers.forEach((a) => (formatted[a.questionCode] = a.choice));

    return NextResponse.json({
      message: "Jawaban berhasil disimpan",
      answers: formatted,
      alreadyTaken: savedAnswers.length > 0,
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
    const type = url.searchParams.get("type");
    const sub = url.searchParams.get("sub");

    if (!attemptId || !type || !sub) {
      return NextResponse.json(
        { error: "attemptId, type, dan sub wajib diisi" },
        { status: 400 }
      );
    }

    // Cari attempt & testType
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      select: { testTypeId: true },
    });
    if (!attempt) {
      return NextResponse.json({ error: "Attempt tidak ditemukan" }, { status: 404 });
    }

    const testType = await prisma.testType.findUnique({
      where: { id: attempt.testTypeId },
    });
    if (!testType || testType.name !== type) {
      return NextResponse.json({ error: "TestType tidak cocok" }, { status: 404 });
    }

    // Cari subtest
    const subTest = await prisma.subTest.findUnique({
      where: { testTypeId_name: { testTypeId: testType.id, name: sub } },
      select: { id: true },
    });
    if (!subTest) {
      return NextResponse.json({ error: "Subtest tidak ditemukan" }, { status: 404 });
    }

    // Ambil semua kode soal subtest
    const questions = await prisma.question.findMany({
      where: { subTestId: subTest.id },
      select: { code: true },
    });
    const questionCodes = questions.map((q) => q.code);

    // Ambil jawaban attempt ini
    const answers = await prisma.answer.findMany({
      where: { attemptId, questionCode: { in: questionCodes } },
      select: { questionCode: true, choice: true },
      orderBy: { questionCode: "asc" },
    });

    const formatted: Record<string, string> = {};
    answers.forEach((a) => (formatted[a.questionCode] = a.choice));

    return NextResponse.json({
      answers: formatted,
      alreadyTaken: answers.length > 0,
    });
  } catch (err) {
    console.error("Gagal ambil jawaban:", err);
    return NextResponse.json({ error: "Gagal ambil jawaban" }, { status: 500 });
  }
}

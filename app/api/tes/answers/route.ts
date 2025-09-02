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

    // Ambil kode soal (questionCode) dari database
    const questionIds = answers.map((a) => a.questionId);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, code: true, answer: true },
    });

    // Bentuk data untuk disimpan
    const answerData = answers.map((a) => {
      const question = questions.find((q) => q.id === a.questionId);
      const isCorrect = question ? question.answer === a.choice : false;
      return {
        userId,
        questionCode: question?.code ?? "",
        choice: a.choice,
        isCorrect,
      };
    });

    // Simpan jawaban user (upsert)
    await Promise.all(
      answerData.map((a) =>
        prisma.answer.upsert({
          where: {
            userId_questionCode: {
              userId: a.userId,
              questionCode: a.questionCode,
            },
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
      select: { questionCode: true, choice: true },
      orderBy: { questionCode: "asc" },
    });

    const formatted: Record<string, string> = {};
    savedAnswers.forEach((a) => {
      formatted[a.questionCode] = a.choice;
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
    const type = url.searchParams.get("type"); // misal "IST"
    const sub = url.searchParams.get("sub");   // misal "SE"

    if (!userId || !type || !sub) {
      return NextResponse.json(
        { error: "userId, type, dan sub wajib diisi" },
        { status: 400 }
      );
    }

    // Ambil TestType
    const testType = await prisma.testType.findUnique({ where: { name: type } });
    if (!testType) {
      return NextResponse.json({ error: "TestType tidak ditemukan" }, { status: 404 });
    }

    // Ambil SubTest pakai composite key (testTypeId + name)
    const subTestEntity = await prisma.subTest.findUnique({
      where: {
        testTypeId_name: {
          testTypeId: testType.id,
          name: sub,
        },
      },
      select: { id: true },
    });
    if (!subTestEntity) {
      return NextResponse.json(
        { error: "Subtest tidak ditemukan" },
        { status: 404 }
      );
    }

    // Ambil semua questionCode untuk subtest ini
    const questions = await prisma.question.findMany({
      where: { subTestId: subTestEntity.id },
      select: { code: true },
    });
    const questionCodes = questions.map((q) => q.code);

    // Ambil jawaban user untuk questionCode di subtest ini
    const answers = await prisma.answer.findMany({
      where: { userId, questionCode: { in: questionCodes } },
      select: { questionCode: true, choice: true },
      orderBy: { questionCode: "asc" },
    });

    const formatted: Record<string, string> = {};
    answers.forEach((a) => {
      formatted[a.questionCode] = a.choice;
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

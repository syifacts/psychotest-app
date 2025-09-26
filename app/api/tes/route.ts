import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");   // ex: IST atau MSDT
    const sub = searchParams.get("sub");     // ex: SE (opsional)
    const userId = Number(searchParams.get("userId")); // optional

    if (!type) {
      return NextResponse.json(
        { error: "type wajib diisi" },
        { status: 400 }
      );
    }

    // Ambil TestType
    const testType = await prisma.testType.findUnique({
      where: { name: type },
    });
    if (!testType) {
      return NextResponse.json(
        { error: "TestType tidak ditemukan" },
        { status: 404 }
      );
    }

    let questions = [];

    if (sub) {
      // ✅ Kalau ada sub, ambil berdasarkan subTest
      const subTest = await prisma.subTest.findFirst({
        where: { testTypeId: testType.id, name: sub },
      });
      if (!subTest) {
        return NextResponse.json(
          { error: "SubTest tidak ditemukan" },
          { status: 404 }
        );
      }

      questions = await prisma.question.findMany({
        where: { subTestId: subTest.id },
        select: {
          id: true,
          code: true,
          content: true,
          options: true,
          type: true,
          answer: true,
          answerScores: true,
          image: true,
        },
        orderBy: { id: "asc" },
      });
    } else {
      // ✅ Kalau tidak ada sub, ambil semua soal untuk testType (contoh MSDT)
      questions = await prisma.question.findMany({
        where: { testTypeId: testType.id },
        select: {
          id: true,
          code: true,
          content: true,
          options: true,
          type: true,
          answer: true,
          answerScores: true,
          image: true,
        },
        orderBy: { id: "asc" },
      });
    }

    // Jika userId tersedia, ambil jawaban user
    let userAnswers: Record<string, string | string[]> = {};
    if (userId) {
      const savedAnswers = await prisma.answer.findMany({
        where: {
          userId,
          questionCode: { in: questions.map((q) => q.code) },
        },
        select: { questionCode: true, choice: true },
      });

      savedAnswers.forEach((a) => {
        if (a.questionCode) {
          const choiceStr = String(a.choice);
          userAnswers[a.questionCode] = choiceStr.includes(",")
            ? choiceStr.split(",")
            : choiceStr;
        }
      });
    }

    return NextResponse.json({ questions, userAnswers });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal ambil soal" },
      { status: 500 }
    );
  }
}

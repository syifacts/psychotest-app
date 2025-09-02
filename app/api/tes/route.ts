import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // ex: IST
    const sub = searchParams.get("sub");   // ex: SE
    const userId = Number(searchParams.get("userId")); // optional, untuk ambil jawaban user

    if (!type || !sub) {
      return NextResponse.json({ error: "type dan sub wajib diisi" }, { status: 400 });
    }

    // Ambil TestType
    const testType = await prisma.testType.findUnique({ where: { name: type } });
    if (!testType) return NextResponse.json({ error: "TestType tidak ditemukan" }, { status: 404 });

    // Ambil SubTest
    const subTest = await prisma.subTest.findFirst({
      where: { testTypeId: testType.id, name: sub },
    });
    if (!subTest) return NextResponse.json({ error: "SubTest tidak ditemukan" }, { status: 404 });

    // Ambil soal dari database
    const questions = await prisma.question.findMany({
      where: { subTestId: subTest.id },
      select: { 
        id: true,
        content: true,
        options: true,
        type: true,
        answer: true,
        answerScores: true,
      },
      orderBy: { id: "asc" },
    });

    // Jika userId tersedia, ambil jawaban user
    let userAnswers: Record<number, string | string[]> = {};
    if (userId) {
      const savedAnswers = await prisma.answer.findMany({
        where: { userId, questionId: { in: questions.map(q => q.id) } },
        select: { questionId: true, choice: true },
      });

      savedAnswers.forEach(a => {
        const choiceStr = String(a.choice);
        userAnswers[a.questionId] = choiceStr.includes(",") ? choiceStr.split(",") : choiceStr;
      });
    }

    return NextResponse.json({ questions, userAnswers });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal ambil soal" }, { status: 500 });
  }
}

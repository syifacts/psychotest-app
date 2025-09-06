import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // ex: IST
    const sub = searchParams.get("sub");   // ex: SE
    const userId = Number(searchParams.get("userId")); // optional

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
        code: true,          // perlu untuk lookup jawaban user
        content: true,
        options: true,
        type: true,
        answer: true,
        answerScores: true,
      },
      orderBy: { id: "asc" },
    });

    // Jika userId tersedia, ambil jawaban user
    let userAnswers: Record<string, string | string[]> = {};
    if (userId) {
      const savedAnswers = await prisma.answer.findMany({
        where: { 
          userId,
          questionCode: { in: questions.map(q => q.code) }
        },
        select: { questionCode: true, choice: true },
      });

      savedAnswers.forEach(a => {
        if (a.questionCode) { // ✅ cek biar ga null
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
    return NextResponse.json({ error: "Gagal ambil soal" }, { status: 500 });
  }
}

// app/api/tes/route.ts - Enhanced Debug Version
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const sub = searchParams.get("sub");
    const userId = Number(searchParams.get("userId"));

    if (!type) {
      return NextResponse.json({ error: "type wajib diisi" }, { status: 400 });
    }

    // Ambil TestType
    const testType = await prisma.testType.findUnique({
      where: { name: type },
    });

    if (!testType) {
      return NextResponse.json({ error: "TestType tidak ditemukan" }, { status: 404 });
    }

    let questions = [];

    if (sub) {
      // ✅ Ambil semua subtest untuk debug
      const allSubTests = await prisma.subTest.findMany({
        where: { testTypeId: testType.id },
      });

      console.log(
  "🔍 ALL SUBTESTS:",
  allSubTests.map((st: any) => ({
    id: st.id,
    name: st.name,
    nameLower: st.name.toLowerCase(),
  }))
);

      console.log("🔍 SEARCHING FOR:", sub, "lowercase:", sub.toLowerCase());

     const subTest = allSubTests.find(
  (st: any) => st.name.toLowerCase() === sub.toLowerCase()
);

      if (!subTest) {
        console.error("❌ SubTest tidak ditemukan!");
        console.error("Available subtests:", allSubTests.map((st: any) => st.name).join(", "));
        return NextResponse.json(
          { 
            error: "SubTest tidak ditemukan",
    available: allSubTests.map((st: any) => st.name),
            searching: sub
          },
          { status: 404 }
        );
      }

      console.log("✅ SubTest found:", subTest.name, "ID:", subTest.id);

      // Ambil questions
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

      console.log(`✅ Found ${questions.length} questions for subtest ${subTest.name}`);

      if (questions.length === 0) {
        console.warn(`⚠️ SubTest ${subTest.name} (ID: ${subTest.id}) tidak punya soal!`);
      }

    } else {
      // Tidak ada sub → ambil semua soal testType
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

    // Ambil jawaban user jika ada
    let userAnswers: Record<string, string | string[]> = {};
    if (userId) {
      const savedAnswers = await prisma.answer.findMany({
        where: {
          userId,
      questionCode: { in: questions.map((q: any) => q.code) },
        },
        select: { questionCode: true, choice: true },
      });

  savedAnswers.forEach((a: any) => {
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
    console.error("❌ Error di /api/tes:", error);
    return NextResponse.json({ error: "Gagal ambil soal" }, { status: 500 });
  }
}
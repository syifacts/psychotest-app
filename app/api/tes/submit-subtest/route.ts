import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scoreIST, IstScoreResult } from "@/lib/scoring/ist";

type AnswerPayload = {
  questionId: number;
  choice: string;
};

type AnswerData = {
  userId: number;
  questionId: number;
  choice: string;
  isCorrect: boolean;
};

export async function POST(req: NextRequest) {
  try {
    const { userId, type, subtest, answers }: { userId: number; type: string; subtest: string; answers: AnswerPayload[] } = await req.json();

    if (!userId || !type || !subtest || !answers?.length) {
      return NextResponse.json(
        { error: "userId, type, subtest, answers wajib diisi" },
        { status: 400 }
      );
    }

    // 🔹 Ambil jawaban benar dari DB
    const questionIds = answers.map(a => a.questionId);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, answer: true },
    });

    // 🔹 Siapkan jawaban user dengan isCorrect
    const answerData: AnswerData[] = answers.map(a => {
      const question = questions.find(q => q.id === a.questionId);
      const isCorrect = question ? question.answer === a.choice : false;
      return { userId, questionId: a.questionId, choice: a.choice, isCorrect };
    });

    // 🔹 Simpan jawaban user
    await Promise.all(
      answerData.map((ans: AnswerData) =>
        prisma.answer.upsert({
          where: { userId_questionId: { userId: ans.userId, questionId: ans.questionId } },
          update: { choice: ans.choice, isCorrect: ans.isCorrect },
          create: ans,
        })
      )
    );

    // 🔹 Hitung skor subtest
    let score = 0;
    if (type === "IST") {
      const istScore: IstScoreResult = await scoreIST(userId, subtest);
      score = istScore.norma ?? istScore.score;
    }

    // 🔹 Ambil entitas TestType
    const testTypeEntity = await prisma.testType.findUnique({ where: { name: type } });
    if (!testTypeEntity) {
      return NextResponse.json({ error: "Test type tidak ditemukan" }, { status: 400 });
    }

    // 🔹 Ambil subtest berdasarkan nama + testTypeId
    const subtestEntity = await prisma.subTest.findUnique({
      where: {
        testTypeId_name: {
          testTypeId: testTypeEntity.id,
          name: subtest,
        },
      },
    });
    if (!subtestEntity) {
      return NextResponse.json({ error: "Subtest tidak ditemukan" }, { status: 400 });
    }

    // 🔹 Simpan/upsert SubtestResult dengan isCompleted = true
    await prisma.subtestResult.upsert({
      where: {
        userId_subTestId_testTypeId: {
          userId,
          subTestId: subtestEntity.id,
          testTypeId: testTypeEntity.id,
        },
      },
      update: { score, isCompleted: true },
      create: {
        userId,
        subTestId: subtestEntity.id,
        testTypeId: testTypeEntity.id,
        score,
        isCompleted: true,
      },
    });

    // 🔹 Cari subtest berikutnya
    const subtests = await prisma.subTest.findMany({
      where: { testTypeId: testTypeEntity.id },
      orderBy: { id: "asc" },
    });

    const doneSubtests = await prisma.subtestResult.findMany({
      where: { userId, testTypeId: testTypeEntity.id, isCompleted: true },
      select: { subTestId: true },
    });

    const nextSubtest = subtests.find(st => !doneSubtests.some(ds => ds.subTestId === st.id));

    return NextResponse.json({
      message: "Jawaban & skor subtest berhasil disimpan",
      score,
      nextSubtest: nextSubtest?.name ?? null,
      durationMinutes: nextSubtest?.duration ?? 6,
       type,
    });

  } catch (err) {
    console.error("❌ Gagal submit subtest:", err);
    return NextResponse.json({ error: "Gagal submit subtest" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scoreIST, IstScoreResult } from "@/lib/scoring/ist";
import type { JsonValue } from "@prisma/client/runtime/library";

type AnswerPayload = {
  questionId: number;
  choice: string;
};

type AnswerScore = { keyword: string; score: number };

function isAnswerScoreArray(val: JsonValue | null): val is AnswerScore[] {
  return (
    Array.isArray(val) &&
    val.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "keyword" in item &&
        "score" in item &&
        typeof (item as any).keyword === "string" &&
        typeof (item as any).score === "number"
    )
  );
}

export async function POST(req: NextRequest) {
  try {
    const { userId, type, subtest, answers }: {
      userId: number;
      type: string;
      subtest: string;
      answers: AnswerPayload[];
    } = await req.json();

    if (!userId || !type || !subtest || !answers?.length) {
      return NextResponse.json(
        { error: "userId, type, subtest, answers wajib diisi" },
        { status: 400 }
      );
    }

    // Ambil testType
    const testTypeEntity = await prisma.testType.findUnique({ where: { name: type } });
    if (!testTypeEntity) return NextResponse.json({ error: "Test type tidak ditemukan" }, { status: 400 });

    // Ambil attempt terakhir
    const attempt = await prisma.testAttempt.findFirst({
      where: { userId, testTypeId: testTypeEntity.id, isCompleted: false },
      orderBy: { startedAt: "desc" },
    });
    if (!attempt) return NextResponse.json({ error: "Attempt tidak ditemukan" }, { status: 400 });

    // Ambil pertanyaan
    const questionIds = answers.map((a) => a.questionId);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, code: true, type: true, answer: true, answerScores: true },
    });

    // Simpan jawaban
    const answerData = answers.map((a) => {
      const question = questions.find((q) => q.id === a.questionId);
      const questionCode = question?.code ?? "";
      let isCorrect = false;

      if (question) {
        if (question.type === "mc") {
          const normalize = (val: string) => val.split(",").map((s) => s.trim()).sort().join(",");
          isCorrect = normalize(a.choice) === normalize(String(question.answer ?? ""));
        } else if (question.type === "essay" && isAnswerScoreArray(question.answerScores)) {
          // Essay: isCorrect = setidaknya ada 1 keyword match
          isCorrect = question.answerScores.some(({ keyword }) =>
            a.choice.toLowerCase().includes(keyword.toLowerCase())
          );
        } else {
          isCorrect = String(question.answer ?? "") === a.choice;
        }
      }

      return { attemptId: attempt.id, questionCode, choice: a.choice, isCorrect, userId };
    });

    await Promise.all(
      answerData.map((ans) =>
        prisma.answer.upsert({
          where: { attemptId_questionCode: { attemptId: ans.attemptId, questionCode: ans.questionCode } },
          update: { choice: ans.choice, isCorrect: ans.isCorrect },
          create: ans,
        })
      )
    );

    // Hitung RW & SW menggunakan scoreIST
    let rw = 0;
    let sw = 0;
    if (type === "IST") {
      const istScore: IstScoreResult = await scoreIST(userId, subtest);
      rw = istScore.rw;
      sw = istScore.norma ?? istScore.rw;
    }

    // Ambil subtest entity
    const subtestEntity = await prisma.subTest.findUnique({
      where: { testTypeId_name: { testTypeId: testTypeEntity.id, name: subtest } },
    });
    if (!subtestEntity) return NextResponse.json({ error: "Subtest tidak ditemukan" }, { status: 400 });

    // Simpan subtestResult
    await prisma.subtestResult.upsert({
      where: { attemptId_subTestId: { attemptId: attempt.id, subTestId: subtestEntity.id } },
      update: { rw, sw, isCompleted: true },
      create: { attemptId: attempt.id, subTestId: subtestEntity.id, rw, sw, isCompleted: true },
    });

    // Hitung total RW & SW
    const subtestResults = await prisma.subtestResult.findMany({ where: { attemptId: attempt.id } });
    const totalRw = subtestResults.reduce((sum, r) => sum + (r.rw ?? 0), 0);
    const totalSw = subtestResults.reduce((sum, r) => sum + (r.sw ?? 0), 0);

    await prisma.result.upsert({
      where: { attemptId_testTypeId: { attemptId: attempt.id, testTypeId: testTypeEntity.id } },
      update: { totalRw, totalSw },
      create: { userId, attemptId: attempt.id, testTypeId: testTypeEntity.id, totalRw, totalSw },
    });

    // Cari next subtest
    const subtests = await prisma.subTest.findMany({ where: { testTypeId: testTypeEntity.id }, orderBy: { id: "asc" } });
    const doneSubtests = subtestResults.map((r) => r.subTestId);
    const nextSubtest = subtests.find((st) => !doneSubtests.includes(st.id));

    return NextResponse.json({
      message: "Jawaban & skor subtest berhasil disimpan",
      nextSubtest: nextSubtest?.name ?? null,
      durationMinutes: nextSubtest?.duration ?? 6,
      type,
      totalRw,
      totalSw,
    }, { status: 200 });

  } catch (err) {
    console.error("❌ Gagal submit subtest:", err);
    return NextResponse.json({ error: "Gagal submit subtest", detail: (err as Error).message }, { status: 500 });
  }
}

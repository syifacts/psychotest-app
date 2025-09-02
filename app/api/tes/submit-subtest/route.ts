import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scoreIST, IstScoreResult } from "@/lib/scoring/ist";
import type { JsonValue } from "@prisma/client/runtime/library";

type AnswerPayload = {
  questionId: number;
  choice: string;
};

type AnswerScore = { keyword: string; score: number };

type AnswerData = {
  userId: number;
  questionCode: string;
  choice: string;
  isCorrect: boolean;
};

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

    // Ambil jawaban benar + code soal dari DB
    const questionIds = answers.map(a => a.questionId);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: {
        id: true,
        code: true,
        type: true,
        answer: true,
        answerScores: true,
      },
    });

    // Siapkan jawaban user dengan isCorrect & code, hitung total essay bonus
    let essayBonus = 0;
    const answerData: AnswerData[] = answers.map((a) => {
      const question = questions.find(q => q.id === a.questionId);
      let isCorrect = false;
      let questionCode = question?.code ?? "";

      if (question) {
        if (question.type === "mc") {
          const normalize = (val: string) =>
            val.split(",").map(s => s.trim()).sort().join(",");
          isCorrect = normalize(a.choice) === normalize(String(question.answer ?? ""));
        } else if (question.type === "essay" && isAnswerScoreArray(question.answerScores)) {
          question.answerScores.forEach(({ keyword, score }) => {
            if (a.choice.toLowerCase().includes(keyword.toLowerCase())) {
              essayBonus += score; // ✅ tambahkan ke bonus total
              isCorrect = true;
            }
          });
        } else {
          isCorrect = String(question.answer ?? "") === a.choice;
        }
      }

      return {
        userId,
        questionCode,
        choice: a.choice,
        isCorrect,
      };
    });

    // Simpan jawaban user
    await Promise.allSettled(
      answerData.map(ans =>
        prisma.answer.upsert({
          where: { userId_questionCode: { userId: ans.userId, questionCode: ans.questionCode } },
          update: { choice: ans.choice, isCorrect: ans.isCorrect },
          create: { userId: ans.userId, questionCode: ans.questionCode, choice: ans.choice, isCorrect: ans.isCorrect },
        })
      )
    );

    // Hitung skor subtest
    let rw = 0;
    let sw = 0;
    if (type === "IST") {
      const istScore: IstScoreResult = await scoreIST(userId, subtest);
      rw = istScore.rw + essayBonus;         // ✅ total RW termasuk essay
      sw = istScore.norma ?? istScore.rw;    // SW = norma atau fallback RW
    }

    // Ambil entitas TestType & SubTest
    const testTypeEntity = await prisma.testType.findUnique({ where: { name: type } });
    if (!testTypeEntity) return NextResponse.json({ error: "Test type tidak ditemukan", status: 400 });

    const subtestEntity = await prisma.subTest.findUnique({
      where: { testTypeId_name: { testTypeId: testTypeEntity.id, name: subtest } },
    });
    if (!subtestEntity) return NextResponse.json({ error: "Subtest tidak ditemukan", status: 400 });

    // Simpan/upsert SubtestResult
    await prisma.subtestResult.upsert({
      where: {
        userId_subTestId_testTypeId: {
          userId,
          subTestId: subtestEntity.id,
          testTypeId: testTypeEntity.id,
        },
      },
      update: { rw, sw, isCompleted: true },
      create: {
        userId,
        subTestId: subtestEntity.id,
        testTypeId: testTypeEntity.id,
        rw,
        sw,
        isCompleted: true,
      },
    });

    // Cari subtest berikutnya
    const subtests = await prisma.subTest.findMany({ where: { testTypeId: testTypeEntity.id }, orderBy: { id: "asc" } });
    const doneSubtests = await prisma.subtestResult.findMany({ where: { userId, testTypeId: testTypeEntity.id, isCompleted: true }, select: { subTestId: true } });
    const doneSet = new Set(doneSubtests.map(ds => ds.subTestId));
    const nextSubtest = subtests.find(st => !doneSet.has(st.id));

    return NextResponse.json({
      message: "Jawaban & skor subtest berhasil disimpan",
      nextSubtest: nextSubtest?.name ?? null,
      durationMinutes: nextSubtest?.duration ?? 6,
      type,
    }, { status: 200 });

  } catch (err) {
    console.error("❌ Gagal submit subtest:", err);
    return NextResponse.json({ error: "Gagal submit subtest", detail: (err as Error).message }, { status: 500 });
  }
}

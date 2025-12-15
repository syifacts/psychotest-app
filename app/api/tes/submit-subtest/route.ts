import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scoreIST, IstScoreResult } from "@/lib/scoring/ist";
import type { JsonValue } from "@prisma/client/runtime/library";

type AnswerPayload = { questionId: number; choice: string; };
type AnswerScore = { keyword: string; score: number };

function isAnswerScoreArray(val: JsonValue | null): val is AnswerScore[] {
  return Array.isArray(val) &&
    val.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "keyword" in item &&
        "score" in item &&
        typeof (item as any).keyword === "string" &&
        typeof (item as any).score === "number"
    );
}

export async function POST(req: NextRequest) {
  try {
    // ✅ Ambil semua body di awal (sekali saja)
    const body = await req.json();
    const { userId, type, subtest, answers, attemptId }: {
      userId: number;
      type: string;
      subtest: string;
      answers: AnswerPayload[];
      attemptId?: number;
    } = body;

    if (!userId || !type || !subtest || !answers?.length) {
      return NextResponse.json(
        { error: "userId, type, subtest, answers wajib diisi" },
        { status: 400 }
      );
    }

    // ✅ Ambil testType dan attempt
    const testTypeEntity = await prisma.testType.findUnique({ where: { name: type } });
    if (!testTypeEntity)
      return NextResponse.json({ error: "Test type tidak ditemukan" }, { status: 400 });

    let attempt = null;

    // ✅ Pakai attemptId dari request jika ada
    if (attemptId) {
      attempt = await prisma.testAttempt.findUnique({
        where: { id: attemptId },
        include: { User: true },
      });
    }

    // ✅ Fallback jika tidak ditemukan / tidak valid
    if (!attempt) {
      attempt = await prisma.testAttempt.findFirst({
        where: { userId, testTypeId: testTypeEntity.id, isCompleted: false },
        orderBy: { startedAt: "desc" },
        include: { User: true },
      });
    }

    if (!attempt)
      return NextResponse.json({ error: "Attempt tidak ditemukan" }, { status: 400 });

    // ✅ Ambil pertanyaan
    const questionIds = answers.map(a => a.questionId);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, code: true, type: true, answer: true, answerScores: true },
    });

    // ✅ Simpan jawaban & cek kebenaran
  const answerData = answers.map((a: any) => {
  const question = questions.find((q: any) => q.id === a.questionId);
      const questionCode = question?.code ?? "";
      let isCorrect = false;

      if (question) {
        if (question.type === "mc") {
          const normalize = (val: string) => val.split(",").map(s => s.trim()).sort().join(",");
          isCorrect = normalize(a.choice) === normalize(String(question.answer ?? ""));
        } else if (question.type === "essay" && isAnswerScoreArray(question.answerScores)) {
      isCorrect = question.answerScores.some(({ keyword }: any) =>
            a.choice.toLowerCase().includes(keyword.toLowerCase())
          );
        } else {
          isCorrect = String(question.answer ?? "") === a.choice;
        }
      }

      return { attemptId: attempt.id, questionCode, choice: a.choice, isCorrect, userId };
    });

    await Promise.all(
answerData.map((ans: any) =>
          prisma.answer.upsert({
          where: { attemptId_questionCode: { attemptId: ans.attemptId, questionCode: ans.questionCode } },
          update: { choice: ans.choice, isCorrect: ans.isCorrect },
          create: ans,
        })
      )
    );

    // ✅ Hitung RW & SW
    let rw = 0;
    let sw = 0;
   if (type === "IST") {
  // 🧩 Tangani khusus subtest tanpa norma / soal
  if (
    ["hapalanme", "mehapalan", "me_hapalan", "hapalan_me"].includes(subtest.toLowerCase())
  ) {
    console.log(`⚠️ Subtest ${subtest} dilewati (tidak punya soal/norma)`);
    rw = 0;
    sw = 0;
  } else {
    try {
      const istScore: IstScoreResult = await scoreIST(userId, subtest, attempt.id);
      rw = istScore?.rw ?? 0;
      sw = istScore?.norma ?? istScore?.rw ?? 0;
    } catch (err) {
      console.warn(`⚠️ Gagal hitung skor subtest ${subtest}:`, err);
      rw = 0;
      sw = 0;
    }
  }
}


    // ✅ Ambil subtest entity
    const subtestEntity = await prisma.subTest.findUnique({
      where: { testTypeId_name: { testTypeId: testTypeEntity.id, name: subtest } },
    });
    if (!subtestEntity)
      return NextResponse.json({ error: "Subtest tidak ditemukan" }, { status: 400 });

    // ✅ Kategori SW
    function swCategory(sw: number): string {
      if (sw <= 80) return "Sangat Rendah";
      if (sw <= 94) return "Rendah";
      if (sw <= 99) return "Sedang";
      if (sw <= 104) return "Cukup";
      if (sw <= 118) return "Tinggi";
      return "Sangat Tinggi";
    }

    await prisma.subtestResult.upsert({
      where: { attemptId_subTestId: { attemptId: attempt.id, subTestId: subtestEntity.id } },
      update: { rw, sw, kategori: swCategory(sw), isCompleted: true },
      create: { attemptId: attempt.id, subTestId: subtestEntity.id, rw, sw, kategori: swCategory(sw), isCompleted: true },
    });

    // ✅ Update userProgress
    await prisma.userProgress.updateMany({
      where: { userId, attemptId: attempt.id, subtest },
      data: { isCompleted: true },
    });

    // ✅ Cek semua subtest selesai
    const subTestResults = await prisma.subtestResult.findMany({ where: { attemptId: attempt.id } });
    const subTests = await prisma.subTest.findMany({ where: { testTypeId: attempt.testTypeId } });
    const allDone = subTests.length === subTestResults.length;

    // ✅ Hitung total RW & SW
    // const totalRw = subTestResults.reduce((sum, s) => sum + (s.rw ?? 0), 0);
    // const totalSw = subTestResults.reduce((sum, s) => sum + (s.sw ?? 0), 0);
    const totalRw = subTestResults.reduce(
  (sum: number, s: any) => sum + (s.rw ?? 0),
  0
);
const totalSw = subTestResults.reduce(
  (sum: number, s: any) => sum + (s.sw ?? 0),
  0
);

    // ✅ Upsert result
    let result = await prisma.result.upsert({
      where: { attemptId_testTypeId: { attemptId: attempt.id, testTypeId: attempt.testTypeId } },
      update: { totalRw, totalSw },
      create: { attemptId: attempt.id, testTypeId: attempt.testTypeId, userId, totalRw, totalSw },
      include: { User: true },
    });

    // ✅ Hitung IQ & Dimensi (jika semua selesai)
    if (allDone && attempt.User.birthDate) {
      const birth = new Date(attempt.User.birthDate);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate()))
        age--;

      const normaResult = await prisma.normaResult.findFirst({
        where: { rw: { lte: totalRw }, age: { lte: age } },
        orderBy: [{ age: "desc" }, { rw: "desc" }],
      });
      const swIq = normaResult?.sw ?? 0;

      const minIqNorma = await prisma.normaIq.findFirst({ orderBy: { sw: "asc" } });
      const maxIqNorma = await prisma.normaIq.findFirst({ orderBy: { sw: "desc" } });

      let iq: number | null = null;
      if (swIq <= (minIqNorma?.sw ?? 0)) iq = minIqNorma?.iq ?? 0;
      else if (swIq >= (maxIqNorma?.sw ?? 0)) iq = maxIqNorma?.iq ?? 0;
      else {
        const normaIq = await prisma.normaIq.findFirst({
          where: { sw: { lte: swIq } },
          orderBy: { sw: "desc" },
        });
        iq = normaIq?.iq ?? 0;
      }

      // ✅ Fungsi kategori IQ & dimensi
      function iqCategory(iq: number): string {
        if (iq <= 65) return "Mentally Defective";
        if (iq <= 79) return "Borderline Defective";
        if (iq <= 90) return "Low Average";
        if (iq <= 110) return "Average";
        if (iq <= 119) return "High Average";
        if (iq <= 127) return "Superior";
        if (iq <= 139) return "Very Superior";
        return "Genius";
      }

      function getDimensi(geSw: number, raSw: number, anSw: number, zrSw: number): string {
        const gera = geSw + raSw;
        const anzr = anSw + zrSw;
        const total = Math.abs(gera - anzr);
        if (total <= 10) return "Seimbang";
        if (gera > anzr) return "Eksak";
        return "Non Eksak";
      }

      const kategoriIq = iqCategory(iq ?? 0);
      const ISTSubTests = ["SE", "WA", "AN", "GE", "RA", "ZR", "FA", "WU", "ME"];
      const swMap: Record<string, number> = {};
      ISTSubTests.forEach((name, idx) => (swMap[name] = subTestResults[idx]?.sw ?? 0));
      const dimensi = getDimensi(swMap["GE"], swMap["RA"], swMap["AN"], swMap["ZR"]);

      await prisma.result.update({
        where: { id: result.id },
        data: { swIq, iq, keteranganiq: kategoriIq, dominasi: dimensi, isCompleted: true },
      });
    }

 const doneSubtests = subTestResults.map((r: any) => r.subTestId);
const nextSubtest = subTests.find((st: any) => !doneSubtests.includes(st.id));


    return NextResponse.json({
      success: true,
      allDone,
      nextSubtest: nextSubtest?.name ?? null,
      durationMinutes: nextSubtest?.duration ?? 6,
      totalRw,
      totalSw,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Gagal submit subtest", detail: (err as Error).message },
      { status: 500 }
    );
  }
}

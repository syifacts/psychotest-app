import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { attemptId } = await req.json();
    if (!attemptId) {
      return NextResponse.json({ error: "attemptId wajib dikirim" }, { status: 400 });
    }

    // Ambil data attempt untuk mendapatkan userId dan testTypeId
    const attempt = await prisma.testAttempt.findUnique({ where: { id: attemptId } });
    if (!attempt) {
      return NextResponse.json({ error: "Attempt tidak ditemukan" }, { status: 404 });
    }

    const { userId, testTypeId } = attempt;

    const answers = await prisma.answer.findMany({ where: { attemptId } });
    if (!answers.length) {
      return NextResponse.json({ error: "Belum ada jawaban untuk attempt ini" }, { status: 404 });
    }

    const questionCodes = answers.map(a => a.preferenceQuestionCode).filter(Boolean) as string[];
    const questions = await prisma.preferenceQuestion.findMany({
      where: { code: { in: questionCodes } },
      select: { code: true, dimension: true },
    });

    const answersWithQuestion = answers.map(a => ({
      ...a,
      question: questions.find(q => q.code === a.preferenceQuestionCode) || null,
    }));

    const dimensionMap: Record<string, [string, string]> = {
      EI: ["E", "I"],
      SN: ["S", "N"],
      TF: ["T", "F"],
      JP: ["J", "P"],
    };
    
    const valueMap: Record<string, number> = { EI: 10, SN: 5, TF: 5, JP: 5 };

    const scores: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

    // Proses perhitungan skor mentah berdasarkan bobot
    for (const ans of answersWithQuestion) {
      const dim = ans.question?.dimension;
      if (!dim || !ans.choice) continue;

      const [first, second] = dimensionMap[dim as keyof typeof dimensionMap];
      const valueToAdd = valueMap[dim as keyof typeof valueMap];

      if (ans.choice.toLowerCase() === "a") {
        scores[first] += valueToAdd;
      } else if (ans.choice.toLowerCase() === "b") {
        scores[second] += valueToAdd;
      }
    }
    
    // Logika penentuan tipe MBTI dengan tipe default INFP
    const defaultType = { EI: "I", SN: "N", TF: "F", JP: "P" };

    const letterEI = (scores.E > 0 || scores.I > 0) ? (scores.E >= scores.I ? "E" : "I") : defaultType.EI;
    const letterSN = (scores.S > 0 || scores.N > 0) ? (scores.S >= scores.N ? "S" : "N") : defaultType.SN;
    const letterTF = (scores.T > 0 || scores.F > 0) ? (scores.T >= scores.F ? "T" : "F") : defaultType.TF;
    const letterJP = (scores.J > 0 || scores.P > 0) ? (scores.J >= scores.P ? "J" : "P") : defaultType.JP;

    const resultType = `${letterEI}${letterSN}${letterTF}${letterJP}`;

    // Simpan hasil scoring ke database
    const personalityResult = await prisma.personalityResult.upsert({
      where: { attemptId },
      update: { resultType, scores, summary: `Hasil tes MBTI: ${resultType}` },
      create: { 
        attemptId,
        userId,
        testTypeId,
        resultType, 
        scores, 
        summary: `Hasil tes MBTI: ${resultType}` 
      },
    });

    // Ambil detail deskripsi dari tabel PersonalityDescription
    const descriptionDetails = await prisma.personalityDescription.findUnique({
      where: {
        testTypeId_type: {
          testTypeId: testTypeId,
          type: resultType,
        },
      },
    });

    // Gabungkan hasil dan kirim sebagai respons
    return NextResponse.json({
      message: "Scoring berhasil",
      result: personalityResult,
      details: descriptionDetails,
    });

  } catch (err) {
    console.error("❌ Error scoring MBTI:", err);
    return NextResponse.json({ error: "Gagal melakukan scoring" }, { status: 500 });
  }
}


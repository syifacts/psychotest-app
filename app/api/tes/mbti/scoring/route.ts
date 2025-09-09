// Lokasi: app/api/tes/mbti/scoring/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { attemptId } = await req.json();
    if (!attemptId) {
      return NextResponse.json({ error: "attemptId wajib dikirim" }, { status: 400 });
    }

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
    
    const percentageMap: Record<string, number> = { EI: 10, SN: 5, TF: 5, JP: 5 };

    const percent: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

    // Proses perhitungan persentase - PENJUMLAHAN LANGSUNG
    for (const ans of answersWithQuestion) {
      const dim = ans.question?.dimension;
      if (!dim || !ans.choice) continue;

      const [first, second] = dimensionMap[dim as keyof typeof dimensionMap];
      const percentageToAdd = percentageMap[dim as keyof typeof percentageMap];

      if (ans.choice.toLowerCase() === "a") {
        percent[first] += percentageToAdd;
      } else if (ans.choice.toLowerCase() === "b") {
        percent[second] += percentageToAdd;
      }
    }
    
    // =================================================================
    // LOGIKA PENENTUAN TIPE MBTI DENGAN TIPE DEFAULT
    // =================================================================
    // Menetapkan tipe dasar jika pengguna tidak menjawab soal di dimensi tertentu.
    const defaultType = {
      EI: "I", // Introvert
      SN: "N", // Intuition
      TF: "F", // Feeling
      JP: "P", // Perceiving
    };

    // Tentukan huruf untuk setiap dimensi secara kondisional
    const letterEI = (percent.E + percent.I > 0) ? (percent.E >= percent.I ? "E" : "I") : defaultType.EI;
    const letterSN = (percent.S + percent.N > 0) ? (percent.S >= percent.N ? "S" : "N") : defaultType.SN;
    const letterTF = (percent.T + percent.F > 0) ? (percent.T >= percent.F ? "T" : "F") : defaultType.TF;
    const letterJP = (percent.J + percent.P > 0) ? (percent.J >= percent.P ? "J" : "P") : defaultType.JP;

    // Gabungkan huruf-huruf menjadi tipe hasil akhir
    const resultType = `${letterEI}${letterSN}${letterTF}${letterJP}`;

    // Simpan hasil scoring
    const personalityResult = await prisma.personalityResult.upsert({
      where: { attemptId },
      update: { resultType, scores: percent, summary: `Hasil tes MBTI: ${resultType}` },
      create: { attemptId, resultType, scores: percent, summary: `Hasil tes MBTI: ${resultType}` },
    });

    return NextResponse.json({ message: "Scoring berhasil", result: personalityResult });
  } catch (err) {
    console.error("❌ Error scoring MBTI:", err);
    return NextResponse.json({ error: "Gagal melakukan scoring" }, { status: 500 });
  }
}


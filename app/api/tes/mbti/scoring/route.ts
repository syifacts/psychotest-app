import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { attemptId } = await req.json();
    if (!attemptId) return NextResponse.json({ error: "attemptId wajib dikirim" }, { status: 400 });

    const answers = await prisma.answer.findMany({
      where: { attemptId },
      include: { PreferenceQuestion: true },
    });

    if (!answers.length) return NextResponse.json({ error: "Belum ada jawaban untuk attempt ini" }, { status: 404 });

    const dimensionMap: Record<string, [string, string]> = {
      EI: ["E", "I"],
      SN: ["S", "N"],
      TF: ["T", "F"],
      JP: ["J", "P"],
    };

    const weightMap: Record<string, number> = {
      EI: 10,
      SN: 5,
      TF: 5,
      JP: 5,
    };

    const scores: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    const dimTotals: Record<string, number> = { EI: 0, SN: 0, TF: 0, JP: 0 };

    // Hitung skor per sisi & total dimensi
    for (const ans of answers) {
      const dim = ans.PreferenceQuestion?.dimension;
      if (!dim || !ans.choice) continue;

      const [first, second] = dimensionMap[dim];
      const weight = weightMap[dim];

      if (ans.choice === "a") scores[first] += weight;
      if (ans.choice === "b") scores[second] += weight;

      dimTotals[dim] += weight; // total poin dimensi
    }

    // Hitung persentase per sisi berdasarkan total dimensi
    const percent: Record<string, number> = {};
    for (const dim in dimensionMap) {
      const [first, second] = dimensionMap[dim];
      const total = dimTotals[dim] || 1; // agar tidak div/0
      percent[first] = Math.round((scores[first] / total) * 100);
      percent[second] = Math.round((scores[second] / total) * 100);
    }

    const resultType =
      (percent.E >= percent.I ? "E" : "I") +
      (percent.S >= percent.N ? "S" : "N") +
      (percent.T >= percent.F ? "T" : "F") +
      (percent.J >= percent.P ? "J" : "P");

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

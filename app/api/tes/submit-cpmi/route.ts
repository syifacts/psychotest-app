import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type AnswerPayload = {
  questionId?: number;
  questionCode?: string;
  choice: string;
};

// 🔹 Tabel mapping total skor → skor IQ
// Contoh: total skor maksimal CPMI = 50 (sesuaikan dengan total skor sebenarnya)
const iqTable = [
  { correct: 50, score: 120, kategori: "Superior", status: "LULUS" },
  { correct: 49, score: 120, kategori: "Superior", status: "LULUS" },
  { correct: 48, score: 120, kategori: "Superior", status: "LULUS" },
  { correct: 47, score: 120, kategori: "Superior", status: "LULUS" },
  { correct: 46, score: 120, kategori: "Superior", status: "LULUS" },
  { correct: 45, score: 120, kategori: "Superior", status: "LULUS" },
  { correct: 44, score: 120, kategori: "Superior", status: "LULUS" },
  { correct: 43, score: 120, kategori: "Superior", status: "LULUS" },
  { correct: 42, score: 120, kategori: "Superior", status: "LULUS" },
  { correct: 41, score: 120, kategori: "Superior", status: "LULUS" },
  { correct: 40, score: 120, kategori: "Superior", status: "LULUS" },
  { correct: 39, score: 110, kategori: "Di atas rata-rata", status: "LULUS" },
  { correct: 38, score: 110, kategori: "Di atas rata-rata", status: "LULUS" },
  { correct: 37, score: 110, kategori: "Di atas rata-rata", status: "LULUS" },
  { correct: 36, score: 108, kategori: "Rata-rata", status: "LULUS" },
  { correct: 35, score: 108, kategori: "Rata-rata", status: "LULUS" },
  { correct: 34, score: 108, kategori: "Rata-rata", status: "LULUS" },
  { correct: 33, score: 108, kategori: "Rata-rata", status: "LULUS" },
  { correct: 32, score: 108, kategori: "Rata-rata", status: "LULUS" },
  { correct: 31, score: 108, kategori: "Rata-rata", status: "LULUS" },
  { correct: 30, score: 107, kategori: "Rata-rata", status: "LULUS" },
  { correct: 29, score: 107, kategori: "Rata-rata", status: "LULUS" },
  { correct: 28, score: 107, kategori: "Rata-rata", status: "LULUS" },
  { correct: 27, score: 107, kategori: "Rata-rata", status: "LULUS" },
  { correct: 26, score: 106, kategori: "Rata-rata", status: "LULUS" },
  { correct: 25, score: 106, kategori: "Rata-rata", status: "LULUS" },
  { correct: 24, score: 106, kategori: "Rata-rata", status: "LULUS" },
  { correct: 23, score: 106, kategori: "Rata-rata", status: "LULUS" },
  { correct: 22, score: 104, kategori: "Rata-rata", status: "LULUS" },
  { correct: 21, score: 104, kategori: "Rata-rata", status: "LULUS" },
  { correct: 20, score: 102, kategori: "Rata-rata", status: "LULUS" },
  { correct: 19, score: 102, kategori: "Rata-rata", status: "LULUS" },
  { correct: 18, score: 100, kategori: "Rata-rata", status: "LULUS" },
  { correct: 17, score: 100, kategori: "Rata-rata", status: "LULUS" },
  { correct: 16, score: 98, kategori: "Rata-rata", status: "LULUS" },
  { correct: 15, score: 98, kategori: "Rata-rata", status: "LULUS" },
  { correct: 14, score: 98, kategori: "Rata-rata", status: "LULUS" },
  { correct: 13, score: 98, kategori: "Rata-rata", status: "LULUS" },
  { correct: 12, score: 97, kategori: "Rata-rata", status: "LULUS" },
  { correct: 11, score: 96, kategori: "Rata-rata", status: "LULUS" },
  { correct: 10, score: 95, kategori: "Rata-rata", status: "LULUS" },
  { correct: 9, score: 94, kategori: "Rata-rata", status: "LULUS" },
  { correct: 8, score: 94, kategori: "Rata-rata", status: "LULUS" },
  { correct: 7, score: 93, kategori: "Rata-rata", status: "LULUS" },
  { correct: 6, score: 88, kategori: "Sedikit di bawah rata-rata", status: "LULUS" },
  { correct: 5, score: 87, kategori: "Sedikit di bawah rata-rata", status: "LULUS" },
  { correct: 4, score: 86, kategori: "Sedikit di bawah rata-rata", status: "LULUS" },
  { correct: 3, score: 85, kategori: "Sedikit di bawah rata-rata", status: "LULUS" },
  { correct: 2, score: 78, kategori: "Di bawah rata-rata", status: "TIDAK LULUS" },
  { correct: 1, score: 78, kategori: "Di bawah rata-rata", status: "TIDAK LULUS" },
];

// 🔹 Helper mapping IQ
function getIQResult(totalScore: number) {
  // Cari row di iqTable yang paling dekat tapi tidak lebih besar dari totalScore
  const sortedTable = [...iqTable].sort((a, b) => b.correct - a.correct);
  for (const row of sortedTable) {
    if (totalScore >= row.correct) return row;
  }
  return { score: null, kategori: "Tidak diketahui", status: "TIDAK LULUS" };
}

export async function POST(req: NextRequest) {
  try {
    const { userId, attemptId, answers } = await req.json();

    if (!userId || !attemptId || !answers) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // Filter jawaban CPMI valid
    const validAnswers = (answers as AnswerPayload[]).filter(
      (a) => typeof a.questionCode === "string" && a.questionCode.startsWith("CPMI-")
    );

    if (validAnswers.length === 0) {
      return NextResponse.json({ error: "Tidak ada jawaban CPMI valid" }, { status: 400 });
    }

    // Ambil soal CPMI dari DB
    const questionList = await prisma.question.findMany({
      where: { code: { in: validAnswers.map((a) => a.questionCode!) } },
      select: { id: true, code: true, answerScores: true },
    });

    const scoreMap: Record<string, any[]> = {};
    questionList.forEach((q) => {
      scoreMap[q.code] = q.answerScores as any[];
    });

    // Hapus jawaban lama
    await prisma.answer.deleteMany({ where: { attemptId } });

    let totalScore = 0;

    for (const ans of validAnswers) {
      const scores = scoreMap[ans.questionCode!];

      // Normalisasi jawaban
      const choiceNormalized = ans.choice.trim().toUpperCase();

      // Ambil skor jawaban yang dipilih
      const scoreObj = scores?.find((s) => {
        const optLetter = s.options.trim()[0].toUpperCase();
        return optLetter === choiceNormalized[0];
      });

      const score = scoreObj?.score || 0;
      totalScore += score;

      await prisma.answer.create({
        data: {
          attemptId,
          userId,
          questionCode: ans.questionCode!,
          choice: ans.choice,
          isCorrect: score > 0,
        },
      });
    }

    // Mapping ke IQ table berdasarkan totalScore
    const iqResult = getIQResult(totalScore);

    // Update attempt selesai
    await prisma.testAttempt.update({
  where: { id: attemptId },
  data: {
    finishedAt: new Date(),
    isCompleted: true, // ✅ tambahkan ini
  },
});


    // Simpan hasil CPMI
    await prisma.result.create({
      data: {
        userId,
        attemptId,
        testTypeId: 30, // CPMI selalu id 30
        jumlahbenar: totalScore, // sekarang total skor
        scoreiq: iqResult.score,
        kategoriiq: iqResult.kategori,
        keteranganiqCPMI: iqResult.status,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Jawaban CPMI berhasil disimpan",
      totalScore,
      hasil: iqResult,
    });
  } catch (err: any) {
    console.error("❌ Error submit CPMI:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

import { prisma } from "@/lib/prisma";
import type { JsonValue } from "@prisma/client/runtime/library";

// Interface hasil scoring IST
export interface IstScoreResult {
  rw: number;     // jumlah jawaban benar / total skor
  score: number;  // skor dasar (misal = rw)
  norma?: number; // skor normanya (sw)
}

// Tipe untuk scoring essay
type AnswerScore = { keyword: string; score: number };

// Type guard agar TypeScript tahu answerScores itu AnswerScore[]
function isAnswerScoreArray(val: JsonValue | null | undefined): val is AnswerScore[] {
  return (
    Array.isArray(val) &&
    val.every(
      (item) =>
        item &&
        typeof item === "object" &&
        "keyword" in item &&
        "score" in item &&
        typeof (item as any).keyword === "string" &&
        typeof (item as any).score === "number"
    )
  );
}

/**
 * Hitung skor IST untuk user & subtest tertentu
 * @param userId - ID peserta
 * @param subtest - nama subtest, ex: "SE"
 */
export async function scoreIST(userId: number, subtest: string): Promise<IstScoreResult> {
  // Ambil jawaban peserta untuk subtest ini
  const answers = await prisma.answer.findMany({
    where: {
      userId,
      Question: { SubTest: { is: { name: subtest } } },
    },
    include: { Question: true },
  });

  let rw = 0;

  for (const a of answers) {
    const q = a.Question;
    if (!q) continue; // ✅ skip jika null

    if (q.type === "essay" && isAnswerScoreArray(q.answerScores)) {
      // hitung essay sesuai keyword + score
      let scoreForThisQuestion = 0;
      const countedKeywords = new Set<string>();

      for (const { keyword, score } of q.answerScores) {
        if (
          !countedKeywords.has(keyword) &&
          a.choice.toLowerCase().includes(keyword.toLowerCase())
        ) {
          scoreForThisQuestion += score;
          countedKeywords.add(keyword);
        }
      }

      rw += scoreForThisQuestion;
    } else if (a.isCorrect) {
      // jawaban MC / single choice
      rw += 1;
    }
  }

  const score = rw; // skor dasar = rw

  // Ambil usia peserta
  const user = await prisma.user.findUnique({ where: { id: userId } });
  let age: number | undefined;
  if (user?.birthDate) {
    const birth = new Date(user.birthDate);
    const now = new Date();
    age = now.getFullYear() - birth.getFullYear();
    if (
      now.getMonth() < birth.getMonth() ||
      (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
    ) {
      age--;
    }
  }

  // Ambil skor norma dari tabel normaIst
  let norma: number | undefined;
  if (age !== undefined) {
    const normaData = await prisma.normaIst.findFirst({
      where: { subtest, rw, age: { lte: age } },
      orderBy: { age: "desc" },
    });
    norma = normaData?.sw;
  }

  return { rw, score, norma };
}

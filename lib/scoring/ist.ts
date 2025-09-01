import { prisma } from "@/lib/prisma";

// Interface hasil scoring IST
export interface IstScoreResult {
  rw: number;     // jumlah jawaban benar
  score: number;  // skor dasar (misal = rw)
  norma?: number; // skor normanya (sw)
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
    Question: {
      SubTest: {
        is: { name: subtest }   // 👈 pakai "is"
      }
    }
  },
  include: {
    Question: {
      include: { SubTest: true }
    }
  }
});


  // Hitung rw (jumlah jawaban benar)
  const rw = answers.filter(a => a.isCorrect).length;

  // Skor dasar: default = rw
  const score = rw;

  // Ambil usia peserta dari birthDate
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

  // Ambil skor norma dari tabel normaIst (dengan fallback umur)
  let norma: number | undefined = undefined;
  if (age !== undefined) {
    const normaData = await prisma.normaIst.findFirst({
      where: {
        subtest: subtest,
        rw: rw,
        age: { lte: age }, // cari umur ≤ umur peserta
      },
      orderBy: {
        age: "desc", // ambil yang paling dekat ke umur peserta
      },
    });

    norma = normaData?.sw;
  }

  return { rw, score, norma };
}

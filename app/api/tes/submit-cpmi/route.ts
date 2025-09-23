// // app/api/cpmi/submit/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// type AnswerPayload = {
//   questionId?: number;
//   questionCode?: string;
//   choice: string;
// };

// // Tabel mapping total skor → IQ
// const iqTable = [
//   { correct: 50, score: 120, kategori: "Superior", status: "LULUS" },
//   { correct: 49, score: 120, kategori: "Superior", status: "LULUS" },
//   { correct: 48, score: 120, kategori: "Superior", status: "LULUS" },
//   { correct: 47, score: 120, kategori: "Superior", status: "LULUS" },
//   { correct: 46, score: 120, kategori: "Superior", status: "LULUS" },
//   { correct: 45, score: 120, kategori: "Superior", status: "LULUS" },
//   { correct: 44, score: 120, kategori: "Superior", status: "LULUS" },
//   { correct: 43, score: 120, kategori: "Superior", status: "LULUS" },
//   { correct: 42, score: 120, kategori: "Superior", status: "LULUS" },
//   { correct: 41, score: 120, kategori: "Superior", status: "LULUS" },
//   { correct: 40, score: 120, kategori: "Superior", status: "LULUS" },
//   { correct: 39, score: 110, kategori: "Di atas rata-rata", status: "LULUS" },
//   { correct: 38, score: 110, kategori: "Di atas rata-rata", status: "LULUS" },
//   { correct: 37, score: 110, kategori: "Di atas rata-rata", status: "LULUS" },
//   { correct: 36, score: 108, kategori: "Rata-rata", status: "LULUS" },
//   { correct: 35, score: 108, kategori: "Rata-rata", status: "LULUS" },
//   { correct: 34, score: 108, kategori: "Rata-rata", status: "LULUS" },
//   { correct: 33, score: 108, kategori: "Rata-rata", status: "LULUS" },
//   { correct: 32, score: 108, kategori: "Rata-rata", status: "LULUS" },
//   { correct: 31, score: 108, kategori: "Rata-rata", status: "LULUS" },
//   { correct: 30, score: 107, kategori: "Rata-rata", status: "LULUS" },
//   { correct: 29, score: 107, kategori: "Rata-rata", status: "LULUS" },
//   { correct: 28, score: 107, kategori: "Rata-rata", status: "LULUS" },
//   { correct: 27, score: 107, kategori: "Rata-rata", status: "LULUS" },
//   { correct: 26, score: 106, kategori: "Rata-rata", status: "LULUS" },
//   { correct: 25, score: 106, kategori: "Rata-rata", status: "LULUS" },
//   { correct: 24, score: 106, kategori: "Rata-rata", status: "LULUS" },
//   { correct: 23, score: 106, kategori: "Rata-rata", status: "LULUS" },
//   { correct: 22, score: 104, kategori: "Rata-rata", status: "LULUS" },
//   { correct: 21, score: 104, kategori: "Rata-rata", status: "LULUS" },
//   { correct: 20, score: 102, kategori: "Rata-rata", status: "LULUS" },
//   { correct: 19, score: 102, kategori: "Rata-rata", status: "LULUS" },
//   { correct: 18, score: 100, kategori: "Rata-rata", status: "LULUS" },
//   { correct: 17, score: 100, kategori: "Rata-rata", status: "LULUS" },
//   { correct: 16, score: 98, kategori: "Rata-rata", status: "LULUS" },
//   { correct: 15, score: 98, kategori: "Rata-rata", status: "LULUS" },
//   { correct: 14, score: 98, kategori: "Rata-rata", status: "LULUS" },
//   { correct: 13, score: 98, kategori: "Rata-rata", status: "LULUS" },
//   { correct: 12, score: 97, kategori: "Rata-rata", status: "LULUS" },
//   { correct: 11, score: 96, kategori: "Rata-rata", status: "LULUS" },
//   { correct: 10, score: 95, kategori: "Rata-rata", status: "LULUS" },
//   { correct: 9, score: 94, kategori: "Rata-rata", status: "LULUS" },
//   { correct: 8, score: 94, kategori: "Rata-rata", status: "LULUS" },
//   { correct: 7, score: 93, kategori: "Rata-rata", status: "LULUS" },
//   { correct: 6, score: 88, kategori: "Sedikit di bawah rata-rata", status: "LULUS" },
//   { correct: 5, score: 87, kategori: "Sedikit di bawah rata-rata", status: "LULUS" },
//   { correct: 4, score: 86, kategori: "Sedikit di bawah rata-rata", status: "LULUS" },
//   { correct: 3, score: 85, kategori: "Sedikit di bawah rata-rata", status: "LULUS" },
//   { correct: 2, score: 78, kategori: "Di bawah rata-rata", status: "TIDAK LULUS" },
//   { correct: 1, score: 78, kategori: "Di bawah rata-rata", status: "TIDAK LULUS" },
// ];

// // Helper mapping IQ
// function getIQResult(totalScore: number) {
//   const sortedTable = [...iqTable].sort((a, b) => b.correct - a.correct);
//   for (const row of sortedTable) {
//     if (totalScore >= row.correct) return row;
//   }
//   return { score: null, kategori: "Tidak diketahui", status: "TIDAK LULUS" };
// }

// // Mapping aspek → nomor soal CPMI
// const aspekQuestionsMap: Record<number, number[]> = {
//   1: [1, 2, 3],
//   2: [4, 5, 6],
//   3: [7, 8, 9],
//   4: [10, 11, 12],
//   5: [13, 14, 15],
//   6: [16, 17, 18],
// };

// // Hitung kategori tiap aspek
// function getKategoriAspek(total: number) {
//   if (total >= 8) return "T";
//   if (total >= 6) return "S";
//   if (total >= 3) return "R";
//   return "-";
// }

// // Function untuk replace placeholder di template
// function replaceTemplatePlaceholders(template: string, user: any, scoreiq: number): string {
//   let result = template;
  
//   // Replace {name}
//   if (user?.fullName) {
//     result = result.replace(/{name}/g, user.fullName);
//   }
  
//   // Replace {scoreiq}
//   if (scoreiq) {
//     result = result.replace(/{scoreiq}/g, scoreiq.toString());
//   }
  
//   return result;
// }

// export async function POST(req: NextRequest) {
//   try {
//     const { userId, attemptId, answers } = await req.json();
//     if (!userId || !attemptId || !answers)
//       return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });

//     const validAnswers = (answers as AnswerPayload[]).filter(a =>
//       a.questionCode?.startsWith("CPMI-")
//     );

//     const questionList = await prisma.question.findMany({
//       where: { code: { in: validAnswers.map(a => a.questionCode!) } },
//       select: { code: true, answerScores: true },
//     });

//     const scoreMap: Record<string, any[]> = {};
//     questionList.forEach(q => (scoreMap[q.code] = q.answerScores as any[]));

//     // Hapus jawaban lama
//     await prisma.answer.deleteMany({ where: { attemptId } });

//     let totalScore = 0;
//     for (const ans of validAnswers) {
//       const scores = scoreMap[ans.questionCode!];
//       const choiceNormalized = ans.choice.trim().toUpperCase();
//       const scoreObj = scores?.find(
//         s => s.options.trim()[0].toUpperCase() === choiceNormalized[0]
//       );
//       const score = scoreObj?.score || 0;
//       totalScore += score;

//       await prisma.answer.create({
//         data: {
//           attemptId,
//           userId,
//           questionCode: ans.questionCode!,
//           choice: ans.choice,
//           isCorrect: score > 0,
//         },
//       });
//     }

//     // Hitung kategori tiap aspek
//     const aspekScores = Object.entries(aspekQuestionsMap).map(([no, soalNums]) => {
//       const totalAspek = soalNums.reduce((sum, qNum) => {
//         const ans = validAnswers.find(a => a.questionCode === `CPMI-${qNum}`);
//         const scoreObj = scoreMap[ans?.questionCode!]?.find(
//           s => s.options.trim()[0].toUpperCase() === ans?.choice.trim()[0].toUpperCase()
//         );
//         return sum + (scoreObj?.score || 0);
//       }, 0);
//       return { no: Number(no), kategori: getKategoriAspek(totalAspek), total: totalAspek };
//     });

//     const iqResult = getIQResult(totalScore);

//     // update attempt
//     await prisma.testAttempt.update({
//       where: { id: attemptId },
//       data: { finishedAt: new Date(), isCompleted: true },
//     });

//     // Ambil user dan template summary sesuai scoreiq
//     const user = await prisma.user.findUnique({ where: { id: userId } });
//     const summaryTemplate = await prisma.summaryTemplate.findFirst({
//       where: {
//         testTypeId: 30,
//         minScore: { lte: iqResult.score! },
//         maxScore: { gte: iqResult.score! },
//       },
//     });

//     // Replace placeholder di template SEBELUM disimpan ke database
//     let kesimpulan = "Kesimpulan tidak tersedia";
//     if (summaryTemplate?.template) {
//       kesimpulan = replaceTemplatePlaceholders(
//   summaryTemplate.template,
//   user,
//   iqResult.score ?? 0 // fallback 0 jika null
// );

//     }

//     console.log('Original template:', summaryTemplate?.template);
//     console.log('Processed kesimpulan:', kesimpulan);
//     console.log('User fullName:', user?.fullName);
//     console.log('IQ Score:', iqResult.score);
//     console.log('PDF - Score IQ:', iqResult?.score);


//     // Cek apakah Result sudah ada
//     const existingResult = await prisma.result.findUnique({
//       where: { attemptId_testTypeId: { attemptId, testTypeId: 30 } },
//     });

//     if (existingResult) {
//       // Update Result lama
//       await prisma.result.update({
//         where: { id: existingResult.id },
//         data: {
//           jumlahbenar: totalScore,
//           scoreiq: iqResult.score,
//           kategoriiq: iqResult.kategori,
//           keteranganiqCPMI: iqResult.status,
//           aspekSTK: aspekScores,
//           summaryTemplateId: summaryTemplate?.id,
//           // Tidak perlu simpan kesimpulan ke database karena akan di-replace lagi di API attempts
//         },
//       });
//     } else {
//       // Buat Result baru
//       await prisma.result.create({
//         data: {
//           userId,
//           attemptId,
//           testTypeId: 30,
//           jumlahbenar: totalScore,
//           scoreiq: iqResult.score,
//           kategoriiq: iqResult.kategori,
//           keteranganiqCPMI: iqResult.status,
//           aspekSTK: aspekScores,
//           summaryTemplateId: summaryTemplate?.id,
//           // Tidak perlu simpan kesimpulan ke database karena akan di-replace lagi di API attempts
//         },
//       });
//     }

//     return NextResponse.json({
//       success: true,
//       totalScore,
//       hasil: iqResult,
//       aspek: aspekScores,
//       kesimpulan, // Return kesimpulan yang sudah di-replace untuk response
//     });
//   } catch (err: any) {
//     console.error('Error in CPMI submit:', err);
//     return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
//   }
// }


// // app/api/cpmi/submit/route.ts
// app/api/cpmi/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Mapping RS → IQ
const rsToIq: Record<number, number> = {
  0: 59, 1: 59, 2: 61, 3: 64, 4: 67, 5: 69, 6: 71, 7: 73, 8: 75, 9: 78,
  10: 80, 11: 81, 12: 83, 13: 86, 14: 88, 15: 90, 16: 93, 17: 95, 18: 97,
  19: 98, 20: 100, 21: 102, 22: 104, 23: 106, 24: 108, 25: 111, 26: 113,
  27: 114, 28: 116, 29: 118, 30: 120, 31: 121, 32: 123, 33: 125, 34: 126,
  35: 128, 36: 130, 37: 132, 38: 134, 39: 136, 40: 138, 41: 140, 42: 142,
  43: 143, 44: 146, 45: 146, 46: 146, 47: 146, 48: 146, 49: 146, 50: 146,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { attemptId, answers } = body as {
      attemptId: number;
      answers: { questionId: number; choice: string }[];
    };

    if (!attemptId || !answers?.length) {
      return NextResponse.json(
        { error: "attemptId dan answers wajib diisi" },
        { status: 400 }
      );
    }

    // Ambil userId & testTypeId dari TestAttempt
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      select: { userId: true, testTypeId: true },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt tidak ditemukan" }, { status: 404 });
    }

    const userId = attempt.userId;

    // Ambil soal terkait attempt
    const questionIds = answers.map(a => a.questionId);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, code: true, answer: true },
    });

    // Hitung jumlah jawaban benar
   let jumlahBenar = 0;

const answerData = answers.map(a => {
  const question = questions.find(q => q.id === a.questionId);
  const normalizedChoice = String(a.choice).trim();

  let isCorrect: boolean | null = null;
  if (question?.answer) {
    if (Array.isArray(question.answer)) {
      // essay case-insensitive
      const arr = question.answer
        .filter(ans => ans != null)
        .map(ans => String(ans).trim().toLowerCase());
      isCorrect = arr.includes(normalizedChoice.toLowerCase());
    } else {
      // single/mc
      isCorrect = normalizedChoice.toLowerCase() === String(question.answer).trim().toLowerCase();
    }
  }

  if (isCorrect) jumlahBenar += 1;

  return {
    userId,
    attemptId,
    questionCode: question?.code ?? null,
    choice: normalizedChoice, // tetap simpan apa yang diketik user
    isCorrect,
  };
});


    // Simpan jawaban
    await Promise.all(
      answerData.map(a =>
        prisma.answer.upsert({
          where: { attemptId_questionCode: { attemptId, questionCode: a.questionCode! } },
          update: { choice: a.choice, isCorrect: a.isCorrect },
          create: { ...a },
        })
      )
    );

    const now = new Date();

    // Cari IQ dari jumlahBenar
    const scoreIq = rsToIq[jumlahBenar] ?? 59; // default 59 kalau RS > 50

    // Update Result & TestAttempt
    await prisma.result.upsert({
      where: {
        attemptId_testTypeId: {
          attemptId,
          testTypeId: attempt.testTypeId,
        },
      },
      update: {
        jumlahbenar: jumlahBenar,
        scoreiq: scoreIq,
        isCompleted: true,
      },
      create: {
        userId,
        attemptId,
        testTypeId: attempt.testTypeId,
        jumlahbenar: jumlahBenar,
        scoreiq: scoreIq,
        isCompleted: true,
      },
    });

    await prisma.testAttempt.update({
      where: { id: attemptId },
      data: { isCompleted: true, finishedAt: now },
    });
    // Cari token yang terkait attempt
const token = await prisma.token.findFirst({
  where: {
    testTypeId: attempt.testTypeId,
    testAttempt: { id: attemptId }, // pastikan di schema token ada kolom FK testAttemptId
  },
});

if (token) {
  await prisma.token.update({
    where: { id: token.id },
    data: {
      used: true,
      usedAt: new Date(),
    },
  });
}



    return NextResponse.json({ message: "Jawaban berhasil disimpan", jumlahBenar, scoreIq });
  } catch (err) {
    console.error("Gagal submit CPMI:", err);
    return NextResponse.json({ error: "Gagal submit CPMI" }, { status: 500 });
  }
}

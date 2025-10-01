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

function getKeteranganIq(score: number) {
  if (score <= 65) return "Mentally Defective";
  if (score <= 79) return "Borderline Defective";
  if (score <= 90) return "Low Average";
  if (score <= 110) return "Average";
  if (score <= 119) return "High Average";
  if (score <= 127) return "Superior";
  if (score <= 139) return "Very Superior";
  return "Genius";
}

// Mapping aspek → nomor soal CPMI
//const aspekQuestionsMap: Record<number, number[]> = {
const aspekQuestionsMap: Record<string, number[]> = {

  // 1: [16, 23, 29,50],
  // 2: [6, 10, 19, 34, 41, 43, 45],
  // 3: [15, 18, 24, 27, 30, 32, 33, 37, 38, 39, 40, 46, 48, 53],
  // 4: [5, 8, 9, 12, 13, 14, 17, 20, 21, 22, 25, 26, 28, 31, 35, 36, 42, 44, 47, 49, 52],

  A: [16, 23, 29,50], 
  // (16+325, 23+325, 29+325, 50+325) [341, 348, 354, 375]

  B: [6, 10, 19, 34, 41, 43, 45], 
  // (6,10,19,34,41,43,45) 331, 335, 344, 359, 366, 368, 370

  C: [15, 18, 24, 27, 30, 32, 33, 37, 38, 39, 40, 46, 48, 53], 
  // (15,18,24,27,30,32,33,37,38,39,40,46,48,53)340, 343, 349, 352, 355, 357, 358, 362, 363, 364, 365, 371, 373, 378

  D: [5, 8, 9, 12, 13, 14, 17, 20, 21, 22, 25, 26, 28, 31, 35, 36, 42, 44, 47, 49, 52], 
  // (5,8,9,12,13,14,17,20,21,22,25,26,28,31,35,36,42,44,47,49,52)330, 333, 334, 337, 338, 339, 342, 345, 346, 347, 350, 351, 353, 356, 360, 361, 367, 369, 372, 374, 377
};

//const kategoriAspekMap: Record<number, { R: number[]; K: number[]; C: number[]; B: number[]; T: number[] }> = {
const kategoriAspekMap: Record<string, { R: number[]; K: number[]; C: number[]; B: number[]; T: number[] }> = {

  A: { R: [0], K: [1], C: [2], B: [3], T: [4] },       // Logika Berpikir
  B: { R: [0, 1], K: [2], C: [3, 4], B: [5, 6], T: [7] }, // Daya Analisis
  C: { R: [0, 1, 2], K: [3, 4], C: [5, 6, 7], B: [8, 9, 10], T: [11, 12, 13] }, // Numerikal
  D: { R: [0, 1, 2, 3], K: [4, 5, 6], C: [7, 8, 9, 10], B: [11, 12, 13, 14, 15], T: [16, 17, 18, 19, 20] }, // Verbal
};

// // Hitung kategori tiap aspek
// function getKategoriAspek(aspekNo: number, total: number) {
//   const map = kategoriAspekMap[aspekNo];
//   if (!map) return "-";

//   if (map.R.includes(total)) return "R";
//   if (map.K.includes(total)) return "K";
//   if (map.C.includes(total)) return "C";
//   if (map.B.includes(total)) return "B";
//   if (map.T.includes(total)) return "T";
//   return "-";
// }
// Hitung kategori tiap aspek
function getKategoriAspek(aspekKey: string, total: number) {
  const map = kategoriAspekMap[aspekKey];
  if (!map) return "-";

  if (map.R.includes(total)) return "R";
  if (map.K.includes(total)) return "K";
  if (map.C.includes(total)) return "C";
  if (map.B.includes(total)) return "B";
  if (map.T.includes(total)) return "T";
  return "-";
}

const aspekQuestionsMap2: Record<string, number[]> = {
  // 1: [15, 18, 24, 30, 32, 33],
  // 2: [12, 26, 31, 36, 44, 47],
  // 3 : [10, 19, 34, 40, 41, 45, 52],
    A: [15, 18, 24, 30, 32, 33], 
  // (15, 18, 24, 30, 32, 33)340, 343, 349, 355, 357, 358

  B: [12, 26, 31, 36, 44, 47], 
  // (12, 26, 31, 36, 44, 47)337, 351, 356, 361, 369, 372

  C: [10, 19, 34, 40, 41, 45, 52], 
  // (10, 19, 34, 40, 41, 45, 52)335, 344, 359, 365, 366, 370, 377
};

const kategoriAspekMap2: Record<string, { R: number[]; K: number[]; C: number[]; B: number[]; T: number[] }> = {
  A: { R: [0,1], K: [2], C: [3], B: [4,5], T: [6] },
  B: { R: [0,1], K: [2], C: [3], B: [4,5], T: [6] },
  C: { R: [0, 1], K: [2], C: [3, 4], B: [5, 6], T: [7] },
};

function getKategoriAspek2(aspekKey: string, total: number) {
  const map = kategoriAspekMap2[aspekKey];
  if (!map) return "-";

  if (map.R.includes(total)) return "R";
  if (map.K.includes(total)) return "K";
  if (map.C.includes(total)) return "C";
  if (map.B.includes(total)) return "B";
  if (map.T.includes(total)) return "T";
  return "-";
}

const aspekQuestionsMap3: Record<string, number[]> = {
//  1: [16, 23, 29,50],
//   2: [26, 44, 47],
//   3 : [5, 8, 12, 13, 22, 28, 31, 36, 42, 49],
//   4 : [9, 14, 17, 25, 35, 52],
  A: [16, 23, 29,50], 
  // (16, 23, 29, 50)341, 348, 354, 375

  B: [26, 44, 47], 
  // (26, 44, 47)351, 369, 372

  C: [5, 8, 12, 13, 22, 28, 31, 36, 42, 49], 
  // (5, 8, 12, 13, 22, 28, 31, 36, 42, 49)330, 333, 337, 338, 347, 353, 356, 361, 367, 374

  D: [9, 14, 17, 25, 35, 52], 
  // (9, 14, 17, 25, 35, 52)334, 339, 342, 350, 360, 377
};

const kategoriAspekMap3: Record<string, { R: number[]; K: number[]; C: number[]; B: number[]; T: number[] }> = {
  A: { R: [0], K: [1], C: [2], B: [3], T: [4] },  
  B: { R: [0], K: [1], C: [2], B: [], T: [3] },
  C: { R: [0, 1,2], K: [3,4], C: [5,6], B: [7,8], T: [9,10] },
  D: { R: [0,1], K: [2], C: [3], B: [4,5], T: [6] },
};

function getKategoriAspek3(aspekKey: string, total: number) {
  const map = kategoriAspekMap3[aspekKey];
  if (!map) return "-";

  if (map.R.includes(total)) return "R";
  if (map.K.includes(total)) return "K";
  if (map.C.includes(total)) return "C";
  if (map.B.includes(total)) return "B";
  if (map.T.includes(total)) return "T";
  return "-";
}

const aspekQuestionsMap4: Record<string, number[]> = {
//  1: [10, 19, 34, 40, 41, 45, 52],
//   2: [24, 27, 30, 32, 33, 37, 38, 39, 46, 48, 53],
  A: [10, 19, 34, 40, 41, 45, 52], 
  // (10, 19, 34, 40, 41, 45, 52)335, 344, 359, 365, 366, 370, 377

  B: [24, 27, 30, 32, 33, 37, 38, 39, 46, 48, 53], 
  // (24, 27, 30, 32, 33, 37, 38, 39, 46, 48, 53)349, 352, 355, 357, 358, 362, 363, 364, 371, 373, 378

};

const kategoriAspekMap4: Record<string, { R: number[]; K: number[]; C: number[]; B: number[]; T: number[] }> = {
A: { R: [0, 1], K: [2], C: [3, 4], B: [5, 6], T: [7] },
B: { R: [0,1,2], K: [3,4], C: [5,6], B: [7,8,9], T: [10,11] },
};

function getKategoriAspek4(aspekKey: string, total: number) {
  const map = kategoriAspekMap4[aspekKey];
  if (!map) return "-";

  if (map.R.includes(total)) return "R";
  if (map.K.includes(total)) return "K";
  if (map.C.includes(total)) return "C";
  if (map.B.includes(total)) return "B";
  if (map.T.includes(total)) return "T";
  return "-";
}
function getDominantKategori(aspekResults: { aspek: string; total: number; kategori: string }[]) {
  const countMap: Record<string, number> = {};

  aspekResults.forEach(r => {
    if (!countMap[r.kategori]) countMap[r.kategori] = 0;
    countMap[r.kategori]++;
  });

  // Cari kategori dengan jumlah terbanyak
  let dominant = "-";
  let max = -1;
  for (const [kategori, count] of Object.entries(countMap)) {
    if (count > max) {
      dominant = kategori;
      max = count;
    }
  }

  return dominant;
}


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
      select: { userId: true, testTypeId: true,  isCompleted: true,
    status: true },
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
          const arr = question.answer
            .filter(ans => ans != null)
            .map(ans => String(ans).trim().toLowerCase());
          isCorrect = arr.includes(normalizedChoice.toLowerCase());
        } else {
          isCorrect = normalizedChoice.toLowerCase() === String(question.answer).trim().toLowerCase();
        }
      }

      if (isCorrect) jumlahBenar += 1;

      return {
        userId,
        attemptId,
        questionCode: question?.code ?? null,
        choice: normalizedChoice,
        isCorrect,
      };
    });

    // Hitung skor tiap aspek
  const aspekScores = Object.entries(aspekQuestionsMap).map(([key, soalNums]) => {
  const totalAspek = soalNums.reduce((sum, qNum) => {
    const ans = answers.find(a => a.questionId === qNum);
    const question = questions.find(q => q.id === qNum);
    if (!ans || !question?.answer) return sum;

    let score = 0;
    if (Array.isArray(question.answer)) {
      const arr = question.answer
        .filter(a => a != null)
        .map(a => String(a).trim().toLowerCase());
      if (arr.includes(String(ans.choice).trim().toLowerCase())) score = 1;
    } else {
      if (
        String(ans.choice).trim().toLowerCase() ===
        String(question.answer).trim().toLowerCase()
      )
        score = 1;
    }

    return sum + score;
  }, 0);

  return {
    aspek: key, // sekarang string, misal "A", "B", "C"
    total: totalAspek,
    kategori: getKategoriAspek(key, totalAspek), // fungsi versi string
  };
});

// const aspekScores2 = Object.entries(aspekQuestionsMap2).map(([no, soalNums]) => {
//   const totalAspek = soalNums.reduce((sum, qNum) => {
//     const ans = answers.find(a => a.questionId === qNum);
//     const question = questions.find(q => q.id === qNum);
//     if (!ans || !question?.answer) return sum;

//     let score = 0;
//     if (Array.isArray(question.answer)) {
//       const arr = question.answer.filter(a => a != null).map(a => String(a).trim().toLowerCase());
//       if (arr.includes(String(ans.choice).trim().toLowerCase())) score = 1;
//     } else {
//       if (String(ans.choice).trim().toLowerCase() === String(question.answer).trim().toLowerCase())
//         score = 1;
//     }

//     return sum + score;
//   }, 0);

//   return {
//     no: Number(no),
//     total: totalAspek,
//     kategori: getKategoriAspek2(Number(no), totalAspek),
//   };
// });
const aspekScores2 = Object.entries(aspekQuestionsMap2).map(([key, soalNums]) => {
  const totalAspek = soalNums.reduce((sum, qNum) => {
    const ans = answers.find(a => a.questionId === qNum);
    const question = questions.find(q => q.id === qNum);
    if (!ans || !question?.answer) return sum;

    let score = 0;
    if (Array.isArray(question.answer)) {
      const arr = question.answer
        .filter(a => a != null)
        .map(a => String(a).trim().toLowerCase());
      if (arr.includes(String(ans.choice).trim().toLowerCase())) score = 1;
    } else {
      if (
        String(ans.choice).trim().toLowerCase() ===
        String(question.answer).trim().toLowerCase()
      )
        score = 1;
    }

    return sum + score;
  }, 0);

  return {
    aspek: key, // "1", "2", "3" -> nanti bisa dipetakan ke "A", "B", "C"
    total: totalAspek,
    kategori: getKategoriAspek2(key, totalAspek), // fungsi versi string
  };
});

// Versi 3
const aspekScores3 = Object.entries(aspekQuestionsMap3).map(([key, soalNums]) => {
  const totalAspek = soalNums.reduce((sum, qNum) => {
    const ans = answers.find(a => a.questionId === qNum);
    const question = questions.find(q => q.id === qNum);
    if (!ans || !question?.answer) return sum;

    let score = 0;
    if (Array.isArray(question.answer)) {
      const arr = question.answer
        .filter(a => a != null)
        .map(a => String(a).trim().toLowerCase());
      if (arr.includes(String(ans.choice).trim().toLowerCase())) score = 1;
    } else {
      if (
        String(ans.choice).trim().toLowerCase() ===
        String(question.answer).trim().toLowerCase()
      )
        score = 1;
    }

    return sum + score;
  }, 0);

  return {
    aspek: key, // "1", "2", "3", "4"
    total: totalAspek,
    kategori: getKategoriAspek3(key, totalAspek), // fungsi harus terima string key
  };
});


// Versi 4
const aspekScores4 = Object.entries(aspekQuestionsMap4).map(([key, soalNums]) => {
  const totalAspek = soalNums.reduce((sum, qNum) => {
    const ans = answers.find(a => a.questionId === qNum);
    const question = questions.find(q => q.id === qNum);
    if (!ans || !question?.answer) return sum;

    let score = 0;
    if (Array.isArray(question.answer)) {
      const arr = question.answer
        .filter(a => a != null)
        .map(a => String(a).trim().toLowerCase());
      if (arr.includes(String(ans.choice).trim().toLowerCase())) score = 1;
    } else {
      if (
        String(ans.choice).trim().toLowerCase() ===
        String(question.answer).trim().toLowerCase()
      ) {
        score = 1;
      }
    }

    return sum + score;
  }, 0);

  return {
    aspek: key, // langsung pakai key dari aspekQuestionsMap4 ("A", "B", ...)
    total: totalAspek,
    kategori: getKategoriAspek4(key, totalAspek), // fungsi versi string
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
    const scoreIq = rsToIq[jumlahBenar] ?? 59;
    const keteranganiqCPMI = getKeteranganIq(scoreIq);

    // Ambil template summary sesuai scoreIq
    const template = await prisma.summaryTemplate.findFirst({
      where: {
        testTypeId: attempt.testTypeId,
        minScore: { lte: scoreIq },
        maxScore: { gte: scoreIq },
      },
    });

    let kesimpulan = "";
    let summaryTemplateId: number | null = null;

    if (template) {
      summaryTemplateId = template.id;
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { fullName: true } });
      kesimpulan = template.template
        .replace("{name}", user?.fullName || "Peserta")
        .replace("{scoreiq}", scoreIq.toString())
        .replace("{keteranganiqCPMI}", keteranganiqCPMI);
    }
// Hitung dominan per tabel
const dominantAspek2 = getDominantKategori(aspekScores2);
const dominantAspek3 = getDominantKategori(aspekScores3);
const dominantAspek4 = getDominantKategori(aspekScores4);

// Misal mau masukin ke kesimpulan


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
        keteranganiqCPMI,
        kesimpulan,
        summaryTemplateId,
        isCompleted: true,
        aspek1: aspekScores,
        aspek2: aspekScores2,
        aspek3: aspekScores3,
        aspek4: aspekScores4,
      },
      create: {
        userId,
        attemptId,
        testTypeId: attempt.testTypeId,
        jumlahbenar: jumlahBenar,
        scoreiq: scoreIq,
        keteranganiqCPMI,
        kesimpulan,
        summaryTemplateId,
        isCompleted: true,
        aspek1: aspekScores,
        aspek2: aspekScores2,
        aspek3: aspekScores3,
        aspek4: aspekScores4,
      },
    });
let status: string;

const result = await prisma.result.findUnique({
  where: {
    attemptId_testTypeId: {
      attemptId,
      testTypeId: attempt.testTypeId
    }
  }
});

const personalityResult = await prisma.personalityResult.findUnique({
  where: { attemptId }
});

if (personalityResult) {
  status = personalityResult.validated ? "Selesai" : "Sedang diverifikasi psikolog";
} else if (result) {
  status = result.validated ? "Selesai" : "Sedang diverifikasi psikolog";
} else {
  status = attempt.isCompleted ? "Sedang diverifikasi psikolog" : "Belum selesai";
}


    await prisma.testAttempt.update({
      where: { id: attemptId },
      data: { isCompleted: true, finishedAt: now, status },
    });

    // Cari token yang terkait attempt
    const token = await prisma.token.findFirst({
      where: {
        testTypeId: attempt.testTypeId,
        testAttempt: { id: attemptId },
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

    return NextResponse.json({ 
  message: "Jawaban berhasil disimpan", 
  jumlahBenar, 
  scoreIq, 
  aspek1: aspekScores,
  aspek2: aspekScores2,
  aspek3: aspekScores3,
  aspek4: aspekScores4
});

  } catch (err) {
    console.error("Gagal submit CPMI:", err);
    return NextResponse.json({ error: "Gagal submit CPMI" }, { status: 500 });
  }
}

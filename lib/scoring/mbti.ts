import { MBTIQuestions } from '@/prisma/data/MBTI/question'; // Pastikan path dan nama variabel ini benar

// Tipe untuk jawaban pengguna (kita gunakan question.code agar lebih robust)
export type UserAnswers = {
  [questionCode: string]: 'a' | 'b';
};

// Tipe untuk data soal yang kita terima dari database
// Sesuaikan dengan data Anda, yang penting ada 'code' dan 'dimension'
interface Question {
  id: number; // atau code: string;
  dimension: string;
  // ...properti lainnya
}


// Fungsi untuk menghitung hasil MBTI dengan bobot berbeda
export function calculateMBTIResult(
  questions: Question[],
  answers: UserAnswers
) {
  // 1. Inisialisasi skor
  const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

  // 2. Iterasi melalui jawaban user
  for (const questionId in answers) {
    const userAnswer = answers[questionId];
    
    // 3. Cari pertanyaan yang sesuai
    const question = questions.find(q => q.id === parseInt(questionId));

    if (question) {
      // 4. Tambahkan skor berdasarkan dimensi DENGAN BOBOT
      const dimension = question.dimension;
      const [traitA, traitB] = dimension.split('') as (keyof typeof scores)[];

      // Tentukan bobot skor berdasarkan dimensi
      let scoreWeight = 0;
      if (dimension === 'EI') {
        scoreWeight = 10; // Bobot 10 untuk soal EI
      } else {
        scoreWeight = 5;  // Bobot 5 untuk dimensi lainnya (SN, TF, JP)
      }

      // Tambahkan skor yang sudah dikalikan dengan bobot
      if (userAnswer === 'a') {
        scores[traitA] += scoreWeight;
      } else if (userAnswer === 'b') {
        scores[traitB] += scoreWeight;
      }
    }
  }

  // 5. Tentukan tipe kepribadian (logika tetap sama)
  let resultType = "";
  resultType += scores.E >= scores.I ? 'E' : 'I';
  resultType += scores.S >= scores.N ? 'S' : 'N';
  resultType += scores.T >= scores.F ? 'T' : 'F';
  resultType += scores.J >= scores.P ? 'J' : 'P';
  
  // 6. Hitung total skor maksimum per dimensi untuk persentase
  const maxScores = { EI: 0, SN: 0, TF: 0, JP: 0 };
  questions.forEach(q => {
    if (q.dimension === 'EI') {
      maxScores.EI += 10;
    } else if (q.dimension === 'SN') {
      maxScores.SN += 5;
    } else if (q.dimension === 'TF') {
      maxScores.TF += 5;
    } else if (q.dimension === 'JP') {
      maxScores.JP += 5;
    }
  });

  // 7. Hitung persentase berdasarkan skor berbobot
  const percentages = {
    E: maxScores.EI > 0 ? (scores.E / maxScores.EI) * 100 : 0,
    I: maxScores.EI > 0 ? (scores.I / maxScores.EI) * 100 : 0,
    S: maxScores.SN > 0 ? (scores.S / maxScores.SN) * 100 : 0,
    N: maxScores.SN > 0 ? (scores.N / maxScores.SN) * 100 : 0,
    T: maxScores.TF > 0 ? (scores.T / maxScores.TF) * 100 : 0,
    F: maxScores.TF > 0 ? (scores.F / maxScores.TF) * 100 : 0,
    J: maxScores.JP > 0 ? (scores.J / maxScores.JP) * 100 : 0,
    P: maxScores.JP > 0 ? (scores.P / maxScores.JP) * 100 : 0,
  };

  return {
    type: resultType,
    scores: scores,
    percentages: percentages,
  };
}
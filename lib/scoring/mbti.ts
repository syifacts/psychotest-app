// calculator.ts

import { MBTIQuestions } from '@/prisma/data/MBTI/question';

// Tipe untuk menampung jawaban user, format: { questionId: 'a' | 'b' }
export type UserAnswers = {
  [questionId: number]: 'a' | 'b';
};

// Fungsi untuk menghitung hasil MBTI
export function calculateMBTIResult(answers: UserAnswers) {
  // 1. Inisialisasi skor
  const scores = {
    E: 0, I: 0,
    S: 0, N: 0,
    T: 0, F: 0,
    J: 0, P: 0,
  };

  // 2. Iterasi melalui jawaban user
  for (const questionId in answers) {
    const userAnswer = answers[questionId];
    
    // 3. Cari pertanyaan yang sesuai
    const question = MBTIQuestions.find(q => q.id === parseInt(questionId));

    if (question) {
      // 4. Tambahkan skor berdasarkan dimensi
      const dimension = question.dimension; // e.g., 'EI'
      const firstTrait = dimension[0];   // e.g., 'E'
      const secondTrait = dimension[1];  // e.g., 'I'

      if (userAnswer === 'a') {
        scores[firstTrait]++; // Jika jawaban 'a', tambah skor untuk kutub pertama (E, S, T, J)
      } else if (userAnswer === 'b') {
        scores[secondTrait]++; // Jika jawaban 'b', tambah skor untuk kutub kedua (I, N, F, P)
      }
    }
  }

  // 5. Tentukan tipe kepribadian
  let resultType = "";
  resultType += scores.E > scores.I ? 'E' : 'I';
  resultType += scores.S > scores.N ? 'S' : 'N';
  resultType += scores.T > scores.F ? 'T' : 'F';
  resultType += scores.J > scores.P ? 'J' : 'P';
  // Catatan: Anda perlu menambahkan logika jika skornya sama (misal, E=5, I=5)

  // Menghitung persentase seperti permintaan Anda (misal: 10% per soal)
  // Ini lebih merupakan visualisasi daripada bagian dari penentuan tipe
  const totalQuestionsPerDimension = {
      EI: MBTIQuestions.filter(q => q.dimension === 'EI').length,
      SN: MBTIQuestions.filter(q => q.dimension === 'SN').length,
      TF: MBTIQuestions.filter(q => q.dimension === 'TF').length,
      JP: MBTIQuestions.filter(q => q.dimension === 'JP').length,
  };
  
  const percentages = {
      E: (scores.E / totalQuestionsPerDimension.EI) * 100,
      I: (scores.I / totalQuestionsPerDimension.EI) * 100,
      S: (scores.S / totalQuestionsPerDimension.SN) * 100,
      N: (scores.N / totalQuestionsPerDimension.SN) * 100,
      T: (scores.T / totalQuestionsPerDimension.TF) * 100,
      F: (scores.F / totalQuestionsPerDimension.TF) * 100,
      // Lakukan hal yang sama untuk J dan P jika ada soalnya
  }

  return {
    type: resultType,
    scores: scores,
    percentages: percentages
  };
}


// CONTOH PENGGUNAAN:
// Anggap saja pengguna menjawab 2 soal pertama dari gambar
const userAnswers: UserAnswers = {
  1: 'a', // Memilih 'a' untuk soal 1 (E)
  2: 'b', // Memilih 'b' untuk soal 2 (N)
  4: 'a', // Memilih 'a' untuk soal 4 (T)
  // ...dan seterusnya
};

const result = calculateMBTIResult(userAnswers);
console.log(result);

/*
Contoh output console:
{
  type: 'ENTJ', // Tipe ini akan berubah tergantung semua jawaban
  scores: { E: 1, I: 0, S: 0, N: 1, T: 1, F: 0, J: 0, P: 0 },
  percentages: {
    E: 100, // Karena hanya ada 1 soal EI dan dijawab E
    I: 0,
    S: 0, 
    N: 50,  // Karena ada 2 soal SN dan 1 dijawab N
    T: 100, // Karena ada 1 soal TF dan dijawab T
    F: 0
  }
}
*/
// src/app/api/mbti/submit/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const answers: { [questionCode: string]: 'a' | 'b' } = await request.json();

    // Hitung skor
    const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    
    for (const code in answers) {
      const userAnswer = answers[code];
      const dimension = code.split('-')[1]; // 'MBTI-EI-1' -> 'EI'
      const [traitA, traitB] = dimension.split(''); // 'EI' -> ['E', 'I']

      if (userAnswer === 'a') {
        scores[traitA as keyof typeof scores]++;
      } else {
        scores[traitB as keyof typeof scores]++;
      }
    }

    // Tentukan tipe kepribadian
    let resultType = "";
    resultType += scores.E >= scores.I ? 'E' : 'I';
    resultType += scores.S >= scores.N ? 'S' : 'N';
    resultType += scores.T >= scores.F ? 'T' : 'F';
    resultType += scores.J >= scores.P ? 'J' : 'P';

    // Simpan hasil ke database (asumsikan user dengan id=1 sedang login)
    // Di aplikasi nyata, userId harus didapat dari sesi autentikasi.
    await prisma.mBTITestResult.create({ //blm ada dbny
      data: {
        userId: 1, // Ganti dengan ID user yang sebenarnya
        resultType: resultType,
        scores: scores,
      },
    });

    return NextResponse.json({ type: resultType, scores });

  } catch (error) {
    console.error("Gagal memproses hasil MBTI:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
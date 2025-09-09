// Lokasi: app/api/tes/mbti/questions/route.ts (atau yang serupa)

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const mBTIQuestions = await prisma.preferenceQuestion.findMany({
      // ======================================================
      // TAMBAHKAN FILTER 'WHERE' DI SINI
      // ======================================================
      where: {
        TestType: {
          name: "MBTI", // Hanya ambil soal yang jenis tesnya MBTI
        },
      },
      // ======================================================
      orderBy: {
        id: 'asc', // Urutkan soal MBTI yang sudah difilter
      },
      select: {
        id: true,
        code: true,
        content: true,
        options: true,
        dimension: true,
      },
    });

    return NextResponse.json(mBTIQuestions);

  } catch (error) {
    console.error("Gagal mengambil soal MBTI:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
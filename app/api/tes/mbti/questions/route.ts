import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Sesuaikan path ke file prisma client Anda

export async function GET() {
  try {
    const mBTIQuestions = await prisma.preferenceQuestion.findMany({ 
      orderBy: {
        code: 'asc', // Pastikan urutan soal konsisten
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
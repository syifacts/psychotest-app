import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = Number(params.id);
  if (!userId) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  try {
    // Ambil semua attempt user
    const attempts = await prisma.testAttempt.findMany({
      where: { userId },
      include: {
        TestType: true,   // nama jenis tes
        results: true,    // ambil hasil untuk cek validasi psikolog
      },
      orderBy: { startedAt: "desc" }, // terbaru paling atas
    });

    // Mapping attempt untuk frontend
    const mappedAttempts = attempts.map((a) => {
      // Jika user sudah submit hasil (ada result)
      const result = a.results?.[0]; // ambil result pertama
      let status = "";

      if (result) {
        status = result.validated ? "Selesai" : "Sedang diverifikasi psikolog";
      } else {
        status = a.isCompleted ? "Belum divalidasi" : "Belum selesai";
      }

      return {
        id: a.id,
        testType: { name: a.TestType.name },
        completedAt: a.finishedAt || a.startedAt,
        status,
      };
    });

    return NextResponse.json({ attempts: mappedAttempts });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch attempts." }, { status: 500 });
  }
}

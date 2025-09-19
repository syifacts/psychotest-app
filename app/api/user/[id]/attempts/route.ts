import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const segments = pathname.split("/"); // ['', 'api', 'user', '2', 'attempts']
  const userId = Number(segments[3]);

  if (!userId) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  try {
    const attempts = await prisma.testAttempt.findMany({
      where: { userId },
      include: { TestType: true, results: true,  personalityResults: true 
 },
      orderBy: { startedAt: "desc" },
    });

    const mappedAttempts = attempts.map((a) => {
      const result = a.results?.[0];
       const personalityResult = a.personalityResults?.[0];
     
      // --- Tentukan status ---
      let status: string;
      if (personalityResult) {
        status = personalityResult.validated
          ? "Selesai"
          : "Sedang diverifikasi psikolog";
      } else if (result) {
        status = result.validated
          ? "Selesai"
          : "Sedang diverifikasi psikolog";
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

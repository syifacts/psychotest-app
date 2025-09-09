import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, attemptId, answers } = body as {
      userId: number;
      attemptId: number;
      answers: { preferenceQuestionCode: string; choice: string }[];
    };

    if (!userId || !attemptId || !answers?.length) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // Upsert jawaban
    await Promise.all(
      answers.map(async (ans) => {
        await prisma.answer.upsert({
          where: {
            attemptId_preferenceQuestionCode: {
              attemptId: Number(attemptId),
              preferenceQuestionCode: ans.preferenceQuestionCode,
            },
          },
          update: { choice: ans.choice },
          create: {
            userId: Number(userId),
            attemptId: Number(attemptId),
            preferenceQuestionCode: ans.preferenceQuestionCode,
            choice: ans.choice,
          },
        });
      })
    );

    return NextResponse.json({ message: "Jawaban berhasil disimpan" });
  } catch (err) {
    console.error("❌ Error submit MBTI:", err);
    return NextResponse.json({ error: "Gagal menyimpan jawaban" }, { status: 500 });
  }
}

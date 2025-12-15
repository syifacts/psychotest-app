import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { attemptId } = await req.json();

    if (!attemptId) {
      return NextResponse.json({ error: "attemptId wajib dikirim" }, { status: 400 });
    }

    // 1️⃣ Cek apakah attempt ada
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt tidak ditemukan" }, { status: 404 });
    }

    // 2️⃣ Update langsung attempt
    const updated = await prisma.testAttempt.update({
      where: { id: attemptId },
      data: {
        isCompleted: true,
        finishedAt: new Date(),
        status: "FINISHED",
      },
    });

    // 3️⃣ Update result juga (biar sinkron)
    await prisma.result.upsert({
      where: {
        attemptId_testTypeId: {
          attemptId: attempt.id,
          testTypeId: attempt.testTypeId,
        },
      },
      update: { isCompleted: true },
      create: {
        userId: attempt.userId,
        attemptId: attempt.id,
        testTypeId: attempt.testTypeId,
        isCompleted: true,
      },
    });

    return NextResponse.json({ success: true, updated });
  } catch (err) {
    console.error("❌ Error submit-finish:", err);
    return NextResponse.json({ error: "Gagal menyelesaikan attempt" }, { status: 500 });
  }
}

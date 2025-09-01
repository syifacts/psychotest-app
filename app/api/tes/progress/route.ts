import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = Number(url.searchParams.get("userId"));
    const type = url.searchParams.get("type");

    if (!userId || !type) {
      return NextResponse.json(
        { error: "userId dan type wajib diisi" },
        { status: 400 }
      );
    }

    // 1️⃣ Ambil testType
    const testType = await prisma.testType.findUnique({
      where: { name: type },
    });
    if (!testType) {
      return NextResponse.json(
        { error: "Test type tidak ditemukan" },
        { status: 400 }
      );
    }

    // 2️⃣ Ambil semua subtest tipe tes ini (dengan duration)
    const allSubtests = await prisma.subTest.findMany({
      where: { testTypeId: testType.id },
      orderBy: { id: "asc" },
    });

    // 3️⃣ Ambil semua result user untuk tipe tes ini
    const userResults = await prisma.subtestResult.findMany({
      where: { userId, testTypeId: testType.id },
    });

    // 4️⃣ Tentukan subtest berikutnya (pakai id, bukan name)
    let nextSubtest: { id: number; name: string } | null = null;
    for (const sub of allSubtests) {
      if (!userResults.some((r) => r.subTestId === sub.id)) {
        nextSubtest = { id: sub.id, name: sub.name };
        break;
      }
    }

    // 5️⃣ Jika semua subtest sudah selesai
    let isCompleted = nextSubtest === null;

    // 6️⃣ Ambil UserProgress untuk subtest berikutnya
    let userProgress = null;
    let durationMinutes = 0;
    if (nextSubtest) {
      userProgress = await prisma.userProgress.findUnique({
        where: {
          userId_subtest: {
            userId,
            subtest: nextSubtest.name,
          },
        },
      });

      // Ambil duration subtest dari DB
      const subtestData = allSubtests.find((s) => s.id === nextSubtest.id);
      durationMinutes = subtestData?.duration || 30;

      // Cek apakah waktu habis
      if (userProgress) {
        const endTime = new Date(userProgress.startTime);
        endTime.setMinutes(endTime.getMinutes() + durationMinutes);

        if (new Date() >= endTime) {
          await prisma.userProgress.update({
            where: { userId_subtest: { userId, subtest: nextSubtest.name } },
            data: { isCompleted: true },
          });
          isCompleted = true;
        }
      }
    }

    // 7️⃣ Tentukan question terakhir yang belum dijawab di subtest
    let nextQuestionIndex = 0;
    if (!isCompleted && nextSubtest) {
      const answered = await prisma.answer.findMany({
        where: {
          userId,
          Question: { subTestId: nextSubtest.id },
        },
        orderBy: { questionId: "asc" },
        select: { questionId: true },
      });

      nextQuestionIndex = answered.length;

      const totalQuestions = await prisma.question.count({
        where: { subTestId: nextSubtest.id },
      });

      if (nextQuestionIndex >= totalQuestions && userProgress) {
        await prisma.userProgress.update({
          where: { userId_subtest: { userId, subtest: nextSubtest.name } },
          data: { isCompleted: true },
        });
        isCompleted = true;
      }
    }

    return NextResponse.json({
      nextSubtest: nextSubtest?.name || null,
      nextQuestionIndex,
      startTime: userProgress?.startTime || null,
      durationMinutes,
      isCompleted,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Gagal ambil progress" },
      { status: 500 }
    );
  }
}

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

    // 4️⃣ Tentukan subtest berikutnya
    let nextSubtest: { id: number; name: string } | null = null;
    for (const sub of allSubtests) {
      if (!userResults.some((r) => r.subTestId === sub.id)) {
        nextSubtest = { id: sub.id, name: sub.name };
        break;
      }
    }

    let isCompleted = nextSubtest === null;

    // 5️⃣ Ambil atau buat UserProgress
    let userProgress = null;
    let durationMinutes = 0;

    if (nextSubtest) {
      durationMinutes = allSubtests.find((s) => s.id === nextSubtest.id)?.duration || 30;

      userProgress = await prisma.userProgress.upsert({
        where: { userId_subtest: { userId, subtest: nextSubtest.name } },
        update: {},
        create: {
          userId,
          subtest: nextSubtest.name,
          startTime: new Date(),
        },
      });

      // cek waktu habis
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

    // 6️⃣ Tentukan soal berikutnya
    let nextQuestionCode: string | null = null;
    if (!isCompleted && nextSubtest) {
      const questions = await prisma.question.findMany({
        where: { subTestId: nextSubtest.id },
        orderBy: { id: "asc" },
        select: { code: true },
      });

      const answered = await prisma.answer.findMany({
        where: {
          userId,
          questionCode: { in: questions.map((q) => q.code) },
        },
        select: { questionCode: true },
      });

      const answeredSet = new Set(answered.map((a) => a.questionCode));
      const nextQ = questions.find((q) => !answeredSet.has(q.code));

      if (nextQ) {
        nextQuestionCode = nextQ.code;
      } else {
        // semua soal selesai
        if (userProgress) {
          await prisma.userProgress.update({
            where: { userId_subtest: { userId, subtest: nextSubtest.name } },
            data: { isCompleted: true },
          });
        }
        isCompleted = true;
      }
    }

    // 7️⃣ Update Result jika semua subtest selesai
    if (isCompleted) {
      await prisma.result.upsert({
        where: { userId_testTypeId: { userId, testTypeId: testType.id } },
        update: { isCompleted: true },
        create: { userId, testTypeId: testType.id, isCompleted: true },
      });
    }

    return NextResponse.json({
      nextSubtest: nextSubtest?.name || null,
      nextQuestionCode,
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

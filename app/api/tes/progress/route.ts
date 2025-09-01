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

    // 2️⃣ Ambil attempt aktif user
    const attempt = await prisma.testAttempt.findFirst({
      where: { userId, testTypeId: testType.id, isCompleted: false },
      orderBy: { startedAt: "desc" },
    });
    if (!attempt) {
      return NextResponse.json(
        { error: "Belum ada attempt aktif" },
        { status: 404 }
      );
    }

    // 3️⃣ Ambil semua subtest
    const allSubtests = await prisma.subTest.findMany({
      where: { testTypeId: testType.id },
      orderBy: { id: "asc" },
    });

    // 4️⃣ Ambil hasil subtest user
    const userResults = await prisma.subtestResult.findMany({
      where: { attemptId: attempt.id },
    });

    // 5️⃣ Tentukan subtest berikutnya
    let nextSubtest: { id: number; name: string } | null = null;
    for (const sub of allSubtests) {
      if (!userResults.some((r) => r.subTestId === sub.id)) {
        nextSubtest = { id: sub.id, name: sub.name };
        break;
      }
    }

    let isCompleted = nextSubtest === null;

    // 6️⃣ Ambil progress user
    let userProgress = null;
    let durationMinutes = 0;

    if (nextSubtest) {
      durationMinutes =
        allSubtests.find((s) => s.id === nextSubtest.id)?.duration || 30;

      userProgress = await prisma.userProgress.upsert({
        where: { userId_subtest: { userId, subtest: nextSubtest.name } },
        update: {},
        create: {
          userId,
          subtest: nextSubtest.name,
          startTime: new Date(),
        },
      });

      // cek apakah waktunya sudah habis
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

    // 7️⃣ Tentukan soal berikutnya
    let nextQuestionCode: string | null = null;
    let nextQuestionIndex: number | null = null;

    if (!isCompleted && nextSubtest) {
      const questions = await prisma.question.findMany({
        where: { subTestId: nextSubtest.id },
        orderBy: { id: "asc" },
        select: { id: true, code: true },
      });

      const answered = await prisma.answer.findMany({
        where: {
          attemptId: attempt.id,
          questionCode: { in: questions.map((q) => q.code) },
        },
        select: { questionCode: true },
      });

      const answeredSet = new Set(answered.map((a) => a.questionCode));
      const nextQ = questions.find((q) => !answeredSet.has(q.code));

      if (nextQ) {
        nextQuestionCode = nextQ.code;
        nextQuestionIndex = questions.findIndex((q) => q.code === nextQ.code);
      } else {
        // semua soal selesai
        if (userProgress) {
          await prisma.userProgress.update({
            where: { userId_subtest: { userId, subtest: nextSubtest.name } },
            data: { isCompleted: true },
          });
        }
        isCompleted = true;

        // simpan SubtestResult
        await prisma.subtestResult.upsert({
          where: {
            attemptId_subTestId: {
              attemptId: attempt.id,
              subTestId: nextSubtest.id,
            },
          },
          update: { isCompleted: true },
          create: {
            attemptId: attempt.id,
            subTestId: nextSubtest.id,
            rw: 0,
            sw: 0,
            isCompleted: true,
          },
        });
      }
    }

    // 8️⃣ Update Result jika semua subtest selesai
    if (isCompleted) {
      await prisma.result.upsert({
        where: {
          attemptId_testTypeId: {
            attemptId: attempt.id,
            testTypeId: testType.id,
          },
        },
        update: { isCompleted: true },
        create: {
          userId,
          attemptId: attempt.id,
          testTypeId: testType.id,
          isCompleted: true,
        },
      });

      await prisma.testAttempt.update({
        where: { id: attempt.id },
        data: { isCompleted: true, finishedAt: new Date() },
      });
    }

    return NextResponse.json({
      nextSubtest: nextSubtest?.name || null,
      nextQuestionCode,
      nextQuestionIndex, // 🔥 tambahan
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

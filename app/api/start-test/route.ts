// app/api/start-test/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { attemptId, userId, testTypeId } = await req.json();

    if (!userId && !attemptId) {
      return NextResponse.json({ error: "attemptId atau userId wajib diisi" }, { status: 400 });
    }

    let attempt = null;

    if (attemptId) {
      attempt = await prisma.testAttempt.findUnique({
        where: { id: attemptId },
      });
      if (!attempt) {
        return NextResponse.json({ error: "Attempt tidak ditemukan" }, { status: 404 });
      }
    } else if (userId && testTypeId) {
      // Cek apakah user punya attempt RESERVED (untuk karyawan perusahaan)
      attempt = await prisma.testAttempt.findFirst({
        where: {
          userId,
          testTypeId,
          status: "RESERVED",
          finishedAt: null,
        },
        orderBy: { startedAt: "asc" },
      });
    }

    // Kalau ada attempt RESERVED → pakai itu
    if (attempt && attempt.status === "RESERVED") {
      const updatedAttempt = await prisma.testAttempt.update({
        where: { id: attempt.id },
        data: {
          status: "STARTED",
          startedAt: new Date(),
        },
      });

      return NextResponse.json({
        message: "Test dimulai",
        attempt: updatedAttempt,
      });
    }

    // Kalau tidak ada attempt RESERVED → buat baru (untuk user beli sendiri)
    if (userId && testTypeId) {
      const newAttempt = await prisma.testAttempt.create({
        data: {
          userId,
          testTypeId,
          status: "STARTED",
          startedAt: new Date(),
        },
      });

      return NextResponse.json({
        message: "Test dimulai",
        attempt: newAttempt,
      });
    }

    return NextResponse.json({ error: "Tidak bisa memulai test" }, { status: 400 });
  } catch (err) {
    console.error("❌ Error di start-test:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

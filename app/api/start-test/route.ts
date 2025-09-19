// app/api/start-test/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { attemptId } = body;

    if (!attemptId) {
      return NextResponse.json({ error: "attemptId wajib diisi" }, { status: 400 });
    }

    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt tidak ditemukan" }, { status: 404 });
    }

    if (attempt.status !== "RESERVED") {
      return NextResponse.json({ error: "Attempt sudah dimulai / kadaluarsa" }, { status: 400 });
    }

    await prisma.testAttempt.update({
      where: { id: attemptId },
      data: { status: "STARTED", startedAt: new Date() },
    });

    return NextResponse.json({ message: "Test dimulai" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

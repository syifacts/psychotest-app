import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// === POST: Simpan jawaban user ===
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, attemptId, answers } = body as {
      userId: number;
      attemptId: number;
      answers: { questionId: number; choice: string }[];
    };

    if (!userId || !attemptId || !answers?.length) {
      return NextResponse.json(
        { error: "userId, attemptId, dan answers wajib diisi" },
        { status: 400 }
      );
    }
}
}


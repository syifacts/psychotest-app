import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { customAlphabet } from "nanoid";

// Alphabet Base62, token 16 karakter
const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const nanoid = customAlphabet(alphabet, 16);

export async function POST(req: NextRequest) {
  try {
    const { userId, testTypeId, attemptId, companyId } = await req.json();

    if (!testTypeId || !companyId) {
      return NextResponse.json({ error: "Missing required fields: testTypeId or companyId" }, { status: 400 });
    }

    // generate token
    const tokenValue = nanoid();

    const newToken = await prisma.token.create({
      data: {
        userId: userId || null,    // bisa null
        companyId,
        testTypeId,
        token: tokenValue,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 jam
        ...(attemptId ? { testAttempt: { connect: { id: attemptId } } } : {}),
      },
    });

    return NextResponse.json({
      message: "Token berhasil dibuat",
      token: newToken.token,
      id: newToken.id,
      companyId: newToken.companyId,
      userId: newToken.userId,
      testTypeId: newToken.testTypeId,
      expiresAt: newToken.expiresAt,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

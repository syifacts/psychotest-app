import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token wajib diisi" }, { status: 400 });
    }

    // Cari token di DB, ambil info perusahaan
    const tokenData = await prisma.token.findUnique({
      where: { token },
      include: {
        Company: true,
        TestType: true,
        User: true,
      },
    });

    if (!tokenData) {
      return NextResponse.json({ error: "Token tidak valid" }, { status: 400 });
    }

    // Kalau token sudah digunakan, bisa kasih warning (opsional)
    if (tokenData.used) {
      return NextResponse.json({ error: "Token sudah digunakan" }, { status: 400 });
    }

    // --------------------------
    // Cek apakah attempt sudah selesai
    // --------------------------
    let isCompleted = false;
    if (tokenData.userId) {
      const attempt = await prisma.testAttempt.findFirst({
        where: {
          userId: tokenData.userId,
          testTypeId: tokenData.testTypeId,
          isCompleted: true,
        },
      });
      isCompleted = !!attempt;
    }

    return NextResponse.json({
      companyName: tokenData.Company?.fullName || tokenData.Company?.customId || "Perusahaan",
      testType: tokenData.TestType.code,
      tokenId: tokenData.id,
      expiresAt: tokenData.expiresAt,
      userId: tokenData.userId ?? 0,
      customId: tokenData.User?.customId,
      isCompleted, // <-- tambahkan
       used: tokenData.used
    });
  } catch (err) {
    console.error("Gagal fetch token info:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

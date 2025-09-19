import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // 1. Result biasa
    const reports = await prisma.result.findMany({
      where: { validated: false }, // Hanya yang belum divalidasi
      include: {
        User: { select: { fullName: true } },
        TestType: { select: { name: true } },
        Attempt: { select: { id: true, startedAt: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. PersonalityResult
    const personalityReports = await prisma.personalityResult.findMany({
      where: { validated: false },
      include: {
        User: { select: { fullName: true } },
        TestType: { select: { name: true } },
        Attempt: { select: { id: true, startedAt: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // 3. Gabungin keduanya
    const combined = [
      ...reports.map(r => ({ ...r, type: "IQ/CPMI" })),
      ...personalityReports.map(p => ({ ...p, type: "Personality" })),
    ].sort((a, b) => {
      // urutkan semua berdasarkan createdAt terbaru
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json(combined);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch pending reports" },
      { status: 500 }
    );
  }
}

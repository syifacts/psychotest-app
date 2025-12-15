// /app/api/admin/attempts/route.ts (Next.js 13+)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const attempts = await prisma.testAttempt.findMany({
      orderBy: { startedAt: "desc" },
      include: {
        User: { select: { fullName: true, email: true } },
        Company: { select: { fullName: true } },
        TestType: { select: { name: true } },
      },
    });
    return NextResponse.json({ attempts });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = Number(params.id);
  if (!userId) return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });

  try {
    const attempts = await prisma.testAttempt.findMany({
      where: { userId },
      include: {
        TestType: true,
        results: true,
      },
      orderBy: { startedAt: "desc" },
    });
    return NextResponse.json({ attempts });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch attempts." }, { status: 500 });
  }
}

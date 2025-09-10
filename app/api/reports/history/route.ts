import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const reports = await prisma.result.findMany({
      where: { validated: true },
      include: {
        User: { select: { fullName: true } },
        TestType: { select: { name: true } },
        Attempt: { select: { id: true, startedAt: true } },
        ValidatedBy: { select: { fullName: true } },
      },
      orderBy: { validatedAt: "desc" },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch history reports" }, { status: 500 });
  }
}

// app/api/attempts/today/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const count = await prisma.testAttempt.count({
    where: {
      startedAt: { gte: today, lt: tomorrow },
      isCompleted: true,
    },
  });

  return NextResponse.json({ count });
}

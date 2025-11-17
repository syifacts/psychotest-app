import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  // Hitung jumlah attempt per testType
  const attempts = await prisma.testAttempt.groupBy({
    by: ["testTypeId"],
    _count: { id: true },
  });

  const data = await Promise.all(
    attempts.map(async (a:any) => {
      const testType = await prisma.testType.findUnique({
        where: { id: a.testTypeId },
      });
      return {
        name: testType?.name || "Unknown",
        count: a._count.id,
      };
    })
  );

  return NextResponse.json(data);
}

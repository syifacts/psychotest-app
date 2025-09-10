import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { attemptId, kesimpulan, ttd } = await req.json();
    if (!attemptId) 
      return NextResponse.json({ error: "attemptId is required" }, { status: 400 });

    const result = await prisma.result.findFirst({
      where: { attemptId: Number(attemptId) },
    });

    if (!result) 
      return NextResponse.json({ error: "Result not found" }, { status: 404 });

    const updated = await prisma.result.update({
      where: { id: result.id },
      data: { kesimpulan, ttd },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}

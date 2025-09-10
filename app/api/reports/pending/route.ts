import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const reports = await prisma.result.findMany({
      where: { validated: false }, // Hanya yang belum divalidasi
      include: {
        User: { select: { fullName: true } },
        TestType: { select: { name: true } },
        Attempt: { select: { id: true, startedAt: true } },
      },
      orderBy: { createdAt: "desc" }, // Terbaru paling atas
    });

    return NextResponse.json(reports); // Kirim JSON ke frontend
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch pending reports" },
      { status: 500 }
    );
  }
}

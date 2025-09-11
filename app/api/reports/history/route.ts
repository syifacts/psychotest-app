import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userIdHeader = req.headers.get("x-user-id");
    if (!userIdHeader) {
      return NextResponse.json({ error: "User ID tidak ditemukan" }, { status: 401 });
    }
    const userId = parseInt(userIdHeader);

    // Ambil hanya hasil yang divalidasi oleh psikolog ini
    const reports = await prisma.result.findMany({
      where: {
        validated: true,
        validatedById: userId, // Hanya result yang divalidasi oleh psikolog ini
      },
      include: {
        Attempt: {
          select: {
            id: true,
            startedAt: true,
            User: { select: { fullName: true } },
            TestType: { select: { name: true } },
          },
        },
        ValidatedBy: { select: { fullName: true } },
      },
      orderBy: { validatedAt: "desc" },
    });

    // Format supaya sesuai frontend
    const formattedReports = reports.map((r) => ({
      id: r.id,
      User: r.Attempt?.User,
      TestType: r.Attempt?.TestType,
      Attempt: { id: r.Attempt?.id, startedAt: r.Attempt?.startedAt },
      validated: r.validated,
      validatedBy: r.ValidatedBy,
    }));

    return NextResponse.json(formattedReports);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch history reports" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

async function getLoggedUserId(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;

    const payload: any = jwt.verify(token, JWT_SECRET);
    return payload.id; // pastikan sesuai key di JWT-mu
  } catch (err) {
    console.error("JWT error:", err);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getLoggedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "User ID tidak ditemukan" }, { status: 401 });
    }

    const reports = await prisma.result.findMany({
      where: {
        validated: true,
        validatedById: userId,
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

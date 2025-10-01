import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

async function getLoggedUserId(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    console.log("DEBUG: token dari cookie =", token);

    if (!token) {
      console.log("DEBUG: token tidak ditemukan di cookie");
      return null;
    }

    const payload: any = jwt.verify(token, JWT_SECRET);
    console.log("DEBUG: payload JWT =", payload);

    return payload.id;
  } catch (err) {
    console.error("JWT error:", err);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getLoggedUserId(req);
    console.log("DEBUG: userId =", userId);

    if (!userId) {
      console.log("DEBUG: User ID tidak ditemukan");
      return NextResponse.json({ error: "User ID tidak ditemukan" }, { status: 401 });
    }

    console.log("DEBUG: menjalankan prisma.result.findMany dengan validatedById =", userId);

    const results = await prisma.result.findMany({
      where: {
        validated: true,
        validatedById: userId,
      },
      include: {
        Attempt: {
          include: {
            User: { select: { fullName: true } },
            TestType: { select: { name: true } },
          },
        },
        ValidatedBy: { select: { fullName: true } },
      },
      orderBy: { validatedAt: "desc" },
    });

    console.log("DEBUG: hasil query =", results);

    const formattedReports = results.map((r) => ({
      id: r.id,
      User: r.Attempt?.User || null,
      TestType: r.Attempt?.TestType || null,
      Attempt: r.Attempt
        ? { id: r.Attempt.id, startedAt: r.Attempt.startedAt }
        : null,
      validated: r.validated,
      validatedAt: r.validatedAt?.toISOString() || null,
      expiresAt: r.expiresAt?.toISOString() || null,
      validatedBy: r.ValidatedBy || null,
      kesimpulan: r.kesimpulan || null,
      ttd: r.ttd || null,
      barcode: r.barcode || null,
    }));

    console.log("DEBUG: formattedReports =", formattedReports);

    return NextResponse.json(formattedReports);
  } catch (error) {
    console.error("ERROR di GET /api/results:", error);
    return NextResponse.json({ error: "Failed to fetch history reports" }, { status: 500 });
  }
}

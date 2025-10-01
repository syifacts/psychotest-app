// app/api/reports/verifying/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get("companyId");
    if (!companyId) return NextResponse.json({ error: "CompanyId wajib" }, { status: 400 });

    const count = await prisma.testAttempt.count({
      where: {
        companyId: Number(companyId),
        status: {
      in: ["RESERVED", "Sedang diverifikasi psikolog"],
      },
    },
    });

    return NextResponse.json({ count });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

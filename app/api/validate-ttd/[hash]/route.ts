// app/api/validate-ttd/[hash]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { hash: string } }) {
  const { hash } = params;

  if (!hash) {
    return NextResponse.json({ error: "Invalid hash" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { ttdHash: hash },
      select: {
        id: true,
        fullName: true,
        ttdUrl: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Signature not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Valid TTD",
      user,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

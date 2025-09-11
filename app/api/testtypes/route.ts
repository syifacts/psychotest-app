// app/api/testtypes/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const testTypes = await prisma.testType.findMany({
    select: {
      name: true,
      desc: true,
      price: true,
      img: true,
    },
    orderBy: { id: "asc" },
  });

  return NextResponse.json(testTypes);
}

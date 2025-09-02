// app/api/testtypes/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const testTypes = await prisma.testType.findMany({
    orderBy: { id: "asc" },
  });
  return NextResponse.json(testTypes);
}

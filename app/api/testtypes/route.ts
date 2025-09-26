// app/api/testtypes/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const testTypes = await prisma.testType.findMany({
    select: {
      id: true,
      name: true,
      desc: true,
      price: true,
      img: true,
      duration: true,
      judul: true,
      deskripsijudul: true,
      juduldesk1: true,
      desk1: true,
      juduldesk2: true,
      desk2: true,
      cp: true,
      judulbenefit: true,
      pointbenefit: true,
    },
    orderBy: { id: "asc" },
  });

  return NextResponse.json(testTypes);
}

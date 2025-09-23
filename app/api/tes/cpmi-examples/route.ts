import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
   const exampleQuestions = await prisma.question.findMany({
  where: { testTypeId: 30 }, // ambil soal CPMI
  select: {
    id: true,
    code: true,
    content: true,
    options: true,
    notes: true,
    type: true,
  },
  orderBy: { id: "asc" },
  take: 3, // ambil 3 soal contoh
});


    return NextResponse.json(exampleQuestions);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Gagal load contoh soal" }, { status: 500 });
  }
}

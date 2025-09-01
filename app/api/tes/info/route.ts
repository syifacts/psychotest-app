import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type"); // contoh: "IST"

    if (!type) {
      return NextResponse.json({ error: "Tipe tes wajib diisi" }, { status: 400 });
    }

    const test = await prisma.testType.findUnique({
      where: { name: type },
      select: { id: true, name: true, duration: true, price: true },
    });

    if (!test) {
      return NextResponse.json({ error: "Tes tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(test);
  } catch (err) {
    return NextResponse.json({ error: "Gagal ambil info tes" }, { status: 500 });
  }
}

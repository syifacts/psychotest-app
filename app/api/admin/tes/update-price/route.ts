import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { testTypeId, price } = await req.json();

    // TODO: cek role admin (misal via JWT / session)
    // kalau bukan ADMIN => return error

    const updatedTest = await prisma.testType.update({
      where: { id: testTypeId },
      data: { price },
    });

    return NextResponse.json({ success: true, test: updatedTest });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Gagal update harga" }, { status: 500 });
  }
}

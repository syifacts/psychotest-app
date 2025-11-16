import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: any) {
  const { id } = params;
  const { status } = await req.json();

  try {
    await prisma.payment.update({
      where: { id: Number(id) },
      data: { status },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}

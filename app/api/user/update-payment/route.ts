// app/api/user/update-payment/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, fullName, email, phone } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "User ID diperlukan" }, { status: 400 });
    }

    if (!fullName || !email || !phone) {
      return NextResponse.json({ success: false, error: "Semua field harus diisi" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        fullName,
        email,
        phone,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });
  } catch (error: any) {
    console.error("Gagal update user:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

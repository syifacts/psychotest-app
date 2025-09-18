import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";

export async function POST(req: Request) {
  try {
    const { ttd, userId } = await req.json();

    if (!ttd || !userId) {
      return NextResponse.json({ error: "TTD atau userId tidak ditemukan" }, { status: 400 });
    }

    // base64 string murni (sudah tanpa prefix data:image/png;base64,)
    const buffer = Buffer.from(ttd, "base64");

    // Hash SHA256 untuk validasi
    const hash = createHash("sha256").update(buffer).digest("hex");

    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        ttdUrl: ttd,   // simpan base64 langsung
        ttdHash: hash, // simpan hash untuk validasi
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("Upload TTD error:", err);
    return NextResponse.json({ error: "Gagal upload TTD" }, { status: 500 });
  }
}

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
   let base64Data = ttd;

// Jika ttd memiliki prefix data:image/png;base64, hapus dulu
if (ttd.startsWith("data:image")) {
  base64Data = ttd.split(",")[1];
}

const buffer = Buffer.from(base64Data, "base64");

// Hash SHA256
const hash = createHash("sha256").update(buffer).digest("hex");

// Simpan di DB
const updatedUser = await prisma.user.update({
  where: { id: Number(userId) },
  data: {
    ttdUrl: ttd,   // simpan full base64 beserta prefix
    ttdHash: hash, // simpan hash untuk validasi
  },
});


    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("Upload TTD error:", err);
    return NextResponse.json({ error: "Gagal upload TTD" }, { status: 500 });
  }
}

// app/api/user/update-profile/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token tidak ditemukan" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    const body = await req.json();
    const { fullName, birthDate } = body;

    if (!fullName || !birthDate) {
      return NextResponse.json({ error: "Nama lengkap dan tanggal lahir wajib diisi" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: decoded.id },
      data: {
        fullName,
        birthDate: new Date(birthDate),
      },
    });

    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(
      { message: "Profil berhasil diperbarui", user: userWithoutPassword },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

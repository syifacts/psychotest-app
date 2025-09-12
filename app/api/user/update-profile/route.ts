import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

export async function POST(req: Request) {
  try {
    // Ambil token dari cookie
    const cookie = req.headers.get("cookie");
    const token = cookie
      ?.split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "Token tidak ditemukan" }, { status: 401 });
    }

    // Verifikasi token
    const decoded: any = jwt.verify(token, JWT_SECRET);

    const body = await req.json();
    const { fullName, birthDate } = body;

    if (!fullName || !birthDate) {
      return NextResponse.json(
        { error: "Nama lengkap dan tanggal lahir wajib diisi" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: decoded.id },
      data: {
        fullName,
        birthDate: new Date(birthDate),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        birthDate: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Profil berhasil diperbarui",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

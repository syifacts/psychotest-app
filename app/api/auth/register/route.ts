import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, password } = body;

    // Validasi sederhana
    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    // cek email sudah ada atau belum
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // simpan user baru
    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        // role default USER otomatis sesuai schema
      },
    });

    // jangan kirim password di response
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      { message: "Registrasi berhasil", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}

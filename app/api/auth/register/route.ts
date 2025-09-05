import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, password, birthDate, gender, education } = body;

    // Validasi sederhana
    if (!fullName || !email || !password || !birthDate || !gender || !education) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    // Validasi gender enum
    if (gender !== "LAKI_LAKI" && gender !== "PEREMPUAN") {
      return NextResponse.json(
        { error: "Jenis kelamin tidak valid" },
        { status: 400 }
      );
    }

    // Validasi tanggal lahir
    const parsedBirthDate = new Date(birthDate);
    if (isNaN(parsedBirthDate.getTime())) {
      return NextResponse.json(
        { error: "Tanggal lahir tidak valid" },
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
        gender,               // enum LAKI_LAKI / PEREMPUAN
        birthDate: parsedBirthDate, // simpan sebagai Date
        education,            // string / enum pendidikan
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

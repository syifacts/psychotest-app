import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      fullName,
      email,
      password,
      role,
      lembagalayanan, // sesuai frontend untuk PSIKOLOG
      organization,    // bisa dipakai untuk PERUSAHAAN
      phone,
      address,
      birthDate,
      gender,
      education
    } = body;

    // Validasi role
    const validRoles = ["USER", "PSIKOLOG", "PERUSAHAAN"];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });
    }

    // Validasi email & password
    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password harus diisi" }, { status: 400 });
    }

    // Cek email sudah ada
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Data user baru
    const userData: any = {
      email,
      password: hashedPassword,
      role,
    };

    if (role === "PSIKOLOG") {
      if (!fullName || !lembagalayanan || !phone) {
        return NextResponse.json({ error: "Semua field untuk Psikolog harus diisi" }, { status: 400 });
      }
      userData.fullName = fullName;
      userData.lembagalayanan = lembagalayanan; // sesuai field frontend
      userData.phone = phone;
    } else if (role === "PERUSAHAAN") {
      if (!fullName || !address) {
        return NextResponse.json({ error: "Semua field untuk Perusahaan harus diisi" }, { status: 400 });
      }
      userData.fullName = fullName; // nama perusahaan
      userData.address = address;
    } else {
      // USER biasa
      if (!fullName || !birthDate || !gender || !education) {
        return NextResponse.json({ error: "Semua field untuk USER harus diisi" }, { status: 400 });
      }
      userData.fullName = fullName;
      userData.birthDate = new Date(birthDate);
      userData.gender = gender;
      userData.education = education;
    }

    // Simpan user baru
    const newUser = await prisma.user.create({ data: userData });

    // Jangan kirim password
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      { message: `Registrasi berhasil sebagai ${role}`, user: userWithoutPassword },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

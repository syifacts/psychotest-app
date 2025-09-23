// app/api/user/update-biodata/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Hitung usia dari tanggal lahir
function calculateAge(birthDate: Date) {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, customId, fullName, birthDate, gender, tujuan } = await req.json();

    if ((!userId && !customId) || !fullName || !birthDate || !gender || !tujuan) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    // Cari user
    let user;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    } else if (customId) {
      user = await prisma.user.findUnique({ where: { customId } });
    }

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const birth = new Date(birthDate);

    let genderEnum: "LAKI_LAKI" | "PEREMPUAN" | undefined;
if (gender === "Laki-laki") genderEnum = "LAKI_LAKI";
else if (gender === "Perempuan") genderEnum = "PEREMPUAN";
else genderEnum = undefined;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        fullName,
        birthDate: birth,
         gender: genderEnum,
        tujuan,
      },
    });

    const usia = calculateAge(birth);

    return NextResponse.json({ success: true, user: updatedUser, usia });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Gagal update biodata" }, { status: 500 });
  }
}

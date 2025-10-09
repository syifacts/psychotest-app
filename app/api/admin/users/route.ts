import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const {
      role,
      fullName,
      email,
      phone,
      birthDate,
      gender,
      education,
       strNumber,
  sippNumber,
      lembagalayanan,
      organization,
      address,
    } = await req.json();

    if (!role || !email) {
      return NextResponse.json({ error: "Role dan email wajib diisi" }, { status: 400 });
    }

    let customIdPrefix = "";
    if (role === "PSIKOLOG") customIdPrefix = "PSI100-";
    else if (role === "PERUSAHAAN") customIdPrefix = "CP100-";

    // hitung user sesuai role untuk generate nomor
    const count = await prisma.user.count({ where: { role } });
    const number = (count + 1).toString().padStart(3, "0");
    const customId = customIdPrefix + number;

    // gunakan customId sebagai password sementara
    const password = customId;
    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser: any = {
      fullName: role === "PERUSAHAAN" ? organization || fullName : fullName,
      email,
      password: hashedPassword,
      role,
      customId,
    };

    if (role === "PSIKOLOG") {
      newUser.lembagalayanan = lembagalayanan || null;
      newUser.phone = phone || null;
      newUser.birthDate = birthDate ? new Date(birthDate) : null;
      newUser.gender = gender || null;
      newUser.education = education || null;
       newUser.strNumber = strNumber || null;
  newUser.sippNumber = sippNumber || null;
    } else if (role === "PERUSAHAAN") {
      newUser.address = address || null;
    }

    const user = await prisma.user.create({ data: newUser });

    return NextResponse.json({ user, password }); // kembalikan password agar bisa ditampilkan
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

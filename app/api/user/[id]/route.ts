import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    //const { id } = await context.params; // ← WAJIB pakai await  try {
    const userId = Number(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        customId: true,
        education: true,
        fullName: true,
        birthDate: true,
        gender: true,
        tujuan: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    // ✅ Kembalikan format lama agar kompatibel dengan frontend
    return NextResponse.json({
      user, 
    });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Gagal ambil data user" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const contentType = req.headers.get("content-type") || "";
    let data: any = {};

    if (contentType.includes("application/json")) {
      data = await req.json();
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        data[key] = value;
      });
    } else {
      return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
    }

    // Cek apakah user ada
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true, role: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const updateData: any = {};

    // === ROLE-BASED EDIT FIELDS ===
    switch (user.role) {
      case "PSIKOLOG":
        if (data.fullName) updateData.fullName = data.fullName;
        if (data.email) updateData.email = data.email;
        if (data.lembagalayanan) updateData.lembagalayanan = data.lembagalayanan;
        if (data.strNumber) updateData.strNumber = data.strNumber;
        if (data.sippNumber) updateData.sippNumber = data.sippNumber;
        break;

      case "PERUSAHAAN":
        if (data.fullName) updateData.fullName = data.fullName;
        if (data.email) updateData.email = data.email;
        if (data.address) updateData.address = data.address;
        if (data.phone) updateData.phone = data.phone;
        break;

      case "SUPERADMIN":
        if (data.fullName) updateData.fullName = data.fullName;
        if (data.email) updateData.email = data.email;
        break;

      case "USER":
      default:
        if (data.fullName) updateData.fullName = data.fullName;
        if (data.email) updateData.email = data.email;
        if (data.birthDate) updateData.birthDate = new Date(data.birthDate);
        if (data.education) updateData.education = data.education;
        if (data.tujuan) updateData.tujuan = data.tujuan;
        break;
    }

    // === PASSWORD update opsional ===
    if (data.newPassword) {
      if (!data.currentPassword) {
        return NextResponse.json({ error: "Password lama harus diisi" }, { status: 400 });
      }

      const isMatch = await bcrypt.compare(data.currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ error: "Password lama salah" }, { status: 401 });
      }

      const hashed = await bcrypt.hash(data.newPassword, 12);
      updateData.password = hashed;
    }

    // === UPDATE DB ===
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        birthDate: true,
        education: true,
        phone: true,
        address: true,
        lembagalayanan: true,
        strNumber: true,
        sippNumber: true,
        tujuan: true,
        updatedAt: true,
      },
    });

    // ✅ Gunakan format sama agar frontend juga cocok
    return NextResponse.json({
      user: updatedUser,
    });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Gagal update user" },
      { status: 500 }
    );
  }
}

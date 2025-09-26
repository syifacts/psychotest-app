// app/api/users/count-by-role/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const userCount = await prisma.user.count({ where: { role: "USER" } });
    const psikologCount = await prisma.user.count({ where: { role: "PSIKOLOG" } });
    const companyCount = await prisma.user.count({ where: { role: "PERUSAHAAN" } });

    return NextResponse.json({ userCount, psikologCount, companyCount });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Gagal hitung user" }, { status: 500 });
  }
}

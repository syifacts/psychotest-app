import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { packagePurchaseId, userId } = await req.json();

  const purchase = await prisma.packagePurchase.findUnique({
    where: { id: packagePurchaseId },
    include: { userPackages: true },
  });

  if (!purchase) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  if (purchase.userPackages.length >= purchase.quantity) {
    return NextResponse.json({ error: "Kuota habis" }, { status: 400 });
  }

  // Cek kalau user sudah terdaftar
  const exists = purchase.userPackages.some(up => up.userId === userId);
  if (exists) {
    return NextResponse.json({ error: "User sudah terdaftar" }, { status: 400 });
  }

  await prisma.userPackage.create({
    data: { userId, packagePurchaseId },
  });

  return NextResponse.json({ success: true });
}

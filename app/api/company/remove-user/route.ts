import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, type, targetId } = await req.json();

    if (!userId || !type || !targetId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    if (type === "Paket") {
      // Hapus relasi userPackages
      await prisma.userPackage.deleteMany({
        where: { userId, packagePurchaseId: targetId },
      });
    } else if (type === "Test Satuan") {
      // Hapus testAttempt untuk payment
      await prisma.testAttempt.deleteMany({
        where: { userId, paymentId: targetId },
      });
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ message: "User berhasil dihapus" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // 1️⃣ Cari semua testAttempt milik user
    const attempts = await prisma.testAttempt.findMany({
      where: { userId },
      select: { id: true },
    });

    // const attemptIds = attempts.map(a => a.id);
    const attemptIds = attempts.map((a: any) => a.id);


    if (attemptIds.length > 0) {
      // 2️⃣ Hapus semua personalityResult terkait attempt
      await prisma.personalityResult.deleteMany({
        where: { attemptId: { in: attemptIds } },
      });

      // 3️⃣ Hapus semua subtestResult terkait attempt
      await prisma.subtestResult.deleteMany({
        where: { attemptId: { in: attemptIds } },
      });

      // 4️⃣ Hapus semua answer terkait attempt
      await prisma.answer.deleteMany({
        where: { attemptId: { in: attemptIds } },
      });

      // 5️⃣ Hapus semua result terkait attempt
      await prisma.result.deleteMany({
        where: { attemptId: { in: attemptIds } },
      });

      // 6️⃣ Hapus semua testAttempt milik user
      await prisma.testAttempt.deleteMany({
        where: { id: { in: attemptIds } },
      });
    }

    // 7️⃣ Hapus userPackage milik user
    await prisma.userPackage.deleteMany({
      where: { userId },
    });

    // 8️⃣ Hapus user
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "User dan semua data terkait berhasil dihapus" });
  } catch (err) {
    console.error("❌ Error hapus user:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

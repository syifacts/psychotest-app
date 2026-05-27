// import { prisma } from "@/lib/prisma";
// import { NextRequest, NextResponse } from "next/server";

// export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const id = parseInt(params.id);

//     const user = await prisma.user.delete({
//       where: { id },
//     });

//     return NextResponse.json({ success: true, user });
//   } catch (err: any) {
//     console.error(err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }


// export async function DELETE(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const id = parseInt(params.id);

//     const user = await prisma.user.delete({
//       where: { id },
//     });

//     return NextResponse.json({ success: true, user });
//   } catch (err: any) {
//     console.error(err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
// export async function DELETE(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const id = parseInt(params.id);

//     // Jalankan dalam transaksi biar konsisten
//     const result = await prisma.$transaction(async (tx) => {
//       // 1. Hapus data turunan yang jelas milik company ini
//       await tx.companyPricing.deleteMany({
//         where: { companyId: id },
//       });

//       await tx.token.deleteMany({
//         where: { companyId: id },
//       });

//       await tx.packagePurchase.deleteMany({
//         where: { companyId: id },
//       });

//       // 2. Untuk relasi yang mau disimpan, bisa di-null-kan companyId-nya
//       await tx.payment.updateMany({
//         where: { companyId: id },
//         data: { companyId: null },
//       });

//       await tx.testAttempt.updateMany({
//         where: { companyId: id },
//         data: { companyId: null },
//       });

//       // 3. Setelah semua aman, baru hapus user
//       const user = await tx.user.delete({
//         where: { id },
//       });

//       return user;
//     });

//     return NextResponse.json({ success: true, user: result });
//   } catch (err: any) {
//     console.error(err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// bener
// export async function DELETE(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await context.params;
//   const userId = parseInt(id);

//   try {
//     const result = await prisma.$transaction(async (tx: any) => {
//       await tx.answer.deleteMany({ where: { userId } });
//       await tx.result.deleteMany({ where: { userId } });
//       await tx.testAttempt.deleteMany({ where: { userId } });
//       await tx.payment.deleteMany({ where: { userId } });
//       await tx.userProgress.deleteMany({ where: { userId } });
//       await tx.personalityResult.deleteMany({ where: { userId } });
//       await tx.token.deleteMany({ where: { userId } });
//       await tx.packagePurchase.deleteMany({ where: { userId } });
//       await tx.userPackage.deleteMany({ where: { userId } });

//       await tx.payment.updateMany({
//         where: { companyId: userId },
//         data: { companyId: null },
//       });

//       await tx.testAttempt.updateMany({
//         where: { companyId: userId },
//         data: { companyId: null },
//       });

//       await tx.token.updateMany({
//         where: { companyId: userId },
//         data: { companyId: null },
//       });

//       await tx.packagePurchase.updateMany({
//         where: { companyId: userId },
//         data: { companyId: null },
//       });

//       await tx.companyPricing.deleteMany({
//         where: { companyId: userId },
//       });

//       const user = await tx.user.delete({
//         where: { id: userId },
//       });

//       return user;
//     });

//     return NextResponse.json({ success: true, user: result });
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// import { prisma } from "@/lib/prisma";
// import { NextRequest, NextResponse } from "next/server";
// export async function DELETE(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await params;
//   const userId = parseInt(id, 10);

//   try {
//     // 1. Null-kan relasi companyId
//     await prisma.payment.updateMany({
//       where: { companyId: userId },
//       data: { companyId: null },
//     });
//     await prisma.testAttempt.updateMany({
//       where: { companyId: userId },
//       data: { companyId: null },
//     });
//     await prisma.token.updateMany({
//       where: { companyId: userId },
//       data: { companyId: null },
//     });
//     await prisma.packagePurchase.updateMany({
//       where: { companyId: userId },
//       data: { companyId: null },
//     });

//     await prisma.companyPricing.deleteMany({
//       where: { companyId: userId },
//     });

//     // 2. Hapus semua data yang terkait userId
//     await prisma.answer.deleteMany({ where: { userId } });
//     await prisma.result.deleteMany({ where: { userId } });
//     await prisma.testAttempt.deleteMany({ where: { userId } });
//     await prisma.payment.deleteMany({ where: { userId } });
//     await prisma.userProgress.deleteMany({ where: { userId } });
//     await prisma.personalityResult.deleteMany({ where: { userId } });
//     await prisma.token.deleteMany({ where: { userId } });
//     await prisma.packagePurchase.deleteMany({ where: { userId } });
//     await prisma.userPackage.deleteMany({ where: { userId } });

//     // 3. Terakhir, hapus user
//     const user = await prisma.user.delete({
//       where: { id: userId },
//     });

//     return NextResponse.json({ success: true, user });
//   } catch (err: any) {
//     console.error("DELETE /api/admin/users/[id] error:", err);
//     return NextResponse.json(
//       { error: err.message ?? "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logActivity } from "@/lib/logger";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ipAddress =
    req.headers.get("x-forwarded-for") || "unknown";

  const userAgent =
    req.headers.get("user-agent") || "unknown";

  const { id } = await params;
  const userId = parseInt(id, 10);

  try {
    // 🔎 ambil user dulu (buat log)
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      await logActivity({
        action: "DELETE",
        resource: "user",
        resourceId: String(userId),
        description: "Gagal hapus user (user tidak ditemukan)",
        ipAddress,
        userAgent,
        endpoint: "/api/admin/users",
        method: "DELETE",
        status: "FAILED",
        severity: "HIGH",
        isSuspicious: true,
      });

      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // 🔥 pakai transaction biar hemat koneksi
    await prisma.$transaction(async (tx) => {
      await tx.payment.updateMany({
        where: { companyId: userId },
        data: { companyId: null },
      });

      await tx.testAttempt.updateMany({
        where: { companyId: userId },
        data: { companyId: null },
      });

      await tx.token.updateMany({
        where: { companyId: userId },
        data: { companyId: null },
      });

      await tx.packagePurchase.updateMany({
        where: { companyId: userId },
        data: { companyId: null },
      });

      await tx.companyPricing.deleteMany({
        where: { companyId: userId },
      });

      await tx.answer.deleteMany({ where: { userId } });
      await tx.result.deleteMany({ where: { userId } });
      await tx.testAttempt.deleteMany({ where: { userId } });
      await tx.payment.deleteMany({ where: { userId } });
      await tx.userProgress.deleteMany({ where: { userId } });
      await tx.personalityResult.deleteMany({ where: { userId } });
      await tx.token.deleteMany({ where: { userId } });
      await tx.packagePurchase.deleteMany({ where: { userId } });
      await tx.userPackage.deleteMany({ where: { userId } });

      await tx.user.delete({
        where: { id: userId },
      });
    });

    // ✅ LOG SUCCESS (INI YANG SEBELUMNYA KAMU BELUM PUNYA)
    await logActivity({
      userId: user.id,
      role: user.role,
      action: "DELETE",
      resource: "user",
      resourceId: String(user.id),
      description: "Admin menghapus user dan seluruh data terkait",
      ipAddress,
      userAgent,
      endpoint: "/api/admin/users",
      method: "DELETE",
      status: "SUCCESS",
      severity: "HIGH",
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("DELETE /api/admin/users/[id] error:", err);

    await logActivity({
      action: "DELETE",
      resource: "user",
      description: "Error saat menghapus user",
      ipAddress,
      userAgent,
      endpoint: "/api/admin/users",
      method: "DELETE",
      status: "FAILED",
      severity: "HIGH",
      isSuspicious: true,
    });

    return NextResponse.json(
      { error: err.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
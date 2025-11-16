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
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const result = await prisma.$transaction(async (tx) => {
      // ==========================
      // 1. Hapus data turunan by userId
      // ==========================

      await tx.answer.deleteMany({ where: { userId: id } });
      await tx.result.deleteMany({ where: { userId: id } });
      await tx.testAttempt.deleteMany({ where: { userId: id } });
      await tx.payment.deleteMany({ where: { userId: id } });
      await tx.userProgress.deleteMany({ where: { userId: id } });
      await tx.personalityResult.deleteMany({ where: { userId: id } });
      await tx.token.deleteMany({ where: { userId: id } });
      await tx.packagePurchase.deleteMany({ where: { userId: id } });
      await tx.userPackage.deleteMany({ where: { userId: id } });

      // ==========================
      // 2. Relasi companyId yang harus di-null-kan, bukan dihapus
      // ==========================

      await tx.payment.updateMany({
        where: { companyId: id },
        data: { companyId: null },
      });

      await tx.testAttempt.updateMany({
        where: { companyId: id },
        data: { companyId: null },
      });

      await tx.token.updateMany({
        where: { companyId: id },
        data: { companyId: null },
      });

      await tx.packagePurchase.updateMany({
        where: { companyId: id },
        data: { companyId: null },
      });

      // ==========================
      // 3. Hapus tabel khusus perusahaan
      // ==========================

      await tx.companyPricing.deleteMany({
        where: { companyId: id },
      });

      // ==========================
      // 4. Terakhir: hapus user
      // ==========================

      const user = await tx.user.delete({
        where: { id },
      });

      return user;
    });

    return NextResponse.json({ success: true, user: result });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
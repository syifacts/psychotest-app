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
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // <-- WAJIB AWAIT

  try {
    const userId = parseInt(id);

    const result = await prisma.$transaction(async (tx) => {
      await tx.answer.deleteMany({ where: { userId } });
      await tx.result.deleteMany({ where: { userId } });
      await tx.testAttempt.deleteMany({ where: { userId } });
      await tx.payment.deleteMany({ where: { userId } });
      await tx.userProgress.deleteMany({ where: { userId } });
      await tx.personalityResult.deleteMany({ where: { userId } });
      await tx.token.deleteMany({ where: { userId } });
      await tx.packagePurchase.deleteMany({ where: { userId } });
      await tx.userPackage.deleteMany({ where: { userId } });

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

      const user = await tx.user.delete({
        where: { id: userId },
      });

      return user;
    });

    return NextResponse.json({ success: true, user: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

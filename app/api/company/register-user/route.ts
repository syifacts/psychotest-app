import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
//import crypto from "crypto";
import { customAlphabet } from "nanoid";
import bcrypt from "bcryptjs"; // ✅ import bcrypt

// Token 16 karakter Base62
const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const nanoid = customAlphabet(alphabet, 16);

function generateToken() {
  return nanoid();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
const { email, paymentId, userId, companyId, testCustomId } = body;
if (!paymentId) {
  return NextResponse.json({ error: "paymentId (test) wajib diisi" }, { status: 400 });
}

    if (!email && !userId) {
      return NextResponse.json({ error: "Email atau User ID wajib diisi" }, { status: 400 });
    }

    // 🔎 Cari user yang sudah ada (tapi JANGAN buat user baru dulu)
    let user = email
      ? await prisma.user.findUnique({ where: { email } })
      : null;

    if (!user && userId) {
      user = await prisma.user.findUnique({ where: { customId: userId } });
    }

    // --- PACKAGE ---
    // if (packagePurchaseId) {
    //   const purchase = await prisma.packagePurchase.findUnique({
    //     where: { id: Number(packagePurchaseId) },
    //     include: { userPackages: true },
    //   });

    //   if (!purchase) {
    //     return NextResponse.json({ error: "Package purchase not found" }, { status: 404 });
    //   }

    //   // ✅ CEK KUOTA DULU sebelum buat user
    //   if (purchase.userPackages.length >= purchase.quantity) {
    //     return NextResponse.json({ error: "Kuota habis" }, { status: 400 });
    //   }

    //   // ✅ Baru buat user kalau belum ada DAN kuota masih ada
    //   if (!user) {
    //     if (!companyId) {
    //       return NextResponse.json({ error: "CompanyId wajib untuk user baru" }, { status: 400 });
    //     }
        
    //     const hashedPassword = await bcrypt.hash(userId, 10);
    //     const count = await prisma.user.count({ where: { companyId: Number(companyId) } });
    //     const fullName = `Karyawan ${count + 1}`;

    //     user = await prisma.user.create({
    //       data: {
    //         email: email ?? `${userId}@gmail.com`,
    //         fullName,
    //         password: hashedPassword,
    //         role: "USER",
    //         customId: userId,
    //         companyId: Number(companyId),
    //       },
    //     });
    //   }

    //   if (purchase.userPackages.some((u) => u.userId === user!.id)) {
    //     return NextResponse.json({ error: "User sudah terdaftar di paket ini" }, { status: 400 });
    //   }

    //   const userPackage = await prisma.userPackage.create({
    //     data: { userId: user!.id, packagePurchaseId: Number(packagePurchaseId) },
    //   });

    //   return NextResponse.json({
    //     message: "User berhasil didaftarkan ke package",
    //     userPackage,
    //   });
    // }

    // --- TEST SATUAN ---
    if (paymentId) {
      const payment = await prisma.payment.findUnique({
        where: { id: Number(paymentId) },
        include: { attempts: true },
      });

      if (!payment) {
        return NextResponse.json({ error: "Payment not found" }, { status: 404 });
      }

      if (payment.testTypeId === null) {
        return NextResponse.json({ error: "Payment tidak memiliki testTypeId" }, { status: 400 });
      }

      // ✅ CEK KUOTA DULU sebelum buat user
      if (payment.attempts.length >= payment.quantity) {
        return NextResponse.json({ error: "Kuota habis" }, { status: 400 });
      }

      // ✅ Baru buat user kalau belum ada DAN kuota masih ada
      if (!user) {
        if (!companyId) {
          return NextResponse.json({ error: "CompanyId wajib untuk user baru" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(userId, 10);
        const count = await prisma.user.count({ where: { companyId: Number(companyId) } });
        const fullName = `Karyawan ${count + 1}`;

        user = await prisma.user.create({
          data: {
            email: email ?? `${userId}@gmail.com`,
            fullName,
            password: hashedPassword,
            role: "USER",
            customId: userId,
            companyId: Number(companyId),
          },
        });
      }

      // Cek user sudah daftar test ini
   if (payment.attempts.some((a) => a.userId === user!.id)) {
    return NextResponse.json(
      { error: "User sudah terdaftar di test ini" },
      { status: 400 }
    );
  }

      // ✅ Buat attempt & token
      const attempt = await prisma.testAttempt.create({
        data: {
          userId: user.id,
          testTypeId: payment.testTypeId,
          paymentId: payment.id,
          companyId: user.companyId,
          status: "RESERVED",
        },
      });

      const token = await prisma.token.create({
        data: {
          userId: user.id,
          testTypeId: payment.testTypeId,
          testAttempt: { connect: { id: attempt.id } },
          token: generateToken(),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
          companyId: user.companyId,
        },
      });

      return NextResponse.json({
        message: "User berhasil didaftarkan ke test satuan",
        attempt,
        token: token.token,
        remainingQuota: payment.quantity - payment.attempts.length - 1,
      });
    }

    // return NextResponse.json({ error: "Pilih package atau test" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
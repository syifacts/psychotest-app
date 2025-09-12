import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, packagePurchaseId, paymentId } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 });
    }

    // Cari user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Email belum terdaftar, silakan daftar akun dulu' }, { status: 400 });
    }

    // Cek role
    if (user.role !== 'USER') {
      return NextResponse.json({ error: 'Hanya user dengan role USER yang bisa didaftarkan' }, { status: 400 });
    }

    // === PACKAGE ===
    if (packagePurchaseId) {
      const purchase = await prisma.packagePurchase.findUnique({
        where: { id: Number(packagePurchaseId) },
        include: { userPackages: true },
      });

      if (!purchase) return NextResponse.json({ error: 'Package purchase not found' }, { status: 404 });

      if (purchase.userPackages.some(u => u.userId === user.id)) {
        return NextResponse.json({ error: 'User sudah terdaftar di paket ini' }, { status: 400 });
      }

      // Cek kuota
      const remainingQuota = purchase.quantity - purchase.userPackages.length;
      if (remainingQuota <= 0) return NextResponse.json({ error: 'Kuota habis' }, { status: 400 });

      const userPackage = await prisma.userPackage.create({
        data: { userId: user.id, packagePurchaseId: Number(packagePurchaseId) },
      });

      return NextResponse.json(userPackage);
    }

    // === TEST SATUAN ===
    if (paymentId) {
      const payment = await prisma.payment.findUnique({
        where: { id: Number(paymentId) },
        include: { attempts: true },
      });

      if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });

      if (payment.attempts.some(a => a.userId === user.id)) {
        return NextResponse.json({ error: 'User sudah terdaftar di test ini' }, { status: 400 });
      }

      // cek kuota
      const remainingQuota = payment.quantity - payment.attempts.length;
      if (remainingQuota <= 0) return NextResponse.json({ error: 'Kuota habis' }, { status: 400 });

      // Buat TestAttempt untuk user (tetap hubungkan ke payment perusahaan)
      const testAttempt = await prisma.testAttempt.create({
        data: {
          userId: user.id,
          testTypeId: payment.testTypeId,
          paymentId: payment.id,
        }
      });

      // ❌ Tidak perlu bikin Payment dummy lagi (cukup attempt terhubung ke payment perusahaan)
      return NextResponse.json(testAttempt);
    }

    return NextResponse.json({ error: 'Pilih package atau test' }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

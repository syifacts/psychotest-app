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
    if (!user) return NextResponse.json({ error: 'Email belum terdaftar', status: 400 });
    if (user.role !== 'USER') {
  return NextResponse.json(
    { error: 'Hanya role USER bisa didaftarkan' },
    { status: 400 } // ✅ ini yg ngatur HTTP status
  );
}


    // --- PACKAGE ---
    if (packagePurchaseId) {
      const purchase = await prisma.packagePurchase.findUnique({
        where: { id: Number(packagePurchaseId) },
        include: { userPackages: true },
      });

      if (!purchase) return NextResponse.json({ error: 'Package purchase not found', status: 404 });

      if (purchase.userPackages.some(u => u.userId === user.id)) {
        return NextResponse.json({ error: 'User sudah terdaftar di paket ini', status: 400 });
      }

      // Cek kuota
      if (purchase.userPackages.length >= purchase.quantity) {
        return NextResponse.json({ error: 'Kuota habis' }, { status: 400 });

      }

      const userPackage = await prisma.userPackage.create({
        data: { userId: user.id, packagePurchaseId: Number(packagePurchaseId) },
      });

      return NextResponse.json({
        message: 'User berhasil didaftarkan ke package',
        userPackage,
      });
    }

  // --- TEST SATUAN ---
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
  if (payment.attempts.length >= payment.quantity) {
    return NextResponse.json({ error: 'Kuota habis', status: 400 });
  }

  // ✅ Buat TestAttempt
  const attempt = await prisma.testAttempt.create({
    data: {
      userId: user.id,
      testTypeId: payment.testTypeId,
      paymentId: payment.id,
    },
  });

  // 🔥 Query ulang untuk ambil kuota terbaru
  const updatedPayment = await prisma.payment.findUnique({
    where: { id: payment.id },
    include: { attempts: true },
  });

  return NextResponse.json({
    message: 'User berhasil didaftarkan ke test satuan',
    attempt,
    remainingQuota: updatedPayment!.quantity - updatedPayment!.attempts.length, // 🎯 kuota tersisa
  });
}


    return NextResponse.json({ error: 'Pilih package atau test', status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

export async function POST(req: NextRequest) {
  try {
    const { userId: bodyUserId, testTypeId, paymentId, packagePurchaseId, guestToken } = await req.json();

    if (!testTypeId) {
      return NextResponse.json({ error: "testTypeId wajib diisi" }, { status: 400 });
    }

    let userId: number | undefined;
    let role: "USER" | "PERUSAHAAN" | "GUEST" | undefined;

    // ----------------------
    // 1️⃣ Cek guest token CPMI
    // ----------------------
    if (guestToken) {
      const tokenData = await prisma.token.findUnique({
        where: { token: guestToken },
        include: { User: true },
      });

      if (!tokenData || !tokenData.userId || !tokenData.User) {
        return NextResponse.json({ error: "Guest token tidak valid" }, { status: 401 });
      }

      userId = tokenData.userId;
      role = "GUEST"; // hanya untuk logika, di DB tetap USER
    } else {
      // ----------------------
      // 2️⃣ Cek JWT login
      // ----------------------
      const cookie = req.headers.get("cookie");
      const token = cookie?.split("; ").find(c => c.startsWith("token="))?.split("=")[1];

      if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };
        userId = bodyUserId || decoded.id;
        role = decoded.role as "USER" | "PERUSAHAAN";
      } catch (err) {
        return NextResponse.json({ error: "Token invalid atau malformed" }, { status: 401 });
      }
    }

    if (!userId) return NextResponse.json({ error: "userId tidak valid" }, { status: 400 });

    // ----------------------
    // 3️⃣ Cek attempt aktif
    // ----------------------
    const existingAttempt = await prisma.testAttempt.findFirst({
      where: { userId, testTypeId, finishedAt: null },
    });
    if (existingAttempt) return NextResponse.json(existingAttempt);

    // ----------------------
    // 4️⃣ Cek testType
    // ----------------------
    const testType = await prisma.testType.findUnique({ where: { id: testTypeId } });
    if (!testType) return NextResponse.json({ error: "TestType tidak ditemukan" }, { status: 404 });

    let assignedPaymentId: number | null = null;

    // ----------------------
    // 5️⃣ PackagePurchase
    // ----------------------
    if (packagePurchaseId) {
      const pkg = await prisma.packagePurchase.findUnique({ where: { id: packagePurchaseId } });
      if (!pkg || pkg.quantity <= 0)
        return NextResponse.json({ error: "Kuota paket habis atau tidak ditemukan" }, { status: 400 });

      const attempt = await prisma.$transaction(async (tx) => {
        const newAttempt = await tx.testAttempt.create({
          data: { userId, testTypeId, packagePurchaseId },
        });
        await tx.packagePurchase.update({
          where: { id: packagePurchaseId },
          data: { quantity: { decrement: 1 } },
        });
        return newAttempt;
      });
      return NextResponse.json(attempt);
    }

    // ----------------------
    // 6️⃣ PaymentId
    // ----------------------
    if (paymentId) {
      const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
      if (!payment || payment.quantity <= 0)
        return NextResponse.json({ error: "Kuota payment habis atau tidak ditemukan" }, { status: 400 });

      if (payment.userId === userId || payment.companyId) {
        assignedPaymentId = payment.id;
      } else {
        return NextResponse.json({ error: "Payment tidak valid untuk user ini" }, { status: 400 });
      }
    }

    // ----------------------
    // 7️⃣ USER / GUEST tanpa paymentId
    // ----------------------
    if (!assignedPaymentId && (role === "USER" || role === "GUEST")) {
      const lastPayment = await prisma.payment.findFirst({
        where: {
          userId,
          testTypeId,
          status: PaymentStatus.SUCCESS,
          quantity: { gt: 0 },
        },
        orderBy: { createdAt: "desc" },
      });

      if (lastPayment) {
        assignedPaymentId = lastPayment.id;
      } else {
        const newPayment = await prisma.payment.create({
          data: {
            testTypeId,
            quantity: 1,
            amount: testType.price || 0,
            status: PaymentStatus.SUCCESS,
            userId,
          },
        });
        assignedPaymentId = newPayment.id;
      }
    }

    // ----------------------
    // 8️⃣ PERUSAHAAN tanpa paymentId → error
    // ----------------------
    if (!assignedPaymentId && role === "PERUSAHAAN") {
      return NextResponse.json({ error: "PERUSAHAAN harus assign melalui payment atau paket" }, { status: 400 });
    }

    // ----------------------
    // 9️⃣ Buat attempt
    // ----------------------
    const attempt = await prisma.testAttempt.create({
      data: { userId, testTypeId, paymentId: assignedPaymentId },
    });

    // Kurangi kuota payment
    if (assignedPaymentId) {
      await prisma.payment.update({
        where: { id: assignedPaymentId },
        data: { quantity: { decrement: 1 } },
      });
    }

    return NextResponse.json(attempt);
  } catch (err) {
    console.error("❌ Gagal membuat attempt:", err);
    return NextResponse.json({ error: "Gagal membuat attempt" }, { status: 500 });
  }
}

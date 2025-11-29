// import { prisma } from "@/lib/prisma";
// //import { PaymentStatus } from "@prisma/client";
// import { NextRequest, NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

// const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

// export async function POST(req: NextRequest) {
//   try {
//     const { testTypeId, quantity = 1, userId: targetUserId } = await req.json();

//     // Validasi testTypeId
//     if (!testTypeId) {
//       return NextResponse.json(
//         { error: "testTypeId wajib" },
//         { status: 400 }
//       );
//     }

//     const cookie = req.headers.get("cookie");
//     const token = cookie
//       ?.split("; ")
//       .find((c) => c.startsWith("token="))
//       ?.split("=")[1];

//     if (!token)
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };

//     // Cek role GUEST
//     if (decoded.role === "GUEST") {
//       return NextResponse.json({ error: "Role GUEST tidak bisa bayar" }, { status: 403 });
//     }

//     // Cast ke number
//     const testTypeIdNum = Number(testTypeId);
//     if (isNaN(testTypeIdNum)) {
//       return NextResponse.json({ error: "testTypeId tidak valid" }, { status: 400 });
//     }

//     // Ambil harga dari TestType
//     const test = await prisma.testType.findUnique({
//       where: { id: testTypeIdNum },
//     });
//     if (!test) {
//       return NextResponse.json({ error: "Tes tidak ditemukan" }, { status: 404 });
//     }

//     const qty = quantity > 0 ? quantity : 1;
//     const totalAmount = (test.price || 0) * qty;

//     // Siapkan data payment
//     const paymentData: any = {
//       testTypeId: testTypeIdNum,
//       quantity: qty,
//       amount: totalAmount,
//      // status: PaymentStatus.SUCCESS,
//      status: "SUCCESS"

//     };

//     // Tentukan siapa yang bayar
//     if (decoded.role === "PERUSAHAAN") {
//       paymentData.companyId = decoded.id;

//       // Jika perusahaan daftarkan user tertentu
//       if (targetUserId) paymentData.userId = targetUserId;
//     } else {
//       paymentData.userId = decoded.id;
//     }

//     const payment = await prisma.payment.create({ data: paymentData });

//     return NextResponse.json({
//       success: true,
//       payment,
//       reason:
//         decoded.role === "PERUSAHAAN"
//           ? targetUserId
//             ? "Perusahaan bayar & daftarkan user"
//             : "Perusahaan bayar sendiri"
//           : "User bayar sendiri",
//     });
//   } catch (err) {
//     console.error("❌ Gagal buat payment:", err);
//     return NextResponse.json({ error: "Gagal buat payment" }, { status: 500 });
//   }
// }
// pages/api/payment/start.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";
const TRIPAY_API_KEY = process.env.TRIPAY_API_KEY;
const TRIPAY_MERCHANT_CODE = process.env.TRIPAY_MERCHANT_CODE;
const TRIPAY_PRIVATE_KEY = process.env.TRIPAY_PRIVATE_KEY;
const TRIPAY_CALLBACK_URL = process.env.TRIPAY_CALLBACK_URL;

export async function POST(req: NextRequest) {
  try {
    // Ambil semua input sekaligus
    const { testTypeId, quantity = 1, userId: targetUserId, method = "BRIVA", guestToken } = await req.json();
        console.log("DEBUG method from client:", method);


    // ----------------------
    // 1️⃣ Cek guest token CPMI
    // ----------------------
    let userId: number | undefined;
    let role: "USER" | "PERUSAHAAN" | "GUEST" | undefined;

    if (guestToken) {
      const tokenData = await prisma.token.findUnique({
        where: { token: guestToken },
        include: { User: true },
      });

      if (!tokenData || !tokenData.userId || !tokenData.User) {
        return NextResponse.json({ error: "Guest token tidak valid" }, { status: 401 });
      }

      userId = tokenData.userId;
      role = "GUEST";

       // ❌ Cek apakah attempt untuk user + testType sudah ada
  const existingAttempt = await prisma.testAttempt.findFirst({
    where: {
      userId,
      testTypeId,
    },
  });

  if (existingAttempt) {
    return NextResponse.json({
      success: true,
      startTest: true,
      attempt: existingAttempt,
      message: "Sudah ada attempt untuk user ini",
    });
  }


      // ===== Buat attempt langsung untuk guest =====
    const attempt = await prisma.testAttempt.create({
  data: {
    userId,
    testTypeId,
    tokenId: tokenData.id,
    status: "RESERVED",           // ✅ benar
    companyId: tokenData.User.companyId || null, // ← ini penting

    
  },
});

      // Tandai token sebagai sudah dipakai (opsional)
      await prisma.token.update({
        where: { id: tokenData.id },
        data: { used: true, usedAt: new Date() },
      });

      return NextResponse.json({
        success: true,
        startTest: true,
        attempt,
        message: "Guest token valid, langsung mulai test",
      });
    }

    // ===== Bagian user/perusahaan tetap sama =====
    if (!testTypeId) return NextResponse.json({ error: "testTypeId wajib" }, { status: 400 });

    const cookie = req.headers.get("cookie");
    const token = cookie?.split("; ").find((c) => c.startsWith("token="))?.split("=")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };
    if (decoded.role === "GUEST") return NextResponse.json({ error: "Role GUEST tidak bisa bayar" }, { status: 403 });

    const test = await prisma.testType.findUnique({ where: { id: Number(testTypeId) } });
    if (!test) return NextResponse.json({ error: "Tes tidak ditemukan" }, { status: 404 });

   // const totalAmount = (test.price || 0) * quantity;
 // Ambil harga default dari TestType
// ✅ Ambil harga dasar dari TestType
const basePrice = test.price ?? 0;

// Variabel final
let finalPrice = basePrice;

// Jika perusahaan
if (decoded.role === "PERUSAHAAN") {
  const companyPricing = await prisma.companyPricing.findFirst({
    where: { companyId: decoded.id, testTypeId: test.id },
  });

  if (companyPricing?.customPrice != null) {
    finalPrice = companyPricing.customPrice;
  }

  if (companyPricing?.discountNominal != null) {
    // hanya hitung diskon jika nominal > 0, tapi jika 0 tetap pakai harga asli
    finalPrice = Math.round(finalPrice - (finalPrice * companyPricing.discountNominal) / 100);
    if (finalPrice < 0) finalPrice = basePrice; // safety, jangan sampai < 0
  }
} else {
  // user biasa
  if (test.priceDiscount != null) {
    finalPrice = test.priceDiscount > 0 ? test.priceDiscount : basePrice;
  } else if (test.percentDiscount != null) {
    finalPrice = test.percentDiscount > 0 
      ? Math.round(basePrice - (basePrice * test.percentDiscount) / 100) 
      : basePrice;
  }
}

// Safety terakhir: jangan sampai finalPrice < 0 atau 0
if (!finalPrice || finalPrice <= 0) finalPrice = basePrice;



// ✅ Total harga akhir
const totalAmount = finalPrice * quantity;


//const totalAmount = finalPrice * quantity;


    const finalUserId = decoded.role === "PERUSAHAAN" && targetUserId ? targetUserId : decoded.id;

    const existingPayment = await prisma.payment.findFirst({
      where: {
        testTypeId: Number(testTypeId),
        userId: finalUserId,
        status: "SUCCESS",
        attempts: { none: {} },
      },
      orderBy: { createdAt: "desc" },
    });

    if (existingPayment) {
      
      const finalUser = await prisma.user.findUnique({
  where: { id: finalUserId },
});

const attempt = await prisma.testAttempt.create({
  data: {
    userId: finalUserId,
    testTypeId: test.id,
    paymentId: existingPayment.id,
    companyId: finalUser?.companyId 
      ? finalUser.companyId 
      : decoded.role === "PERUSAHAAN" 
        ? decoded.id 
        : null,
    status: "RESERVED",       // ✅ tandai reserved dulu
  },
});


      return NextResponse.json({
        success: true,
        payment: existingPayment,
        attempt,
        message: "Sudah bayar, langsung mulai test",
        startTest: true,
      });
    }

    let companyPricingRecord = null;

if (decoded.role === "PERUSAHAAN") {
  companyPricingRecord = await prisma.companyPricing.findFirst({
    where: { companyId: decoded.id, testTypeId: test.id },
    select: { id: true },
  });
}
    const payment = await prisma.payment.create({
      data: {
        testTypeId: test.id,
        amount: totalAmount,
        status: totalAmount === 0 ? "FREE" : "PENDING",
        userId: finalUserId,
        companyId: decoded.role === "PERUSAHAAN" ? decoded.id : null,
        companyPricingId: companyPricingRecord?.id ?? null, // ✅ tambahkan ini
        quantity,
        method,
      },
    });

    if (totalAmount === 0) {
     const finalUser = await prisma.user.findUnique({
  where: { id: finalUserId },
});

const attempt = await prisma.testAttempt.create({
  data: {
    userId: finalUserId,
    testTypeId: test.id,
    paymentId: payment.id,
    companyId: finalUser?.companyId 
      ? finalUser.companyId 
      : decoded.role === "PERUSAHAAN" 
        ? decoded.id 
        : null,
    status: "RESERVED",           // ✅ benar
  },
});

      await prisma.payment.update({ where: { id: payment.id }, data: { status: "SUCCESS" } });
      return NextResponse.json({ success: true, payment, attempt, startTest: true, reason: "FREE" });
    }

    const user = await prisma.user.findUnique({ where: { id: finalUserId } });
    if (!TRIPAY_API_KEY || !TRIPAY_MERCHANT_CODE || !TRIPAY_PRIVATE_KEY) {
      throw new Error("Tripay credentials tidak lengkap di environment variables");
    }

    const merchantRef = `PSY-${payment.id}-${Date.now()}`;
    const signature = crypto
      .createHmac("sha256", TRIPAY_PRIVATE_KEY)
      .update(`${TRIPAY_MERCHANT_CODE}${merchantRef}${totalAmount}`)
      .digest("hex");

    const payload: any = {
      method,
      merchant_ref: merchantRef,
      amount: totalAmount,
      customer_name: user?.fullName || `User ${finalUserId}`,
      customer_email: user?.email || "no-reply@example.com",
      customer_phone: user?.phone || "081234567890",
     // order_items: [{ sku: `TEST-${test.id}`, name: test.name, price: test.price || 0, quantity }],
order_items: [
  {
    sku: `TEST-${test.id}`,
    name: test.name,
    price: finalPrice, // ✅ harga setelah diskon
    quantity,
  },
],

      return_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/payment/return`,
      expired_time: Math.floor(Date.now() / 1000) + 3600,
      signature,
    };

    if (TRIPAY_CALLBACK_URL) payload.callback_url = TRIPAY_CALLBACK_URL;

    const response = await fetch("https://tripay.co.id/api/transaction/create", {
      method: "POST",
      headers: { Authorization: `Bearer ${TRIPAY_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data: any = await response.json();

    if (!data.success || !data.data) {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED", payload: data } });
      return NextResponse.json({ error: data.message || "Payment gateway error", details: data }, { status: 400 });
    }

    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: { reference: data.data.reference, paymentUrl: data.data.checkout_url, payload: data, status: "PENDING" },
    });

    return NextResponse.json({
      success: true,
      payment: updated,
      paymentUrl: data.data.checkout_url,
      reference: data.data.reference,
    });

  } catch (err: any) {
    console.error("❌ Error di payment/start:", err);
    return NextResponse.json({ error: "Gagal membuat pembayaran", message: err.message }, { status: 500 });
  }
}

// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import bcrypt from "bcrypt";
// import { logActivity } from "@/lib/logger";

// export async function POST(req: Request) {
//   try {
//     const { email, newPassword } = await req.json();
//     const ipAddress =
//       req.headers.get("x-forwarded-for") || "unknown";
//     const userAgent =
//       req.headers.get("user-agent") || "unknown";

//     if (!email || !newPassword) {
//        await logActivity({
//         action: "UPDATE",
//         resource: "user",
//         description: "Gagal reset password (input tidak lengkap)",
//         ipAddress,
//         userAgent,
//         endpoint: "/api/reset-password",
//         method: "POST",
//         status: "FAILED",
//         severity: "MEDIUM",
//         isSuspicious: true,
//       });
//       return NextResponse.json({ error: "Email dan password baru wajib diisi." }, { status: 400 });
//     }

//     const user = await prisma.user.findUnique({ where: { email } });

//     if (!user) {
//        await logActivity({
//         action: "UPDATE",
//         resource: "user",
//         description: `Gagal reset password (email tidak ditemukan: ${email})`,
//         ipAddress,
//         userAgent,
//         endpoint: "/api/reset-password",
//         method: "POST",
//         status: "FAILED",
//         severity: "HIGH",
//         isSuspicious: true,
//       });
//       return NextResponse.json({ error: "Email tidak ditemukan." }, { status: 404 });
//     }

//     const hashed = await bcrypt.hash(newPassword, 10);

//     await prisma.user.update({
//       where: { email },
//       data: { password: hashed },
//     });
//  // ✅ LOG SUCCESS (TANPA PASSWORD)
//     await logActivity({
//       userId: user.id,
//       role: user.role,
//       action: "UPDATE",
//       resource: "user",
//       resourceId: String(user.id),
//       description: "User melakukan reset password",
//       ipAddress,
//       userAgent,
//       endpoint: "/api/reset-password",
//       method: "POST",
//       status: "SUCCESS",
//       severity: "LOW",
//     });
//     return NextResponse.json({ success: true, message: "Password berhasil direset." });
//   } catch (e) {
//     console.error(e);
//         await logActivity({
//       action: "UPDATE",
//       resource: "user",
//       description: "Error saat reset password",
//       endpoint: "/api/reset-password",
//       method: "POST",
//       status: "FAILED",
//       severity: "HIGH",
//       isSuspicious: true,
//     });
//     return NextResponse.json({ error: "Server error." }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { logActivity } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();

    const ipAddress =
      req.headers.get("x-forwarded-for") || "unknown";
    const userAgent =
      req.headers.get("user-agent") || "unknown";

    if (!email || !otp || !newPassword) {
      await logActivity({
        action: "UPDATE",
        resource: "user",
        description: "Gagal reset password (input tidak lengkap)",
        ipAddress,
        userAgent,
        endpoint: "/api/reset-password",
        method: "POST",
        status: "FAILED",
        severity: "MEDIUM",
        isSuspicious: true,
      });

      return NextResponse.json(
        { error: "Email, OTP, dan password wajib diisi." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      await logActivity({
        action: "UPDATE",
        resource: "user",
        resourceId: email,
        description: `Gagal reset password (email tidak ditemukan: ${email})`,
        ipAddress,
        userAgent,
        endpoint: "/api/reset-password",
        method: "POST",
        status: "FAILED",
        severity: "HIGH",
        isSuspicious: true,
      });

      return NextResponse.json(
        { error: "Email tidak ditemukan." },
        { status: 404 }
      );
    }

    // 🔥 CEK OTP
    const record = await prisma.passwordReset.findFirst({
      where: { email, otp },
    });

    if (!record) {
      await logActivity({
        userId: user.id,
        action: "UPDATE",
        resource: "user",
        role: user.role,
        resourceId: String(user.id),
        description: "Gagal reset password (OTP salah)",
        ipAddress,
        userAgent,
        endpoint: "/api/reset-password",
        method: "POST",
        status: "FAILED",
        severity: "HIGH",
        isSuspicious: true,
      });

      return NextResponse.json(
        { error: "OTP salah" },
        { status: 400 }
      );
    }

    // ⏰ CEK EXPIRED
  if (record.expiresAt < new Date()) {
  await logActivity({
    userId: user.id,
    action: "UPDATE",
    resource: "user",
    role: user.role,
    resourceId: String(user.id),
    description: "Gagal reset password (OTP expired)",
    ipAddress,
    userAgent,
    endpoint: "/api/reset-password",
    method: "POST",
    status: "FAILED",
    severity: "MEDIUM",
    isSuspicious: true,
  });

  return NextResponse.json(
    { error: "OTP sudah expired" },
    { status: 400 }
  );
}

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashed },
    });

    // 🧹 HAPUS OTP (biar sekali pakai)
    await prisma.passwordReset.deleteMany({
      where: { email },
    });

    await logActivity({
      userId: user.id,
      role: user.role,
      action: "UPDATE",
      resource: "user",
      resourceId: String(user.id),
      description: "User reset password menggunakan OTP",
      ipAddress,
      userAgent,
      endpoint: "/api/reset-password",
      method: "POST",
      status: "SUCCESS",
      severity: "LOW",
    });

    return NextResponse.json({
      success: true,
      message: "Password berhasil direset.",
    });

  } catch (e) {
    console.error(e);

    await logActivity({
      action: "UPDATE",
      resource: "user",
      description: "Error saat reset password",
      endpoint: "/api/reset-password",
      method: "POST",
      status: "FAILED",
      severity: "HIGH",
      isSuspicious: true,
    });

    return NextResponse.json(
      { error: "Server error." },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { logActivity } from "@/lib/logger";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";


export async function POST(req: Request) {
  const ip =
  req.headers.get("x-forwarded-for")?.split(",")[0] ||
  req.headers.get("x-real-ip") ||
  "unknown";
const userAgent = req.headers.get("user-agent") || "unknown";
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      await logActivity({
        action: "LOGIN",
        endpoint: "/api/auth/login",
        method: "POST",
        ipAddress: ip,
        userAgent,
        status: "FAILED",
        severity: "MEDIUM",
        isSuspicious: true,
        description: "Login gagal (email tidak ditemukan)",
      });

      return NextResponse.json({ error: "Email tidak ditemukan" }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
   if (!isPasswordValid) {
  await logActivity({
    userId: user.id,
    role: user.role,
    action: "LOGIN",
    endpoint: "/api/auth/login",
    method: "POST",
    ipAddress: ip,
    userAgent,
    status: "FAILED",
    severity: "HIGH",
    isSuspicious: true,
    description: "Password salah",
  });

  return NextResponse.json({ error: "Password salah" }, { status: 401 });
}
     // ✅ SUCCESS LOGIN
    await logActivity({
      userId: user.id,
      role: user.role,
      action: "LOGIN",
      endpoint: "/api/auth/login",
      method: "POST",
      ipAddress: ip,
      userAgent,
      status: "SUCCESS",
      severity: "LOW",
       description: "Login berhasil",
    });

    // Buat token JWT
const token = jwt.sign(
  { 
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    birthDate: user.birthDate?.toISOString(),
    profileImage: user.profileImage,

    // ✅ tambahkan ini
    tokenVersion: user.tokenVersion
  },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Simpan di cookie HttpOnly
    const res = NextResponse.json({
      message: "Login berhasil",
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        birthDate: user.birthDate,
        role: user.role,
      },
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 hari
    });

    return res;
  // } catch (err) {
  //   console.error("Login error:", err);
    
  //   return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  // }
  } catch (err: any) {
  console.error("Login error:", err);

  await logActivity({
    action: "LOGIN",
    endpoint: "/api/auth/login",
    method: "POST",
    ipAddress: ip,
    userAgent,
    status: "FAILED",
    severity: "HIGH",
    isSuspicious: true,
    description: "Server error: " + err.message,
  });

  return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
}
}


//sebelum
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";

// const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

// export async function POST(req: Request) {
//   try {
//     const { email, password } = await req.json();

//     const user = await prisma.user.findUnique({ where: { email } });
//     if (!user) {
//       return NextResponse.json({ error: "Email tidak ditemukan" }, { status: 401 });
//     }

//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return NextResponse.json({ error: "Password salah" }, { status: 401 });
//     }

//     // Buat token JWT
//     const token = jwt.sign(
//       { id: user.id, email: user.email, fullName: user.fullName, role: user.role, birthDate: user.birthDate?.toISOString(),
//     profileImage: user.profileImage },
//       JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     // Simpan di cookie HttpOnly
//     const res = NextResponse.json({
//       message: "Login berhasil",
//       user: {
//         id: user.id,
//         email: user.email,
//         fullName: user.fullName,
//         birthDate: user.birthDate,
//         role: user.role,
//       },
//     });

//     res.cookies.set("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       path: "/",
//       maxAge: 60 * 60 * 24, // 1 hari
//     });

//     return res;
//   } catch (err) {
//     console.error("Login error:", err);
//     return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
//   }
// }

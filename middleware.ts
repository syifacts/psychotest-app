import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

// Halaman publik dan halaman test yang boleh diakses guest
const publicPaths = [
  "/",
  "/login",
  "/register",
  "/api/report/view",
  "/api/user"
];

// Halaman test yang bisa diakses guest tanpa login
const guestTestPaths = ["/tes"];

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const path = url.pathname;

  const authToken = req.cookies.get("token")?.value;
  const testToken = url.searchParams.get("token");

  // 🚫 Jika path butuh login tapi tidak ada authToken
  const protectedPaths = ["/admin", "/psikolog", "/company", "/account"];
  if (protectedPaths.some(p => path.startsWith(p)) && !authToken) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  
  // 1️⃣ Jika ada JWT login
  if (authToken) {
    try {
    const decoded = jwt.verify(authToken, JWT_SECRET) as {
  id: number;
  role: string;
  tokenVersion: number;
};
      const user = await prisma.user.findUnique({
  where: { id: decoded.id },
  select: {
    tokenVersion: true,
    role: true,
  },
});

if (!user || user.tokenVersion !== decoded.tokenVersion) {
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

      // Redirect user yang sudah login jika buka login/register
      if (path === "/login" || path === "/register") {
        switch (decoded.role) {
          case "SUPERADMIN":
            url.pathname = "/admin";
            break;
          case "PSIKOLOG":
            url.pathname = "/psikolog/dashboard";
            break;
          case "PERUSAHAAN":
            url.pathname = "/company/dashboard";
            break;
          default:
            url.pathname = "/dashboard";
        }
        return NextResponse.redirect(url);
      }

      // Proteksi role-based
      if (path.startsWith("/admin") && decoded.role !== "SUPERADMIN") {
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
      if (path.startsWith("/psikolog") && decoded.role !== "PSIKOLOG") {
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
      if (path.startsWith("/company") && decoded.role !== "PERUSAHAAN") {
        url.pathname = "/";
        return NextResponse.redirect(url);
      }

      return NextResponse.next();
    } catch (err) {
      // invalid JWT → lanjut cek guest
    }
  }

  // 2️⃣ Jika ada token test dari query param
  if (testToken) {
    const valid = await prisma.token.findUnique({ where: { token: testToken } });
    if (valid) return NextResponse.next();
  }

  // 3️⃣ Guest akses halaman test
  if (guestTestPaths.some(p => path.startsWith(p))) {
    return NextResponse.next();
  }
  // 🚫 Blokir akses guest ke halaman /account
if (path.startsWith("/account")) {
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

  // 4️⃣ Halaman publik lain
  if (publicPaths.includes(path) || publicPaths.some(p => path.startsWith(p))) {
    return NextResponse.next();
  }

  // 5️⃣ Semua halaman lain → redirect ke login
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/psikolog/:path*",
    "/company/:path*",
    "/account/:path*",
    "/tes/:path*",
    "/login",
    "/register",
    "/",
  ],
  runtime: "nodejs",
};
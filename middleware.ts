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

  // 1️⃣ Jika ada JWT login
  if (authToken) {
    try {
      const decoded = jwt.verify(authToken, JWT_SECRET) as { role: string };

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

  // 4️⃣ Halaman publik lain
  if (publicPaths.includes(path) || publicPaths.some(p => path.startsWith(p))) {
    return NextResponse.next();
  }

  // 5️⃣ Semua halaman lain → redirect ke login
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|static|favicon.ico).*)"],
  runtime: "nodejs",
};

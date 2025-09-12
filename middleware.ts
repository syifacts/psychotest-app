import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

// Halaman publik
const publicPaths = ["/", "/login", "/register", "/api/report/view", "/api/user"];

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const path = url.pathname;

  // Ambil token dari cookie
  const token = req.cookies.get("token")?.value;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { role: string };

      // Redirect user yang sudah login jika membuka login/register
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

      // Proteksi halaman role-based
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

      // Semua halaman lain bisa diakses
      return NextResponse.next();
    } catch (err) {
      // Token tidak valid → redirect ke login
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // Token tidak ada → hanya boleh akses halaman publik
  if (publicPaths.includes(path)) {
    return NextResponse.next();
  }
  if (publicPaths.some(publicPath => path.startsWith(publicPath))) {
  return NextResponse.next();
}


  // Bukan halaman publik → redirect ke login
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|static|favicon.ico).*)"],
  runtime: "nodejs",
};

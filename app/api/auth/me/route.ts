import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    let token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      const cookieHeader = req.headers.get("cookie") || "";
      token = cookieHeader.split("; ").find(c => c.startsWith("token="))?.split("=")[1];
    }
    if (!token) token = url.searchParams.get("token") ?? undefined;

    console.log("Token yang dipakai:", token);

    // 1️⃣ Token test di DB
    if (token) {
      const testToken = await prisma.token.findUnique({ where: { token } });
      if (testToken) return NextResponse.json({ user: { id: testToken.userId, role: "GUEST" } });

      // 2️⃣ JWT login
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        return NextResponse.json({ user: decoded });
      } catch (err) {
        console.log("JWT invalid:", err);
      }
    }

    // 3️⃣ Guest → bisa akses tanpa token
    console.log("Guest akses API tanpa token");
    return NextResponse.json({ user: { role: "GUEST" } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}

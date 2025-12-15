import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

export async function GET(req: Request) {
  try {
    let token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      const cookieHeader = req.headers.get("cookie") || "";
      token = cookieHeader.split("; ").find(c => c.startsWith("token="))?.split("=")[1];
    }
    if (!token) return NextResponse.json({ user: { role: "GUEST" } });

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userFromDB = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, fullName: true }
    });
    if (!userFromDB) return NextResponse.json({ user: { role: "GUEST" } });

    return NextResponse.json({ user: userFromDB });
  } catch (err) {
    console.error("JWT invalid atau error:", err);
    return NextResponse.json({ user: { role: "GUEST" } });
  }
}

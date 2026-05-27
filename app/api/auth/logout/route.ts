import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

export async function POST(req: Request) {
  try {
    const token =
      req.headers
        .get("cookie")
        ?.split("; ")
        .find((c) => c.startsWith("token="))
        ?.split("=")[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      if (decoded.id) {
        // ✅ increment tokenVersion
        await prisma.user.update({
          where: {
            id: decoded.id,
          },
          data: {
            tokenVersion: {
              increment: 1,
            },
          },
        });
      }
    }

    const res = NextResponse.json({
      message: "Logged out",
    });

    res.cookies.set("token", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });

    return res;
  } catch (err) {
    return NextResponse.json(
      { error: "Logout gagal" },
      { status: 500 }
    );
  }
}
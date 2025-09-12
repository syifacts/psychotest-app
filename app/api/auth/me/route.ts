import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie");
    const token = cookie
      ?.split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

      console.log("Token dari headers:", token);


    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
      fullName: string;
      role: string;
      birthDate: string;
      profileImage: string;
    };
    console.log("Decoded JWT:", decoded);


    return NextResponse.json({ user: decoded });
  } catch (err) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}

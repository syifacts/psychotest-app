import { NextApiRequest } from "next";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "psychotestweb"; // ganti dengan env variable

interface Session {
  user: {
    id: number;
    email: string;
    role?: string;
  };
}

/**
 * Ambil session user dari request API
 */
export async function getSession(req: NextApiRequest): Promise<Session | null> {
  try {
    const token = req.cookies["token"]; // pastikan nama cookie sama seperti login
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as Session;
    return decoded;
  } catch (err) {
    console.error("Gagal mengambil session:", err);
    return null;
  }
}

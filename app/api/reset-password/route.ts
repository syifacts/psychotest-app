import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  const { email, otp, newPassword } = await req.json();

  const record = await prisma.passwordReset.findFirst({
    where: { email, otp },
  });

  if (!record) {
    return Response.json({ error: "OTP salah" }, { status: 400 });
  }

  if (record.expiresAt < new Date()) {
    return Response.json({ error: "OTP expired" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email },
    data: { password: hashed },
  });

  // hapus OTP setelah dipakai
  await prisma.passwordReset.deleteMany({
    where: { email },
  });

  return Response.json({ success: true });
}
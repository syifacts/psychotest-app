import { prisma } from "@/lib/prisma";
import { transporter } from "@/lib/mailer";

export async function POST(req: Request) {
  const { email } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return Response.json({ error: "Email tidak ditemukan" }, { status: 404 });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await prisma.passwordReset.deleteMany({
    where: { email },
  });

  await prisma.passwordReset.create({
    data: {
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  // 🔥 KIRIM EMAIL
  await transporter.sendMail({
    from: `"Psychotest App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "[Psychotest] Kode OTP Reset Password",
    html: `
      <div style="font-family:sans-serif">
        <h2>Reset Password</h2>
        <p>Kode OTP kamu:</p>
        <h1>${otp}</h1>
        <p>Berlaku selama 5 menit.</p>
      </div>
    `,
  });

  return Response.json({ success: true });
}
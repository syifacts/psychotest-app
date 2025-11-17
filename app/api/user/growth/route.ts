import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // Ambil semua user dengan role USER
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    select: { createdAt: true },
  });

  if (!users.length) return NextResponse.json([]);

  // Tentukan range bulan
  // const firstUser = users.reduce((min, u) => u.createdAt < min ? u.createdAt : min, users[0].createdAt);
  // const lastUser = users.reduce((max, u) => u.createdAt > max ? u.createdAt : max, users[0].createdAt);
  // Tentukan range bulan
const firstUser = users.reduce(
  (min: Date, u: { createdAt: Date }) =>
    u.createdAt < min ? u.createdAt : min,
  users[0].createdAt
);

const lastUser = users.reduce(
  (max: Date, u: { createdAt: Date }) =>
    u.createdAt > max ? u.createdAt : max,
  users[0].createdAt
);


  const months: Record<string, number> = {};
  for (let d = new Date(firstUser.getFullYear(), firstUser.getMonth(), 1); d <= lastUser; d.setMonth(d.getMonth() + 1)) {
    const key = d.toISOString().slice(0, 7);
    months[key] = 0;
  }

  users.forEach(u => {
    const month = u.createdAt.toISOString().slice(0, 7);
    months[month] = (months[month] || 0) + 1;
  });

  const data = Object.entries(months).map(([month, newUsers]) => ({ month, newUsers }));

  return NextResponse.json(data);
}

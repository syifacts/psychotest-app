import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // ambil semua user
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        companyId: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // ambil semua perusahaan
    const companies = await prisma.user.findMany({
      where: { role: "PERUSAHAAN" },
      select: { id: true, fullName: true },
    });

    const companyMap = new Map(companies.map(c => [c.id, c.fullName]));

    const result = users.map(u => ({
      ...u,
      companyName: u.companyId ? companyMap.get(u.companyId) : null,
    }));

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to fetch users" }), { status: 500 });
  }
}

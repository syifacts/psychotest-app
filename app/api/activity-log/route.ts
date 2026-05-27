import { prisma } from "@/lib/prisma";

export async function GET() {
  const logs = await prisma.activityLog.findMany({
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },

    take: 1000,
  });

  return Response.json(logs);
}
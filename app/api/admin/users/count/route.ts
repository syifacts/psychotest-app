import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const validRoles = ["USER", "PSIKOLOG", "PERUSAHAAN", "SUPERADMIN"] as const;
type Role = (typeof validRoles)[number];

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const roleParam = url.searchParams.get("role");

    if (!roleParam || !validRoles.includes(roleParam as Role)) {
      return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });
    }

    const role = roleParam as Role;

    const count = await prisma.user.count({ where: { role } });

    return NextResponse.json({ count });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

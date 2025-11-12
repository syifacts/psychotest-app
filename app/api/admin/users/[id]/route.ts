// import { prisma } from "@/lib/prisma";
// import { NextRequest, NextResponse } from "next/server";

// export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const id = parseInt(params.id);

//     const user = await prisma.user.delete({
//       where: { id },
//     });

//     return NextResponse.json({ success: true, user });
//   } catch (err: any) {
//     console.error(err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params; // ⬅️ perhatikan: pakai await
    const user = await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

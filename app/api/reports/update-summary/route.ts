// pages/api/reports/update-summary.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { attemptId, kesimpulan, ttd } = await req.json();

    if (!attemptId) {
      return NextResponse.json({ error: "attemptId is required" }, { status: 400 });
    }

    const result = await prisma.result.findFirst({
      where: { attemptId: Number(attemptId) },
    });

    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    // Update kesimpulan & TTD tanpa mengubah status validasi atau barcode
    const updated = await prisma.result.update({
      where: { id: result.id },
      data: {
        kesimpulan: kesimpulan ?? result.kesimpulan,
        ttd: ttd ?? result.ttd,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Revisi kesimpulan & TTD berhasil disimpan",
      updated,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}

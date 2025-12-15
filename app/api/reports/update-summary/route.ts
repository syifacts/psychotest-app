// pages/api/reports/update-summary.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
interface UpdateSummaryBody {
  attemptId: number;
  kesimpulan?: string;
  kesimpulanSikap?: string;
  kesimpulanKepribadian?: string;
  kesimpulanBelajar?: string;
  ttd?: string;
  saranpengembangan?: string;
  kesimpulanumum?: string;
  rekomendasi?: string;
  layak?: boolean;
  belumLayak?: boolean;
  tidakLayak?: boolean;
}

const body: UpdateSummaryBody = await req.json();
const { attemptId, kesimpulan, kesimpulanSikap, kesimpulanKepribadian, kesimpulanBelajar, ttd, rekomendasi, layak, belumLayak, tidakLayak } = body;


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
        kesimpulanSikap: kesimpulanSikap ?? result.kesimpulanSikap,
        kesimpulanKepribadian: kesimpulanKepribadian ?? result.kesimpulanKepribadian,
        kesimpulanBelajar: kesimpulanBelajar ?? result.kesimpulanBelajar,
        ttd: ttd ?? result.ttd,
        saranpengembangan: body.saranpengembangan ?? result.saranpengembangan,
        kesimpulanumum: body.kesimpulanumum ?? result.kesimpulanumum,
        rekomendasi: rekomendasi ?? result.rekomendasi,
    layak: layak ?? result.layak,
    belumLayak: belumLayak ?? result.belumLayak,
    tidakLayak: tidakLayak ?? result.tidakLayak,

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

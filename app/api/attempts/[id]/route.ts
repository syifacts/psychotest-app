// app/api/attempts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const attemptId = Number(params.id);
    if (!attemptId) {
      return NextResponse.json({ error: "Invalid attempt ID" }, { status: 400 });
    }

    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        User: true,
        TestType: true,
        subtestResults: { include: { SubTest: true } },
        results: {
          include: { 
            summaryTemplate: true,
            ValidatedBy: true,   // ✅ ambil data psikolog yang validasi
          },
          orderBy: { id: "desc" },
        },
        answers: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // SubtestResults
    const subtestResults = attempt.subtestResults.map((s) => ({
      ...s,
      rw: s.rw ?? 0,
      sw: s.sw ?? 0,
      kategori: s.kategori ?? "-",
    }));

    // Ambil IST result terbaru (selain CPMI)
    const istResultRaw = attempt.results.find(r => r.testTypeId !== 30);
    const totalResult = istResultRaw
      ? {
          totalRw: istResultRaw.totalRw ?? 0,
          totalSw: istResultRaw.swIq ?? 0,
          iq: istResultRaw.iq ?? null,
          keteranganiq: istResultRaw.keteranganiq ?? null,
          dominasi: istResultRaw.dominasi ?? null,
          kesimpulan: istResultRaw.kesimpulan 
            ?? istResultRaw.summaryTemplate?.template 
            ?? "-",
          ttd: istResultRaw.ttd ?? null,
          ValidatedBy: istResultRaw.ValidatedBy 
            ? {
                fullName: istResultRaw.ValidatedBy.fullName,
                lembagalayanan: istResultRaw.ValidatedBy.lembagalayanan,
              }
            : null,
        }
      : null;

    // Ambil CPMI result terbaru (testTypeId = 30)
    const cpmiResultRaw = attempt.results.find(r => r.testTypeId === 30);
    let cpmiResult = null;
    if (cpmiResultRaw) {
      // Parse aspekSTK
      let aspekSTK: any[] = [];
      try {
        if (Array.isArray(cpmiResultRaw.aspekSTK)) {
          aspekSTK = cpmiResultRaw.aspekSTK;
        } else if (typeof cpmiResultRaw.aspekSTK === "string") {
          aspekSTK = JSON.parse(cpmiResultRaw.aspekSTK);
        }
      } catch (err) {
        console.error("Error parsing aspekSTK:", err);
        aspekSTK = [];
      }

      // Kesimpulan (pakai template + replace nama user)
      let kesimpulan = cpmiResultRaw.kesimpulan 
        ?? cpmiResultRaw.summaryTemplate?.template 
        ?? "-";
      if (attempt.User?.fullName) {
        kesimpulan = kesimpulan.replace(/{name}/g, attempt.User.fullName);
      }

     cpmiResult = {
  id: cpmiResultRaw.id,
  jumlahbenar: cpmiResultRaw.jumlahbenar ?? 0,
  scoreiq: cpmiResultRaw.scoreiq ?? 0,
  kategoriiq: cpmiResultRaw.kategoriiq ?? "-",
  keteranganiqCPMI: cpmiResultRaw.keteranganiqCPMI ?? "-",
  kesimpulan,
  ttd: cpmiResultRaw.ttd ?? null,
  barcode: cpmiResultRaw.barcode ?? null,       // ✅ tambahkan
  expiresAt: cpmiResultRaw.expiresAt ?? null,   // ✅ tambahkan
  aspekSTK,
  ValidatedBy: cpmiResultRaw.ValidatedBy 
    ? {
        fullName: cpmiResultRaw.ValidatedBy.fullName,
        lembagalayanan: cpmiResultRaw.ValidatedBy.lembagalayanan,
      }
    : null,
};

    }

    // TestType fallback
    const testTypeData = {
      id: attempt.TestType?.id,
      name: attempt.TestType?.name || `TEST_${attempt.TestType?.id}`,
      code: attempt.TestType?.id || attempt.TestType?.name || "IST",
    };

    return NextResponse.json({
      attempt: { ...attempt, TestType: testTypeData },
      subtestResults,
      result: totalResult,
      cpmiResult,
    });
  } catch (err: any) {
    console.error("Error in attempts API:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

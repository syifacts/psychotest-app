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
            ValidatedBy: true,
          },
          orderBy: { id: "desc" },
        },
        answers: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // --- SubtestResults
    const subtestResults = attempt.subtestResults.map((s) => ({
      ...s,
      rw: s.rw ?? 0,
      sw: s.sw ?? 0,
      kategori: s.kategori ?? "-",
    }));

    // --- IST result (selain CPMI)
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
          // 🔹 pakai TTD asli dari User
          ttdUrl: attempt.User?.ttdUrl || null,
          ttdHash: attempt.User?.ttdHash || null,
          ValidatedBy: istResultRaw.ValidatedBy 
            ? {
                fullName: istResultRaw.ValidatedBy.fullName,
                lembagalayanan: istResultRaw.ValidatedBy.lembagalayanan,
              }
            : null,
        }
      : null;

    // --- CPMI result (testTypeId = 30)
    const cpmiResultRaw = attempt.results.find(r => r.testTypeId === 30);
    let cpmiResult = null;
    if (cpmiResultRaw) {
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
       // kategoriiq: cpmiResultRaw.kategoriiq ?? "-",
        keteranganiqCPMI: cpmiResultRaw.keteranganiqCPMI ?? "-",
        kesimpulan: cpmiResultRaw.kesimpulan ?? "",
kesimpulanSikap: cpmiResultRaw.kesimpulanSikap ?? "",
kesimpulanKepribadian: cpmiResultRaw.kesimpulanKepribadian ?? "",
kesimpulanBelajar: cpmiResultRaw.kesimpulanBelajar ?? "",

        // 🔹 pakai TTD asli dari User
        ttdUrl: attempt.User?.ttdUrl || null,
        ttdHash: attempt.User?.ttdHash || null,
        // 🔹 barcodeTTD tetap dari result
        barcode: cpmiResultRaw.barcode ?? null,
        barcodettd: cpmiResultRaw.barcodettd ?? null,
        expiresAt: cpmiResultRaw.expiresAt ?? null,
        aspekSTK,
        ValidatedBy: cpmiResultRaw.ValidatedBy
          ? {
              fullName: cpmiResultRaw.ValidatedBy.fullName,
              lembagalayanan: cpmiResultRaw.ValidatedBy.lembagalayanan,
            }
          : null,
      };
    }
    const msdtResultRaw = attempt.results.find(r => r.testTypeId !== 30); // sama seperti istResultRaw

const msdtResult = msdtResultRaw
  ? {
      // Nilai MSDT per tipe
      Ds: msdtResultRaw.Ds ?? 0,
      Mi: msdtResultRaw.Mi ?? 0,
      Au: msdtResultRaw.Au ?? 0,
      Co: msdtResultRaw.Co ?? 0,
      Bu: msdtResultRaw.Bu ?? 0,
      Dv: msdtResultRaw.Dv ?? 0,
      Ba: msdtResultRaw.Ba ?? 0,
      E: msdtResultRaw.E ?? 0,

      // Total Skala
      totalSkalaTO: msdtResultRaw.totalSkalaTO ?? 0,
      totalSkalaRO: msdtResultRaw.totalSkalaRO ?? 0,
      totalSkalaE: msdtResultRaw.totalSkalaE ?? 0,
      totalSkalaO: msdtResultRaw.totalSkalaO ?? 0,

      konversiTO: msdtResultRaw.konversiTO ?? 0,
      konversiE: msdtResultRaw.konversiE ?? 0,
      konversiRO: msdtResultRaw.konversiRO ?? 0,
      konversiO: msdtResultRaw.konversiO ?? 0,

      // Hasil Akhir
      hasilAkhir: msdtResultRaw.hasilAkhir ?? "",

      // Barcode & validasi
      barcodettd: msdtResultRaw.barcodettd ?? "",

      // Bisa juga bawa info tambahan jika perlu
      kesimpulan: msdtResultRaw.kesimpulan ?? msdtResultRaw.summaryTemplate?.template ?? "-",
      ValidatedBy: msdtResultRaw.ValidatedBy
        ? {
            fullName: msdtResultRaw.ValidatedBy.fullName,
            lembagalayanan: msdtResultRaw.ValidatedBy.lembagalayanan,
          }
        : null,
      ttdUrl: attempt.User?.ttdUrl || null,
      ttdHash: attempt.User?.ttdHash || null,
    }
  : null;

    const psikologTTD = attempt.results?.[0]?.ValidatedBy
      ? attempt.results[0].ValidatedBy.ttdUrl
      : attempt.User?.ttdUrl || null;

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
      msdtResult,
      ttd: psikologTTD,
    });
  } catch (err: any) {
    console.error("Error in attempts API:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

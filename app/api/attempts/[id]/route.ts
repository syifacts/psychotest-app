// app/api/attempts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const attemptId = Number(params.id);

    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        User: true,
        TestType: true,
        subtestResults: { include: { SubTest: true } },
        results: {
          include: {
            summaryTemplate: true, // tambahkan biar bisa ambil template kesimpulan
          },
        },
        answers: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // format hasil per subtest
    const subtestResults = attempt.subtestResults.map((s) => ({
      ...s,
      rw: s.rw ?? 0,
      sw: s.sw ?? 0,
      kategori: s.kategori ?? "-",
    }));

    // hasil IST (biar tetap ada)
    const totalResult = attempt.results.length > 0 ? {
      totalRw: attempt.results[0].totalRw ?? 0,
      totalSw: attempt.results[0].swIq ?? 0,
      iq: attempt.results[0].iq ?? null,
      keteranganiq: attempt.results[0].keteranganiq ?? null,
      dominasi: attempt.results[0].dominasi ?? null,
    } : null;

    // hasil CPMI - PERBAIKAN: pastikan data lengkap
    const cpmiResultRaw = attempt.results.find(r => r.testTypeId === 30); // 30 = CPMI
    let cpmiResult = null;
    
    if (cpmiResultRaw) {
      // Parse aspekSTK dengan aman
      let aspekSTK = [];
      try {
        if (Array.isArray(cpmiResultRaw.aspekSTK)) {
          aspekSTK = cpmiResultRaw.aspekSTK;
        } else if (typeof cpmiResultRaw.aspekSTK === 'string') {
          aspekSTK = JSON.parse(cpmiResultRaw.aspekSTK);
        }
      } catch (error) {
        console.error('Error parsing aspekSTK:', error);
        aspekSTK = [];
      }

      // Ambil template kesimpulan
      let kesimpulan = "-";
      if (cpmiResultRaw.summaryTemplate?.template) {
        kesimpulan = cpmiResultRaw.summaryTemplate.template;
        // Replace placeholder {name} jika ada
        if (attempt.User?.fullName) {
          kesimpulan = kesimpulan.replace(/{name}/g, attempt.User.fullName);
        }
      } else if (cpmiResultRaw.keteranganiqCPMI) {
        kesimpulan = cpmiResultRaw.keteranganiqCPMI;
      }

      cpmiResult = {
        id: cpmiResultRaw.id,
        jumlahbenar: cpmiResultRaw.jumlahbenar ?? 0,
        scoreiq: cpmiResultRaw.scoreiq ?? 0,
        kategoriiq: cpmiResultRaw.kategoriiq ?? "-",
        keteranganiqCPMI: cpmiResultRaw.keteranganiqCPMI ?? "-",
        kesimpulan: kesimpulan,
        aspekSTK: aspekSTK,
      };
    }

    // TestType fallback
    const testTypeData = {
      id: attempt.TestType?.id,
      name: attempt.TestType?.name || `TEST_${attempt.TestType?.id}`,
      code: attempt.TestType?.id || attempt.TestType?.name || 'IST',
    };

    console.log('CPMI Result:', cpmiResult); // Debug log

    return NextResponse.json({
      attempt: {
        ...attempt,
        TestType: testTypeData,
      },
      subtestResults,
      result: totalResult,  // tetap ada untuk IST
      cpmiResult,           // hasil CPMI lebih rapi
    });
  } catch (err: any) {
    console.error('Error in attempts API:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
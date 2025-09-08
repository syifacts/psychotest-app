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
        subtestResults: {
          include: { SubTest: true }, // ambil nama subtest
        },
        results: true, // total hasil tes
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

    // ambil hasil total (kalau ada di tabel Result)
    const totalResult = attempt.results.length > 0 ? {
      totalRw: attempt.results[0].totalRw ?? 0,
      totalSw: attempt.results[0].swIq ?? 0,
        iq: attempt.results[0].iq ?? null,
      keteranganiq: attempt.results[0].keteranganiq ?? null,
      dominasi: attempt.results[0].dominasi ?? null,
    } : null;

    return NextResponse.json({
      attempt,
      subtestResults,
      result: totalResult,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

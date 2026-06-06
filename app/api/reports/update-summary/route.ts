import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/logger";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const ipAddress =
    req.headers.get("x-forwarded-for") || "unknown";

  const userAgent =
    req.headers.get("user-agent") || "unknown";

  try {
    const session = getSession(req);

    // 🔒 AUTH CHECK
    if (!session) {
      await logActivity({
        action: "UPDATE",
        resource: "result",
        description: "Akses tanpa login saat update kesimpulan",
        ipAddress,
        userAgent,
        endpoint: "/api/reports/update-summary",
        method: "POST",
        status: "FAILED",
        severity: "HIGH",
        isSuspicious: true,
      });

      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.id;
const role = session.role;
  // 🔒 ROLE CHECK
if (role !== "PSIKOLOG") {
  await logActivity({
    userId,
    role,
    action: "UPDATE",
    resource: "result",
    description: "Akses tidak berhak update kesimpulan",
    ipAddress,
    userAgent,
    endpoint: "/api/reports/update-summary",
    method: "POST",
    status: "FAILED",
    severity: "HIGH",
    isSuspicious: true,
  });

  return NextResponse.json(
    { error: "Forbidden" },
    { status: 403 }
  );
}

    const body = await req.json();
    const {
      attemptId,
      kesimpulan,
      kesimpulanSikap,
      kesimpulanKepribadian,
      kesimpulanBelajar,
      ttd,
      rekomendasi,
      layak,
      belumLayak,
      tidakLayak,
       scoreiq,
    } = body;

    // ❌ VALIDASI INPUT
    if (!attemptId) {
      await logActivity({
        userId: session.id,
        role: session.role,
        action: "UPDATE",
        resource: "result",
        description: "Gagal update (attemptId kosong)",
        ipAddress,
        userAgent,
        endpoint: "/api/reports/update-summary",
        method: "POST",
        status: "FAILED",
        severity: "MEDIUM",
      });

      return NextResponse.json(
        { error: "attemptId is required" },
        { status: 400 }
      );
    }

    const result = await prisma.result.findFirst({
      where: { attemptId: Number(attemptId) },
    });

    // ❌ DATA TIDAK ADA
    if (!result) {
      await logActivity({
        userId: session.id,
        role: session.role,
        action: "UPDATE",
        resource: "result",
        resourceId: String(attemptId),
        description: "Gagal update (result tidak ditemukan)",
        ipAddress,
        userAgent,
        endpoint: "/api/reports/update-summary",
        method: "POST",
        status: "FAILED",
        severity: "HIGH",
        isSuspicious: true,
      });

      return NextResponse.json(
        { error: "Result not found" },
        { status: 404 }
      );
    }

const existingResult = result;

if (
  existingResult.validatedById &&
  existingResult.validatedById !== userId
) {
  await logActivity({
    userId,
    role,
    action: "UPDATE",
    resource: "result",
    resourceId: String(existingResult.id),
    description:
      "Psikolog mencoba mengubah result yang divalidasi psikolog lain",
    ipAddress,
    userAgent,
    endpoint: "/api/reports/update-summary",
    method: "POST",
    status: "FAILED",
    severity: "HIGH",
    isSuspicious: true,
  });

  return NextResponse.json(
    {
      error:
        "Forbidden - kamu bukan psikolog validator data ini",
    },
    { status: 403 }
  );
}



    // ✅ UPDATE
const updated = await prisma.result.update({
  where: { id: result.id },
  data: {
    validatedById: result.validatedById ?? userId,

    kesimpulan: kesimpulan ?? result.kesimpulan,
    kesimpulanSikap: kesimpulanSikap ?? result.kesimpulanSikap,
    kesimpulanKepribadian:
      kesimpulanKepribadian ?? result.kesimpulanKepribadian,
    kesimpulanBelajar:
      kesimpulanBelajar ?? result.kesimpulanBelajar,
    ttd: ttd ?? result.ttd,
    saranpengembangan:
      body.saranpengembangan ?? result.saranpengembangan,
    kesimpulanumum:
      body.kesimpulanumum ?? result.kesimpulanumum,
    rekomendasi: rekomendasi ?? result.rekomendasi,
    layak: layak ?? result.layak,
    belumLayak: belumLayak ?? result.belumLayak,
    tidakLayak: tidakLayak ?? result.tidakLayak,
    scoreiq: scoreiq ?? result.scoreiq,

    // RESET VALIDASI
    validated: false,
    validatedAt: null,

    Signature: null,
    dataHash: null,
    signedHash: null,

    barcode: null,
    barcodettd: null,
    expiresAt: null,

    url: null,
  },
});
    // ✅ LOG SUCCESS
    await logActivity({
      userId: session.id,
      role: session.role,
      action: "UPDATE",
      resource: "result",
      resourceId: String(result.id),
      description: "Psikolog mengubah kesimpulan hasil tes",
      ipAddress,
      userAgent,
      endpoint: "/api/reports/update-summary",
      method: "POST",
      status: "SUCCESS",
      severity: "MEDIUM",
    });

    return NextResponse.json({
      success: true,
      message:
  "Data berhasil diperbarui. Laporan harus divalidasi ulang.",
      updated,
    });

  } catch (err) {
    console.error(err);

    await logActivity({
      action: "UPDATE",
      resource: "result",
      description: "Error saat update kesimpulan",
      ipAddress,
      userAgent,
      endpoint: "/api/reports/update-summary",
      method: "POST",
      status: "FAILED",
      severity: "HIGH",
      isSuspicious: true,
    });

    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 }
    );
  }
}


// // pages/api/reports/update-summary.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { logActivity } from "@/lib/logger";
// import { getSession } from "@/lib/auth";

// export async function POST(req: NextRequest) {
//   const ipAddress =
//   req.headers.get("x-forwarded-for") || "unknown";

// const userAgent =
//   req.headers.get("user-agent") || "unknown";
//   try {
// interface UpdateSummaryBody {
//   attemptId: number;
//   kesimpulan?: string;
//   kesimpulanSikap?: string;
//   kesimpulanKepribadian?: string;
//   kesimpulanBelajar?: string;
//   ttd?: string;
//   saranpengembangan?: string;
//   kesimpulanumum?: string;
//   rekomendasi?: string;
//   layak?: boolean;
//   belumLayak?: boolean;
//   tidakLayak?: boolean;
// }

// const body: UpdateSummaryBody = await req.json();
// const { attemptId, kesimpulan, kesimpulanSikap, kesimpulanKepribadian, kesimpulanBelajar, ttd, rekomendasi, layak, belumLayak, tidakLayak } = body;
// const session = getSession(req);

// if (!session) {
//   await logActivity({
//     action: "UPDATE",
//     resource: "result",
//     description: "Akses tanpa login saat update kesimpulan",
//     ipAddress,
//     userAgent,
//     endpoint: "/api/reports/update-summary",
//     method: "POST",
//     status: "FAILED",
//     severity: "HIGH",
//     isSuspicious: true,
//   });

//   return NextResponse.json(
//     { error: "Unauthorized" },
//     { status: 401 }
//   );
// }

//     if (!attemptId) {
//       return NextResponse.json({ error: "attemptId is required" }, { status: 400 });
//     }

//     const result = await prisma.result.findFirst({
//       where: { attemptId: Number(attemptId) },
//     });

//     if (!result) {
//       return NextResponse.json({ error: "Result not found" }, { status: 404 });
//     }

//     // Update kesimpulan & TTD tanpa mengubah status validasi atau barcode
//      const updated = await prisma.result.update({
//       where: { id: result.id },
//       data: {
//         kesimpulan: kesimpulan ?? result.kesimpulan,
//         kesimpulanSikap: kesimpulanSikap ?? result.kesimpulanSikap,
//         kesimpulanKepribadian: kesimpulanKepribadian ?? result.kesimpulanKepribadian,
//         kesimpulanBelajar: kesimpulanBelajar ?? result.kesimpulanBelajar,
//         ttd: ttd ?? result.ttd,
//         saranpengembangan: body.saranpengembangan ?? result.saranpengembangan,
//         kesimpulanumum: body.kesimpulanumum ?? result.kesimpulanumum,
//         rekomendasi: rekomendasi ?? result.rekomendasi,
//     layak: layak ?? result.layak,
//     belumLayak: belumLayak ?? result.belumLayak,
//     tidakLayak: tidakLayak ?? result.tidakLayak,

//       },
//     });
// await logActivity({
//   userId: session.user.id,
//   role: session.user.role,
//   action: "UPDATE",
//   resource: "result",
//   resourceId: String(result.id),
//   description: "Psikolog mengubah kesimpulan hasil tes",
//   ipAddress,
//   userAgent,
//   endpoint: "/api/reports/update-summary",
//   method: "POST",
//   status: "SUCCESS",
//   severity: "MEDIUM",
// });
//     return NextResponse.json({
//       success: true,
//       message: "Revisi kesimpulan & TTD berhasil disimpan",
//       updated,
//     });
//   } catch (err) {
//     console.error(err);
//     await logActivity({
//   action: "UPDATE",
//   resource: "result",
//   description: "Gagal update kesimpulan",
//   ipAddress,
//   userAgent,
//   endpoint: "/api/reports/update-summary",
//   method: "POST",
//   status: "FAILED",
//   severity: "HIGH",
//   isSuspicious: true,
// });
//     return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
//   }
// }

// // pages/api/reports/update-summary.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export async function POST(req: NextRequest) {
//   try {
// interface UpdateSummaryBody {
//   attemptId: number;
//   kesimpulan?: string;
//   kesimpulanSikap?: string;
//   kesimpulanKepribadian?: string;
//   kesimpulanBelajar?: string;
//   ttd?: string;
//   saranpengembangan?: string;
//   kesimpulanumum?: string;
//   rekomendasi?: string;
//   layak?: boolean;
//   belumLayak?: boolean;
//   tidakLayak?: boolean;
// }

// const body: UpdateSummaryBody = await req.json();
// const { attemptId, kesimpulan, kesimpulanSikap, kesimpulanKepribadian, kesimpulanBelajar, ttd, rekomendasi, layak, belumLayak, tidakLayak } = body;


//     if (!attemptId) {
//       return NextResponse.json({ error: "attemptId is required" }, { status: 400 });
//     }

//     const result = await prisma.result.findFirst({
//       where: { attemptId: Number(attemptId) },
//     });

//     if (!result) {
//       return NextResponse.json({ error: "Result not found" }, { status: 404 });
//     }

//     // Update kesimpulan & TTD tanpa mengubah status validasi atau barcode
//      const updated = await prisma.result.update({
//       where: { id: result.id },
//       data: {
//         kesimpulan: kesimpulan ?? result.kesimpulan,
//         kesimpulanSikap: kesimpulanSikap ?? result.kesimpulanSikap,
//         kesimpulanKepribadian: kesimpulanKepribadian ?? result.kesimpulanKepribadian,
//         kesimpulanBelajar: kesimpulanBelajar ?? result.kesimpulanBelajar,
//         ttd: ttd ?? result.ttd,
//         saranpengembangan: body.saranpengembangan ?? result.saranpengembangan,
//         kesimpulanumum: body.kesimpulanumum ?? result.kesimpulanumum,
//         rekomendasi: rekomendasi ?? result.rekomendasi,
//     layak: layak ?? result.layak,
//     belumLayak: belumLayak ?? result.belumLayak,
//     tidakLayak: tidakLayak ?? result.tidakLayak,

//       },
//     });

//     return NextResponse.json({
//       success: true,
//       message: "Revisi kesimpulan & TTD berhasil disimpan",
//       updated,
//     });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
//   }
// }

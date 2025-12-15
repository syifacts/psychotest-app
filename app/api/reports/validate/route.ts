// pages/api/reports/validate.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";

const JWT_SECRET = process.env.JWT_SECRET!;

async function getLoggedUserId(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;

    const payload: any = jwt.verify(token, JWT_SECRET);
    return payload.id;
  } catch (err) {
    console.error("JWT error:", err);
    return null;
  }
}

// === GET untuk filter reports (Pending & History) ===
export async function GET(req: NextRequest) {
  try {
        const userId = await getLoggedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL(req.url);
    const companyId = url.searchParams.get("companyId");
    const testTypeId = url.searchParams.get("testTypeId");
    const status = url.searchParams.get("status");
    const validatedAt = url.searchParams.get("validatedAt");

    const whereClause: any = { AND: [] };

    // === Filter Perusahaan / Sendiri ===
    if (companyId && companyId !== "all") {
      if (companyId === "self") {
        whereClause.AND.push({
          User: { role: "USER" },
          OR: [
            { Attempt: { PackagePurchase: { is: null }, Payment: { is: null } } },
            { Attempt: { PackagePurchase: { companyId: null } } },
            { Attempt: { Payment: { companyId: null } } },
          ],
        });
      } else {
        const numericCompanyId = Number(companyId);
        if (!isNaN(numericCompanyId)) {
          whereClause.AND.push({
            OR: [
              { Attempt: { PackagePurchase: { companyId: numericCompanyId } } },
              { Attempt: { Payment: { companyId: numericCompanyId } } },
              {
                User: {
                  id: { equals: numericCompanyId },
                  role: "PERUSAHAAN",
                },
              },
            ],
          });
        }
      }
    }

    // Filter Jenis Tes
    if (testTypeId && testTypeId !== "all") {
      const numericTestTypeId = Number(testTypeId);
      if (!isNaN(numericTestTypeId)) {
        whereClause.AND.push({ testTypeId: numericTestTypeId });
      }
    }

   // Filter Status
if (status && status !== "all") {
  if (status === "pending") {
    whereClause.AND.push({ validated: false });
  }
  if (status === "selesai") {
    whereClause.AND.push({
       validatedById: userId,
      OR: [
        { validated: true },
        { Attempt: { status: "FINISHED" } }
      ],
    });
  }
}


    // Filter Tanggal Pemeriksaan (validatedAt)
    if (validatedAt) {
      const start = new Date(validatedAt);
      start.setHours(0, 0, 0, 0);
      const end = new Date(validatedAt);
      end.setHours(23, 59, 59, 999);
      whereClause.AND.push({
        validatedAt: { gte: start, lte: end },
      });
    }

    // === Ambil data dari DB → result
    const results = await prisma.result.findMany({
      where: whereClause.AND.length > 0 ? whereClause : undefined,
      include: {
        User: { select: { id: true, fullName: true, role: true } },
        TestType: { select: { id: true, name: true } },
        Attempt: {
          select: {
            id: true,
            startedAt: true,
            status: true, // tambahkan ini
            PackagePurchase: { select: { company: true } },
            Payment: { select: { company: true } },
          },
        },
        ValidatedBy: {
          select: {
            id: true,
            fullName: true,
            ttdUrl: true,
            ttdHash: true,
             strNumber: true,   // tambahkan
        sippNumber: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // === Ambil data dari DB → personalityResult
    const personalityResults = await prisma.personalityResult.findMany({
      where: whereClause.AND.length > 0 ? whereClause : undefined,
      include: {
        User: { select: { id: true, fullName: true, role: true } },
        TestType: { select: { id: true, name: true } },
        Attempt: {
          select: {
            id: true,
            startedAt: true,
            status: true,
            PackagePurchase: { select: { company: true } },
            Payment: { select: { company: true } },
          },
        },
        ValidatedBy: {
          select: {
            id: true,
            fullName: true,
            ttdUrl: true,
            ttdHash: true,
             strNumber: true,   // tambahkan
        sippNumber: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // === Mapping company fallback (untuk result)
    const mappedResults = results.map((r:any) => {
      let company = null;
      if (r.Attempt?.PackagePurchase?.company) company = r.Attempt.PackagePurchase.company;
      else if (r.Attempt?.Payment?.company) company = r.Attempt.Payment.company;
      else if (r.User.role === "PERUSAHAAN") company = { id: r.User.id, fullName: r.User.fullName };

      return {
        id: r.id,
        User: r.User,
        TestType: r.TestType,
        Attempt: r.Attempt ? { id: r.Attempt.id, startedAt: r.Attempt.startedAt,status: r.Attempt.status ?? null // tambahkan ini
 } : null,
        Company: company,
        validated: r.validated,
        validatedAt: r.validatedAt,
        createdAt: r.createdAt,
        source: "result",
      };
    });

    // === Mapping company fallback (untuk personalityResult)
    const mappedPersonality = personalityResults.map((r:any) => {
      let company = null;
      if (r.Attempt?.PackagePurchase?.company) company = r.Attempt.PackagePurchase.company;
      else if (r.Attempt?.Payment?.company) company = r.Attempt.Payment.company;
      else if (r.User.role === "PERUSAHAAN") company = { id: r.User.id, fullName: r.User.fullName };

      return {
        id: r.id,
        User: r.User,
        TestType: r.TestType,
        Attempt: r.Attempt ? { id: r.Attempt.id, startedAt: r.Attempt.startedAt, status: r.Attempt.status ?? null // tambahkan ini
 } : null,
        Company: company,
        validated: r.validated,
        validatedAt: r.validatedAt,
        createdAt: r.createdAt,
        source: "personalityResult",
      };
    });
// console.log("🔍 Hasil mapping:", mappedResults, mappedPersonality);

    // Gabungkan hasil dan sort by createdAt descending
    const combined = [...mappedResults, ...mappedPersonality];
    const sortedCombined = combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
// console.log("🔍 sortedCombined:", sortedCombined);

    return NextResponse.json(sortedCombined);
  } catch (err) {
    console.error("❌ Gagal ambil reports:", err);
    return NextResponse.json({ error: "Gagal ambil reports" }, { status: 500 });
  }
}

// === POST untuk validasi laporan (result + personalityResult) ===
export async function POST(req: NextRequest) {
  try {
    const { reportId, kesimpulan, source } = await req.json();
    const userId = await getLoggedUserId(req);
    if (!reportId || !userId) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    let result;
    if (source === "personalityResult") {
      result = await prisma.personalityResult.findUnique({
        where: { id: reportId },
        include: {
          User: { select: { id: true, fullName: true, ttdUrl: true, ttdHash: true } },
          ValidatedBy: true,
        },
      });
    } else {
      result = await prisma.result.findUnique({
        where: { id: reportId },
        include: {
          User: { select: { id: true, fullName: true, ttdUrl: true, ttdHash: true,  strNumber: true,   // tambahkan
        sippNumber: true, } },
          ValidatedBy: true,
        },
      });
    }

    if (!result) {
      return NextResponse.json({ error: "Result tidak ditemukan" }, { status: 404 });
    }

    // Generate barcode ID report
    let barcodeId = result.barcode;
    let barcodeURL = barcodeId
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/report/view/${barcodeId}`
      : undefined;

    if (!barcodeId) {
      barcodeId = nanoid(10);
      barcodeURL = `${process.env.NEXT_PUBLIC_BASE_URL}/report/view/${barcodeId}`;
    }

    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);

    // console.log("🔥 validator ttdHash:", result?.ValidatedBy?.ttdHash);
    // console.log("🔥 validator ttdUrl:", result?.ValidatedBy?.ttdUrl);
const validatorUser = await prisma.user.findUnique({
  where: { id: userId },
  select: { ttdHash: true },
});
    // === Generate QR dari ttdHash psikolog ===
let barcodettd: string | null = null;
if (validatorUser?.ttdHash) {
  barcodettd = await QRCode.toDataURL(validatorUser.ttdHash);
  // console.log("✅ Generated barcodettd:", barcodettd.substring(0, 50));
}

    // Update data sesuai source
    let updated;
    if (source === "personalityResult") {
      updated = await prisma.personalityResult.update({
        where: { id: reportId },
        data: {
          validated: true,
          validatedById: result.validated ? result.validatedById : userId,
          validatedAt: result.validated ? result.validatedAt : new Date(),
          kesimpulan: kesimpulan ?? result.kesimpulan,
          barcode: barcodeId,
          barcodettd,
          expiresAt: expiry,
          isCompleted: true,
        },
      });
    } else {
      updated = await prisma.result.update({
        where: { id: reportId },
        data: {
          validated: true,
          validatedById: result.validated ? result.validatedById : userId,
          validatedAt: result.validated ? result.validatedAt : new Date(),
          kesimpulan: kesimpulan ?? result.kesimpulan,
          barcode: barcodeId,
          barcodettd,
          expiresAt: expiry,
          isCompleted: true,
        },
      });
    }

    // console.log("✅ saved barcodettd:", updated.barcodettd?.substring(0, 50));

    // === Tambahkan update testAttempt di sini ===
await prisma.testAttempt.update({
  where: { id: result.attemptId },
  data: {
    status: "FINISHED", // bisa jadi logika lain jika perlu
    finishedAt: new Date(),
    isCompleted: true,
  },
});

    return NextResponse.json({
      success: true,
      barcodeURL,
      barcodeId,
      expiresAt: expiry,
      source,
    });
  } catch (err) {
    console.error("Error validating report:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

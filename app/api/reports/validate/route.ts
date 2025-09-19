// pages/api/reports/validate.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import crypto from "crypto";

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
      if (status === "pending") whereClause.AND.push({ validated: false });
      if (status === "selesai") whereClause.AND.push({ validated: true });
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

    // Ambil data dari DB
   const results = await prisma.result.findMany({
  where: whereClause.AND.length > 0 ? whereClause : undefined,
  include: {
    User: { select: { id: true, fullName: true, role: true } }, // peserta tes
    TestType: { select: { id: true, name: true } },
    Attempt: {
      select: {
        id: true,
        startedAt: true,
        PackagePurchase: { select: { company: true } },
        Payment: { select: { company: true } },
      },
    },
    ValidatedBy: { // 🔹 ambil psikolog validator
      select: {
        id: true,
        fullName: true,
        ttdUrl: true,
        ttdHash: true,
      },
    },
  },
  orderBy: { createdAt: "desc" },
});


    // Mapping company fallback ke User jika role PERUSAHAAN
    const mapped = results.map((r) => {
      let company = null;
      if (r.Attempt?.PackagePurchase?.company) company = r.Attempt.PackagePurchase.company;
      else if (r.Attempt?.Payment?.company) company = r.Attempt.Payment.company;
      else if (r.User.role === "PERUSAHAAN") company = { id: r.User.id, fullName: r.User.fullName };

      return {
        id: r.id,
        User: r.User,
        TestType: r.TestType,
        Attempt: r.Attempt ? { id: r.Attempt.id, startedAt: r.Attempt.startedAt } : null,
        Company: company,
        validated: r.validated,
        validatedAt: r.validatedAt,
      };
    });

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("❌ Gagal ambil reports:", err);
    return NextResponse.json({ error: "Gagal ambil reports" }, { status: 500 });
  }
}

// === POST untuk validasi laporan ===

export async function POST(req: NextRequest) {
  try {
    const { reportId, kesimpulan } = await req.json();
    const userId = await getLoggedUserId(req);
    if (!reportId || !userId) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const result = await prisma.result.findUnique({
      where: { id: reportId },
      include: {
        User: { select: { id: true, fullName: true, ttdUrl: true, ttdHash: true } }, // ✅ ambil TTD asli + hash
        ValidatedBy: true,
      },
    });

    if (!result) return NextResponse.json({ error: "Result tidak ditemukan" }, { status: 404 });

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
console.log("🔥 validator ttdHash:", result?.ValidatedBy?.ttdHash);
console.log("🔥 validator ttdUrl:", result?.ValidatedBy?.ttdUrl);

// === Generate QR dari ttdHash psikolog ===
let barcodettd: string | null = null;
if (result?.ValidatedBy?.ttdHash) {
  barcodettd = await QRCode.toDataURL(result.ValidatedBy.ttdHash.toString());
  console.log("✅ Generated barcodettd:", barcodettd.substring(0, 50));
}
// // === Generate QR dari TTD URL psikolog (bukan hash) ===
// let barcodettd: string | null = null;
// if (result?.ValidatedBy?.ttdUrl) {
//   barcodettd = await QRCode.toDataURL(result.ValidatedBy.ttdUrl.toString());
//   console.log("✅ Generated barcodettd pakai URL:", barcodettd.substring(0, 50));
// }

    // Update result
    const updated = await prisma.result.update({
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

console.log("✅ saved barcodettd:", updated.barcodettd?.substring(0, 50));
    

    return NextResponse.json({
      success: true,
      barcodeURL,
      barcodeId,
      expiresAt: expiry,
    });
  } catch (err) {
    console.error("Error validating report:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// pages/api/reports/validate.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import nacl from "tweetnacl";
import { decodeUTF8, encodeBase64, decodeBase64 } from "tweetnacl-util";
import crypto from "crypto";
import fs from "fs";
import { logActivity } from "@/lib/logger";
import path from "path";
// import puppeteer from "puppeteer";
import pdf from "pdf-parse";

// async function generatePDF(filePath: string, html: string) {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();

//   await page.setContent(html, { waitUntil: "networkidle0" });

//   await page.pdf({
//     path: filePath,
//     format: "A4",
//     printBackground: true, // 🔥 TAMBAHKAN DI SINI
//   });

//   await browser.close();
// }
function stableStringify(obj: any) {
  return JSON.stringify(obj, Object.keys(obj).sort());
}
function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}
// const hash = crypto.createHash("sha256")
//   .update(message)
//   .digest("hex");

// const signature = nacl.sign.detached(
//   decodeUTF8(hash),
//   privateKey
// );

// function signData(data: any, privateKey: Uint8Array) {
//   const message = JSON.stringify(data);

//   const signature = nacl.sign.detached(
//     decodeUTF8(message), // 🔥 langsung message
//     privateKey,
//   );

//   return {
//     message, // ✅ ini yang dipakai,
//     signature: encodeBase64(signature),
//   };
// }

const AES_KEY = Buffer.from(process.env.KEY_ENCRYPTION_SECRET!, "hex");
function signData(data: string, privateKey: Uint8Array) {
  const signature = nacl.sign.detached(decodeUTF8(data), privateKey);

  return {
    message: data,
    signature: encodeBase64(signature),
  };
}
function decryptPrivateKey(encryptedData: string): string {
  const [ivHex, encrypted] = encryptedData.split(":");

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    AES_KEY,
    Buffer.from(ivHex, "hex"),
  );

  let decrypted = decipher.update(encrypted, "hex", "utf8");

  decrypted += decipher.final("utf8");

  return decrypted;
}
function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9]/g, "_");
}
const JWT_SECRET = process.env.JWT_SECRET!;

async function getLoggedUserId(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;

    const payload: any = jwt.verify(token, JWT_SECRET);

    return {
      id: payload.id,
      role: payload.role,
    };
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
            {
              Attempt: { PackagePurchase: { is: null }, Payment: { is: null } },
            },
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
          OR: [{ validated: true }, { Attempt: { status: "FINISHED" } }],
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
        User: {
          select: {
            id: true,
            fullName: true,
            role: true,
            tujuan: true,

            // 🔥 TAMBAHKAN INI
            birthDate: true,
            education: true,
          },
        },
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
            strNumber: true, // tambahkan
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
        User: {
          select: {
            id: true,
            fullName: true,
            role: true,
            tujuan: true,

            // 🔥 TAMBAHKAN INI
            birthDate: true,
            education: true,
          },
        },
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
            strNumber: true, // tambahkan
            sippNumber: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // === Mapping company fallback (untuk result)
    const mappedResults = results.map((r: any) => {
      let company = null;
      if (r.Attempt?.PackagePurchase?.company)
        company = r.Attempt.PackagePurchase.company;
      else if (r.Attempt?.Payment?.company) company = r.Attempt.Payment.company;
      else if (r.User.role === "PERUSAHAAN")
        company = { id: r.User.id, fullName: r.User.fullName };

      return {
        id: r.id,
        User: r.User,
        TestType: r.TestType,
        Attempt: r.Attempt
          ? {
              id: r.Attempt.id,
              startedAt: r.Attempt.startedAt,
              status: r.Attempt.status ?? null, // tambahkan ini
            }
          : null,
        Company: company,
        validated: r.validated,
        validatedAt: r.validatedAt,
        validatedById: r.validatedById,
        createdAt: r.createdAt,
        source: "result",
      };
    });

    // === Mapping company fallback (untuk personalityResult)
    const mappedPersonality = personalityResults.map((r: any) => {
      let company = null;
      if (r.Attempt?.PackagePurchase?.company)
        company = r.Attempt.PackagePurchase.company;
      else if (r.Attempt?.Payment?.company) company = r.Attempt.Payment.company;
      else if (r.User.role === "PERUSAHAAN")
        company = { id: r.User.id, fullName: r.User.fullName };

      return {
        id: r.id,
        User: r.User,
        TestType: r.TestType,
        Attempt: r.Attempt
          ? {
              id: r.Attempt.id,
              startedAt: r.Attempt.startedAt,
              status: r.Attempt.status ?? null, // tambahkan ini
            }
          : null,
        Company: company,
        validated: r.validated,
        validatedAt: r.validatedAt,
        validatedById: r.validatedById,
        createdAt: r.createdAt,
        source: "personalityResult",
      };
    });
    // console.log("🔍 Hasil mapping:", mappedResults, mappedPersonality);

    // Gabungkan hasil dan sort by createdAt descending
    const combined = [...mappedResults, ...mappedPersonality];
    const sortedCombined = combined.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    // console.log("🔍 sortedCombined:", sortedCombined);

    return NextResponse.json(sortedCombined);
  } catch (err) {
    console.error("❌ Gagal ambil reports:", err);
    return NextResponse.json({ error: "Gagal ambil reports" }, { status: 500 });
  }
}

// === POST untuk validasi laporan (result + personalityResult) ===
export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const userAgent = req.headers.get("user-agent") || "unknown";
  try {
    const { reportId, kesimpulan, source } = await req.json();
const authUser = await getLoggedUserId(req);

if (!reportId || !authUser) {
  return NextResponse.json(
    { error: "Data tidak lengkap" },
    { status: 400 },
  );
}

if (authUser.role !== "PSIKOLOG") {
  return NextResponse.json(
    { error: "Forbidden" },
    { status: 403 }
  );
}

const userId = authUser.id;

    const validatorUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        ttdHash: true,
        PrivateKey: true,
        PublicKey: true,
      },
    });
    if (!validatorUser?.PrivateKey) {
      return NextResponse.json(
        { error: "Private key tidak ditemukan" },
        { status: 500 },
      );
    }

    // const privateKeyUint8 = Buffer.from(validatorUser.PrivateKey, "base64");
    const decryptedPrivateKey = decryptPrivateKey(validatorUser.PrivateKey);

    const privateKeyUint8 = Uint8Array.from(
      Buffer.from(decryptedPrivateKey, "base64"),
    );
    let result;
    if (source === "personalityResult") {
      result = await prisma.personalityResult.findUnique({
        where: { id: reportId },
        include: {
          User: {
            select: {
              id: true,
              fullName: true,
              role: true,
              tujuan: true,

              // 🔥 TAMBAHKAN INI
              birthDate: true,
              education: true,
            },
          },
          ValidatedBy: true,
        },
      });
    } else {
      result = await prisma.result.findUnique({
        where: { id: reportId },
        include: {
          User: {
            select: {
              id: true,
              fullName: true,
              role: true,
              tujuan: true,

              // 🔥 TAMBAHKAN INI
              birthDate: true,
              education: true,
            },
          },
          ValidatedBy: true,
        },
      });
    }

    if (!result) {
      await logActivity({
        userId,
        role: "PSIKOLOG",
        action: "VALIDATE",
        resource: "report",
        resourceId: reportId?.toString(),
        endpoint: "/api/reports/validate",
        method: "POST",
        ipAddress: ip,
        userAgent,
        status: "FAILED",
        severity: "MEDIUM",
        isSuspicious: true,
        description: "Report not found",
      });

      return NextResponse.json(
        { error: "Result tidak ditemukan" },
        { status: 404 },
      );
    }
    // hanya psikolog yang membuat validasi yang boleh edit
    if (result.validated) {
      if (!result.validatedById || result.validatedById !== userId) {
        await logActivity({
          userId,
          role: "PSIKOLOG",
          action: "VALIDATE",
          resource: "report",
          resourceId: reportId.toString(),
          endpoint: "/api/reports/validate",
          method: "POST",
          ipAddress: ip,
          userAgent,
          status: "FAILED",
          severity: "HIGH",
          isSuspicious: true,
          description: "Unauthorized validation (different psychologist)",
        });
        return NextResponse.json(
          { error: "Anda tidak berhak mengubah hasil validasi psikolog lain." },
          { status: 403 },
        );
      }
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
    // === Generate QR dari ttdHash psikolog ===
    let barcodettd: string | null = null;
    if (validatorUser?.ttdHash) {
      barcodettd = await QRCode.toDataURL(validatorUser.ttdHash);
      // console.log("✅ Generated barcodettd:", barcodettd.substring(0, 50));
    }
    // const pdfContent = JSON.stringify({
    //   userId: result.userId,
    //   testTypeId: result.testTypeId,
    //   createdAt: result.createdAt,

    //   kesimpulan: kesimpulan ?? result.kesimpulan,
    //   kesimpulanSikap: (result as any).kesimpulanSikap ?? null,
    //   kesimpulanBelajar: (result as any).kesimpulanBelajar ?? null,
    //   kesimpulanUmum: (result as any).kesimpulanumum ?? null,
    //   saranPengembangan: (result as any).saranpengembangan ?? null,

    //   scoreIq: (result as any).scoreiq ?? null,
    //   jumlahBenar: (result as any).jumlahbenar ?? null,

    //   aspek1: (result as any).aspek1 ?? null,
    //   aspek2: (result as any).aspek2 ?? null,
    //   aspek3: (result as any).aspek3 ?? null,
    //   aspek4: (result as any).aspek4 ?? null,
    // });

    // sesuaikan path kamu
    const validationTime = result.validatedAt ?? new Date();

    const timestamp =
      validationTime.getFullYear().toString() +
      String(validationTime.getMonth() + 1).padStart(2, "0") +
      String(validationTime.getDate()).padStart(2, "0") +
      "_" +
      String(validationTime.getHours()).padStart(2, "0") +
      String(validationTime.getMinutes()).padStart(2, "0") +
      String(validationTime.getSeconds()).padStart(2, "0");

    const safeName = sanitizeFileName(result.User.fullName);

    // const fileName = `HPP_${safeName}_validated_${timestamp}.pdf`;

    // const filePath = path.join(process.cwd(), "public", "reports", fileName);

    // pastikan folder ada
    // const dirPath = path.join(process.cwd(), "public", "reports");
    // if (!fs.existsSync(dirPath)) {
    //   fs.mkdirSync(dirPath, { recursive: true });
    // }

    // kalau file belum ada → generate
    //   if (!fs.existsSync(filePath)) {
    //     console.log("📄 Generating PDF...");

    //     const html = `
    //   <h1>Laporan Psikotes</h1>
    //   <p>Nama: ${result.User?.fullName || "-"}</p>
    //   <p>Pendidikan: ${result.User?.education || "-"}</p>
    //   <p>Kesimpulan: ${kesimpulan ?? result.kesimpulan ?? "-"}</p>
    // `;

    //     await generatePDF(filePath, html);
    //   }
    // hapus PDF lama jika ada
    // if (fs.existsSync(filePath)) {
    //   fs.unlinkSync(filePath);
    // }

    console.log("📄 Generating PDF...");

//     const html = `
//   <h1>Laporan Psikotes</h1>
//   <p>Nama: ${result.User?.fullName || "-"}</p>
//   <p>Pendidikan: ${result.User?.education || "-"}</p>
//   <p>Kesimpulan: ${kesimpulan ?? result.kesimpulan ?? "-"}</p>
// `;

    // await generatePDF(filePath, html);
    // pastikan folder ada

    // kalau file belum ada → generate
    // if (!fs.existsSync(filePath)) {
    //   console.log("📄 Generating REAL PDF...");

    //   const html = `
    //     <h1>Laporan Psikotes</h1>
    //     <p>Nama: ${result.User.fullName}</p>
    //     <p>Pendidikan: ${result.User.education}</p>
    //     <p>Kesimpulan: ${kesimpulan ?? result.kesimpulan}</p>
    //   `;

    //   await generatePDF(filePath, html);
    // }

    // const pdfBuffer = fs.readFileSync(filePath);

    // const pdfHash = crypto.createHash("sha512").update(pdfBuffer).digest("hex");

    // console.log("PDF HASH (SAVE):", pdfHash);
    const pdfHash = null;

    // 🔐 DATA HASH (untuk deteksi perubahan DB)
    // const dataForHash = {
    //   userId: result.userId,
    //   testTypeId: result.testTypeId,
    //   createdAt: result.createdAt,

    //   fullName: result.User?.fullName,
    //   birthDate: result.User?.birthDate,
    //   education: result.User?.education,
    //   tujuan: result.User?.tujuan,

    //   kesimpulan: kesimpulan ?? result.kesimpulan,
    //   kesimpulanSikap: (result as any).kesimpulanSikap ?? null,
    //   kesimpulanBelajar: (result as any).kesimpulanBelajar ?? null,
    //   kesimpulanUmum: (result as any).kesimpulanumum ?? null,
    //   saranPengembangan: (result as any).saranpengembangan ?? null,

    //   scoreIq: (result as any).scoreiq ?? null,
    //   jumlahBenar: (result as any).jumlahbenar ?? null,

    //   aspek1: (result as any).aspek1 ?? null,
    //   aspek2: (result as any).aspek2 ?? null,
    //   aspek3: (result as any).aspek3 ?? null,
    //   aspek4: (result as any).aspek4 ?? null,
    // };

    // const dataHash = crypto
    //   .createHash("sha512")
    //   .update(stableStringify(dataForHash))
    //   .digest("hex");
    // =============================
    // EXTRACT TEXT DARI PDF FINAL
    // =============================
    // const parsedPdf = await pdfParse(pdfBuffer);

    // const normalizedPdfText =
    //   normalizeText(parsedPdf.text);

    // =============================
    // GENERATE HASH DARI PDF
    // =============================
    // const dataHash = crypto
    //   .createHash("sha512")
    //   .update(normalizedPdfText)
    //   .digest("hex");

    // === DATA YANG AKAN DI-SIGN ===
    // const dataToSign = {
    //   userId: result.userId,
    //   attemptId: result.attemptId,
    //   testTypeId: result.testTypeId,
    //   kesimpulan: kesimpulan ?? result.kesimpulan,
    //   createdAt: result.createdAt,
    // };
    // const dataHash = crypto
    //   .createHash("sha512")
    //   .update(pdfBuffer)
    //   .digest("hex");
    // const parsedPdf = await pdfParse(pdfBuffer);

    // const normalizedPdfText = normalizeText(parsedPdf.text);

    // const dataHash = crypto
    //   .createHash("sha512")
    //   .update(normalizedPdfText)
    //   .digest("hex");

    const canonicalData = {
      userId: result.userId,
      testTypeId: result.testTypeId,

      fullName: result.User?.fullName,
      birthDate: result.User?.birthDate,
      education: result.User?.education,
      tujuan: result.User?.tujuan,

      scoreiq: (result as any).scoreiq,
      iq: (result as any).iq,
      keteranganiq: (result as any).keteranganiq,

      aspek1: (result as any).aspek1,
      aspek2: (result as any).aspek2,
      aspek3: (result as any).aspek3,
      aspek4: (result as any).aspek4,

      kesimpulan: kesimpulan ?? result.kesimpulan,

      kesimpulanSikap: (result as any).kesimpulanSikap,

      kesimpulanKepribadian: (result as any).kesimpulanKepribadian,

      kesimpulanBelajar: (result as any).kesimpulanBelajar,

      kesimpulanumum: (result as any).kesimpulanumum,

      saranpengembangan: (result as any).saranpengembangan,

      rekomendasi: (result as any).rekomendasi,

      layak: (result as any).layak,

      belumLayak: (result as any).belumLayak,

      tidakLayak: (result as any).tidakLayak,
    };

    const dataHash = crypto
      .createHash("sha512")
      .update(stableStringify(canonicalData))
      .digest("hex");

    const hashBytes = Buffer.from(dataHash, "hex");

    const signatureUint8 = nacl.sign.detached(hashBytes, privateKeyUint8);

    const signature = encodeBase64(signatureUint8);

    console.log("PRIVATE KEY LENGTH:", privateKeyUint8.length);

    console.log("SIGNATURE LENGTH:", decodeBase64(signature).length);

    const publicKeyUint8 = decodeBase64(validatorUser.PublicKey!);

    // const testVerify = nacl.sign.detached.verify(
    //   decodeUTF8(message),
    //   decodeBase64(signature),
    //   publicKeyUint8,
    // );

    // console.log("TEST VERIFY:", testVerify);

    // Update data sesuai source
    let updated;
    if (source === "personalityResult") {
      updated = await prisma.personalityResult.update({
        where: { id: reportId },
        data: {
          validated: true,
          // validatedById: result.validated ? result.validatedById : userId,
          validatedById: result.validatedById ?? userId,
          validatedAt: result.validated ? result.validatedAt : validationTime,
          kesimpulan: kesimpulan ?? result.kesimpulan,
          barcode: barcodeId,
          barcodettd,
          expiresAt: expiry,
          isCompleted: true,
          Signature: signature,
          signedHash: dataHash,
          dataHash: dataHash,
          pdfHash: pdfHash,
        },
      });
    } else {
      updated = await prisma.result.update({
        where: { id: reportId },
        data: {
          validated: true,
          validatedById: result.validatedById ?? userId,
          validatedAt: result.validated ? result.validatedAt : validationTime,
          kesimpulan: kesimpulan ?? result.kesimpulan,
          barcode: barcodeId,
          barcodettd,
          expiresAt: expiry,
          isCompleted: true,
          Signature: signature,
          signedHash: dataHash,
          dataHash: dataHash,
          pdfHash: pdfHash,
        },
      });
    }

    // console.log("✅ saved barcodettd:", updated.barcodettd?.substring(0, 50));
    console.log({
      reportId,
      dataHash,
      pdfHash,
      signed: true,
    });
    console.log({
      currentUser: userId,
      validated: result.validated,
      validatedById: result.validatedById,
    });

    // === Tambahkan update testAttempt di sini ===
    await prisma.testAttempt.update({
      where: { id: result.attemptId },
      data: {
        status: "FINISHED", // bisa jadi logika lain jika perlu
        finishedAt: new Date(),
        isCompleted: true,
      },
    });
    await logActivity({
      userId,
      role: "PSIKOLOG",
      action: "VALIDATE",
      resource: "report",
      resourceId: reportId.toString(),
      endpoint: "/api/reports/validate",
      method: "POST",
      ipAddress: ip,
      userAgent,
      status: "SUCCESS",
      severity: "LOW",
      description: "Report validated and digitally signed",
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
    await logActivity({
      role: "PSIKOLOG",
      action: "VALIDATE",
      resource: "report",
      endpoint: "/api/reports/validate",
      method: "POST",
      ipAddress: ip,
      userAgent,
      status: "FAILED",
      severity: "HIGH",
      isSuspicious: true,
      description:
        "Server error: " +
        (err instanceof Error ? err.message : "Unknown error"),
    });

    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}



// // pages/api/reports/validate.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { nanoid } from "nanoid";
// import jwt from "jsonwebtoken";
// import QRCode from "qrcode";

// const JWT_SECRET = process.env.JWT_SECRET!;

// async function getLoggedUserId(req: NextRequest) {
//   try {
//     const token = req.cookies.get("token")?.value;
//     if (!token) return null;

//     const payload: any = jwt.verify(token, JWT_SECRET);
//     return payload.id;
//   } catch (err) {
//     console.error("JWT error:", err);
//     return null;
//   }
// }

// // === GET untuk filter reports (Pending & History) ===
// export async function GET(req: NextRequest) {
//   try {
//     const userId = await getLoggedUserId(req);
//     if (!userId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }
//     const url = new URL(req.url);
//     const companyId = url.searchParams.get("companyId");
//     const testTypeId = url.searchParams.get("testTypeId");
//     const status = url.searchParams.get("status");
//     const validatedAt = url.searchParams.get("validatedAt");

//     const whereClause: any = { AND: [] };

//     // === Filter Perusahaan / Sendiri ===
//     if (companyId && companyId !== "all") {
//       if (companyId === "self") {
//         whereClause.AND.push({
//           User: { role: "USER" },
//           OR: [
//             { Attempt: { PackagePurchase: { is: null }, Payment: { is: null } } },
//             { Attempt: { PackagePurchase: { companyId: null } } },
//             { Attempt: { Payment: { companyId: null } } },
//           ],
//         });
//       } else {
//         const numericCompanyId = Number(companyId);
//         if (!isNaN(numericCompanyId)) {
//           whereClause.AND.push({
//             OR: [
//               { Attempt: { PackagePurchase: { companyId: numericCompanyId } } },
//               { Attempt: { Payment: { companyId: numericCompanyId } } },
//               {
//                 User: {
//                   id: { equals: numericCompanyId },
//                   role: "PERUSAHAAN",
//                 },
//               },
//             ],
//           });
//         }
//       }
//     }

//     // Filter Jenis Tes
//     if (testTypeId && testTypeId !== "all") {
//       const numericTestTypeId = Number(testTypeId);
//       if (!isNaN(numericTestTypeId)) {
//         whereClause.AND.push({ testTypeId: numericTestTypeId });
//       }
//     }

//    // Filter Status
// if (status && status !== "all") {
//   if (status === "pending") {
//     whereClause.AND.push({ validated: false });
//   }
//   if (status === "selesai") {
//     whereClause.AND.push({
//        validatedById: userId,
//       OR: [
//         { validated: true },
//         { Attempt: { status: "FINISHED" } }
//       ],
//     });
//   }
// }


//     // Filter Tanggal Pemeriksaan (validatedAt)
//     if (validatedAt) {
//       const start = new Date(validatedAt);
//       start.setHours(0, 0, 0, 0);
//       const end = new Date(validatedAt);
//       end.setHours(23, 59, 59, 999);
//       whereClause.AND.push({
//         validatedAt: { gte: start, lte: end },
//       });
//     }

//     // === Ambil data dari DB → result
//     const results = await prisma.result.findMany({
//       where: whereClause.AND.length > 0 ? whereClause : undefined,
//       include: {
//         User: { select: { id: true, fullName: true, role: true } },
//         TestType: { select: { id: true, name: true } },
//         Attempt: {
//           select: {
//             id: true,
//             startedAt: true,
//             status: true, // tambahkan ini
//             PackagePurchase: { select: { company: true } },
//             Payment: { select: { company: true } },
//           },
//         },
//         ValidatedBy: {
//           select: {
//             id: true,
//             fullName: true,
//             ttdUrl: true,
//             ttdHash: true,
//              strNumber: true,   // tambahkan
//         sippNumber: true,
//           },
//         },
//       },
//       orderBy: { createdAt: "desc" },
//     });

//     // === Ambil data dari DB → personalityResult
//     const personalityResults = await prisma.personalityResult.findMany({
//       where: whereClause.AND.length > 0 ? whereClause : undefined,
//       include: {
//         User: { select: { id: true, fullName: true, role: true } },
//         TestType: { select: { id: true, name: true } },
//         Attempt: {
//           select: {
//             id: true,
//             startedAt: true,
//             status: true,
//             PackagePurchase: { select: { company: true } },
//             Payment: { select: { company: true } },
//           },
//         },
//         ValidatedBy: {
//           select: {
//             id: true,
//             fullName: true,
//             ttdUrl: true,
//             ttdHash: true,
//              strNumber: true,   // tambahkan
//         sippNumber: true,
//           },
//         },
//       },
//       orderBy: { createdAt: "desc" },
//     });

//     // === Mapping company fallback (untuk result)
//     const mappedResults = results.map((r:any) => {
//       let company = null;
//       if (r.Attempt?.PackagePurchase?.company) company = r.Attempt.PackagePurchase.company;
//       else if (r.Attempt?.Payment?.company) company = r.Attempt.Payment.company;
//       else if (r.User.role === "PERUSAHAAN") company = { id: r.User.id, fullName: r.User.fullName };

//       return {
//         id: r.id,
//         User: r.User,
//         TestType: r.TestType,
//         Attempt: r.Attempt ? { id: r.Attempt.id, startedAt: r.Attempt.startedAt,status: r.Attempt.status ?? null // tambahkan ini
//  } : null,
//         Company: company,
//         validated: r.validated,
//         validatedAt: r.validatedAt,
//         createdAt: r.createdAt,
//         source: "result",
//       };
//     });

//     // === Mapping company fallback (untuk personalityResult)
//     const mappedPersonality = personalityResults.map((r:any) => {
//       let company = null;
//       if (r.Attempt?.PackagePurchase?.company) company = r.Attempt.PackagePurchase.company;
//       else if (r.Attempt?.Payment?.company) company = r.Attempt.Payment.company;
//       else if (r.User.role === "PERUSAHAAN") company = { id: r.User.id, fullName: r.User.fullName };

//       return {
//         id: r.id,
//         User: r.User,
//         TestType: r.TestType,
//         Attempt: r.Attempt ? { id: r.Attempt.id, startedAt: r.Attempt.startedAt, status: r.Attempt.status ?? null // tambahkan ini
//  } : null,
//         Company: company,
//         validated: r.validated,
//         validatedAt: r.validatedAt,
//         createdAt: r.createdAt,
//         source: "personalityResult",
//       };
//     });
// // console.log("🔍 Hasil mapping:", mappedResults, mappedPersonality);

//     // Gabungkan hasil dan sort by createdAt descending
//     const combined = [...mappedResults, ...mappedPersonality];
//     const sortedCombined = combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
// // console.log("🔍 sortedCombined:", sortedCombined);

//     return NextResponse.json(sortedCombined);
//   } catch (err) {
//     console.error("❌ Gagal ambil reports:", err);
//     return NextResponse.json({ error: "Gagal ambil reports" }, { status: 500 });
//   }
// }

// // === POST untuk validasi laporan (result + personalityResult) ===
// export async function POST(req: NextRequest) {
//   try {
//     const { reportId, kesimpulan, source } = await req.json();
//     const userId = await getLoggedUserId(req);
//     if (!reportId || !userId) {
//       return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
//     }

//     let result;
//     if (source === "personalityResult") {
//       result = await prisma.personalityResult.findUnique({
//         where: { id: reportId },
//         include: {
//           User: { select: { id: true, fullName: true, ttdUrl: true, ttdHash: true } },
//           ValidatedBy: true,
//         },
//       });
//     } else {
//       result = await prisma.result.findUnique({
//         where: { id: reportId },
//         include: {
//           User: { select: { id: true, fullName: true, ttdUrl: true, ttdHash: true,  strNumber: true,   // tambahkan
//         sippNumber: true, } },
//           ValidatedBy: true,
//         },
//       });
//     }

//     if (!result) {
//       return NextResponse.json({ error: "Result tidak ditemukan" }, { status: 404 });
//     }

//     // Generate barcode ID report
//     let barcodeId = result.barcode;
//     let barcodeURL = barcodeId
//       ? `${process.env.NEXT_PUBLIC_BASE_URL}/report/view/${barcodeId}`
//       : undefined;

//     if (!barcodeId) {
//       barcodeId = nanoid(10);
//       barcodeURL = `${process.env.NEXT_PUBLIC_BASE_URL}/report/view/${barcodeId}`;
//     }

//     const expiry = new Date();
//     expiry.setFullYear(expiry.getFullYear() + 1);

//     // console.log("🔥 validator ttdHash:", result?.ValidatedBy?.ttdHash);
//     // console.log("🔥 validator ttdUrl:", result?.ValidatedBy?.ttdUrl);
// const validatorUser = await prisma.user.findUnique({
//   where: { id: userId },
//   select: { ttdHash: true },
// });
//     // === Generate QR dari ttdHash psikolog ===
// let barcodettd: string | null = null;
// if (validatorUser?.ttdHash) {
//   barcodettd = await QRCode.toDataURL(validatorUser.ttdHash);
//   // console.log("✅ Generated barcodettd:", barcodettd.substring(0, 50));
// }

//     let updated;
//     if (source === "personalityResult") {
//       updated = await prisma.personalityResult.update({
//         where: { id: reportId },
//         data: {
//           validated: true,
//           validatedById: result.validated ? result.validatedById : userId,
//           validatedAt: result.validated ? result.validatedAt : new Date(),
//           kesimpulan: kesimpulan ?? result.kesimpulan,
//           barcode: barcodeId,
//           barcodettd,
//           expiresAt: expiry,
//           isCompleted: true,
//         },
//       });
//     } else {
//       updated = await prisma.result.update({
//         where: { id: reportId },
//         data: {
//           validated: true,
//           validatedById: result.validated ? result.validatedById : userId,
//           validatedAt: result.validated ? result.validatedAt : new Date(),
//           kesimpulan: kesimpulan ?? result.kesimpulan,
//           barcode: barcodeId,
//           barcodettd,
//           expiresAt: expiry,
//           isCompleted: true,
//         },
//       });
//     }

//     // console.log("✅ saved barcodettd:", updated.barcodettd?.substring(0, 50));

//     // === Tambahkan update testAttempt di sini ===
// await prisma.testAttempt.update({
//   where: { id: result.attemptId },
//   data: {
//     status: "FINISHED", // bisa jadi logika lain jika perlu
//     finishedAt: new Date(),
//     isCompleted: true,
//   },
// });

//     return NextResponse.json({
//       success: true,
//       barcodeURL,
//       barcodeId,
//       expiresAt: expiry,
//       source,
//     });
//   } catch (err) {
//     console.error("Error validating report:", err);
//     return NextResponse.json(
//       { error: "Terjadi kesalahan server" },
//       { status: 500 }
//     );
//   }
// }

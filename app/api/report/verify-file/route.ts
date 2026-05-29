export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
const pdfParse = require("pdf-parse/lib/pdf-parse.js");

import nacl from "tweetnacl";
import {
  decodeBase64,
  decodeUTF8,
} from "tweetnacl-util";

import crypto from "crypto";

import { logActivity } from "@/lib/logger";

// 🔧 normalisasi teks
function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

// 🔧 cek semua keyword ada
function containsAllKeywords(text: string, keywords: string[]) {
  return keywords.every((word) => text.includes(word));
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const userAgent =
    req.headers.get("user-agent") || "unknown";

  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;
    const barcode = formData.get("barcode") as string;

    // =============================
    // VALIDASI INPUT
    // =============================
    if (!file || !barcode) {
      await logActivity({
        action: "VERIFY",
        resource: "report",
        resourceId:
          typeof barcode !== "undefined"
            ? barcode
            : undefined,
        endpoint: "/api/reports/verify",
        method: "POST",
        ipAddress: ip,
        userAgent,
        status: "FAILED",
        severity: "MEDIUM",
        isSuspicious: true,
        description: "Missing file or barcode",
      });

      return NextResponse.json(
        { error: "File atau barcode kosong" },
        { status: 400 },
      );
    }

    if (file.type !== "application/pdf") {
      await logActivity({
        action: "VERIFY",
        resource: "report",
        resourceId:
          typeof barcode !== "undefined"
            ? barcode
            : undefined,
        endpoint: "/api/reports/verify",
        method: "POST",
        ipAddress: ip,
        userAgent,
        status: "FAILED",
        severity: "HIGH",
        isSuspicious: true,
        description: "Invalid file type (not PDF)",
      });

      return NextResponse.json(
        { error: "File harus berupa PDF" },
        { status: 400 },
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      await logActivity({
        action: "VERIFY",
        resource: "report",
        resourceId:
          typeof barcode !== "undefined"
            ? barcode
            : undefined,
        endpoint: "/api/reports/verify",
        method: "POST",
        ipAddress: ip,
        userAgent,
        status: "FAILED",
        severity: "HIGH",
        isSuspicious: true,
        description: "File too large",
      });

      return NextResponse.json(
        {
          error: "Ukuran file terlalu besar (maks 5MB)",
        },
        { status: 400 },
      );
    }

    // =============================
    // AMBIL DATA REPORT
    // =============================
    const result = await prisma.result.findUnique({
      where: { barcode },
      include: {
        User: true,
        ValidatedBy: true,
      },
    });

    if (!result) {
      await logActivity({
        action: "VERIFY",
        resource: "report",
        resourceId:
          typeof barcode !== "undefined"
            ? barcode
            : undefined,
        endpoint: "/api/reports/verify",
        method: "POST",
        ipAddress: ip,
        userAgent,
        status: "FAILED",
        severity: "HIGH",
        isSuspicious: true,
        description: "Report not found",
      });

      return NextResponse.json(
        { error: "Report tidak ditemukan" },
        { status: 404 },
      );
    }

    // =============================
    // VALIDASI DATA SIGNATURE
    // =============================
    if (
      !result.Signature ||
      !result.dataHash ||
      !result.ValidatedBy?.PublicKey
    ) {
      await logActivity({
        action: "VERIFY",
        resource: "report",
        resourceId: barcode,
        endpoint: "/api/reports/verify",
        method: "POST",
        ipAddress: ip,
        userAgent,
        status: "FAILED",
        severity: "HIGH",
        isSuspicious: true,
        description:
          "Missing signature or public key",
      });

      return NextResponse.json(
        {
          error:
            "Signature atau public key tidak ditemukan",
        },
        { status: 400 },
      );
    }

    // =============================
    // CONVERT FILE PDF
    // =============================
    const buffer = Buffer.from(
      await file.arrayBuffer(),
    );

    // =============================
    // EXTRACT TEXT PDF
    // =============================
    const data = await pdfParse(buffer);

    const extractedText = normalizeText(data.text);

  //   const generatedHash = crypto
  // .createHash("sha512")
  // .update(extractedText)
  // .digest("hex");

  //   console.log("📄 EXTRACTED:", extractedText);

    // =============================
    // VALIDASI INTEGRITAS DATA
    // =============================
    const differences: any = {};

    // 🔹 Nama
    const namaKeywords =
      result.User?.fullName
        ?.toLowerCase()
        .split(" ") || [];

    if (
      !containsAllKeywords(
        extractedText,
        namaKeywords,
      )
    ) {
      differences.nama =
        "Nama berubah / tidak ditemukan";
    }

    if (
      !extractedText.includes(
        String(result.scoreiq || ""),
      )
    ) {
      differences.iq =
        `IQ berubah (expected: ${result.scoreiq})`;
    }

    if (
      result.User?.education &&
      !extractedText.includes(
        result.User.education.toLowerCase(),
      )
    ) {
      differences.pendidikan =
        "Pendidikan berubah / tidak ditemukan";
    }

if (
  result.User?.tujuan &&
  !extractedText.includes(
    result.User.tujuan.toLowerCase(),
  )
) {
  differences.tujuan =
    "Tujuan berubah / tidak ditemukan";
}

// =============================
// 🔹 ASPEK 1
// =============================
if (result.aspek1) {
  try {
    const aspek1Data =
      typeof result.aspek1 === "string"
        ? JSON.parse(result.aspek1)
        : result.aspek1;

    for (const item of aspek1Data) {
      if (
        item.aspek &&
        !extractedText.includes(
          String(item.aspek).toLowerCase()
        )
      ) {
        differences.aspek1 =
          "Data aspek1 berubah";
      }

      if (
        item.total !== undefined &&
        !extractedText.includes(
          String(item.total).toLowerCase()
        )
      ) {
        differences.aspek1 =
          "Data aspek1 berubah";
      }

      if (
        item.kategori &&
        !extractedText.includes(
          String(item.kategori).toLowerCase()
        )
      ) {
        differences.aspek1 =
          "Data aspek1 berubah";
      }
    }
  } catch (err) {
    console.error("Parse aspek1 gagal");
  }
}

// =============================
// 🔹 ASPEK 2
// =============================
if (result.aspek2) {
  try {
    const aspek2Data =
      typeof result.aspek2 === "string"
        ? JSON.parse(result.aspek2)
        : result.aspek2;

    for (const item of aspek2Data) {
      if (
        item.aspek &&
        !extractedText.includes(
          String(item.aspek).toLowerCase()
        )
      ) {
        differences.aspek2 =
          "Data aspek2 berubah";
      }

      if (
        item.total !== undefined &&
        !extractedText.includes(
          String(item.total).toLowerCase()
        )
      ) {
        differences.aspek2 =
          "Data aspek2 berubah";
      }

      if (
        item.kategori &&
        !extractedText.includes(
          String(item.kategori).toLowerCase()
        )
      ) {
        differences.aspek2 =
          "Data aspek2 berubah";
      }
    }
  } catch (err) {
    console.error("Parse aspek2 gagal");
  }
}

// =============================
// 🔹 ASPEK 3
// =============================
if (result.aspek3) {
  try {
    const aspek3Data =
      typeof result.aspek3 === "string"
        ? JSON.parse(result.aspek3)
        : result.aspek3;

    for (const item of aspek3Data) {
      if (
        item.aspek &&
        !extractedText.includes(
          String(item.aspek).toLowerCase()
        )
      ) {
        differences.aspek3 =
          "Data aspek3 berubah";
      }

      if (
        item.total !== undefined &&
        !extractedText.includes(
          String(item.total).toLowerCase()
        )
      ) {
        differences.aspek3 =
          "Data aspek3 berubah";
      }

      if (
        item.kategori &&
        !extractedText.includes(
          String(item.kategori).toLowerCase()
        )
      ) {
        differences.aspek3 =
          "Data aspek3 berubah";
      }
    }
  } catch (err) {
    console.error("Parse aspek3 gagal");
  }
}

// =============================
// 🔹 ASPEK 4
// =============================
if (result.aspek4) {
  try {
    const aspek4Data =
      typeof result.aspek4 === "string"
        ? JSON.parse(result.aspek4)
        : result.aspek4;

    for (const item of aspek4Data) {
      if (
        item.aspek &&
        !extractedText.includes(
          String(item.aspek).toLowerCase()
        )
      ) {
        differences.aspek4 =
          "Data aspek4 berubah";
      }

      if (
        item.total !== undefined &&
        !extractedText.includes(
          String(item.total).toLowerCase()
        )
      ) {
        differences.aspek4 =
          "Data aspek4 berubah";
      }

      if (
        item.kategori &&
        !extractedText.includes(
          String(item.kategori).toLowerCase()
        )
      ) {
        differences.aspek4 =
          "Data aspek4 berubah";
      }
    }
  } catch (err) {
    console.error("Parse aspek4 gagal");
  }
}
// 🔹 Kesimpulan
const kesimpulanKeywords =
  result.kesimpulan
    ?.toLowerCase()
    .split(" ")
    .filter((w) => w.length > 4) || [];

if (
  !containsAllKeywords(
    extractedText,
    kesimpulanKeywords,
  )
) {
  differences.kesimpulan =
    "Kesimpulan berubah / tidak ditemukan";
}

// 🔹 Kesimpulan Umum
if (
  result.kesimpulanumum &&
  !extractedText.includes(
    result.kesimpulanumum.toLowerCase(),
  )
) {
  differences.kesimpulanumum =
    "Kesimpulan umum berubah / tidak ditemukan";
}

// =============================
// 🔹 STATUS KELAYAKAN
// =============================

// // const compactText =
//   extractedText.replace(/\s+/g, "");

// =============================
// STATUS LAYAK
// =============================
const hasLayak =
  /\blayak\b/.test(extractedText);

const hasTidakLayak =
  /tidak\s+layak/.test(extractedText);

const hasBelumLayak =
  /belum\s+layak/.test(extractedText);

// DB = LAYAK
if (result.layak) {
  if (!hasLayak || hasTidakLayak) {
    differences.layak =
      "Status layak berubah";
  }
}

// DB = TIDAK LAYAK
if (result.tidakLayak) {
  if (!hasTidakLayak) {
    differences.tidakLayak =
      "Status tidak layak berubah";
  }
}

// DB = BELUM LAYAK
if (result.belumLayak) {
  if (!hasBelumLayak) {
    differences.belumLayak =
      "Status belum layak berubah";
  }
}
    // =============================
    // GENERATE HASH PDF
    // =============================
// const generatedHash = result.dataHash;
// const generatedHash = crypto
//   .createHash("sha512")
//   .update(extractedText)
//   .digest("hex");
// const data = await pdfParse(buffer);

// const extractedText = normalizeText(data.text);

// const generatedHash = crypto
//   .createHash("sha512")
//   .update(extractedText)
//   .digest("hex");
// const isHashMatch =
//   generatedHash === result.dataHash;

// const isHashMatch =
//   generatedHash === result.dataHash;
    // =============================
    // VERIFY SIGNATURE ED25519
    // =============================
    const signatureUint8 = decodeBase64(
      result.Signature,
    );
    const publicKeyUint8 = decodeBase64(
      result.ValidatedBy.PublicKey,
  );

console.log("DB DATA HASH:", result.dataHash);

console.log(
  "PUBLIC KEY LENGTH:",
  publicKeyUint8.length
);

console.log(
  "SIGNATURE LENGTH:",
  signatureUint8.length
);


console.log(
  "SIGNED HASH:",
  result.signedHash
);
// const isSignatureValid =
//   nacl.sign.detached.verify(
//     decodeUTF8(generatedHash),
//     signatureUint8,
//     publicKeyUint8,
//   );
const isSignatureValid =
  nacl.sign.detached.verify(
    Buffer.from(result.dataHash!, "hex"),
    signatureUint8,
    publicKeyUint8,
  );
  console.log(
  "SIGNATURE VALID:",
  isSignatureValid
);

    // =============================
    // HASIL AKHIR
    // =============================
const isValid =
  isSignatureValid &&
  Object.keys(differences).length === 0;

  let message = "";

if (!isSignatureValid) {
  message =
    "Signature digital tidak valid";
}

// if (!isHashMatch) {
//   message +=
//     (message ? " | " : "") +
//     "Integritas dokumen berubah";
// }

if (
  Object.keys(differences).length > 0
) {
  message +=
  "\n\nPerubahan terdeteksi pada:\n- " +
  Object.keys(differences).join("\n- ");
}

if (!message) {
  message =
    "File sesuai dengan dokumen asli";
}
const diffCount =
  Object.keys(differences).length;
    // =============================
    // ACTIVITY LOG
    // =============================
    await logActivity({
      action: "VERIFY",
      resource: "report",
      resourceId:
        typeof barcode !== "undefined"
          ? barcode
          : undefined,
      endpoint: "/api/reports/verify",
      method: "POST",
      ipAddress: ip,
      userAgent,
      status: isValid ? "SUCCESS" : "FAILED",
      severity: isValid ? "LOW" : "HIGH",
      isSuspicious: !isValid,
      description: isValid
        ? "Valid document verified"
        : !isSignatureValid
          ? "Invalid ED25519 signature detected"
          : `Tampered document detected (${diffCount} fields changed)`,
    });
console.log("DB HASH:", result.dataHash);

// console.log("HASH MATCH:", isHashMatch);
    // =============================
    // RESPONSE
    // =============================
    return NextResponse.json({
      isValid,
      signatureValid: isSignatureValid,
      status: isValid
        ? "VALID"
        : "INVALID_USER_FILE",
      message,
      differences,
    });
  } catch (err) {
    await logActivity({
      action: "VERIFY",
      resource: "report",
      endpoint: "/api/reports/verify",
      method: "POST",
      ipAddress: ip,
      userAgent,
      status: "FAILED",
      severity: "HIGH",
      isSuspicious: true,
      description:
        "Server error: " +
        (err instanceof Error
          ? err.message
          : "Unknown error"),
    });

    console.error(err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 },
    );
  }
}


// export const runtime = "nodejs";

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// const pdfParse = require("pdf-parse/lib/pdf-parse.js");

// // 🔧 normalisasi teks
// function normalizeText(text: string) {
//   return text
//     .replace(/\s+/g, " ")
//     .trim()
//     .toLowerCase();
// }

// // 🔧 cek semua keyword ada
// function containsAllKeywords(text: string, keywords: string[]) {
//   return keywords.every((word) => text.includes(word));
// }

// export async function POST(req: NextRequest) {
//   try {
//     const formData = await req.formData();

//     const file = formData.get("file") as File;
//     const barcode = formData.get("barcode") as string;

//     if (!file || !barcode) {
//       return NextResponse.json(
//         { error: "File atau barcode kosong" },
//         { status: 400 }
//       );
//     }

//     // 🔥 ambil dari DB
//     const result = await prisma.result.findUnique({
//       where: { barcode },
//       include: { User: true },
//     });

//     if (!result) {
//       return NextResponse.json(
//         { error: "Report tidak ditemukan" },
//         { status: 404 }
//       );
//     }

//     // 🔥 convert file
//     const buffer = Buffer.from(await file.arrayBuffer());

//     // 🔥 extract text PDF
//     const data = await pdfParse(buffer);
//     const extractedText = normalizeText(data.text);

//     // 🔥 buat keyword dari DB
//     const keywords = [
//       ...(result.User?.fullName?.toLowerCase().split(" ") || []),
//       ...(result.kesimpulan?.toLowerCase().split(" ") || []),
//         String(result.scoreiq || ""),

//     ].filter(word => word.length > 3);
// // const keywords = [
// //   result.User?.fullName,
// //   result.User?.education,
// //   result.kesimpulan,
// //   String(result.scoreiq),
// //   String(result.layak),
// //   String(result.tidakLayak),
// //   String(result.belumLayak)
// // ]
// //   .join(" ")
// //   .toLowerCase()
// //   .split(" ")
// //   .filter(word => word.length > 3);
//     console.log("KEYWORDS:", keywords);
//     console.log("EXTRACTED:", extractedText);

//     // 🔥 VALIDASI
//     // const isValid = containsAllKeywords(extractedText, keywords);
//     const isValid =
//   containsAllKeywords(extractedText, keywords) &&
//   extractedText.includes(String(result.scoreiq || ""));

//     return NextResponse.json({
//       isValid,
//       status: isValid ? "VALID" : "INVALID_USER_FILE",
//       message: isValid
//         ? "File sesuai dengan dokumen asli"
//         : "Isi file telah dimodifikasi",
//     });

//   } catch (err) {
//     console.error(err);
//     return NextResponse.json(
//       { error: "Server error" },
//       { status: 500 }
//     );
//   }
// }

// export const runtime = "nodejs";

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// const pdfParse = require("pdf-parse/lib/pdf-parse.js");
// import { logActivity } from "@/lib/logger";


// // 🔧 normalisasi teks
// function normalizeText(text: string) {
//   return text.replace(/\s+/g, " ").trim().toLowerCase();
// }

// // 🔧 cek semua keyword ada
// function containsAllKeywords(text: string, keywords: string[]) {
//   return keywords.every((word) => text.includes(word));
// }

// export async function POST(req: NextRequest) {
//   const ip =
//   req.headers.get("x-forwarded-for")?.split(",")[0] ||
//   req.headers.get("x-real-ip") ||
//   "unknown";

// const userAgent = req.headers.get("user-agent") || "unknown";
//   try {
//     const formData = await req.formData();

//     const file = formData.get("file") as File;
//     const barcode = formData.get("barcode") as string;

//     if (!file || !barcode) {
//       await logActivity({
//     action: "VERIFY",
//      resource: "report",
//    resourceId: typeof barcode !== "undefined" ? barcode : undefined,
//     endpoint: "/api/reports/verify",
//     method: "POST",
//     ipAddress: ip,
//     userAgent,
//     status: "FAILED",
//     severity: "MEDIUM",
//     isSuspicious: true,
//     description: "Missing file or barcode",
//   });

//       return NextResponse.json(
//         { error: "File atau barcode kosong" },
//         { status: 400 },
//       );
//     }
// if (file.type !== "application/pdf") {
//   await logActivity({
//     action: "VERIFY",
//     resource: "report",
//    resourceId: typeof barcode !== "undefined" ? barcode : undefined,
//     endpoint: "/api/reports/verify",
//     method: "POST",
//     ipAddress: ip,
//     userAgent,
//     status: "FAILED",
//     severity: "HIGH",
//     isSuspicious: true,
//     description: "Invalid file type (not PDF)",
//   });

//   return NextResponse.json(
//     { error: "File harus berupa PDF" },
//     { status: 400 },
//   );
// }
// if (file.size > 5 * 1024 * 1024) { // 5MB
//   await logActivity({
//     action: "VERIFY",
//     resource: "report",
//     resourceId: typeof barcode !== "undefined" ? barcode : undefined,
//     endpoint: "/api/reports/verify",
//     method: "POST",
//     ipAddress: ip,
//     userAgent,
//     status: "FAILED",
//     severity: "HIGH",
//     isSuspicious: true,
//     description: "File too large",
//   });

//   return NextResponse.json(
//     { error: "Ukuran file terlalu besar (maks 5MB)" },
//     { status: 400 },
//   );
// }
//     // 🔥 ambil dari DB
//     const result = await prisma.result.findUnique({
//       where: { barcode },
//       include: { User: true },
//     });

//     if (!result) {
//        await logActivity({
//     action: "VERIFY",
//     resource: "report",
//     resourceId: typeof barcode !== "undefined" ? barcode : undefined,
//     endpoint: "/api/reports/verify",
//     method: "POST",
//     ipAddress: ip,
//     userAgent,
//     status: "FAILED",
//     severity: "HIGH",
//     isSuspicious: true,
//     description: "Report not found",
//   });
//       return NextResponse.json(
//         { error: "Report tidak ditemukan" },
//         { status: 404 },
//       );
//     }

//     // 🔥 convert file
//     const buffer = Buffer.from(await file.arrayBuffer());

//     // 🔥 extract text PDF
//     const data = await pdfParse(buffer);
//     const extractedText = normalizeText(data.text);

//     console.log("📄 EXTRACTED:", extractedText);

//     // =============================
//     // 🔍 VALIDASI PER FIELD
//     // =============================
//     const differences: any = {};

//     // 🔹 Nama (flexible keyword)
//     const namaKeywords = result.User?.fullName?.toLowerCase().split(" ") || [];

//     if (!containsAllKeywords(extractedText, namaKeywords)) {
//       differences.nama = "Nama berubah / tidak ditemukan";
//     }

//     // 🔹 Kesimpulan (flexible keyword)
//     const kesimpulanKeywords =
//       result.kesimpulan?.toLowerCase().split(" ") || [];

//     if (!containsAllKeywords(extractedText, kesimpulanKeywords)) {
//       differences.kesimpulan = "Kesimpulan berubah / tidak ditemukan";
//     }

//     // 🔹 IQ (strict)
//     if (!extractedText.includes(String(result.scoreiq || ""))) {
//       differences.iq = `IQ berubah (expected: ${result.scoreiq})`;
//     }

//     // 🔹 Pendidikan (optional)
//     if (
//       result.User?.education &&
//       !extractedText.includes(result.User.education.toLowerCase())
//     ) {
//       differences.pendidikan = "Pendidikan berubah / tidak ditemukan";
//     }

//     // =============================
//     // 🧠 HASIL AKHIR
//     // =============================
//     const isValid = Object.keys(differences).length === 0;
//     const diffCount = Object.keys(differences).length;

//     const message = isValid
//       ? "File sesuai dengan dokumen asli"
//       : "Perubahan terdeteksi pada: " + Object.keys(differences).join(", ");
//       await logActivity({
//       action: "VERIFY",
//       resource: "report",
//       resourceId: typeof barcode !== "undefined" ? barcode : undefined,
//       endpoint: "/api/reports/verify",
//       method: "POST",
//       ipAddress: ip,
//       userAgent,
//       status: isValid ? "SUCCESS" : "FAILED",
//       severity: isValid ? "LOW" : "HIGH",
//       isSuspicious: !isValid,
//       description: isValid
//         ? "Valid document verified"
//           : `Tampered document detected (${diffCount} fields changed)`
//     });

//     return NextResponse.json({
//       isValid,
//       status: isValid ? "VALID" : "INVALID_USER_FILE",
//       message,
//       differences, // 🔥 detail perubahan
//     });
//   } catch (err) {
//     await logActivity({
//     action: "VERIFY",
//     resource: "report",
//     endpoint: "/api/reports/verify",
//     method: "POST",
//     ipAddress: ip,
//     userAgent,
//     status: "FAILED",
//     severity: "HIGH",
//     isSuspicious: true,
//     description:
//       "Server error: " +
//       (err instanceof Error ? err.message : "Unknown error"),
//   });
//     console.error(err);
    
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }
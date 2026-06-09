// import { prisma } from "@/lib/prisma";
// import { NextResponse } from "next/server";

// export async function GET(
//   req: Request,
//   { params }: { params: { barcode: string } }
// ) {
//   const { barcode } = params;

//   if (!barcode) {
//     return NextResponse.json({ error: "Barcode tidak valid" }, { status: 400 });
//   }

//   try {
//     // Cari result berdasarkan barcode
//     const result = await prisma.result.findUnique({
//       where: { barcode },
//       include: {
//         User: true,
//         Attempt: {
//           include: {
//             TestType: true,
//             User: true,
//           },
//         },
//         ValidatedBy: true,
//       },
//     });

//     if (!result) {
//       return NextResponse.json(
//         { error: "Report tidak ditemukan" },
//         { status: 404 }
//       );
//     }

//     if (result.expiresAt && result.expiresAt < new Date()) {
//       return NextResponse.json(
//         { error: "QR Code ini sudah kadaluarsa." },
//         { status: 410 }
//       );
//     }

//     // Buat pesan TTD yang lebih human-readable
//     const ttdValidationMessage = result.validated
//       ? `Dokumen sudah ditandatangani secara elektronik oleh Psikolog ${result.ValidatedBy?.fullName} pada tanggal ${result.validatedAt?.toLocaleDateString("id-ID") || "-"}`
//       : null;

//     return NextResponse.json({
//       attempt: result.Attempt,
//       result,
//       kesimpulan: result.kesimpulan,
//       ttd: result.User?.ttdUrl, // optional
//       barcode: result.barcode,
//       expiresAt: result.expiresAt,
//       validationNotes: result.validated
//         ? `Hasil divalidasi oleh ${result.ValidatedBy?.fullName || "Psikolog"}, pada ${result.validatedAt ? result.validatedAt.toLocaleDateString("id-ID") : "-"}.
// Berlaku sampai: ${result.expiresAt ? result.expiresAt.toLocaleDateString("id-ID") : "-"}` 
//         : null,
//       ttdValidationMessage, // 🔥 tambahkan ini
//     });

//   } catch (err) {
//     console.error("Error get report:", err);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }


// import { prisma } from "@/lib/prisma";
// import { NextRequest, NextResponse } from "next/server";
// import nacl from "tweetnacl";
// import { decodeUTF8, decodeBase64 } from "tweetnacl-util";

// function verifySignature(message: string, signature: string, publicKey: string) {
//   return nacl.sign.detached.verify(
//     decodeUTF8(message),
//     decodeBase64(signature),
//     decodeBase64(publicKey)
//   );
// }
// export async function GET(
//   req: NextRequest,
//   context: { params: Promise<{ barcode: string }> } // ⬅️ harus pakai Promise
// ) {
//   try {
//     const { barcode } = await context.params; // ⬅️ jangan lupa `await`

//     if (!barcode) {
//       return NextResponse.json({ error: "Barcode tidak valid" }, { status: 400 });
//     }

//     const result = await prisma.result.findUnique({
//       where: { barcode },
//       include: {
//         User: true,
//         Attempt: {
//           include: {
//             TestType: true,
//             User: true,
//           },
//         },
//         ValidatedBy: true,
//       },
//     });

//     if (!result) {
//       return NextResponse.json(
//         { error: "Report tidak ditemukan" },
//         { status: 404 }
//       );
//     }
//  let isSignatureValid = false;
// if (
//   result.Signature &&
//   result.signedHash &&
//   result.ValidatedBy?.PublicKey
// ) {
//   isSignatureValid = verifySignature(
//     result.signedHash,
//     result.Signature,
//     result.ValidatedBy.PublicKey
//   );
// }
// let verificationStatus = "UNKNOWN";
// let verificationMessage = "Belum diverifikasi";

// if (!result.Signature) {
//   verificationStatus = "UNSIGNED";
//   verificationMessage = "Dokumen belum ditandatangani";
// } else if (isSignatureValid) {
//   verificationStatus = "VALID";
//   verificationMessage = "Dokumen valid dan tidak mengalami perubahan";
// } else {
//   verificationStatus = "INVALID";
//   verificationMessage = "Dokumen telah diubah atau tanda tangan tidak valid";
// }
//     if (result.expiresAt && result.expiresAt < new Date()) {
//       return NextResponse.json(
//         { error: "QR Code ini sudah kadaluarsa." },
//         { status: 410 }
//       );
//     }

//     const ttdValidationMessage = result.validated
//       ? `Dokumen sudah ditandatangani secara elektronik oleh Psikolog ${result.ValidatedBy?.fullName} pada tanggal ${result.validatedAt?.toLocaleDateString("id-ID") || "-"}`
//       : null;

//     return NextResponse.json({
//       attempt: result.Attempt,
//       result,
//       kesimpulan: result.kesimpulan,
//       kesimpulanSikap: result.kesimpulanSikap,
//   kesimpulanKepribadian: result.kesimpulanKepribadian,
//   kesimpulanBelajar: result.kesimpulanBelajar,
//   kesimpulanUmum: result.kesimpulanumum,
//   saranPengembangan: result.saranpengembangan,

//       ttd: result.User?.ttdUrl,
//       barcode: result.barcode,
//       expiresAt: result.expiresAt,
//       validationNotes: result.validated
//         ? `Hasil divalidasi oleh ${result.ValidatedBy?.fullName || "Psikolog"}, pada ${result.validatedAt ? result.validatedAt.toLocaleDateString("id-ID") : "-"}.
// Berlaku sampai: ${result.expiresAt ? result.expiresAt.toLocaleDateString("id-ID") : "-"}` 
//         : null,
//       ttdValidationMessage,
//             isSignatureValid, // 🔥 tetap kirim (optional tapi bagus)
//   verificationStatus,
//   verificationMessage,

      
//     });
//   } catch (err) {
//     console.error("Error get report:", err);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import nacl from "tweetnacl";
import { decodeUTF8, decodeBase64 } from "tweetnacl-util";
import crypto from "crypto"; 
import fs from "fs";
import path from "path";
import stableStringify
  from "json-stable-stringify";


function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9]/g, "_");
}

function verifySignature(
  hash: string,
  signature: string,
  publicKey: string
) {
  return nacl.sign.detached.verify(
    Buffer.from(hash, "hex"),
    decodeBase64(signature),
    decodeBase64(publicKey)
  );
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ barcode: string }> }
) {
  try {
    const { barcode } = await context.params;

    if (!barcode) {
      return NextResponse.json({ error: "Barcode tidak valid" }, { status: 400 });
    }

    const result = await prisma.result.findUnique({
      where: { barcode },
      include: {
        User: true,
        Attempt: {
          include: {
            TestType: true,
            User: true,
          },
        },
        ValidatedBy: true,
      },
    });
if (!result) {
  const archived =
    await prisma.archivedBarcode.findUnique({
      where: {
        barcode,
      },
    });

  if (archived) {
    return NextResponse.json({
      status: "REVISED",
      message:
        "Dokumen ini telah direvisi dan tidak lagi berlaku. Silakan gunakan dokumen terbaru yang telah divalidasi ulang.",
    });
  }

  return NextResponse.json({
    error: "Report tidak ditemukan",
  });
}
    // =============================
    // 🔐 1. VERIFY SIGNATURE
    // =============================
//     let isSignatureValid = false;

//     if (
//       result.Signature &&
//       result.dataHash &&
//       result.ValidatedBy?.PublicKey
//     ) {
// isSignatureValid = verifySignature(
//   result.dataHash!,
//   result.Signature,
//   result.ValidatedBy.PublicKey
// );
//     }

    // =============================
    // 📄 2. VERIFY PDF HASH
    // =============================
//     const currentPdfContent = JSON.stringify({
//       userId: result.userId,
//       testTypeId: result.testTypeId,
//       createdAt: result.createdAt,
//         // 🔥 TAMBAH INI
//   fullName: result.User?.fullName,
//   birthDate: result.User?.birthDate,
//   education: result.User?.education,
//   tujuan: result.User?.tujuan,

//       kesimpulan: result.kesimpulan,
//       kesimpulanSikap: result.kesimpulanSikap,
//       kesimpulanBelajar: result.kesimpulanBelajar,
//       kesimpulanUmum: result.kesimpulanumum,
//       saranPengembangan: result.saranpengembangan,

//       scoreIq: result.scoreiq,
//       jumlahBenar: result.jumlahbenar,

//       aspek1: result.aspek1,
//       aspek2: result.aspek2,
//       aspek3: result.aspek3,
//       aspek4: result.aspek4,
//     });
//     const dataForHash = {
//   userId: result.userId,
//   testTypeId: result.testTypeId,
//   createdAt: result.createdAt,

//   fullName: result.User?.fullName,
//   birthDate: result.User?.birthDate,
//   education: result.User?.education,
//   tujuan: result.User?.tujuan,

//   kesimpulan: result.kesimpulan,
//   kesimpulanSikap: result.kesimpulanSikap,
//   kesimpulanBelajar: result.kesimpulanBelajar,
//   kesimpulanUmum: result.kesimpulanumum,
//   saranPengembangan: result.saranpengembangan,

//   scoreIq: result.scoreiq,
//   jumlahBenar: result.jumlahbenar,

//   aspek1: result.aspek1,
//   aspek2: result.aspek2,
//   aspek3: result.aspek3,
//   aspek4: result.aspek4,
// };

//     // 🔐 DATA HASH CHECK (cek DB tampering)
// const currentDataHash = crypto
//   .createHash("sha512")
//   .update(stableStringify(dataForHash)) // 🔥 WAJIB
//   .digest("hex");

// const isDataValid = currentDataHash === result.dataHash;

// const safeName = sanitizeFileName(result.User.fullName);

// const fileName = `HPP_${safeName}.pdf`;

// const filePath = path.join(
//   process.cwd(),
//   "public",
//   "reports",
//   fileName
// );

// if (!fs.existsSync(filePath)) {
//   return NextResponse.json(
//     { error: "File PDF tidak ditemukan di server" },
//     { status: 500 }
//   );
// }

// const pdfBuffer = fs.readFileSync(filePath);

// const currentPdfHash = crypto
//   .createHash("sha512")
//   .update(pdfBuffer)
//   .digest("hex");
//   console.log("PDF HASH (CHECK):", currentPdfHash);
// =============================
// 📄 2. VERIFY DATA HASH
// =============================
// const canonicalData = {
//   userId: result.userId,
//   testTypeId: result.testTypeId,

//   fullName: result.User?.fullName,
//   birthDate: result.User?.birthDate,
//   education: result.User?.education,
//   tujuan: result.User?.tujuan,

//   scoreiq: result.scoreiq,
//   iq: result.iq,
//   keteranganiq: result.keteranganiq,

//   aspek1: result.aspek1,
//   aspek2: result.aspek2,
//   aspek3: result.aspek3,
//   aspek4: result.aspek4,

//   kesimpulan: result.kesimpulan,

//   kesimpulanSikap:
//     result.kesimpulanSikap,

//   kesimpulanKepribadian:
//     result.kesimpulanKepribadian,

//   kesimpulanBelajar:
//     result.kesimpulanBelajar,

//   kesimpulanumum:
//     result.kesimpulanumum,

//   saranpengembangan:
//     result.saranpengembangan,

//   rekomendasi: result.rekomendasi,

//   layak: result.layak,
//   belumLayak: result.belumLayak,
//   tidakLayak: result.tidakLayak,
// };

// const currentDataHash = crypto
//   .createHash("sha512")
//   .update(
//     stableStringify(canonicalData) || ""
//   )
//   .digest("hex");

// const isDataValid =
//   currentDataHash === result.dataHash;
    // const isPdfValid = currentPdfHash === result.pdfHash;
    const isDataValid = true;

    // =============================
    // 🧠 3. STATUS FINAL
    // =============================
//     let verificationStatus = "UNKNOWN";
//     let verificationMessage = "Belum diverifikasi";
// if (!result.Signature) {
//   verificationStatus = "UNSIGNED";

//   verificationMessage =
//     "Dokumen belum ditandatangani";
// }
// else if (isSignatureValid) {
//   verificationStatus = "VALID";

//   verificationMessage =
//     "Dokumen valid dan diterbitkan oleh sistem";
// }
// else {
//   verificationStatus =
//     "INVALID_SIGNATURE";

//   verificationMessage =
//     "Tanda tangan digital tidak valid";
// }
let verificationStatus = "REGISTERED";
let verificationMessage =
  "Dokumen terdaftar di sistem";
// else if (
//   isSignatureValid &&
//   isDataValid
// ) {
//   verificationStatus =
//     "VALID";

//   verificationMessage =
//     "Dokumen valid dan diterbitkan oleh sistem";
// }
// else if (
//   isSignatureValid &&
//   !isDataValid
// ) {
//   verificationStatus =
//     "INVALID_DATA";

//   verificationMessage =
//     "Data hasil tes pada server telah berubah";
// }
// else {
//   verificationStatus =
//     "INVALID_SIGNATURE";

//   verificationMessage =
//     "Tanda tangan digital tidak valid";
// }
    // =============================
    // ⏳ EXPIRED CHECK
    // =============================
    if (result.expiresAt && result.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "QR Code ini sudah kadaluarsa." },
        { status: 410 }
      );
    }

    const ttdValidationMessage = result.validated
      ? `Dokumen sudah ditandatangani secara elektronik oleh Psikolog ${result.ValidatedBy?.fullName} pada tanggal ${result.validatedAt?.toLocaleDateString("id-ID") || "-"}`
      : null;

  return NextResponse.json({
  attempt: result.Attempt,
  result,

  kesimpulan: result.kesimpulan,
  kesimpulanSikap: result.kesimpulanSikap,
  kesimpulanKepribadian: result.kesimpulanKepribadian,
  kesimpulanBelajar: result.kesimpulanBelajar,
  kesimpulanUmum: result.kesimpulanumum,
  saranPengembangan: result.saranpengembangan,

  barcode: result.barcode,
  expiresAt: result.expiresAt,

  // isSignatureValid,
  // isDataValid,
  
  verificationStatus,
  verificationMessage,

  ttdValidationMessage,

  verifiedBy: {
    name: result.ValidatedBy?.fullName,
    str: result.ValidatedBy?.strNumber,
    sipp: result.ValidatedBy?.sippNumber,
  },

  // verificationDetails: {
  //   signature: isSignatureValid,
  //   // data: isDataValid,
  // }
});
    

  } catch (err) {
    console.error("Error get report:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// import { prisma } from "@/lib/prisma";
// import { NextRequest, NextResponse } from "next/server";
// import nacl from "tweetnacl";
// import { decodeUTF8, decodeBase64 } from "tweetnacl-util";
// import crypto from "crypto"; 
// import fs from "fs";
// import path from "path";


// function stableStringify(obj: any) {
//   return JSON.stringify(obj, Object.keys(obj).sort());
// }
// function sanitizeFileName(name: string) {
//   return name.replace(/[^a-zA-Z0-9]/g, "_");
// }

// function verifySignature(
//   hash: string,
//   signature: string,
//   publicKey: string
// ) {
//   return nacl.sign.detached.verify(
//     Buffer.from(hash, "hex"),
//     decodeBase64(signature),
//     decodeBase64(publicKey)
//   );
// }

// export async function GET(
//   req: NextRequest,
//   context: { params: Promise<{ barcode: string }> }
// ) {
//   try {
//     const { barcode } = await context.params;

//     if (!barcode) {
//       return NextResponse.json({ error: "Barcode tidak valid" }, { status: 400 });
//     }

//     const result = await prisma.result.findUnique({
//       where: { barcode },
//       include: {
//         User: true,
//         Attempt: {
//           include: {
//             TestType: true,
//             User: true,
//           },
//         },
//         ValidatedBy: true,
//       },
//     });

//     if (!result) {
//       return NextResponse.json(
//         { error: "Report tidak ditemukan" },
//         { status: 404 }
//       );
//     }

//     // =============================
//     // 🔐 1. VERIFY SIGNATURE
//     // =============================
//     let isSignatureValid = false;

//     if (
//       result.Signature &&
//       result.signedHash &&
//       result.ValidatedBy?.PublicKey
//     ) {
//       isSignatureValid = verifySignature(
//         result.signedHash,
//         result.Signature,
//         result.ValidatedBy.PublicKey
//       );
//     }

//     // =============================
//     // 📄 2. VERIFY PDF HASH
//     // =============================
//     const currentPdfContent = JSON.stringify({
//       userId: result.userId,
//       testTypeId: result.testTypeId,
//       createdAt: result.createdAt,
//         // 🔥 TAMBAH INI
//   fullName: result.User?.fullName,
//   birthDate: result.User?.birthDate,
//   education: result.User?.education,
//   tujuan: result.User?.tujuan,

//       kesimpulan: result.kesimpulan,
//       kesimpulanSikap: result.kesimpulanSikap,
//       kesimpulanBelajar: result.kesimpulanBelajar,
//       kesimpulanUmum: result.kesimpulanumum,
//       saranPengembangan: result.saranpengembangan,

//       scoreIq: result.scoreiq,
//       jumlahBenar: result.jumlahbenar,

//       aspek1: result.aspek1,
//       aspek2: result.aspek2,
//       aspek3: result.aspek3,
//       aspek4: result.aspek4,
//     });
//     const dataForHash = {
//   userId: result.userId,
//   testTypeId: result.testTypeId,
//   createdAt: result.createdAt,

//   fullName: result.User?.fullName,
//   birthDate: result.User?.birthDate,
//   education: result.User?.education,
//   tujuan: result.User?.tujuan,

//   kesimpulan: result.kesimpulan,
//   kesimpulanSikap: result.kesimpulanSikap,
//   kesimpulanBelajar: result.kesimpulanBelajar,
//   kesimpulanUmum: result.kesimpulanumum,
//   saranPengembangan: result.saranpengembangan,

//   scoreIq: result.scoreiq,
//   jumlahBenar: result.jumlahbenar,

//   aspek1: result.aspek1,
//   aspek2: result.aspek2,
//   aspek3: result.aspek3,
//   aspek4: result.aspek4,
// };

// //     // 🔐 DATA HASH CHECK (cek DB tampering)
// // const currentDataHash = crypto
// //   .createHash("sha512")
// //   .update(stableStringify(dataForHash)) // 🔥 WAJIB
// //   .digest("hex");

// // const isDataValid = currentDataHash === result.dataHash;

// // const safeName = sanitizeFileName(result.User.fullName);

// // const fileName = `HPP_${safeName}.pdf`;

// // const filePath = path.join(
// //   process.cwd(),
// //   "public",
// //   "reports",
// //   fileName
// // );

// // if (!fs.existsSync(filePath)) {
// //   return NextResponse.json(
// //     { error: "File PDF tidak ditemukan di server" },
// //     { status: 500 }
// //   );
// // }

// // const pdfBuffer = fs.readFileSync(filePath);

// // const currentPdfHash = crypto
// //   .createHash("sha512")
// //   .update(pdfBuffer)
// //   .digest("hex");
// //   console.log("PDF HASH (CHECK):", currentPdfHash);
// // =============================
// // 📄 2. VERIFY DATA HASH
// // =============================
// const canonicalData = {
//   userId: result.userId,
//   testTypeId: result.testTypeId,

//   fullName: result.User?.fullName,
//   birthDate: result.User?.birthDate,
//   education: result.User?.education,
//   tujuan: result.User?.tujuan,

//   scoreiq: result.scoreiq,
//   iq: result.iq,
//   keteranganiq: result.keteranganiq,

//   aspek1: result.aspek1,
//   aspek2: result.aspek2,
//   aspek3: result.aspek3,
//   aspek4: result.aspek4,

//   kesimpulan: result.kesimpulan,

//   kesimpulanSikap:
//     result.kesimpulanSikap,

//   kesimpulanKepribadian:
//     result.kesimpulanKepribadian,

//   kesimpulanBelajar:
//     result.kesimpulanBelajar,

//   kesimpulanumum:
//     result.kesimpulanumum,

//   saranpengembangan:
//     result.saranpengembangan,

//   rekomendasi: result.rekomendasi,

//   layak: result.layak,
//   belumLayak: result.belumLayak,
//   tidakLayak: result.tidakLayak,
// };

// const currentDataHash = crypto
//   .createHash("sha512")
//   .update(stableStringify(canonicalData))
//   .digest("hex");

// const isDataValid =
//   currentDataHash === result.dataHash;
//     // const isPdfValid = currentPdfHash === result.pdfHash;

//     // =============================
//     // 🧠 3. STATUS FINAL
//     // =============================
//     let verificationStatus = "UNKNOWN";
//     let verificationMessage = "Belum diverifikasi";
// if (!result.Signature) {
//   verificationStatus = "UNSIGNED";
//   verificationMessage = "Dokumen belum ditandatangani";
// } else if (isSignatureValid && isDataValid) {
//   verificationStatus = "VALID";
//   verificationMessage = "Dokumen valid dan tidak mengalami perubahan";
// } else if (!isDataValid) {
//   verificationStatus = "INVALID_DATA";
//   verificationMessage = "Data telah diubah di server";
// // } else if (!isPdfValid) {
// //   verificationStatus = "INVALID_PDF";
// //   verificationMessage = "File PDF telah diubah";
// } else if (!isSignatureValid) {
//   verificationStatus = "INVALID_SIGNATURE";
//   verificationMessage = "Tanda tangan tidak valid";
// }
//     // =============================
//     // ⏳ EXPIRED CHECK
//     // =============================
//     if (result.expiresAt && result.expiresAt < new Date()) {
//       return NextResponse.json(
//         { error: "QR Code ini sudah kadaluarsa." },
//         { status: 410 }
//       );
//     }

//     const ttdValidationMessage = result.validated
//       ? `Dokumen sudah ditandatangani secara elektronik oleh Psikolog ${result.ValidatedBy?.fullName} pada tanggal ${result.validatedAt?.toLocaleDateString("id-ID") || "-"}`
//       : null;

//   return NextResponse.json({
//   attempt: result.Attempt,
//   result,

//   kesimpulan: result.kesimpulan,
//   kesimpulanSikap: result.kesimpulanSikap,
//   kesimpulanKepribadian: result.kesimpulanKepribadian,
//   kesimpulanBelajar: result.kesimpulanBelajar,
//   kesimpulanUmum: result.kesimpulanumum,
//   saranPengembangan: result.saranpengembangan,

//   barcode: result.barcode,
//   expiresAt: result.expiresAt,

//   isSignatureValid,
//   isDataValid,
//   verificationStatus,
//   verificationMessage,

//   ttdValidationMessage,

//   verifiedBy: {
//     name: result.ValidatedBy?.fullName,
//     str: result.ValidatedBy?.strNumber,
//     sipp: result.ValidatedBy?.sippNumber,
//   },

//   verificationDetails: {
//     signature: isSignatureValid,
//     data: isDataValid,
//   }
// });
    

//   } catch (err) {
//     console.error("Error get report:", err);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }



// // import { prisma } from "@/lib/prisma";
// // import { NextResponse } from "next/server";

// // export async function GET(
// //   req: Request,
// //   { params }: { params: { barcode: string } }
// // ) {
// //   const { barcode } = params;

// //   if (!barcode) {
// //     return NextResponse.json({ error: "Barcode tidak valid" }, { status: 400 });
// //   }

// //   try {
// //     // Cari result berdasarkan barcode
// //     const result = await prisma.result.findUnique({
// //       where: { barcode },
// //       include: {
// //         User: true,
// //         Attempt: {
// //           include: {
// //             TestType: true,
// //             User: true,
// //           },
// //         },
// //         ValidatedBy: true,
// //       },
// //     });

// //     if (!result) {
// //       return NextResponse.json(
// //         { error: "Report tidak ditemukan" },
// //         { status: 404 }
// //       );
// //     }

// //     if (result.expiresAt && result.expiresAt < new Date()) {
// //       return NextResponse.json(
// //         { error: "QR Code ini sudah kadaluarsa." },
// //         { status: 410 }
// //       );
// //     }

// //     // Buat pesan TTD yang lebih human-readable
// //     const ttdValidationMessage = result.validated
// //       ? `Dokumen sudah ditandatangani secara elektronik oleh Psikolog ${result.ValidatedBy?.fullName} pada tanggal ${result.validatedAt?.toLocaleDateString("id-ID") || "-"}`
// //       : null;

// //     return NextResponse.json({
// //       attempt: result.Attempt,
// //       result,
// //       kesimpulan: result.kesimpulan,
// //       ttd: result.User?.ttdUrl, // optional
// //       barcode: result.barcode,
// //       expiresAt: result.expiresAt,
// //       validationNotes: result.validated
// //         ? `Hasil divalidasi oleh ${result.ValidatedBy?.fullName || "Psikolog"}, pada ${result.validatedAt ? result.validatedAt.toLocaleDateString("id-ID") : "-"}.
// // Berlaku sampai: ${result.expiresAt ? result.expiresAt.toLocaleDateString("id-ID") : "-"}` 
// //         : null,
// //       ttdValidationMessage, // 🔥 tambahkan ini
// //     });

// //   } catch (err) {
// //     console.error("Error get report:", err);
// //     return NextResponse.json(
// //       { error: "Internal Server Error" },
// //       { status: 500 }
// //     );
// //   }
// // }


// import { prisma } from "@/lib/prisma";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(
//   req: NextRequest,
//   context: { params: Promise<{ barcode: string }> } // ⬅️ harus pakai Promise
// ) {
//   try {
//     const { barcode } = await context.params; // ⬅️ jangan lupa `await`

//     if (!barcode) {
//       return NextResponse.json({ error: "Barcode tidak valid" }, { status: 400 });
//     }

//     const result = await prisma.result.findUnique({
//       where: { barcode },
//       include: {
//         User: true,
//         Attempt: {
//           include: {
//             TestType: true,
//             User: true,
//           },
//         },
//         ValidatedBy: true,
//       },
//     });

//     if (!result) {
//       return NextResponse.json(
//         { error: "Report tidak ditemukan" },
//         { status: 404 }
//       );
//     }

//     if (result.expiresAt && result.expiresAt < new Date()) {
//       return NextResponse.json(
//         { error: "QR Code ini sudah kadaluarsa." },
//         { status: 410 }
//       );
//     }

//     const ttdValidationMessage = result.validated
//       ? `Dokumen sudah ditandatangani secara elektronik oleh Psikolog ${result.ValidatedBy?.fullName} pada tanggal ${result.validatedAt?.toLocaleDateString("id-ID") || "-"}`
//       : null;

//     return NextResponse.json({
//       attempt: result.Attempt,
//       result,
//       kesimpulan: result.kesimpulan,
//       kesimpulanSikap: result.kesimpulanSikap,
//   kesimpulanKepribadian: result.kesimpulanKepribadian,
//   kesimpulanBelajar: result.kesimpulanBelajar,
//   kesimpulanUmum: result.kesimpulanumum,
//   saranPengembangan: result.saranpengembangan,

//       ttd: result.User?.ttdUrl,
//       barcode: result.barcode,
//       expiresAt: result.expiresAt,
//       validationNotes: result.validated
//         ? `Hasil divalidasi oleh ${result.ValidatedBy?.fullName || "Psikolog"}, pada ${result.validatedAt ? result.validatedAt.toLocaleDateString("id-ID") : "-"}.
// Berlaku sampai: ${result.expiresAt ? result.expiresAt.toLocaleDateString("id-ID") : "-"}` 
//         : null,
//       ttdValidationMessage,
//     });
//   } catch (err) {
//     console.error("Error get report:", err);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

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


import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ barcode: string }> } // ⬅️ harus pakai Promise
) {
  try {
    const { barcode } = await context.params; // ⬅️ jangan lupa `await`

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
      return NextResponse.json(
        { error: "Report tidak ditemukan" },
        { status: 404 }
      );
    }

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
      ttd: result.User?.ttdUrl,
      barcode: result.barcode,
      expiresAt: result.expiresAt,
      validationNotes: result.validated
        ? `Hasil divalidasi oleh ${result.ValidatedBy?.fullName || "Psikolog"}, pada ${result.validatedAt ? result.validatedAt.toLocaleDateString("id-ID") : "-"}.
Berlaku sampai: ${result.expiresAt ? result.expiresAt.toLocaleDateString("id-ID") : "-"}` 
        : null,
      ttdValidationMessage,
    });
  } catch (err) {
    console.error("Error get report:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

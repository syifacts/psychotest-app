// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { renderToStream } from '@react-pdf/renderer';
// import MbtiReport from "@/components/report/reportDocumentMBTI";
// import React from 'react'; // <-- TAMBAHKAN BARIS INI

// export async function GET(
//   req: NextRequest,
//   { params }: { params: { attemptId: string } }
// ) {
//   try {
//     const attemptId = parseInt(params.attemptId, 10);
//     if (isNaN(attemptId)) {
//       return NextResponse.json({ error: "Invalid attemptId" }, { status: 400 });
//     }

//     // 1. Ambil semua data yang diperlukan untuk laporan
//     const result = await prisma.personalityResult.findUnique({
//       where: { attemptId },
//       include: {
//         User: true, // Data pengguna (nama, tgl lahir, dll)
//         Attempt: true, // Data pengerjaan (tgl tes)
//         TestType: true, // Data jenis tes
//       }
//     });

//     if (!result) {
//       return NextResponse.json({ error: "Hasil tes tidak ditemukan" }, { status: 404 });
//     }
    
//     const description = await prisma.personalityDescription.findUnique({
//         where: {
//             testTypeId_type: {
//                 testTypeId: result.testTypeId,
//                 type: result.resultType,
//             }
//         }
//     });

//     if (!description) {
//         return NextResponse.json({ error: "Deskripsi untuk tipe ini tidak ditemukan" }, { status: 404 });
//     }

//     const reportData = {
//         user: result.User,
//         attempt: result.Attempt,
//         result,
//         description
//     };

//     // 2. Render komponen React ke dalam stream PDF
//     const pdfStream = await renderToStream(<MbtiReport data={reportData} />);

//     // 3. Kirim stream sebagai respons
//     return new NextResponse(pdfStream as any, {
//       headers: {
//         'Content-Type': 'application/pdf',
//         'Content-Disposition': `inline; filename="hasil-tes-${result.resultType}-${attemptId}.pdf"`
//       },
//     });

//   } catch (err) {
//     console.error("❌ Error generating PDF report:", err);
//     return NextResponse.json({ error: "Gagal membuat laporan PDF" }, { status: 500 });
//   }
// }


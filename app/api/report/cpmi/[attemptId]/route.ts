// /app/api/report/cpmi/[attemptId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { attemptId: string } }
) {
  try {
    const attemptId = Number(params.attemptId);

    const result = await prisma.result.findFirst({
      where: {
        attemptId,
        testTypeId: 30, // khusus CPMI
      },
      include: { User: true },
    });

    if (!result) {
      return NextResponse.json(
        { error: "Hasil tidak ditemukan" },
        { status: 404 }
      );
    }

    // Buat PDF
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {});

    // Generate nomor dokumen otomatis
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // 01-12
    const year = now.getFullYear();
    const nomorDokumen = `${result.id}/PSI-ETP/${month}/${year}`;

    // Header
    doc.fontSize(16).text("Laporan Hasil Pemeriksaan Psikologi", {
      align: "center",
    });
    doc.fontSize(14).text("Psychological Assessment Report CPMI", {
      align: "center",
    });
    doc.moveDown();

    // Nomor dokumen
    doc.fontSize(12).text(`Nomor Dokumen: ${nomorDokumen}`, { align: "center" });
    doc.moveDown();

    // Identitas klien
    doc.fontSize(12).text(`Nama: ${result.User.fullName}`);
    doc.text(
      `Usia: ${
        result.User.birthDate
          ? new Date().getFullYear() - result.User.birthDate.getFullYear()
          : "-"
      }`
    );
    doc.text(`Pendidikan: ${result.User.education || "-"}`);
    doc.text(`Tujuan: Bekerja ke Luar Negeri`);
    doc.moveDown();

    // Ringkasan hasil intelektual
    doc.text("I. KEMAMPUAN INTELEKTUAL", { underline: true });
    doc.text(`IQ Score: ${result.scoreiq} (${result.kategoriiq})`);
    doc.text(`Status: ${result.keteranganiqCPMI}`);
    doc.moveDown();

    // Tambahkan tabel
    const startX = doc.x;
    let startY = doc.y;

    // Header tabel (pakai bold built-in)
    doc.font("Times-Bold");
    doc.text("No.", startX, startY, { width: 30, align: "center" });
    doc.text("Aspek yang dinilai", startX + 30, startY, {
      width: 150,
      align: "center",
    });
    doc.text("Uraian", startX + 180, startY, { width: 200, align: "center" });
    doc.text("Kategori", startX + 380, startY, { width: 100, align: "center" });

    doc.moveDown(1.5);
    startY = doc.y;
    doc.font("Times-Roman");

    // Data tabel
    const rows = [
      {
        no: 1,
        aspek: "Kemampuan Konsentrasi",
        uraian:
          "Kemampuan untuk tetap fokus sekalipun dalam situasi banyaknya stimulus yang menganggu.",
      },
      {
        no: 2,
        aspek: "Kecermatan/Ketelitian",
        uraian:
          "Kemampuan untuk memperhatikan hal-hal detil maupun prosedur.",
      },
      {
        no: 3,
        aspek: "Ketahanan Kerja",
        uraian:
          "Kemampuan untuk bertahan dalam situasi kerja yang menekan/kemampuan beradaptasi dengan stres.",
      },
      {
        no: 4,
        aspek: "Kemampuan Penyesuaian Diri",
        uraian: "Kemampuan untuk beradaptasi dalam situasi apapun.",
      },
      {
        no: 5,
        aspek: "Stabilitas Emosi",
        uraian:
          "Kemampuan untuk mengelola kondisi diri, tidak terpengaruh oleh situasi yang terjadi.",
      },
      {
        no: 6,
        aspek: "Pengendalian Diri",
        uraian:
          "Kemampuan untuk menerima kondisi diri maupun lingkungan, sehingga terlihat sebagai pribadi yang matang.",
      },
    ];

    rows.forEach((row, i) => {
      const rowY = startY + i * 40; // tinggi row
      doc.text(row.no.toString(), startX, rowY, { width: 30, align: "center" });
      doc.text(row.aspek, startX + 30, rowY, { width: 150 });
      doc.text(row.uraian, startX + 180, rowY, { width: 200 });
      doc.text("T / S / R", startX + 380, rowY, {
        width: 100,
        align: "center",
      });
    });

    // Total Score
    const lastRowY = startY + rows.length * 40 + 10;
    doc.font("Times-Bold");
    doc.text("TOTAL SCORE", startX, lastRowY, { width: 180 });
    doc.text(`${result.scoreiq ?? "-"}`, startX + 180, lastRowY, {
      width: 200,
    });

    // Kesimpulan umum
    doc.moveDown();
    doc.font("Times-Roman");
    doc.text("Kesimpulan Umum:");
    doc.text(
      `Berdasarkan hasil pemeriksaan, Sdr. ${result.User.fullName} ${
        result.keteranganiqCPMI === "LULUS" ? "DISARANKAN" : "TIDAK DISARANKAN"
      } untuk bekerja ke luar negeri.`
    );
    doc.moveDown();

    // Identitas Psikolog
    doc.text("Nama Psikolog: Tiara Mustika Ayu, M.Psi, Psikolog");
    doc.text("Nomor STR/SIK: 20060366");
    doc.text("Nomor SIPP/SIPPK: 0101061157");

    doc.end();

    return new NextResponse(Buffer.concat(chunks), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="report_cpmi_${attemptId}.pdf"`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Gagal generate PDF" },
      { status: 500 }
    );
  }
}

// components/report/ReportCPMIDocument.tsx
import React, { useEffect, useState } from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import QRCode from "qrcode";

interface AspekScore {
  no: number;
  kategori: string;
  total?: number;
}

interface Props {
  attempt: any;
  result: {
    id: number;
    jumlahbenar: number;
    scoreiq?: number;
    kategoriiq?: string;
    keteranganiqCPMI?: string;
    kesimpulan: string;
    aspekSTK: string | AspekScore[];
    ValidatedBy?: {
      fullName: string;
      lembagalayanan?: string;
    };
  };
  kesimpulan?: string;
  ttd?: string;
  barcode?: string;           // ✅ barcode ID
  expiresAt?: string;         // ✅ tanggal expired
  validationNotes?: string;   // ✅ optional catatan validasi
}

const styles = StyleSheet.create({
  page: { 
    paddingTop: 40, 
    paddingBottom: 40, 
    paddingHorizontal: 50, 
    fontSize: 12, 
    fontFamily: "Times-Roman" 
  },
   tableRow: {
    flexDirection: "row",
  },
  cell: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    flexWrap: 'wrap',
  },
  headerCenter: { textAlign: "center", marginBottom: 10 },
  title: { fontSize: 16, fontWeight: "bold" },
  subtitle: { fontSize: 14, marginBottom: 5 },
  sectionTitle: { marginTop: 10, marginBottom: 5, textDecoration: "underline", fontWeight: "bold" },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, paddingBottom: 3, marginTop: 10, fontWeight: "bold" },
//  tableRow: { flexDirection: "row", paddingVertical: 3 },
  bold: { fontFamily: "Times-Bold" },
  text: { lineHeight: 1.5 },
  ttd: { width: 90, height: 90 },
  qr: { width: 100, height: 100, marginTop: 10 },
  validation: { fontSize: 10, color: "gray", marginTop: 3 },
});

export default function ReportCPMIDocument({ attempt, result, kesimpulan, ttd, barcode, expiresAt, validationNotes }: Props) {
  const [qrCodeBase64, setQrCodeBase64] = useState<string>("");

  useEffect(() => {
    if (barcode) {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/report/view/${barcode}`;
      QRCode.toDataURL(url)
        .then(setQrCodeBase64)
        .catch((err) => console.error("QR generation error:", err));
    }
  }, [barcode]);

  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const nomorUrut = String(result?.id || 1).padStart(2, "0");
  const nomorDokumen = `${nomorUrut}/PSI-ETP/${month}/${year}`;

  let aspekScores: AspekScore[] = [];
  if (Array.isArray(result.aspekSTK)) aspekScores = result.aspekSTK;
  else if (typeof result.aspekSTK === "string") {
    try { aspekScores = JSON.parse(result.aspekSTK); } 
    catch { aspekScores = []; }
  }

  const kesimpulanFinal = kesimpulan || result.kesimpulan || "";
  const kesimpulanPDF = kesimpulanFinal
    .replace(/{name}/g, attempt?.User?.fullName || "-")
    .replace(/{scoreiq}/g, result?.scoreiq?.toString() || "-");

  const rows = [
    { no: 1, aspek: "Kemampuan Konsentrasi", uraian: "Kemampuan untuk tetap fokus sekalipun dalam situasi banyaknya stimulus yang menganggu." },
    { no: 2, aspek: "Kecermatan/Ketelitian", uraian: "Kemampuan untuk memperhatikan hal-hal detil maupun prosedur." },
    { no: 3, aspek: "Ketahanan Kerja", uraian: "Kemampuan untuk bertahan dalam situasi kerja yang menekan/kemampuan beradaptasi dengan stres." },
    { no: 4, aspek: "Kemampuan Penyesuaian Diri", uraian: "Kemampuan untuk beradaptasi dalam situasi apapun." },
    { no: 5, aspek: "Stabilitas Emosi", uraian: "Kemampuan untuk mengelola kondisi diri, tidak terpengaruh oleh situasi yang terjadi." },
    { no: 6, aspek: "Pengendalian Diri", uraian: "Kemampuan untuk menerima kondisi diri maupun lingkungan, sehingga terlihat sebagai pribadi yang matang." },
  ];

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return "-";
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  return (
    <Document>
      {/* Halaman 1 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Laporan Hasil Pemeriksaan Psikologi</Text>
          <Text style={styles.subtitle}>Psychological Assessment Report CPMI</Text>
          <Text style={styles.text}>Nomor Dokumen: {nomorDokumen}</Text>
        </View>
        <View style={{ marginTop: 20 }}>
          <Text style={styles.text}>Nama: {attempt?.User?.fullName || "-"}</Text>
          <Text style={styles.text}>Usia: {calculateAge(attempt?.User?.birthDate)} Tahun</Text>
          <Text style={styles.text}>Pendidikan: {attempt?.User?.education || "-"}</Text>
          <Text style={styles.text}>Tujuan: Bekerja ke Luar Negeri</Text>
        </View>
        <View style={{ marginTop: 30 }}>
          <Text style={styles.text}>
            Tanggal Pemeriksaan: {new Date(attempt?.createdAt || Date.now()).toLocaleDateString('id-ID', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </Text>
        </View>
      </Page>

      {/* Halaman 2 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerCenter}>
          <Text style={styles.sectionTitle}>RINGKASAN HASIL PEMERIKSAAN PSIKOLOGI</Text>
          <Text style={styles.text}>(Resume of Psychological Assessment)</Text>
        </View>

        {/* Identitas Psikolog */}
        <View style={{ marginTop: 20, marginBottom: 20 }}>
          <Text style={[styles.bold, styles.text]}>Identitas Psikolog / Psychologist's Identity</Text>
          <Text style={styles.text}>Nama Psikolog: {result?.ValidatedBy?.fullName || "-"}</Text>
          <Text style={styles.text}>Lembaga Layanan Psikologi: {result?.ValidatedBy?.lembagalayanan || "-"}</Text>
          <Text style={styles.text}>
            Tanggal Pemeriksaan: {new Date().toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" })}
          </Text>
        </View>

{/* Tabel CPMI */}
<View style={{ marginTop: 10, borderWidth: 1, borderColor: "#000" }}>
  {/* Header */}
  <View style={[styles.tableRow, { backgroundColor: "#f0f0f0", borderBottomWidth: 1, borderColor: "#000" }]}>
    <Text style={[styles.cell, { width: 30, textAlign: "center", fontWeight: "bold", fontSize: 13 }]}>No.</Text>
    <Text style={[styles.cell, { width: 150, textAlign: "center", fontWeight: "bold", fontSize: 13, borderLeftWidth: 1 }]}>Aspek yang dinilai</Text>
    <Text style={[styles.cell, { width: 250, textAlign: "center", fontWeight: "bold", fontSize: 13, borderLeftWidth: 1 }]}>Uraian</Text>
    <Text style={[styles.cell, { width: 60, textAlign: "center", fontWeight: "bold", fontSize: 13, borderLeftWidth: 1 }]}>T</Text>
    <Text style={[styles.cell, { width: 60, textAlign: "center", fontWeight: "bold", fontSize: 13, borderLeftWidth: 1 }]}>S</Text>
    <Text style={[styles.cell, { width: 60, textAlign: "center", fontWeight: "bold", fontSize: 13, borderLeftWidth: 1 }]}>R</Text>
  </View>

  {/* Rows */}
  {rows.map((row) => {
    const kategoriObj = aspekScores.find(a => a.no === Number(row.no));
    const kategoriNormalized = (kategoriObj?.kategori || "").trim().toUpperCase();
    return (
      <View key={row.no} style={[styles.tableRow, { borderBottomWidth: 1, borderColor: "#ccc" }]}>
        <Text style={[styles.cell, { width: 30, textAlign: "center", fontSize: 12, paddingVertical: 4 }]}>{row.no}</Text>
        <Text style={[styles.cell, { width: 150, fontSize: 12, paddingVertical: 4, flexWrap: 'wrap', borderLeftWidth: 1 }]}>{row.aspek}</Text>
        <Text style={[styles.cell, { width: 250, fontSize: 12, paddingVertical: 4, flexWrap: 'wrap', borderLeftWidth: 1 }]}>{row.uraian}</Text>
        <Text style={[styles.cell, { width: 60, textAlign: "center", fontSize: 12, borderLeftWidth: 1 }]}>{kategoriNormalized === "T" ? "X" : ""}</Text>
        <Text style={[styles.cell, { width: 60, textAlign: "center", fontSize: 12, borderLeftWidth: 1 }]}>{kategoriNormalized === "S" ? "X" : ""}</Text>
        <Text style={[styles.cell, { width: 60, textAlign: "center", fontSize: 12, borderLeftWidth: 1 }]}>{kategoriNormalized === "R" ? "X" : ""}</Text>
      </View>
    );
  })}


          {/* Footer Tabel / Legend */}
          <View style={{ marginTop: 10, borderBottomWidth:1, flexDirection: "row", alignItems: "center" }}>
            <Text style={[styles.bold, {marginLeft:30, marginRight: 10 }]}>Keterangan:</Text>
            <Text style={[styles.text, {marginLeft:30, marginTop: 14, marginRight: 15 }]}>T = Tinggi</Text>
            <Text style={[styles.text, {marginLeft:30, marginTop: 14, marginRight: 15 }]}>S = Sedang</Text>
            <Text style={[styles.text, {marginLeft:30, marginTop: 14 }]}>R = Rendah</Text>
          </View>

          {/* Status */}
          <View style={[styles.tableRow, { marginTop: 10, paddingTop: 5,alignItems: "center" ,borderBottomWidth:1, }]}>
            <Text style={{marginLeft:30, marginTop: 10,width: 180, fontFamily: "Times-Bold" }}>Status</Text>
            <Text style={{ marginTop: 10, width: 200 }}>{result?.keteranganiqCPMI ?? "-"}</Text>
          </View>

          {/* Kesimpulan */}
          <View style={{ marginTop: 15, marginBottom:15 }}>
            <Text style={[styles.bold, { marginLeft:30, marginBottom: 10 }]}>Kesimpulan Umum:</Text>
            <Text style={[styles.text, {marginLeft:30, marginRight:30, textAlign: "justify" }]}>{kesimpulanPDF || "Tidak ada kesimpulan tersedia"}</Text>
          </View>
        </View>

     {/* Footer TTD & QR */}
<View style={{ marginTop: 90, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
  {/* TTD Psikolog */}
  <View style={{ alignItems: "center" }}>
    <Text style={styles.text}>Psikolog,</Text>
    {ttd && <Image src={ttd} style={styles.ttd} />}
    <Text style={styles.text}>{result?.ValidatedBy?.fullName || "____________________"}</Text>
  </View>

  {/* QR Code Validasi di kanan bawah */}
  {qrCodeBase64 && (
    <View style={{ alignItems: "center", flexDirection: "column", marginTop:400 }}>
      <Text style={styles.text}>Scan untuk verifikasi dokumen</Text>
      <Image src={qrCodeBase64} style={styles.qr} />
      {expiresAt && <Text style={styles.validation}>Berlaku sampai: {new Date(expiresAt).toLocaleDateString("id-ID")}</Text>}
      {validationNotes && <Text style={styles.validation}>{validationNotes}</Text>}
    </View>
  )}
</View>

      </Page>
    </Document>
  );
}

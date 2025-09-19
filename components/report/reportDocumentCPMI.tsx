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
    barcodettd?: string; // ✅ tambahkan
    ValidatedBy?: {
      fullName: string;
      lembagalayanan?: string;
      ttdUrl?: string;  // ✅ tambahkan
      ttdHash?: string; // opsional, kalau mau ditampilkan
    };
  };
  kesimpulan?: string;
  ttd?: string;
  barcode?: string;
  expiresAt?: string;
  validationNotes?: string;
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
  validation: { 
  fontSize: 10, 
  color: "gray", 
  marginTop: 3, 
  flexWrap: "wrap",  // penting supaya teks panjang membungkus
  width: 120         // sesuaikan lebar container QR Code
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
});

export default function ReportCPMIDocument({ attempt, result, kesimpulan, ttd, barcode, expiresAt, validationNotes }: Props) {
  const [qrCodeBase64, setQrCodeBase64] = useState<string>("");

  useEffect(() => {
    if (barcode) {
      const url = `https://8a106cfaf826.ngrok-free.app/validate/${barcode}`;
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
     // Halaman 1
<Page size="A4" style={styles.page}>
  {/* HEADER dengan logo kiri & kanan */}
  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 40 }}>
    <Image src="/logoetp.png" style={{ width: 100, height: 40 }} />
    <Image src="/logoklinik.png" style={{ width: 100, height: 40 }} />
  </View>

  {/* JUDUL */}
  <View style={{ marginTop:30, marginBottom: 30 }}>
    <Text style={{ fontSize: 18, fontWeight: "bold", color: "#0A3D91" }}>
      Laporan Hasil
    </Text>
    <Text style={{ fontSize: 18, fontWeight: "bold", color: "#0A3D91", marginBottom: 6 }}>
      Pemeriksaan Psikologi
    </Text>
    <Text style={{ fontSize: 11, fontStyle: "italic", color: "gray", marginBottom: 4 }}>
      Psychological Assessment Report CPMI
    </Text>
    <Text style={{ fontSize: 11, color: "gray" }}>
      {nomorDokumen}
    </Text>
  </View>

  {/* IDENTITAS */}
  <View style={{ marginTop: 40 }}>
    <Text style={{ fontSize: 12, marginBottom: 6, color: "#0A3D91" }}>
      Nama : {attempt?.User?.fullName || "-"}
    </Text>
    <Text style={{ fontSize: 12, marginBottom: 6, color: "#0A3D91" }}>
      Usia : {calculateAge(attempt?.User?.birthDate)} Tahun
    </Text>
    <Text style={{ fontSize: 12, marginBottom: 6, color: "#0A3D91" }}>
      Pendidikan : {attempt?.User?.education || "-"}
    </Text>
    <Text style={{ fontSize: 12, marginBottom: 6, color: "#0A3D91" }}>
      Tujuan : Bekerja Ke Luar Negeri
    </Text>
  </View>
</Page>


      {/* Halaman 2 */}
    {/* Halaman 2 */}
<Page size="A4" style={styles.page}>
  {/* HEADER dengan logo kiri & kanan */}
  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 30 }}>
    <Image src="/logoetp.png" style={{ width: 100, height: 40 }} />
    <Image src="/logoklinik.png" style={{ width: 100, height: 40 }} />
  </View>

  {/* JUDUL */}
  <View style={{ alignItems: "center", marginBottom: 20 }}>
    <Text style={{ fontSize: 14, fontWeight: "bold", color: "#0A3D91" }}>
      RINGKASAN
    </Text>
    <Text style={{ fontSize: 14, fontWeight: "bold", color: "#0A3D91" }}>
      HASIL PEMERIKSAAN PSIKOLOGI
    </Text>
    <Text style={{ fontSize: 11, fontStyle: "italic", color: "gray" }}>
      (Resume of Psychological Assessment)
    </Text>
  </View>

   {/* Identitas Psikolog */}
   <View style={{ marginBottom: 20 }}>
     <Text style={[styles.bold, { marginBottom: 4 }]}>Identitas Psikolog</Text>
     <Text style={{ fontSize: 9, color: "gray", marginBottom: 6, borderBottomWidth: 1, borderColor: "#525252" }}>
       Psychologist’s Identity
     </Text>
 
     {/* Nama Psikolog */}
     <View style={{ flexDirection: "row", paddingVertical: 4 }}>
       <Text style={{ width: 180, fontFamily: "Times-Bold" }}>Nama Psikolog</Text>
       <Text style={{ flex: 1 }}> : {result?.ValidatedBy?.fullName || "-"}</Text>
     </View>
     <Text style={{ borderColor: "#525252", borderBottomWidth: 1,fontSize: 9, color: "gray", marginBottom: 4 }}>Psychologist’s Name</Text>
 
     {/* Lembaga */}
     <View style={{ flexDirection: "row", paddingVertical: 4 }}>
       <Text style={{ width: 180, fontFamily: "Times-Bold" }}>Nama Fasyankes/Lembaga Layanan Psikologi</Text>
       <Text style={{ flex: 1 }}> : {result?.ValidatedBy?.lembagalayanan || "-"}</Text>
     </View>
     <Text style={{ fontSize: 9, color: "gray", marginBottom: 4, borderColor: "#525252", borderBottomWidth: 1 }}>Clinic/Hospital</Text>
 
     {/* Tanggal */}
     <View style={{ flexDirection: "row", paddingVertical: 4 }}>
       <Text style={{ width: 180, fontFamily: "Times-Bold" }}>Tanggal Pemeriksaan</Text>
       <Text style={{ flex: 1 }}> : {new Date(attempt?.createdAt || Date.now()).toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" })}</Text>
     </View>
     <Text style={{ fontSize: 9, color: "gray", borderColor: "#525252", borderBottomWidth: 1 }}>Date of Assessment</Text>
   </View>
 

{/* Tabel CPMI */}
<View style={{ marginTop: 10, borderWidth: 1, borderColor: "#000" }}>
  {/* Header */}
  <View style={[styles.tableRow, { backgroundColor: "#d8b6d8", borderBottomWidth: 1, borderColor: "#000" }]}>
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


  </View>

{/* Legend / Keterangan dalam tabel */}
<View style={{ marginTop: 8, borderWidth: 1, borderColor: "#000" }}>
  <View style={[styles.tableRow, { backgroundColor: "#d8b6d8", borderBottomWidth: 1, borderColor: "#000" }]}>
    <Text style={[styles.cell, { fontWeight: "bold", fontSize: 10, textAlign: "center" }]}>Keterangan</Text>
    <Text style={[styles.cell, { fontSize: 10, textAlign: "center", borderLeftWidth: 1 }]}>R: Rendah</Text>
    <Text style={[styles.cell, { fontSize: 10, textAlign: "center", borderLeftWidth: 1 }]}>S: Sedang</Text>
    <Text style={[styles.cell, { fontSize: 10, textAlign: "center", borderLeftWidth: 1 }]}>T: Tinggi</Text>
  </View>
</View>

{/* Kesimpulan dalam tabel */}
<View style={{ marginTop: 10, borderWidth: 1, borderColor: "#000" }}>
  <View style={[styles.tableRow, { backgroundColor: "#d8b6d8", borderBottomWidth: 1, borderColor: "#000" }]}>
    <Text style={[styles.cell, { fontWeight: "bold", fontSize: 11 }]}>Kesimpulan</Text>
  </View>
  <View style={[styles.tableRow]}>
    <Text style={[styles.cell, { fontSize: 11, paddingVertical: 4, textAlign: "justify" }]}>
      {kesimpulanPDF || "Tidak ada kesimpulan tersedia"}
    </Text>
  </View>
</View>

{/* Footer TTD & QR */}
<View style={{ marginTop: 30, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
  
</View>
{/* Footer TTD & QR */}
<View
  style={{
    marginTop: 90,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  }}
>
 {/* TTD Psikolog + Nama + QR TTD */}  
<View style={{ alignItems: "center" }}>
  <Text style={styles.text}>Psikolog,</Text>
  
  {/* TTD Image */}
  {result?.ValidatedBy?.ttdUrl && (
    <Image src={result.ValidatedBy.ttdUrl} style={styles.ttd} />
  )}
  
  {/* Nama Psikolog */}
  <Text style={styles.text}>
    {result?.ValidatedBy?.fullName || "____________________"}
  </Text>

  {/* QR TTD tepat di bawah nama */}
  {result?.barcodettd && (
    <View style={{ alignItems: "center", marginTop: 5 }}>
      <Image src={result.barcodettd} style={styles.qr} />
    </View>
  )}
</View>


  {/* QR Code Validasi di kanan bawah */}
  {qrCodeBase64 && (
    <View style={{ alignItems: "center", flexDirection: "column", marginTop:400 }}>
      <Text style={styles.text}>Scan untuk verifikasi dokumen</Text>
      <Image src={qrCodeBase64} style={styles.qr} />
      {expiresAt && <Text style={styles.validation}>Berlaku sampai: {new Date(expiresAt).toLocaleDateString("id-ID")}</Text>}
      {validationNotes && (
  <View style={{ width: 120, marginTop: 3 }}>
    <Text style={[styles.validation, {textAlign:"justify", flexWrap: "wrap" }]}>{validationNotes}</Text>
  </View>
)}

    </View>
)}
</View>
      </Page>
    </Document>
  );
}

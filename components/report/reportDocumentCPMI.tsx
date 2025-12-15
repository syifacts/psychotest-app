// components/report/ReportCPMIDocument.tsx
import React, { useEffect, useState } from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import QRCode from "qrcode";

interface AspekScore {
  aspek: string;
  no: number;
  kategori: string;
  total?: number;
}
interface AspekScore2 {
  aspek: string;
  no: number;
  kategori: string;
  total?: number;
}
interface AspekScore3 {
  aspek: string;
  no: number;
  kategori: string;
  total?: number;
}
interface AspekScore4 {
  aspek: string;
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
    aspek1: string | AspekScore[];
    aspek2: string | AspekScore2[];
    aspek3: string | AspekScore3[];
    aspek4: string | AspekScore4[];
    barcodettd?: string; // ✅ tambahkan
    layak?: boolean;
  tidakLayak?: boolean;
  belumLayak?: boolean;
    ValidatedBy?: {
      fullName: string;
      lembagalayanan?: string;
      ttdUrl?: string;  // ✅ tambahkan
      ttdHash?: string; // opsional, kalau mau ditampilkan
        sippNumber?: string;
  strNumber?: string;
    };
  };
 kesimpulan?: string;                // umum / IQ
    kesimpulanSikap?: string;
    kesimpulanKepribadian?: string;
    kesimpulanBelajar?: string;
  ttd?: string;
  barcode?: string;
  expiresAt?: string;
  validationNotes?: string;
      saranpengembangan?: string;
    kesimpulanumum?: string;

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
    paddingTop: 4, paddingBottom: 4,
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

export default function ReportCPMIDocument({ attempt, result, kesimpulan, kesimpulanSikap,kesimpulanBelajar,kesimpulanKepribadian, ttd, barcode, expiresAt, validationNotes, kesimpulanumum, saranpengembangan }: Props) {
  const [qrCodeBase64, setQrCodeBase64] = useState<string>("");

  useEffect(() => {
    if (barcode) {
      const url = `https://psychotest-app.vercel.app/validate/${barcode}`;
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

try {
  if (Array.isArray(result.aspek1)) {
    aspekScores = result.aspek1;
  } else if (typeof result.aspek1 === "string") {
    aspekScores = JSON.parse(result.aspek1);
  }
} catch (e) {
  console.error("Gagal parse aspek1:", e);
  aspekScores = [];
}

console.log("aspekScores:", aspekScores);


let aspekScores2: AspekScore[] = [];

try {
  if (Array.isArray(result.aspek2)) {
    aspekScores2 = result.aspek2;
  } else if (typeof result.aspek2 === "string") {
    aspekScores2 = JSON.parse(result.aspek2);
  }
} catch (e) {
  console.error("Gagal parse aspek2:", e);
  aspekScores2 = [];
}

console.log("aspekScores2:", aspekScores2);

let aspekScores3: AspekScore[] = [];

try {
  if (Array.isArray(result.aspek3)) {
    aspekScores3 = result.aspek3;
  } else if (typeof result.aspek3 === "string") {
    aspekScores3 = JSON.parse(result.aspek3);
  }
} catch (e) {
  console.error("Gagal parse aspek2:", e);
  aspekScores2 = [];
}

console.log("aspekScores3:", aspekScores3);
//const aspekScores4 = result?.aspekScores4 || []; 
let aspekScores4: AspekScore[] = [];

try {
  if (Array.isArray(result.aspek4)) {
    aspekScores4 = result.aspek4;
  } else if (typeof result.aspek4 === "string") {
    aspekScores4 = JSON.parse(result.aspek4);
  }
} catch (e) {
  console.error("Gagal parse aspek4:", e);
  aspekScores2 = [];
}

console.log("aspekScores2:", aspekScores2);
const kesimpulanIQ = (kesimpulan || result.kesimpulan || "")
  .replace(/{name}/g, attempt?.User?.fullName || "-")
  .replace(/{scoreiq}/g, result?.scoreiq?.toString() || "-");

const kesimpulanSikapPDF = (kesimpulanSikap || "")
  .replace(/{name}/g, attempt?.User?.fullName || "-");

const kesimpulanKepribadianPDF = (kesimpulanKepribadian || "")
  .replace(/{name}/g, attempt?.User?.fullName || "-");

const kesimpulanBelajarPDF = (kesimpulanBelajar || "")
  .replace(/{name}/g, attempt?.User?.fullName || "-");




  const rows = [
  { no: "A", aspek: "Logika Berpikir", uraian: "Kemampuan untuk berpikir secara logis dan sistematis." },
  { no: "B", aspek: "Daya Analisis", uraian: "Kemampuan untuk melihat permasalahan dan memahami hubungan sebab-akibat permasalahan." },
  { no: "C", aspek: "Kemampuan \nNumerikal", uraian: "Kemampuan untuk berpikir praktis dalam memahami konsep angka dan hitungan." },
  { no: "D", aspek: "Kemampuan Verbal", uraian: "Kemampuan untuk memahami konsep dan pola dalam bentuk kata-kata dan mengekspresikan gagasan secara verbal." },
];
const rows2 = [
  { no: "A", aspek: "Orientasi Hasil", uraian: "Kemampuan untuk mempertahankan komitmen menyelesaikan tugas secara bertanggungjawab dan memperhatikan keterhubungan antara perencanaan dan hasil kerja." },
  { no: "B", aspek: "Fleksibilitas", uraian: "Kemampuan untuk menyesuaikan diri dalam menghadapi permasalahan." },
  { no: "C", aspek: "Sistematika Kerja", uraian: "Kemampuan untuk merencanakan hingga mengorganisasikan cara kerja dalam proses penyelesaian pekerjaan." },
];
const rows3 = [
  { no: "A", aspek: "Motivasi", uraian: "Kemampuan untuk menunjukkan prestasi dan mencapai target." },
  { no: "B", aspek: "Kerjasama", uraian: "Kemampuan untuk menjalin, membina dan mengoptimalkan hubungan kerja yang efektif demi tercapainya tujuan bersama." },
  { no: "C", aspek: "Keterampilan Interpersonal", uraian: "Kemampuan untuk menjalin hubungan sosial dan mampu memahami kebutuhan orang lain." },
  { no: "D", aspek: "Stabilitas Emosi", uraian: "Kemampuan untuk memahami dan mengontrol emosi." },
];
const rows4 = [
  { no: "A", aspek: "Mengelola Perubahan", uraian: "Kemampuan dalam menyesuaikan diri dengan situasi yang baru." },
  { no: "B", aspek: "Pengembangan Diri", uraian: "Kemampuan meningkatkan pengetahuan dan penyempurnaan keterampilan diri." },
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
  {/* HEADER dengan logo kiri & kanan */}
  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 40 }}>
    <Image src="/logoetp.png" style={{ width: 100, height: 40 }} />
    <Image src="/logoklinik.png" style={{ width: 100, height: 40 }} />
  </View>

  {/* JUDUL */}
  <View style={{ marginTop:30, marginBottom: 30 }}>
    <Text style={{ fontSize: 25, fontWeight: "bold", color: "#0A3D91" }}>
      Laporan Hasil
    </Text>
    <Text style={{ fontSize: 25, fontWeight: "bold", color: "#0A3D91", marginBottom: 6 }}>
      Pemeriksaan Psikologi
    </Text>
    <Text style={{ fontSize: 17, fontStyle: "italic", color: "gray", marginBottom: 4 }}>
      Psychological Assessment Report CPMI
    </Text>
    <Text style={{ fontSize: 17, color: "gray" }}>
      {nomorDokumen}
    </Text>
  </View>

  {/* IDENTITAS */}
  <View style={{ marginTop: 40 }}>
    <Text style={{ fontSize: 16, marginBottom: 6, color: "#0A3D91" }}>
      Nama : {attempt?.User?.fullName || "-"}
    </Text>
    <Text style={{ fontSize: 16, marginBottom: 6, color: "#0A3D91", marginTop:6 }}>
      Usia : {calculateAge(attempt?.User?.birthDate)} Tahun
    </Text>
    <Text style={{ fontSize: 16, marginBottom: 6, color: "#0A3D91", marginTop:6 }}>
      Pendidikan : {attempt?.User?.education || "-"}
    </Text>
    <Text style={{ fontSize: 16, marginBottom: 6, color: "#0A3D91", marginTop:6 }}>
    Tujuan : {attempt?.User?.tujuan || "-"}  {/* ✅ ambil dari DB */}
  </Text>
  </View>
</Page>


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
     <View style={{ flexDirection: "row", paddingTop: 4, paddingBottom: 4}}>
       <Text style={{ width: 180, fontFamily: "Times-Bold" }}>Nama Psikolog</Text>
       <Text style={{ flex: 1 }}> : {result?.ValidatedBy?.fullName || "-"}</Text>
     </View>
     <Text style={{ borderColor: "#525252", borderBottomWidth: 1,fontSize: 9, color: "gray", marginBottom: 4 }}>Psychologist’s Name</Text>
 
     {/* Lembaga */}
     <View style={{ flexDirection: "row", paddingTop: 4, paddingBottom: 4}}>
       <Text style={{ width: 180, fontFamily: "Times-Bold" }}>Nama Fasyankes/Lembaga Layanan Psikologi</Text>
       <Text style={{ flex: 1 }}> : {result?.ValidatedBy?.lembagalayanan || "-"}</Text>
     </View>
     <Text style={{ fontSize: 9, color: "gray", marginBottom: 4, borderColor: "#525252", borderBottomWidth: 1 }}>Clinic/Hospital</Text>
 
     {/* Tanggal */}
     <View style={{ flexDirection: "row", paddingTop: 4, paddingBottom: 4 }}>
       <Text style={{ width: 180, fontFamily: "Times-Bold" }}>Tanggal Pemeriksaan</Text>
       <Text style={{ flex: 1 }}> : {new Date(attempt?.createdAt || Date.now()).toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" })}</Text>
     </View>
     <Text style={{ fontSize: 9, color: "gray", borderColor: "#525252", borderBottomWidth: 1 }}>Date of Assessment</Text>
   </View>
 
  <Text style={{ fontSize: 12, fontWeight: "bold", color: "#000" }}>
      I. KEMAMPUAN INTELEKTUAL
    </Text>
{/* Tabel CPMI */}
<View style={{ marginTop: 10, borderWidth: 1, borderColor: "#000" }}>
  {/* Header Utama */}
  <View style={[styles.tableRow, { backgroundColor: "#d8b6d8" }]}>
    <Text style={[styles.cell, { width: 50, textAlign: "center", fontWeight: "bold", fontSize: 12, borderBottomWidth: 0 }]}>No.</Text>
   <Text style={[styles.cell, { width: 170, textAlign: "center", fontWeight: "bold", fontSize: 12, borderLeftWidth: 1, borderBottomWidth: 0 }]}>
  ASPEK YANG{'\n'}DINILAI
</Text>

    <Text style={[styles.cell, { width: 400, textAlign: "center", fontWeight: "bold", fontSize: 12, borderLeftWidth: 1, borderBottomWidth: 0 }]}>URAIAN</Text>
    <Text style={[styles.cell, { width: 300, textAlign: "center", fontWeight: "bold", fontSize: 12, borderLeftWidth: 1, borderBottomWidth: 1 }]}>KATEGORI</Text>
  </View>

  {/* Sub-header kategori hanya di kolom kategori */}
  <View style={[styles.tableRow, { backgroundColor: "#d8b6d8" }]}>
    {/* Kolom No., Aspek, Uraian tetap kosong tapi tanpa borderBottom */}
    <Text style={[styles.cell, { width: 50, borderBottomWidth: 1 }]}></Text>
    <Text style={[styles.cell, { width: 170, borderLeftWidth: 1, borderBottomWidth: 1 }]}></Text>
    <Text style={[styles.cell, { width: 400, borderLeftWidth: 1, borderBottomWidth: 1 }]}></Text>

    {/* R/K/C/B/T dengan borderBottom */}
    {["R", "K", "C", "B", "T"].map((k) => (
      <Text
        key={k}
        style={[
          styles.cell,
          {
            width: 60,
            textAlign: "center",
            fontWeight: "bold",
            borderLeftWidth: 1,
            borderBottomWidth: 1, // ✅ garis bawah hanya di R/K/C/B/T
            borderColor: "#000",
          }
        ]}
      >
        {k}
      </Text>
    ))}
  </View>

  {/* Rows */}
  {rows.map((row) => {
//    const kategoriObj = aspekScores.find(a => String(a.no) === String(row.no));
// const kategoriNormalized = (kategoriObj?.kategori || "").trim().toUpperCase(); // R/K/C/B/T
const kategoriObj = aspekScores.find(a => String(a.aspek) === String(row.no));
const kategoriNormalized = (kategoriObj?.kategori || "").trim().toUpperCase();


    return (
      <View key={row.no} style={[styles.tableRow, { borderBottomWidth: 1, borderColor: "#ccc" }]}>
        <Text style={[styles.cell, { width: 50, textAlign: "center", fontSize: 12, paddingTop: 4, paddingBottom: 4 }]}>{row.no}</Text>
        <Text style={[styles.cell, { width: 170, fontSize: 12, paddingTop: 4, paddingBottom: 4, flexWrap: 'wrap', borderLeftWidth: 1 }]}>{row.aspek}</Text>
        <Text style={[styles.cell, { width: 400, fontSize: 12, paddingTop: 4, paddingBottom: 4, flexWrap: 'wrap', borderLeftWidth: 1, textAlign: "justify" }]}>{row.uraian}</Text>

        {/* Kolom kategori R/K/C/B/T */}
        {["R", "K", "C", "B", "T"].map((k) => (
          <Text
            key={k}
            style={[styles.cell, { width: 60, textAlign: "center", fontSize: 12, borderLeftWidth: 1 }]}
          >
            {kategoriNormalized === k ? "X" : ""}
          </Text>
        ))}
      </View>
    );
  })}
  {/* Legend / Keterangan sederhana di dalam tabel CPMI */}
<View style={[styles.tableRow, { backgroundColor: "#fff", paddingTop: 4, paddingBottom: 4, borderTopWidth:1, borderBottomWidth:1 }]}>
  <View style={{ flexDirection: "row", marginLeft: 14, marginTop: 3 }}>
  <Text style={{ fontSize: 12, fontFamily: "Times-Bold" }}>Keterangan = </Text>
  <Text style={{ fontSize: 12, fontFamily: "Times-Roman" }}>
    R: Rendah   K: Kurang   C: Cukup   B: Baik   T: Tinggi
  </Text>
</View>

</View>
{/* Kesimpulan dalam tabel */}
<View style={[styles.tableRow]}>
<View style={{ marginLeft: 14, fontSize: 12, paddingTop: 4, paddingBottom: 4 }}>
  <Text style={{ fontFamily: "Times-Bold" }}>Kesimpulan</Text>
  <Text style={{ fontFamily: "Times-Roman", textAlign: "justify" , marginTop:4, marginRight:12}}>
    {kesimpulanIQ || "Tidak ada kesimpulan tersedia"}
  </Text>
</View>

</View>

</View>
</Page>
{/* Halaman 3 */}
<Page size="A4" style={styles.page}>
  {/* HEADER */}
  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 30 }}>
    <Image src="/logoetp.png" style={{ width: 100, height: 40 }} />
    <Image src="/logoklinik.png" style={{ width: 100, height: 40 }} />
  </View>

  {/* Tabel II */}
  <Text style={{ fontSize: 12, fontWeight: "bold", color: "#000" }}>
    II. SIKAP DAN CARA KERJA
  </Text>

  <View style={{ marginTop: 10, borderWidth: 1, borderColor: "#000" }}>
    {/* Header Utama */}
    <View style={[styles.tableRow, { backgroundColor: "#d8b6d8" }]}>
      <Text style={[styles.cell, { width: 50, textAlign: "center", fontWeight: "bold", fontSize: 12, borderBottomWidth: 0 }]}>No.</Text>
      <Text style={[styles.cell, { width: 170, textAlign: "center", fontWeight: "bold", fontSize: 12, borderLeftWidth: 1, borderBottomWidth: 0 }]}>
        ASPEK YANG{'\n'}DINILAI
      </Text>
      <Text style={[styles.cell, { width: 400, textAlign: "center", fontWeight: "bold", fontSize: 12, borderLeftWidth: 1, borderBottomWidth: 0 }]}>URAIAN</Text>
      <Text style={[styles.cell, { width: 300, textAlign: "center", fontWeight: "bold", fontSize: 12, borderLeftWidth: 1, borderBottomWidth: 1 }]}>KATEGORI</Text>
    </View>

    {/* Sub-header kategori R/K/C/B/T */}
    <View style={[styles.tableRow, { backgroundColor: "#d8b6d8" }]}>
      <Text style={[styles.cell, { width: 50, borderBottomWidth: 1 }]}></Text>
      <Text style={[styles.cell, { width: 170, borderLeftWidth: 1, borderBottomWidth: 1 }]}></Text>
      <Text style={[styles.cell, { width: 400, borderLeftWidth: 1, borderBottomWidth: 1 }]}></Text>
      {["R", "K", "C", "B", "T"].map((k) => (
        <Text
          key={k}
          style={[
            styles.cell,
            {
              width: 60,
              textAlign: "center",
              fontWeight: "bold",
              borderLeftWidth: 1,
              borderBottomWidth: 1,
              borderColor: "#000",
            }
          ]}
        >
          {k}
        </Text>
      ))}
    </View>

    {/* Rows */}
    {rows2.map((row) => {
const kategoriObj = aspekScores2.find(a => String(a.aspek) === String(row.no));
const kategoriNormalized = (kategoriObj?.kategori || "").trim().toUpperCase();
      return (
        <View key={row.no} style={[styles.tableRow, { borderBottomWidth: 1, borderColor: "#ccc" }]}>
          <Text style={[styles.cell, { width: 50, textAlign: "center", fontSize: 12, paddingTop: 4, paddingBottom: 4 }]}>{row.no}</Text>
          <Text style={[styles.cell, { width: 170, fontSize: 12, paddingTop: 4, paddingBottom: 4, flexWrap: 'wrap', borderLeftWidth: 1 }]}>{row.aspek}</Text>
          <Text style={[styles.cell, { width: 400, fontSize: 12, paddingTop: 4, paddingBottom: 4, flexWrap: 'wrap', borderLeftWidth: 1, textAlign: "justify" }]}>{row.uraian}</Text>
          {["R", "K", "C", "B", "T"].map((k) => (
            <Text key={k} style={[styles.cell, { width: 60, textAlign: "center", fontSize: 12, borderLeftWidth: 1 }]}>
              {kategoriNormalized === k ? "X" : ""}
            </Text>
          ))}
        </View>
      );
    })}

    {/* Legend */}
    <View style={[styles.tableRow, { backgroundColor: "#fff", paddingTop: 4, paddingBottom: 4, borderTopWidth:1, borderBottomWidth:1 }]}>
      <View style={{ flexDirection: "row", marginLeft: 14, marginTop: 3 }}>
        <Text style={{ fontSize: 12, fontFamily: "Times-Bold" }}>Keterangan = </Text>
        <Text style={{ fontSize: 12, fontFamily: "Times-Roman" }}>
          R: Rendah   K: Kurang   C: Cukup   B: Baik   T: Tinggi
        </Text>
      </View>
    </View>

    {/* Kesimpulan */}
    <View style={[styles.tableRow]}>
     <View style={{ marginLeft: 14, fontSize: 12, paddingTop: 4, paddingBottom: 4 }}>
  <Text style={{ fontFamily: "Times-Bold" }}>Kesimpulan</Text>
  <Text style={{ fontFamily: "Times-Roman", textAlign: "justify" , marginTop:5, marginRight:12}}>
    {kesimpulanSikap || "Tidak ada kesimpulan tersedia"}
  </Text>
</View>

    </View>

  </View>
  {/* Judul */}
<Text style={{ fontSize: 12, fontWeight: "bold", color: "#000", marginTop: 20 }}>
  III. KEPRIBADIAN
</Text>

{/* Table */}
<View style={{ marginTop: 10, borderWidth: 1, borderColor: "#000" }}>
  {/* Header Utama */}
  <View style={[styles.tableRow, { backgroundColor: "#d8b6d8" }]}>
    <Text style={[styles.cell, { width: 50, textAlign: "center", fontWeight: "bold", fontSize: 12 }]}>No.</Text>
    <Text style={[styles.cell, { width: 170, textAlign: "center", fontWeight: "bold", fontSize: 12, borderLeftWidth: 1 }]}>
     ASPEK YANG{'\n'}DINILAI
    </Text>
    <Text style={[styles.cell, { width: 400, textAlign: "center", fontWeight: "bold", fontSize: 12, borderLeftWidth: 1 }]}>URAIAN</Text>
    <Text style={[styles.cell, { width: 300, textAlign: "center", fontWeight: "bold", fontSize: 12, borderLeftWidth: 1, borderBottomWidth:1 }]}>KATEGORI</Text>
  </View>

  {/* Sub-header kategori */}
  <View style={[styles.tableRow, { backgroundColor: "#d8b6d8" }]}>
    <Text style={[styles.cell, { width: 50, borderBottomWidth: 1 }]}></Text>
    <Text style={[styles.cell, { width: 170, borderLeftWidth: 1, borderBottomWidth: 1, }]}></Text>
    <Text style={[styles.cell, { width: 400, borderLeftWidth: 1,  borderBottomWidth: 1, }]}></Text>
    {["R", "K", "C", "B", "T"].map((k) => (
      <Text
        key={k}
        style={[styles.cell, { width: 60, textAlign: "center", fontWeight: "bold", borderLeftWidth: 1,  borderBottomWidth: 1, }]}
      >
        {k}
      </Text>
    ))}
  </View>

  {/* Rows isi */}
  {rows3.map((row) => {
const kategoriObj = aspekScores3.find(a => String(a.aspek) === String(row.no));
const kategoriNormalized = (kategoriObj?.kategori || "").trim().toUpperCase();
    return (
      <View key={row.no} style={[styles.tableRow, { borderBottomWidth: 1, borderColor: "#ccc" }]}>
        <Text style={[styles.cell, { width: 50, textAlign: "center", fontSize: 12 }]}>{row.no}</Text>
        <Text style={[styles.cell, { width: 170, fontSize: 12, borderLeftWidth: 1 }]}>{row.aspek}</Text>
        <Text style={[styles.cell, { width: 400, fontSize: 12, borderLeftWidth: 1, textAlign: "justify" }]}>{row.uraian}</Text>
        {["R", "K", "C", "B", "T"].map((k) => (
          <Text
            key={k}
            style={[styles.cell, { width: 60, textAlign: "center", fontSize: 12, borderLeftWidth: 1 }]}
          >
            {kategoriNormalized === k ? "X" : ""}
          </Text>
        ))}
      </View>
    );
  })}

   {/* Legend */}
    <View style={[styles.tableRow, { backgroundColor: "#fff", paddingTop: 4, paddingBottom: 4, borderTopWidth:1, borderBottomWidth:1 }]}>
      <View style={{ flexDirection: "row", marginLeft: 14, marginTop: 3 }}>
        <Text style={{ fontSize: 12, fontFamily: "Times-Bold" }}>Keterangan = </Text>
        <Text style={{ fontSize: 12, fontFamily: "Times-Roman" }}>
          R: Rendah   K: Kurang   C: Cukup   B: Baik   T: Tinggi
        </Text>
      </View>
    </View>



</View>
</Page>

{/* Halaman 3 */}
<Page size="A4" style={styles.page}>
  {/* HEADER */}
  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 30 }}>
    <Image src="/logoetp.png" style={{ width: 100, height: 40 }} />
    <Image src="/logoklinik.png" style={{ width: 100, height: 40 }} />
  </View>
    {/* Kesimpulan */}
        <View style={[styles.tableRow, { backgroundColor: "#fff", paddingTop: 4, paddingBottom: 4, borderTopWidth:1, borderBottomWidth:1, borderRightWidth: 1,borderLeftWidth:1 }]}>
    <View style={{ marginLeft: 14, fontSize: 12, paddingTop: 4, paddingBottom: 4 }}>
  <Text style={{ fontFamily: "Times-Bold" }}>Kesimpulan</Text>
  <Text style={{ fontFamily: "Times-Roman", textAlign: "justify" , marginTop:5, marginRight:12}}>
    {kesimpulanKepribadian || "Tidak ada kesimpulan tersedia"}
  </Text>
</View>
</View>

  {/* Tabel II */}
  <Text style={{ fontSize: 12, fontWeight: "bold", color: "#000", marginTop:12 }}>
    IV. KEMAMPUAN BELAJAR 
  </Text>

  <View style={{ marginTop: 10, borderWidth: 1, borderColor: "#000" }}>
    {/* Header Utama */}
    <View style={[styles.tableRow, { backgroundColor: "#d8b6d8" }]}>
      <Text style={[styles.cell, { width: 50, textAlign: "center", fontWeight: "bold", fontSize: 12, borderBottomWidth: 0 }]}>No.</Text>
      <Text style={[styles.cell, { width: 170, textAlign: "center", fontWeight: "bold", fontSize: 12, borderLeftWidth: 1, borderBottomWidth: 0 }]}>
       ASPEK YANG{'\n'}DINILAI
      </Text>
      <Text style={[styles.cell, { width: 400, textAlign: "center", fontWeight: "bold", fontSize: 12, borderLeftWidth: 1, borderBottomWidth: 0 }]}>URAIAN</Text>
      <Text style={[styles.cell, { width: 300, textAlign: "center", fontWeight: "bold", fontSize: 12, borderLeftWidth: 1, borderBottomWidth: 1 }]}>KATEGORI</Text>
    </View>

    {/* Sub-header kategori R/K/C/B/T */}
    <View style={[styles.tableRow, { backgroundColor: "#d8b6d8" }]}>
      <Text style={[styles.cell, { width: 50, borderBottomWidth: 1 }]}></Text>
      <Text style={[styles.cell, { width: 170, borderLeftWidth: 1, borderBottomWidth: 1 }]}></Text>
      <Text style={[styles.cell, { width: 400, borderLeftWidth: 1, borderBottomWidth: 1 }]}></Text>
      {["R", "K", "C", "B", "T"].map((k) => (
        <Text
          key={k}
          style={[
            styles.cell,
            {
              width: 60,
              textAlign: "center",
              fontWeight: "bold",
              borderLeftWidth: 1,
              borderBottomWidth: 1,
              borderColor: "#000",
            }
          ]}
        >
          {k}
        </Text>
      ))}
    </View>

    {/* Rows */}
    {rows4.map((row) => {
const kategoriObj = aspekScores4.find(a => String(a.aspek) === String(row.no));
const kategoriNormalized = (kategoriObj?.kategori || "").trim().toUpperCase();
      return (
        <View key={row.no} style={[styles.tableRow, { borderBottomWidth: 1, borderColor: "#ccc" }]}>
          <Text style={[styles.cell, { width: 50, textAlign: "center", fontSize: 12, paddingTop: 4, paddingBottom: 4 }]}>{row.no}</Text>
          <Text style={[styles.cell, { width: 170, fontSize: 12, paddingTop: 4, paddingBottom: 4, flexWrap: 'wrap', borderLeftWidth: 1 }]}>{row.aspek}</Text>
          <Text style={[styles.cell, { width: 400, fontSize: 12, paddingTop: 4, paddingBottom: 4, flexWrap: 'wrap', borderLeftWidth: 1, textAlign: "justify" }]}>{row.uraian}</Text>
          {["R", "K", "C", "B", "T"].map((k) => (
            <Text key={k} style={[styles.cell, { width: 60, textAlign: "center", fontSize: 12, borderLeftWidth: 1 }]}>
              {kategoriNormalized === k ? "X" : ""}
            </Text>
          ))}
        </View>
      );
    })}

    {/* Legend */}
    <View style={[styles.tableRow, { backgroundColor: "#fff", paddingTop: 4, paddingBottom: 4, borderTopWidth:1, borderBottomWidth:1 }]}>
      <View style={{ flexDirection: "row", marginLeft: 14, marginTop: 3 }}>
        <Text style={{ fontSize: 12, fontFamily: "Times-Bold" }}>Keterangan = </Text>
        <Text style={{ fontSize: 12, fontFamily: "Times-Roman" }}>
          R: Rendah   K: Kurang   C: Cukup   B: Baik   T: Tinggi
        </Text>
      </View>
    </View>

    {/* Kesimpulan */}
    <View style={{ marginLeft: 14, fontSize: 12, paddingTop: 4, paddingBottom: 4}}>
  <Text style={{ fontFamily: "Times-Bold" }}>Kesimpulan</Text>
  <Text style={{ fontFamily: "Times-Roman", textAlign: "justify" , marginTop:5, marginRight:12}}>
    {kesimpulanBelajar || "Tidak ada kesimpulan tersedia"}
  </Text>
</View>

    {/* saran */}
    <View style={[styles.tableRow, { backgroundColor: "#fff", paddingTop: 4, paddingBottom: 4, borderTopWidth:1, borderBottomWidth:1 }]}>
        <View style={{ marginLeft: 14, fontSize: 12, paddingTop: 4, paddingBottom: 4}}>
        <Text style={{ fontSize: 13, fontFamily: "Times-Bold" }}>Saran Pengembangan </Text>
         <Text style={{ fontFamily: "Times-Roman", textAlign: "justify" , marginTop:5, marginRight:12}}>
          {saranpengembangan || "Tidak ada saran tersedia"}
        </Text>
        </View>
    </View>

   {/* kesimpulan umum */}
    <View style={{ marginLeft: 14, fontSize: 12, paddingTop: 4, paddingBottom: 4 }}>
  <Text style={{ fontFamily: "Times-Bold" }}>Kesimpulan Umum</Text>
  <Text style={{ fontFamily: "Times-Roman", textAlign: "justify" , marginTop:5}}>
    {kesimpulanumum || "Tidak ada kesimpulan tersedia"}
  </Text>
</View>
{/* Rekomendasi */}
<View
  style={[
    styles.tableRow,
    {
      backgroundColor: "#fff",
      paddingTop: 4,
      paddingBottom: 4,
      borderTopWidth: 1,
      borderBottomWidth: 1,
    },
  ]}
>
  <View style={{ marginTop: 5, marginLeft: 14, marginRight: 12 }}>
    <Text style={{ fontFamily: "Times-Bold", marginBottom: 4 }}>
      Rekomendasi
    </Text>

    {/* Tabel */}
    <View
      style={{
        borderWidth: 1,
        borderColor: "#000",
        flexDirection: "column",
        width: 300,
      }}
    >

     {/* Baris LAYAK */}
<View style={{ flexDirection: "row" }}>
  {(() => {
    const isBold = result?.layak === true;
    return (
      <>
        <Text
          style={{
            width: 40,
            textAlign: "center",
            fontFamily: isBold ? "Times-Bold" : "Times-Roman",
            paddingVertical: 4,
            borderRightWidth: 1,
            borderColor: "#000",
          }}
        >
          {isBold ? "X" : ""}
        </Text>

        <Text
          style={{
            flex: 1,
            fontFamily: isBold ? "Times-Bold" : "Times-Roman",
            paddingVertical: 4,
            paddingLeft: 6,
          }}
        >
          Layak
        </Text>
      </>
    );
  })()}
</View>


     {/* Baris Belum Layak */}
<View style={{ flexDirection: "row", borderTopWidth: 1, borderColor: "#000" }}>
  {(() => {
    const isBold = result?.belumLayak === true;

    return (
      <>
        <Text
          style={{
            width: 40,
            textAlign: "center",
            fontFamily: isBold ? "Times-Bold" : "Times-Roman",
            paddingVertical: 4,
            borderRightWidth: 1,
            borderColor: "#000",
          }}
        >
          {isBold ? "X" : ""}
        </Text>

        <Text
          style={{
            flex: 1,
            fontFamily: isBold ? "Times-Bold" : "Times-Roman",
            paddingVertical: 4,
            paddingLeft: 6,
          }}
        >
          Belum Layak
        </Text>
      </>
    );
  })()}
</View>

    {/* Baris Tidak Layak */}
<View style={{ flexDirection: "row", borderTopWidth: 1, borderColor: "#000" }}>
  {(() => {
    const isBold = result?.tidakLayak === true;

    return (
      <>
        <Text
          style={{
            width: 40,
            textAlign: "center",
            fontFamily: isBold ? "Times-Bold" : "Times-Roman",
            paddingVertical: 4,
            borderRightWidth: 1,
            borderColor: "#000",
          }}
        >
          {isBold ? "X" : ""}
        </Text>

        <Text
          style={{
            flex: 1,
            fontFamily: isBold ? "Times-Bold" : "Times-Roman",
            paddingVertical: 4,
            paddingLeft: 6,
          }}
        >
          Tidak Layak
        </Text>
      </>
    );
  })()}
</View>

    </View>



     {/* Keterangan di bawah tabel */}
     <View style={{ marginTop: 6 }}>
       <Text style={{ fontSize: 13, fontFamily: "Times-Bold" }}>
         Keterangan:
       </Text>
       <Text style={{ marginTop:5, fontSize: 13, fontFamily: "Times-Roman" }}>
         Tanda "X" adalah potensi dari kandidat CPMI.
       </Text>
     </View>
     </View>

  </View>
</View>
</Page>
{/* Halaman 4 */}
<Page size="A4" style={styles.page}>
  {/* HEADER */}
  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 30 }}>
    <Image src="/logoetp.png" style={{ width: 100, height: 40 }} />
    <Image src="/logoklinik.png" style={{ width: 100, height: 40 }} />
  </View>


{/* Footer TTD & QR */}
<View
  style={{
    marginTop: 20,
    flexDirection: "column",
    alignItems: "flex-start",
  }}
>
<View style={{ flexDirection: "row", marginBottom: 2, alignItems: "center" }}>
  {/* Label */}
  <Text style={{ fontSize: 12, width: 100 }}>Tanggal</Text>

  {/* Titik dua */}
  <Text style={{ fontSize: 12, width: 10, textAlign: "center" }}>:</Text>

  {/* Nilai */}
  <Text style={{ fontSize: 12, width: 150 }}> 
    {new Date(attempt?.createdAt || Date.now()).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}
  </Text>
</View>
<Text style={{ fontSize: 10, color: "gray", marginBottom: 6 }}>Date</Text>


{/* Label Signature */}
<View style={{ flexDirection: "row", marginBottom: 4, alignItems: "center" }}>
  {/* Label */}
  <Text style={{ fontSize: 12, width: 100 }}>Tanda Tangan</Text>

  {/* Titik dua */}
  <Text style={{ fontSize: 12, width: 10, textAlign: "center" }}>:</Text>

  {/* Value kosong untuk sejajar */}
  <Text style={{ fontSize: 12, width: 150 }}></Text>
</View>
<Text style={{ fontSize: 10, color: "gray", marginBottom: 4 }}>Signature</Text>

{/* QR TTD */}
{result?.barcodettd && (
  <Image
    src={result.barcodettd}
    style={{ width: 50, height: 50, marginBottom: 6 }}
  />
)}


 {/* Nama Psikolog */}
<View style={{ flexDirection: "row", marginBottom: 2, alignItems: "center" }}>
  {/* Label */}
  <Text style={{ fontSize: 12, width: 100 }}>Nama Psikolog</Text>

  {/* Titik dua */}
  <Text style={{ fontSize: 12, width: 10, textAlign: "center" }}>:</Text>

  {/* Nilai */}
  <Text style={{ fontSize: 12, width: 150, fontFamily: "Times-Bold" }}>
    {result?.ValidatedBy?.fullName || "____________________"}
  </Text>
</View>
<Text style={{ fontSize: 10, color: "gray", marginBottom: 8 }}>Psychologist’s Name</Text>


 {/* Nomor STR/SIK */}
<View style={{ flexDirection: "row", marginBottom: 2, alignItems: "center" }}>
  {/* Label */}
  <Text style={{ fontSize: 12, width: 100 }}>Nomor STR/SIK</Text>

  {/* Titik dua */}
  <Text style={{ fontSize: 12, width: 10, textAlign: "center" }}>:</Text>

  {/* Nilai */}
  <Text style={{ fontSize: 12, width: 150 }}>
    {result?.ValidatedBy?.strNumber || "-"}
  </Text>
</View>
<Text style={{ fontSize: 10, color: "gray", marginBottom: 6 }}>
  Registration Number
</Text>

{/* Nomor SIPP/SIPPK */}
<View style={{ flexDirection: "row", marginBottom: 2, alignItems: "center" }}>
  {/* Label */}
  <Text style={{ fontSize: 12, width: 100 }}>Nomor SIPP/SIPPK</Text>

  {/* Titik dua */}
  <Text style={{ fontSize: 12, width: 10, textAlign: "center" }}>:</Text>

  {/* Nilai */}
  <Text style={{ fontSize: 12, width: 150 }}>
    {result?.ValidatedBy?.sippNumber || "-"}
  </Text>
</View>
<Text style={{ fontSize: 10, color: "gray" }}>
  Licence Number
</Text>
</View>
  {/* Footer kanan (QR + Validasi) */}
{qrCodeBase64 && (
  <View
    style={{
      position: "absolute",
      bottom: 60, // 🔼 dinaikkan (semakin besar semakin naik)
      right: 50,
      alignItems: "center",
    }}
  >
    <Text style={styles.text}>Scan untuk verifikasi dokumen</Text>
    <Image
      src={qrCodeBase64}
      style={[styles.qr, { marginTop: -10, width: 130, height: 130 }]} // 🔽 jarak kecil saja
    />
    {/* {expiresAt && (
      <Text style={styles.validation}>
        Berlaku sampai:{" "}
        {new Date(expiresAt).toLocaleDateString("id-ID")}
      </Text>
    )} */}
    {validationNotes && (
      <View style={{ width: 120, marginTop: 1 }}>
        <Text
          style={[styles.validation, { textAlign: "justify" }]}
        >
          {validationNotes}
        </Text>
      </View>
    )}
  </View>
)}


</Page>


   
    </Document>
  );
}

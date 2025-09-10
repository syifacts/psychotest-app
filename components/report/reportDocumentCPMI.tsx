// components/report/ReportCPMIDocument.tsx
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

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
    kesimpulan: string; // harus isi summaryTemplate, bukan status LULUS/TIDAK LULUS
    aspekSTK: string | AspekScore[];
  };
}

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 12, fontFamily: "Times-Roman" },
  headerCenter: { textAlign: "center", marginBottom: 10 },
  title: { fontSize: 16, fontWeight: "bold" },
  subtitle: { fontSize: 14, marginBottom: 5 },
  sectionTitle: { 
    marginTop: 10, 
    marginBottom: 5, 
    textDecoration: "underline",
    fontWeight: "bold"
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingBottom: 3,
    marginTop: 10,
    fontWeight: "bold",
  },
  tableRow: { flexDirection: "row", paddingVertical: 3 },
  bold: { fontFamily: "Times-Bold" },
  text: { lineHeight: 1.5 },
});

export default function ReportCPMIDocument({ attempt, result }: Props) {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const nomorUrut = String(result?.id || 1).padStart(2, "0");
  const nomorDokumen = `${nomorUrut}/PSI-ETP/${month}/${year}`;

  // Pastikan aspekScores berupa array objek
  let aspekScores: AspekScore[] = [];
  if (Array.isArray(result.aspekSTK)) {
    aspekScores = result.aspekSTK;
  } else if (typeof result.aspekSTK === "string") {
    try {
      aspekScores = JSON.parse(result.aspekSTK);
    } catch (error) {
      console.error('Error parsing aspekSTK:', error);
      aspekScores = [];
    }
  }

  // Replace placeholder langsung di PDF
  const kesimpulanPDF = result.kesimpulan
    .replace(/{name}/g, attempt?.User?.fullName || "-")
    .replace(/{scoreiq}/g, result?.scoreiq?.toString() || "-");

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
      uraian: "Kemampuan untuk memperhatikan hal-hal detil maupun prosedur.",
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

  // Hitung umur
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return "-";
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
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
          <Text style={styles.text}>
            Usia: {calculateAge(attempt?.User?.birthDate)} Tahun
          </Text>
          <Text style={styles.text}>Pendidikan: {attempt?.User?.education || "-"}</Text>
          <Text style={styles.text}>Tujuan: Bekerja ke Luar Negeri</Text>
        </View>

        <View style={{ marginTop: 30 }}>
          <Text style={styles.text}>
            Tanggal Pemeriksaan: {new Date(attempt?.createdAt || Date.now()).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </Text>
        </View>
      </Page>

      {/* Halaman 2 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerCenter}>
          <Text style={styles.sectionTitle}>
            RINGKASAN HASIL PEMERIKSAAN PSIKOLOGI
          </Text>
          <Text style={styles.text}>(Resume of Psychological Assessment)</Text>
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={[styles.bold, styles.text]}>
            Identitas Psikolog / Psychologist's Identity
          </Text>
          <Text style={styles.text}>
            Nama Psikolog / Psychologist's Name: TIARA MUSTIKA AYU, M.Psi, Psikolog
          </Text>
          <Text style={styles.text}>
            Nama Fasyankes/Lembaga Layanan Psikologi / Clinic/Hospital: YULIARPAN MEDIKA/ETP
          </Text>
          <Text style={styles.text}>
            Tanggal Pemeriksaan / Date of Assessment: {new Date().toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }).toUpperCase()}
          </Text>
        </View>

        {/* Tabel CPMI */}
        <View style={{ marginTop: 20 }}>
          <View style={styles.tableHeader}>
            <Text style={{ width: 30, textAlign: "center" }}>No.</Text>
            <Text style={{ width: 150, textAlign: "center" }}>Aspek yang dinilai</Text>
            <Text style={{ width: 200, textAlign: "center" }}>Uraian</Text>
            <Text style={{ width: 60, textAlign: "center" }}>T</Text>
            <Text style={{ width: 60, textAlign: "center" }}>S</Text>
            <Text style={{ width: 60, textAlign: "center" }}>R</Text>
          </View>

          {rows.map((row) => {
  const kategoriObj = aspekScores.find(a => a.no === Number(row.no));
  const kategoriNormalized = (kategoriObj?.kategori || "").trim().toUpperCase();

  return (
    <View key={row.no} style={styles.tableRow}>
      <Text style={{ width: 30, textAlign: "center", fontSize: 10 }}>{row.no}</Text>
      <Text style={{ width: 150, fontSize: 10 }}>{row.aspek}</Text>
      <Text style={{ width: 200, fontSize: 9 }}>{row.uraian}</Text>
      <Text style={{ width: 60, textAlign: "center", fontSize: 10 }}>
        {kategoriNormalized === "T" ? "X" : ""}
      </Text>
      <Text style={{ width: 60, textAlign: "center", fontSize: 10 }}>
        {kategoriNormalized === "S" ? "X" : ""}
      </Text>
      <Text style={{ width: 60, textAlign: "center", fontSize: 10 }}>
        {kategoriNormalized === "R" ? "X" : ""}
      </Text>
    </View>
  );
})}
          <View style={[styles.tableRow, { marginTop: 10, borderTopWidth: 1, paddingTop: 5 }]}>
            <Text style={{ width: 180, fontFamily: "Times-Bold" }}>Status</Text>
            <Text style={{ width: 200 }}>{result?.keteranganiqCPMI ?? "-"}</Text>
          </View>
{/* Footer Tabel / Legend */}
<View style={{ marginTop: 10 }}>
  <Text style={[styles.bold, { marginBottom: 5 }]}>Keterangan:</Text>
  <Text style={styles.text}>T = Tinggi</Text>
  <Text style={styles.text}>S = Sedang</Text>
  <Text style={styles.text}>R = Rendah</Text>
</View>

          <View style={{ marginTop: 20 }}>
            <Text style={[styles.bold, { marginBottom: 10 }]}>Kesimpulan Umum:</Text>
            <Text style={[styles.text, { textAlign: "justify" }]}>
              {kesimpulanPDF || "Tidak ada kesimpulan tersedia"}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={{ marginTop: 30, textAlign: "right" }}>
          <Text style={styles.text}>Jakarta, {new Date().toLocaleDateString('id-ID')}</Text>
          <Text style={[styles.text, { marginTop: 40 }]}>Psikolog,</Text>
          <Text style={styles.text}>TIARA MUSTIKA AYU, M.Psi, Psikolog</Text>
        </View>
      </Page>
    </Document>
  );
}

// components/ReportDocument.tsx
import React, { useEffect, useState } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Svg,
  Line,
  Polyline,
  Text as SvgText
} from "@react-pdf/renderer";
import QRCode from "qrcode";

const styles = StyleSheet.create({
  page: { paddingTop: 40, paddingBottom: 40, paddingHorizontal: 50, fontSize: 12, fontFamily: "Times-Roman" },
  header: { marginBottom: 16, textAlign: "center" },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#0A3D91"
  },
  subtitle: { fontSize: 12, color: "#555" },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#0A3D91"
  },

  // tabel
  table: {
    display: "flex",
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    flexDirection: "column",
  },
  tableRow: { flexDirection: "row" },
  tableColHeader: {
    flex: 1,
    borderRightWidth: 1,
    borderColor: "#000",
    backgroundColor: "#eee",
    padding: 4,
  },
  tableCol: {
    flex: 1,
    borderRightWidth: 1,
    borderColor: "#000",
    padding: 4,
  },
  tableCellHeader: { fontSize: 11, fontWeight: "bold" },
  tableCell: { fontSize: 11 },
  cell: { paddingHorizontal: 6, paddingVertical: 4, flexWrap: 'wrap' },
  bold: { fontFamily: "Times-Bold" },
  text: { lineHeight: 1.5 },

  // identitas
  infoRow: { flexDirection: "row", marginBottom: 4 },
  infoLabel: { width: "30%", fontWeight: "bold" },
  infoValue: { width: "70%" },

  footer: {
    marginTop: 20,
    fontSize: 9,
    textAlign: "right",
    color: "#555",
  },

  // chart
  chartContainer: {
    marginTop: 20,
    marginBottom: 40,
    height: 200,
    position: "relative",
    border: "1pt solid #ccc",
  },
  bar: {
    position: "absolute",
    bottom: 20,
    width: 20,
    backgroundColor: "#4a90e2",
  },
  barLabel: {
    fontSize: 8,
    position: "absolute",
    bottom: 5,
    textAlign: "center",
    width: 40,
  },

  // tanda tangan
  signatureContainer: {
    marginTop: 60,
    alignItems: "flex-end",
  },
  signatureBox: {
    borderTopWidth: 1,
    borderColor: "#000",
    width: 200,
    textAlign: "center",
    paddingTop: 4,
  },
  ttd: { width: 90, height: 90 },
  qr: { width: 100, height: 100, marginTop: 10 },
});
const chartHeight = 150; // tinggi maksimal bar
const ySteps = 5; // jumlah step sumbu Y



function calcAge(birthDate?: string | Date, atDate?: Date) {
  if (!birthDate) return "-";
  const bd = new Date(birthDate);
  const now = atDate ?? new Date();
  let age = now.getFullYear() - bd.getFullYear();
  const m = now.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < bd.getDate())) age--;
  return `${age} tahun`;
}

export default function ReportDocument({
  attempt,
  subtestResults,
  result,
  kesimpulan,
  ttd,
  barcode,
  expiresAt,
  validationNotes
}: {
  attempt: any;
  subtestResults: any[];
  result: any | null;
  kesimpulan?: string;
  ttd?: string;
  barcode?: string;
  expiresAt?: string;
  validationNotes?: string;
}) {
  const [qrCodeBase64, setQrCodeBase64] = useState<string>("");

  useEffect(() => {
    if (barcode) {
      const url = `https://8a106cfaf826.ngrok-free.app/validate/${barcode}`;
      QRCode.toDataURL(url).then(setQrCodeBase64).catch(err => console.error(err));
    }
  }, [barcode]);

  const user = attempt.User;
  const testType = attempt.TestType;
  const maxSw = Math.max(...subtestResults.map((s: any) => s.sw ?? 0), 1);
  
  // Generate nomor dokumen
  const nomorDokumen = `${String(result?.id || 1).padStart(2,"0")}/PSI-IST/${String(new Date().getMonth()+1).padStart(2,"0")}/${new Date().getFullYear()}`;

  return (
    <Document>
      {/* 📄 Halaman 1: Identitas Peserta */}
      <Page size="A4" style={styles.page}>
        {/* HEADER dengan logo kiri & kanan */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 40 }}>
          <Image src="/logoetp.png" style={{ width: 100, height: 40 }} />
          <Image src="/logoklinik.png" style={{ width: 100, height: 40 }} />
        </View>

        {/* JUDUL */}
        <View style={{ marginTop: 30, marginBottom: 30 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#0A3D91" }}>Laporan Hasil</Text>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#0A3D91", marginBottom: 6 }}>
            {testType?.name ?? "IST"}
          </Text>
          <Text style={{ fontSize: 11, fontStyle: "italic", color: "gray" }}>
            Psychological Assessment {testType?.name ?? "IST"}
          </Text>
          <Text style={{ fontSize: 11, color: "gray" }}>{nomorDokumen}</Text>
        </View>

        {/* IDENTITAS PESERTA */}
        <View style={{ marginTop: 40 }}>
          <Text style={{ fontSize: 12, marginBottom: 6, color: "#0A3D91" }}>
            Nama : {user?.fullName ?? "-"}
          </Text>
          <Text style={{ fontSize: 12, marginBottom: 6, color: "#0A3D91" }}>
            Usia : {user?.birthDate ? calcAge(user.birthDate, new Date(attempt.startedAt)) : "-"}
          </Text>
          <Text style={{ fontSize: 12, marginBottom: 6, color: "#0A3D91" }}>
            Pendidikan : {user?.education || "-"}
          </Text>
          <Text style={{ fontSize: 12, marginBottom: 6, color: "#0A3D91" }}>
            Tanggal Tes: {attempt?.startedAt ? new Date(attempt.startedAt).toLocaleDateString("id-ID") : "-"}
          </Text>
        </View>
      </Page>

      {/* 📄 Halaman 2: Ringkasan Hasil Pemeriksaan + Tabel */}
      <Page size="A4" style={styles.page}>
        {/* HEADER dengan logo kiri & kanan */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 30 }}>
          <Image src="/logoetp.png" style={{ width: 100, height: 40 }} />
          <Image src="/logoklinik.png" style={{ width: 100, height: 40 }} />
        </View>

        {/* JUDUL RINGKASAN */}
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
            Psychologist's Identity
          </Text>

          {/* Nama Psikolog */}
          <View style={{ flexDirection: "row", paddingVertical: 4 }}>
            <Text style={{ width: 180, fontFamily: "Times-Bold" }}>Nama Psikolog</Text>
            <Text style={{ flex: 1 }}> : {result?.ValidatedBy?.fullName || "-"}</Text>
          </View>
          <Text style={{ borderColor: "#525252", borderBottomWidth: 1,fontSize: 9, color: "gray", marginBottom: 4 }}>
            Psychologist's Name
          </Text>

          {/* Lembaga */}
          <View style={{ flexDirection: "row", paddingVertical: 4 }}>
            <Text style={{ width: 180, fontFamily: "Times-Bold" }}>Nama Fasyankes/Lembaga Layanan Psikologi</Text>
            <Text style={{ flex: 1 }}> : {result?.ValidatedBy?.lembagalayanan || "-"}</Text>
          </View>
          <Text style={{ fontSize: 9, color: "gray", marginBottom: 4, borderColor: "#525252", borderBottomWidth: 1 }}>
            Clinic/Hospital
          </Text>

          {/* Tanggal */}
          <View style={{ flexDirection: "row", paddingVertical: 4 }}>
            <Text style={{ width: 180, fontFamily: "Times-Bold" }}>Tanggal Pemeriksaan</Text>
            <Text style={{ flex: 1 }}> : {new Date(attempt?.createdAt || Date.now()).toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" })}</Text>
          </View>
          <Text style={{ fontSize: 9, color: "gray", borderColor: "#525252", borderBottomWidth: 1 }}>
            Date of Assessment
          </Text>
        </View>

        {/* Judul Tabel */}
        <View style={{ marginTop: 10, marginBottom: 4 }}>
          <Text style={{ fontSize: 12, fontWeight: "bold" , marginBottom:10 }}>A. Rincian Hasil Tes</Text>
        </View>

        {/* SUBTEST + HASIL TOTAL DALAM SATU TABEL */}
        <View style={styles.table}>
          {/* Header row */}
          <View style={[styles.tableRow, { backgroundColor: "#d8b6d8" }]}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Subtest</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>RW</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>SW</Text>
            </View>
            <View style={[styles.tableColHeader, { borderRightWidth: 0 }]}>
              <Text style={styles.tableCellHeader}>Kategori</Text>
            </View>
          </View>

          {/* Isi subtest */}
          {subtestResults?.length > 0 ? (
            subtestResults.map((s: any, idx: number) => (
              <View key={idx} style={[styles.tableRow, { borderBottomWidth: 1, borderColor: "#ccc" }]}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{s.SubTest?.name ?? "-"}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{s.rw ?? "-"}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{s.sw ?? "-"}</Text>
                </View>
                <View style={[styles.tableCol, { borderRightWidth: 0 }]}>
                  <Text style={styles.tableCell}>{s.kategori ?? "-"}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={[styles.tableRow, { borderBottomWidth: 1, borderColor: "#ccc" }]}>
              <View style={[styles.tableCol, { borderRightWidth: 0, flex: 4 }]}>
                <Text style={styles.tableCell}>Tidak ada data subtest</Text>
              </View>
            </View>
          )}

          {/* Row Jumlah */}
          <View style={[styles.tableRow, { borderBottomWidth: 1, borderColor: "#000" }]}>
            <View style={styles.tableCol}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                JML
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                {result?.totalRw ?? "-"}
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                {result?.totalSw ?? "-"}
              </Text>
            </View>
            <View style={[styles.tableCol, { borderRightWidth: 0 }]}>
              <Text style={styles.tableCell}>-</Text>
            </View>
          </View>

          {/* Row IQ */}
          <View style={[styles.tableRow, { borderBottomWidth: 1, borderColor: "#000" }]}>
            <View style={styles.tableCol}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                IQ
              </Text>
            </View>
            {/* Merge RW + SW jadi 1 kolom */}
            <View style={[styles.tableCol, { flex: 2 }]}>
              <Text style={[styles.tableCell, { fontWeight: "bold", textAlign: "center" }]}>
                {result?.iq ?? "-"}
              </Text>
            </View>
            {/* Kolom Kategori */}
            <View style={[styles.tableCol, { borderRightWidth: 0 }]}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                {result?.keteranganiq ?? "-"}
              </Text>
            </View>
          </View>

          {/* Row Dominasi */}
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                Dominasi
              </Text>
            </View>
            <View
              style={[
                styles.tableCol,
                { borderRightWidth: 0, flex: 3 }, // merge 3 kolom
              ]}
            >
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                {result?.dominasi ?? "-"}
              </Text>
            </View>
          </View>
        </View>
      </Page>

      {/* 📄 Halaman 3: Grafik + Kesimpulan + TTD + QR */}
      <Page size="A4" style={styles.page}>
        {/* HEADER dengan logo kiri & kanan */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 30 }}>
          <Image src="/logoetp.png" style={{ width: 100, height: 40 }} />
          <Image src="/logoklinik.png" style={{ width: 100, height: 40 }} />
        </View>

{/* GRAFIK */}
<Text style={{ fontSize: 12, fontWeight: "bold", marginBottom: 10 }}>
  B. Grafik Skor Subtest
</Text>

{/* Chart container dengan sumbu */}

<View style={{ flexDirection: "row", height: chartHeight + 20, paddingLeft: 30, paddingBottom: 10 }}>
  {/* Sumbu Y */}
  <View style={{ width: 30, justifyContent: "flex-end", alignItems: "flex-end" }}>
    {Array.from({ length: ySteps + 1 }).map((_, i) => {
      const value = Math.round((maxSw / ySteps) * i);
      return (
        <Text key={i} style={{ fontSize: 8, height: chartHeight / ySteps, textAlign: "right" }}>
          {value}
        </Text>
      );
    })}
  </View>

  {/* Bar chart */}
  <View style={{ flex: 1, flexDirection: "row", alignItems: "flex-end" }}>
    {subtestResults.map((s: any, idx: number) => {
      const barHeight = (s.sw / maxSw) * chartHeight; // tinggi proporsional
      return (
        <View key={idx} style={{ flex: 1, alignItems: "center" }}>
          {/* Bar */}
          <View
            style={{
              width: 20,
              height: barHeight,
              backgroundColor: "#4a90e2",
            }}
          />
          {/* Label X */}
          <Text style={{ fontSize: 8, textAlign: "center", marginTop: 2 }}>
            {s.SubTest?.name || s.name || "-"}
          </Text>
        </View>
      );
    })}
  </View>
</View>



        {/* Judul Kesimpulan */}
        <Text style={{ fontSize: 12, fontWeight: "bold" , marginBottom:10}}>
          C. Kesimpulan
        </Text>

        {/* Kotak Kesimpulan */}
        <View
          style={{
            marginTop: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: "#000",
            borderRadius: 8,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* IQ Score */}
          <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>
            IQ: {result?.iq || "-"} ({result?.keteranganiq || "-"})
          </Text>

          {/* Dominasi */}
          <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 10 }}>
            Dominasi: {result?.dominasi || "-"}
          </Text>

          {/* Kesimpulan tambahan */}
          {kesimpulan && (
            <Text style={{ fontSize: 12, textAlign: "center" }}>
              {kesimpulan}
            </Text>
          )}
        </View>

        {/* Identitas Psikolog + TTD + QR */}
        <View style={{ marginTop: 60, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ alignItems: "center" }}>
            <Text>Psikolog,</Text>
            {result?.ValidatedBy?.ttdUrl && <Image src={result.ValidatedBy.ttdUrl} style={styles.ttd} />}
            <Text>{result?.ValidatedBy?.fullName || "____________________"}</Text>
            {result?.ValidatedBy?.lembagalayanan && <Text>{result.ValidatedBy.lembagalayanan}</Text>}
          </View>

          {qrCodeBase64 && (
            <View style={{ alignItems: "center" }}>
              <Text>Scan untuk verifikasi dokumen</Text>
              <Image src={qrCodeBase64} style={styles.qr} />
              {expiresAt && <Text>Berlaku sampai: {new Date(expiresAt).toLocaleDateString("id-ID")}</Text>}
              {validationNotes && <Text>{validationNotes}</Text>}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}
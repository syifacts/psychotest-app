// components/ReportDocument.tsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,        // <--- ini penting untuk logo
  Svg,
  Line,
  Polyline,
  Text as SvgText
} from "@react-pdf/renderer";


const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, fontFamily: "Helvetica" },
  header: { marginBottom: 16, textAlign: "center" },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  subtitle: { fontSize: 12, color: "#555" },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 6,
    textDecoration: "underline",
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
});

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
}: {
  attempt: any;
  subtestResults: any[];
  result: any | null;
}) {
  const user = attempt.User;
  const testType = attempt.TestType;

  const maxSw = Math.max(...subtestResults.map((s: any) => s.sw ?? 0), 1);

  return (
    <Document>
      {/* 📄 Halaman 1 */}
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'relative' }]}>
  {/* Logo di kiri */}
  <Image
    src="/logoklinik.png"
    style={{ width: 90, height: 50, position: 'absolute', left: 0 }}
  />

  {/* Judul header di tengah */}
  <View style={{ alignItems: 'center' }}>
    <Text style={styles.title}>LAPORAN HASIL TES</Text>
    <Text style={styles.subtitle}>{testType?.name ?? "Unknown Test"}</Text>
    <Text style={{ marginTop: 4, fontSize: 10 }}>
      {`Nomor Laporan: ${attempt.id}`}
    </Text>
  </View>
</View>



        {/* IDENTITAS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identitas Peserta</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nama</Text>
            <Text style={styles.infoValue}>{user?.fullName ?? "-"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tanggal Lahir</Text>
            <Text style={styles.infoValue}>
              {user?.birthDate
                ? new Date(user.birthDate).toLocaleDateString("id-ID")
                : "-"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Usia Saat Tes</Text>
            <Text style={styles.infoValue}>
              {calcAge(user?.birthDate, new Date(attempt.startedAt))}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tanggal Tes</Text>
            <Text style={styles.infoValue}>
              {attempt.startedAt
                ? new Date(attempt.startedAt).toLocaleDateString("id-ID")
                : "-"}
            </Text>
          </View>
        </View>

        {/* SUBTEST + HASIL TOTAL DALAM SATU TABEL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rincian Hasil Tes</Text>
          <View style={styles.table}>
            {/* Header row */}
            <View style={styles.tableRow}>
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
                <View key={idx} style={styles.tableRow}>
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
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, { borderRightWidth: 0 }]}>
                  <Text style={styles.tableCell}>Tidak ada data subtest</Text>
                </View>
              </View>
            )}

            {/* Row Jumlah */}
            <View style={styles.tableRow}>
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
<View style={styles.tableRow}>
  <View style={styles.tableCol}>
    <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
      IQ
    </Text>
  </View>

  {/* Merge RW + SW jadi 1 kolom */}
  <View style={[styles.tableCol, { flex: 2 }]}>
    <Text style={[styles.tableCell, { fontWeight: "bold", textAlign: "center" }]}>
      {result?.iq ?? "-"} {/* swIq ditampilkan di kolom gabungan */}
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
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text>{`Generated: ${new Date().toLocaleString("id-ID")}`}</Text>
          <Text>Sistem Psikotes Online</Text>
        </View>
      </Page>

      {/* 📄 Halaman 2: Grafik + Tanda Tangan */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Grafik Skor Subtest</Text>
        <View style={styles.chartContainer}>
          {subtestResults.map((s: any, idx: number) => {
            const barHeight = (s.sw / maxSw) * 150;
            const left = 40 + idx * 40;
            return (
              <React.Fragment key={idx}>
                <View
                  style={[
                    styles.bar,
                    {
                      left,
                      height: barHeight,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.barLabel,
                    { left: left - 10, width: 40, textAlign: "center" },
                  ]}
                >
                  {s.SubTest?.name || s.name || "-"}
                </Text>
              </React.Fragment>
            );
          })}
        </View>

        {/* Kolom tanda tangan */}
        <View style={styles.signatureContainer}>
          <Text>Mengetahui,</Text>
          <Text>Psikolog / Dokter</Text>
          <View style={styles.signatureBox}>
            <Text>Tanda Tangan</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}


import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 10,
  },
 table: {
  display: "flex",         // ganti dari "table"
  flexDirection: "column", // agar baris ditumpuk vertikal
  width: "auto",
  borderStyle: "solid",
  borderWidth: 1,
  borderRightWidth: 0,
  borderBottomWidth: 0,
},
tableRow: {
  display: "flex",         // ganti dari "table-row"
  flexDirection: "row",    // baris horizontal
},
tableCell: {
  display: "flex",         // ganti dari "table-cell"
  flex: 1,                 // supaya cell membagi space
  borderStyle: "solid",
  borderWidth: 1,
  borderLeftWidth: 0,
  borderTopWidth: 0,
  padding: 2,
},

  tableCol: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 4,
  },
  bold: {
    fontWeight: "bold",
  },
});

// Type
interface SubtestScore {
  name: string;
  rw: number;
  sw: number;
  category: string;
}

interface ReportPDFProps {
  nomor: string;
  nama: string;
  tglLahir: string;
  tglTes: string;
  usia: number;
  tujuan: string;
  subtests: SubtestScore[];
  totalRw: number;
  totalSw: number;
  iq: number;
  dominasi: string;
}

const ReportPDF: React.FC<ReportPDFProps> = ({
  nomor,
  nama,
  tglLahir,
  tglTes,
  usia,
  tujuan,
  subtests,
  totalRw,
  totalSw,
  iq,
  dominasi,
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>HASIL TES</Text>
          <Text>Laporan Hasil Skoring</Text>
        </View>

        {/* Info Peserta */}
        <View style={styles.section}>
          <Text>Nomor: {nomor}</Text>
          <Text>Nama: {nama}</Text>
          <Text>Tgl Lahir: {tglLahir}</Text>
          <Text>Tgl Tes: {tglTes}</Text>
          <Text>Usia: {usia}</Text>
          <Text>Tujuan Tes: {tujuan}</Text>
        </View>

        {/* Tabel Subtest */}
        <View style={[styles.section, styles.table]}>
          {/* Header tabel */}
          <View style={styles.tableRow}>
            <View style={styles.tableCol}><Text style={[styles.tableCell, styles.bold]}>Subtest</Text></View>
            <View style={styles.tableCol}><Text style={[styles.tableCell, styles.bold]}>RW</Text></View>
            <View style={styles.tableCol}><Text style={[styles.tableCell, styles.bold]}>SW</Text></View>
            <View style={styles.tableCol}><Text style={[styles.tableCell, styles.bold]}>Kategori</Text></View>
          </View>

          {/* Rows */}
          {subtests.map((st, idx) => (
            <View style={styles.tableRow} key={idx}>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{st.name}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{st.rw}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{st.sw}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{st.category}</Text></View>
            </View>
          ))}

          {/* Total */}
          <View style={styles.tableRow}>
            <View style={styles.tableCol}><Text style={[styles.tableCell, styles.bold]}>JML</Text></View>
            <View style={styles.tableCol}><Text style={[styles.tableCell, styles.bold]}>{totalRw}</Text></View>
            <View style={styles.tableCol}><Text style={[styles.tableCell, styles.bold]}>{totalSw}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}></Text></View>
          </View>
        </View>

        {/* IQ & Dominasi */}
        <View style={styles.section}>
          <Text>IQ: {iq}</Text>
          <Text>Dominasi: {dominasi}</Text>
        </View>

        {/* Placeholder grafik */}
        <View style={styles.section}>
          <Text>Grafik Skoring Persubtest (bisa pakai chart nanti)</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ReportPDF;

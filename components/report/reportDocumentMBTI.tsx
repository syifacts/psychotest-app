'use client'; // <-- TAMBAHKAN BARIS INI
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Daftarkan font (opsional, tapi disarankan)
// Pastikan file font ada di folder /public
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa.woff2', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    padding: 40,
    fontSize: 10,
    color: '#333',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 14,
    fontWeight: 'bold',
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: '#bfbfbf',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row"
  },
  tableColHeader: {
    width: "30%",
    borderStyle: "solid",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#bfbfbf',
    backgroundColor: '#f2f2f2',
    padding: 5,
  },
  tableCol: {
    width: "70%",
    borderStyle: "solid",
    borderBottomWidth: 1,
    borderColor: '#bfbfbf',
    padding: 5,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#e6e6e6',
    padding: 5,
    marginBottom: 10,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  listItemNumber: {
    width: 20,
  },
  listItemContent: {
    flex: 1,
  },
});

const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('id-ID', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
};

const MbtiReport = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>HASIL PEMERIKSAAN PSIKOLOGIS</Text>

      {/* Tabel Info Pengguna */}
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}><Text>No. Tes</Text></View>
          <View style={styles.tableCol}><Text>: {data.attempt.id}</Text></View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}><Text>Nama</Text></View>
          <View style={styles.tableCol}><Text>: {data.user.fullName}</Text></View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}><Text>Tanggal Lahir</Text></View>
          <View style={styles.tableCol}><Text>: {formatDate(data.user.birthDate)}</Text></View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}><Text>Tanggal Tes</Text></View>
          <View style={styles.tableCol}><Text>: {formatDate(data.attempt.finishedAt)}</Text></View>
        </View>
      </View>

      {/* Deskripsi Kepribadian */}
      <Text style={styles.sectionTitle}>A. DESKRIPSI KEPRIBADIAN ({data.result.resultType})</Text>
      {data.description.description.split('\n').map((item: string, index: number) => (
        <View key={index} style={styles.listItem}>
          <Text style={styles.listItemNumber}>({index + 1})</Text>
          <Text style={styles.listItemContent}>{item}</Text>
        </View>
      ))}

      {/* Saran dan Pengembangan */}
      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>B. SARAN DAN PENGEMBANGAN</Text>
      {data.description.suggestions.split('\n').map((item: string, index: number) => (
        <View key={index} style={styles.listItem}>
          <Text style={styles.listItemNumber}>({index + 1})</Text>
          <Text style={styles.listItemContent}>{item}</Text>
        </View>
      ))}

      {/* Saran Profesi */}
      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>C. SARAN PROFESI</Text>
      <Text>{data.description.professions}</Text>
    </Page>
  </Document>
);

export default MbtiReport;

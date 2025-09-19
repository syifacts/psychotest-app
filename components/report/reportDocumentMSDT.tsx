import React, { useEffect, useState } from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import QRCode from "qrcode";

interface Props {
  attempt: any;
  result: {
    id: number;
    Ds?: number;
    Mi?: number;
    Au?: number;
    Co?: number;
    Bu?: number;
    Dv?: number;
    Ba?: number;
    E?: number;
    totalSkalaTO?: number;
    totalSkalaRO?: number;
    totalSkalaE?: number;
    totalSkalaO?: number;
    konversiTO?: number;
    konversiRO?: number;
    konversiE?: number;
    konversiO?: number;
    hasilAkhir?: string;
    barcodettd?: string;
    ValidatedBy?: {
      fullName: string;
      lembagalayanan?: string;
      ttdUrl?: string;
    };
  };
  kesimpulan?: string;
  ttd?: string;
  barcode?: string;
  expiresAt?: string;
  validationNotes?: string;
}

const styles = StyleSheet.create({
  page: { paddingTop: 40, paddingBottom: 40, paddingHorizontal: 50, fontSize: 12, fontFamily: "Times-Roman" },
  tableRow: { flexDirection: "row" },
  cell: { paddingHorizontal: 6, paddingVertical: 4, flexWrap: 'wrap' },
  bold: { fontFamily: "Times-Bold" },
  text: { lineHeight: 1.5 },
  ttd: { width: 90, height: 90 },
  qr: { width: 100, height: 100, marginTop: 10 },
});

export default function ReportMSDTDocument({ attempt, result, kesimpulan, ttd, barcode, expiresAt, validationNotes }: Props) {
  const [qrCodeBase64, setQrCodeBase64] = useState<string>("");

  useEffect(() => {
    if (barcode) {
      const url = `https://8a106cfaf826.ngrok-free.app/validate/${barcode}`;
      QRCode.toDataURL(url).then(setQrCodeBase64).catch(err => console.error(err));
    }
  }, [barcode]);

  const nomorDokumen = `${String(result?.id || 1).padStart(2,"0")}/PSI-MSDT/${String(new Date().getMonth()+1).padStart(2,"0")}/${new Date().getFullYear()}`;
  const kesimpulanFinal = kesimpulan || result.hasilAkhir || "";

  // Tabel MSDT
// Tabel MSDT dengan mapping sesuai kebutuhan
const rows = [
  { name: "Deserter (Ds)", RO: null, TO: null, E: null, O: result.Ds ?? null },
  { name: "Missionary (Mi)", RO: result.Mi ?? null, TO: null, E: null, O: null },
  { name: "Autocrat (Au)", RO: null, TO: result.Au ?? null, E: null, O: null },
  { name: "Compromiser (Co)", RO: result.Co ?? null, TO: result.Co ?? null, E: null, O: null },
  { name: "Bureaucrat (Bu)", RO: null, TO: null, E: result.Bu ?? null, O: null },
  { name: "Developer (Dv)", RO: result.Dv ?? null, TO: null, E: result.Dv ?? null, O: null },
  { name: "Benevolent Autocrat (Ba)", RO: null, TO: result.Ba ?? null, E: result.Ba ?? null, O: null },
  { name: "Executive (E)", RO: result.E ?? null, TO: result.E ?? null, E: result.E ?? null, O: null },
];


  return (
    <Document>
      {/* Halaman 1: Identitas Peserta */}
      <Page size="A4" style={styles.page}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 40 }}>
          <Image src="/logoetp.png" style={{ width: 100, height: 40 }} />
          <Image src="/logoklinik.png" style={{ width: 100, height: 40 }} />
        </View>

        <View style={{ marginTop: 30, marginBottom: 30 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#0A3D91" }}>Laporan Hasil</Text>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#0A3D91", marginBottom: 6 }}>MSDT</Text>
          <Text style={{ fontSize: 11, fontStyle: "italic", color: "gray" }}>Psychological Assessment MSDT</Text>
          <Text style={{ fontSize: 11, color: "gray" }}>{nomorDokumen}</Text>
        </View>

        <View style={{ marginTop: 40 }}>
          <Text style={{ fontSize: 12, marginBottom: 6, color: "#0A3D91" }}>Nama : {attempt?.User?.fullName || "-"}</Text>
          <Text style={{ fontSize: 12, marginBottom: 6, color: "#0A3D91" }}>Usia : {attempt?.User?.birthDate ? new Date().getFullYear() - new Date(attempt.User.birthDate).getFullYear() : "-"}</Text>
          <Text style={{ fontSize: 12, marginBottom: 6, color: "#0A3D91" }}>Pendidikan : {attempt?.User?.education || "-"}</Text>
<Text style={{ fontSize: 12, marginBottom: 6, color: "#0A3D91" }}>
  Tanggal Tes: {attempt?.startedAt ? new Date(attempt.startedAt).toLocaleDateString("id-ID") : "-"}
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

{/* Judul Tabel */}
<View style={{ marginTop: 10, marginBottom: 4 }}>
  <Text style={{ fontSize: 12, fontWeight: "bold" , marginBottom:10}}>A. Interpretasi Gaya Kepemimpinan</Text>
</View>

{/* Tabel MSDT */}
<View style={{ borderWidth: 1, borderColor: "#000" }}>
  {/* Baris header 1 */}
  <View style={{ flexDirection: "row", backgroundColor: "#d8b6d8", borderBottomWidth: 0, borderColor: "#000" }}>
    <View
      style={{
        width: 145,
        borderRightWidth: 1,
        borderColor: "#000",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 4,
      }}
    >
      <Text style={{ fontWeight: "bold", textAlign: "center" }}>Gaya Kepemimpinan</Text>
    </View>
    <View
      style={{
        width: 240,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 4,
        paddingRight: 0
      }}
    >
      <Text style={{ fontWeight: "bold", textAlign: "center" }}>Jumlah</Text>
    </View>
  </View>

  {/* Baris header 2 */}
  <View style={{ flexDirection: "row", backgroundColor: "#d8b6d8", borderBottomWidth: 1, borderColor: "#000" }}>
    <View style={{ width: 150, borderRightWidth: 1, borderColor: "#000" }} />
    <Text style={[styles.cell, { width: 90, fontWeight: "bold", textAlign: "center", borderRightWidth: 1, borderColor: "#000" }]}>
      Relationship Oriented (RO)
    </Text>
    <Text style={[styles.cell, { width: 90, fontWeight: "bold", textAlign: "center", borderRightWidth: 1, borderColor: "#000" }]}>
      Task Oriented (TO)

    </Text>
    <Text style={[styles.cell, { width: 90, fontWeight: "bold", textAlign: "center", borderRightWidth: 1, borderColor: "#000" }]}>
      Effectiveness (E)
    </Text>
    <Text style={[styles.cell, { width: 90, fontWeight: "bold", textAlign: "center", borderRightWidth: 0, borderColor: "#000" }]}>
      Outcome (O)
    </Text>
  </View>

  {/* Rows data */}
  {rows.map((row, i) => (
  <View key={i} style={{ flexDirection: "row", borderBottomWidth: 1, borderColor: "#ccc" }}>
    <Text style={[styles.cell, { width: 150, borderRightWidth: 1, borderColor: "#000" }]}>{row.name}</Text>
    <Text style={[styles.cell, { width: 90, textAlign: "center", borderRightWidth: 1, borderColor: "#000" }]}>{row.RO != null ? String(row.RO) : ""}</Text>
    <Text style={[styles.cell, { width: 90, textAlign: "center", borderRightWidth: 1, borderColor: "#000" }]}>{row.TO != null ? String(row.TO) : ""}</Text>
    <Text style={[styles.cell, { width: 90, textAlign: "center", borderRightWidth: 1, borderColor: "#000" }]}>{row.E != null ? String(row.E) : ""}</Text>
    <Text style={[styles.cell, { width: 90, textAlign: "center", borderRightWidth: 0, borderColor: "#000" }]}>{row.O != null ? String(row.O) : ""}</Text>
  </View>
))}
{/* Baris Total */}
<View style={{ flexDirection: "row", borderColor: "#000" }}>
  <Text style={[styles.cell, { width: 150, borderRightWidth: 1, borderColor: "#000", fontWeight: "bold" }]}>JUMLAH</Text>
  <Text style={[styles.cell, { width: 90, textAlign: "center", borderRightWidth: 1, borderColor: "#000", fontWeight: "bold" }]}>{result?.totalSkalaRO ?? ""}</Text>
  <Text style={[styles.cell, { width: 90, textAlign: "center", borderRightWidth: 1, borderColor: "#000", fontWeight: "bold" }]}>{result?.totalSkalaTO ?? ""}</Text>
  <Text style={[styles.cell, { width: 90, textAlign: "center", borderRightWidth: 1, borderColor: "#000", fontWeight: "bold" }]}>{result?.totalSkalaE ?? ""}</Text>
  <Text style={[styles.cell, { width: 90, textAlign: "center", borderRightWidth: 0, borderColor: "#000", fontWeight: "bold" }]}>{result?.totalSkalaO ?? ""}</Text>
</View>
</View>
{/* Tabel Skala Orientasi */}
<View style={{ marginTop: 20, borderWidth: 1, borderColor: "#000" }}>
  {/* Header */}
  <View style={{ flexDirection: "row", backgroundColor: "#d8b6d8", borderBottomWidth: 1, borderColor: "#000" }}>
    <View style={{ width: 120, borderRightWidth: 1, borderColor: "#000", justifyContent: "center", alignItems: "center", paddingVertical: 4 }}>
      <Text style={{ fontWeight: "bold", textAlign: "center" }}>Skala Orientasi</Text>
    </View>
    {["0","0.6","1.2","1.8","2.4","3.0","3.6","4"].map((val, i) => (
      <View key={i} style={{ width: 50, borderRightWidth: i<7 ? 1 : 0, borderColor: "#000", justifyContent: "center", alignItems: "center", paddingVertical: 4 }}>
        <Text style={{ fontWeight: "bold", textAlign: "center" }}>{val}</Text>
      </View>
    ))}
  </View>

  {/* Rows */}
  {[
    { label: "TO", value: result.konversiTO },
    { label: "RO", value: result.konversiRO },
    { label: "E",  value: result.konversiE },
  ].map((row, i) => (
    <View key={i} style={{ flexDirection: "row", borderBottomWidth: i<2 ? 1 : 0, borderColor: "#000" }}>
      <View style={{ width: 120, borderRightWidth: 1, borderColor: "#000", paddingVertical: 4, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontWeight: "bold", textAlign: "center" }}>{row.label}</Text>
      </View>
      {["0","0.6","1.2","1.8","2.4","3.0","3.6","4"].map((val, j) => (
        <View key={j} style={{ width: 50, borderRightWidth: j<7 ? 1 : 0, borderColor: "#000", paddingVertical: 4, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ textAlign: "center" }}>{row.value === parseFloat(val) ? "X" : ""}</Text>
        </View>
      ))}
    </View>
  ))}
</View>
</Page>


{/* Halaman 3: Kesimpulan + TTD + QR */}
<Page size="A4" style={styles.page}>
      {/* HEADER dengan logo kiri & kanan */}
  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 30 }}>
    <Image src="/logoetp.png" style={{ width: 100, height: 40 }} />
    <Image src="/logoklinik.png" style={{ width: 100, height: 40 }} />
  </View>
  {/* Judul Kesimpulan */}
  <Text style={{ fontSize: 12, fontWeight: "bold", marginBottom:10 }}>B.	Kesimpulan Gaya Kepemimpinan</Text>

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
  {/* Hasil Akhir dari DB */}
  <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>
    {result?.hasilAkhir || "Developer"}
  </Text>

  {/* Kesimpulan */}
  <Text style={{ fontSize: 12, textAlign: "center" }}>
    {kesimpulanFinal || "Tidak ada kesimpulan tersedia"}
  </Text>
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

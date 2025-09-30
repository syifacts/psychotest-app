'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';

// Import semua template PDF
import ReportISTDocument from '../../../../components/report/reportDocument';
import ReportCPMIDocument from '../../../../components/report/reportDocumentCPMI';

// Mapping testType → PDF component
const PDFComponents: Record<string, any> = {
  IST: ReportISTDocument,
  CPMI: ReportCPMIDocument,
};

export default function HasilPage() {
  const { id } = useParams();
  const [attempt, setAttempt] = useState<any | null>(null);
  const [subtestResults, setSubtestResults] = useState<any[]>([]);
  const [result, setResult] = useState<any | null>(null);
  const [cpmiResult, setCpmiResult] = useState<any | null>(null); 
const [kesimpulan, setKesimpulan] = useState({
  kesimpulan: '',
  kesimpulanSikap: '',
  kesimpulanKepribadian: '',
  kesimpulanBelajar: '',
  saranpengembangan: '',
  kesimpulanumum: ''
});

 // ✅ Tambah
  const [ttd, setTtd] = useState('');                 // ✅ Tambah
  const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//   if (!id) return;

//   const fetchReport = async () => {
//     try {
//       const res = await fetch(`/api/attempts/${id}`);
//       if (!res.ok) throw new Error("Gagal ambil data report");
//       const data = await res.json();

//       console.log("📌 Full API response:", data);

//       setAttempt(data.attempt);
//       setSubtestResults(data.subtestResults || []);
//       setResult(data.result || null);
//       setCpmiResult(data.cpmiResult || null);

//       if (data.cpmiResult) {
//         console.log("✅ CPMI TTD dari API:", data.cpmiResult.ttd);
//         setKesimpulan(data.cpmiResult.kesimpulan || "");
//         setTtd(data.cpmiResult.ttd || "");
//       } else if (data.result) {
//         console.log("✅ IST TTD dari API:", data.result.ttd);
//         setKesimpulan(data.result.kesimpulan || "");
//         setTtd(data.result.ttd || "");
//       }
//     } catch (err) {
//       console.error("❌ Error fetching report:", err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   fetchReport();
// }, [id]);

useEffect(() => {
  if (!id) return;

  const fetchReport = async () => {
    try {
      const res = await fetch(`/api/attempts/${id}`);
      if (!res.ok) throw new Error("Gagal ambil data report");
      const data = await res.json();

      console.log("📌 Full API response:", data);

      setAttempt(data.attempt);
      setSubtestResults(data.subtestResults || []);
      setResult(data.result || null);
      setCpmiResult(data.cpmiResult || null);

      // Ambil source data: CPMI kalau ada, kalau tidak pakai result
      const source = data.cpmiResult || data.result || {};

      setKesimpulan({
        kesimpulan: source.kesimpulan || '',
        kesimpulanSikap: source.kesimpulanSikap || '',
        kesimpulanKepribadian: source.kesimpulanKepribadian || '',
        kesimpulanBelajar: source.kesimpulanBelajar || '',
        saranpengembangan: source.saranpengembangan || '',
        kesimpulanumum: source.kesimpulanumum || '',
      });

      setTtd(source.ttd || '');
      
    } catch (err) {
      console.error("❌ Error fetching report:", err);
    } finally {
      setIsLoading(false);
    }
  };

  fetchReport();
}, [id]);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Memuat laporan...</p>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Data laporan tidak ditemukan.</p>
      </div>
    );
  }

  // Tentukan jenis tes
  const rawTestType = attempt.TestType?.name || attempt.TestType?.code || attempt.TestType?.id || 'IST';
  const testType = String(rawTestType).toUpperCase();
  const PDFTemplate = PDFComponents[testType] || ReportISTDocument;

  const fileName = `${attempt.TestType?.name || 'Tes'}_${attempt.User?.fullName || 'User'}.pdf`.replace(/\s+/g, '_');

  // Tentukan props yang akan dikirim ke PDF berdasarkan jenis tes
  const getPDFProps = () => {
    if (testType === 'CPMI' && cpmiResult) {
      return {
        attempt,
        result: cpmiResult,
        kesimpulan: kesimpulan.kesimpulan,
kesimpulanSikap: kesimpulan.kesimpulanSikap,
kesimpulanKepribadian: kesimpulan.kesimpulanKepribadian,
kesimpulanBelajar: kesimpulan.kesimpulanBelajar,
saranpengembangan: kesimpulan.saranpengembangan,
kesimpulanumum: kesimpulan.kesimpulanumum,
  // ✅ sekarang sudah ada
        ttd,          // ✅ sekarang sudah ada
        barcode: cpmiResult.barcode,
      };
    } else {
      return {
        attempt,
        subtestResults,
        result,
        kesimpulan,
        ttd,
         barcode: result?.barcode,
      };
    }
  };

  const pdfProps = getPDFProps();

  return (
    <div className="h-screen flex flex-col">
      {/* Tombol Download */}
      <div className="p-4 bg-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">
            Laporan {attempt.TestType?.name || 'Test'} - {attempt.User?.fullName || 'User'}
          </h1>
          {cpmiResult && (
            <p className="text-sm text-gray-600">
              Skor IQ: {cpmiResult.scoreiq} | Status: {cpmiResult.keteranganiqCPMI}
            </p>
          )}
        </div>
        <PDFDownloadLink
          document={<PDFTemplate {...pdfProps} />}
          fileName={fileName}
        >
          {({ loading }) => (
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">
              {loading ? 'Menyiapkan...' : 'Unduh PDF'}
            </button>
          )}
        </PDFDownloadLink>
      </div>

      {/* Preview PDF */}
      <div className="flex-grow">
        <PDFViewer style={{ width: '100%', height: '100%' }}>
          <PDFTemplate {...pdfProps} />
        </PDFViewer>
      </div>
    </div>
  );
}

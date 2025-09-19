'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import ReportISTDocument from '@/components/report/reportDocument';
import ReportCPMIDocument from '@/components/report/reportDocumentCPMI';
import ReportMSDTDocument from '@/components/report/reportDocumentMSDT';

const PDFComponents: Record<string, any> = {
  IST: ReportISTDocument,
  CPMI: ReportCPMIDocument,
  MSDT: ReportMSDTDocument,
};

export default function HasilPage() {
  const { id } = useParams();
  const [attempt, setAttempt] = useState<any | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [cpmiResult, setCpmiResult] = useState<any | null>(null);
  const [subtestResults, setSubtestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ttd, setTtd] = useState<string | null>(null);
  const [kesimpulan, setKesimpulan] = useState('');
  const [msdtResult, setmsdtResult] = useState<any | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/attempts/${id}`);
        const data = await res.json();

        setAttempt(data.attempt || null);
        setResult(data.result || null);
        setCpmiResult(data.cpmiResult || null);
        setmsdtResult(data.msdtResult || null);
        setSubtestResults(data.subtestResults || []);

        // Ambil kesimpulan default
        const source = data.cpmiResult || data.result || {};
        setKesimpulan(source.kesimpulan || '');

        // Ambil TTD psikolog
        setTtd(data.ttd || null);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (isLoading) return <p>Memuat laporan...</p>;
  if (!attempt) return <p>Data laporan tidak ditemukan.</p>;

  const testType = (attempt.TestType?.name || 'IST').toUpperCase();
  const PDFTemplate = PDFComponents[testType] || ReportISTDocument;

  // props untuk PDF
  const pdfProps =
    testType === 'CPMI'
      ? { 
          attempt, 
          result: cpmiResult, 
          kesimpulan, 
          ttd,
          barcode: cpmiResult?.barcode,
          barcodettd: cpmiResult?.barcodettd,
          expiresAt: cpmiResult?.expiresAt
        }
      : testType === 'MSDT'
      ? {
          attempt,
           result: msdtResult,       // MSDT pakai result utama
          kesimpulan: msdtResult?.kesimpulan || kesimpulan,
          ttd,
  barcode: msdtResult?.barcode,
    barcodettd: msdtResult?.barcodettd,
    expiresAt: msdtResult?.expiresAt
        }
      : { attempt, result, subtestResults, kesimpulan, ttd };

  const fileName = `${attempt.TestType?.name}_${attempt.User?.fullName}.pdf`.replace(/\s+/g, '_');

  const handleSave = async () => {
    try {
      await fetch('/api/reports/update-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId: id, kesimpulan }),
      });
      alert('Berhasil disimpan!');
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan!');
    }
  };

  const handleValidate = async () => {
    if (!result && !cpmiResult) return;

    try {
      const reportId = testType === 'CPMI' ? cpmiResult?.id : result?.id;
      const res = await fetch('/api/reports/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reportId, 
          kesimpulan,
          ttd 
        }),
      });
      const data = await res.json();

      if (data.success) {
        alert('Berhasil validasi!');

        // Re-fetch report supaya dapat barcode & TTD terbaru
        const updated = await fetch(`/api/attempts/${id}`);
        const updatedData = await updated.json();

        if (testType === 'CPMI') {
          setCpmiResult(updatedData.cpmiResult);
        } else if (testType === 'MSDT') {
          setResult(updatedData.result);
        }
        setTtd(updatedData.ttd);
      } else {
        alert('Validasi gagal!');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan!');
    }
  };

  // Key unik untuk re-render PDF saat kesimpulan berubah
  const pdfKey = JSON.stringify({ kesimpulan, result, cpmiResult, subtestResults });

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 flex justify-between bg-gray-100">
        <h1>{attempt.User?.fullName} - {attempt.TestType?.name}</h1>
        <PDFDownloadLink key={pdfKey} document={<PDFTemplate {...pdfProps} />} fileName={fileName}>
          {({ loading }) => (
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              {loading ? 'Menyiapkan...' : 'Unduh PDF'}
            </button>
          )}
        </PDFDownloadLink>
        <button
          onClick={handleValidate}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mt-2"
        >
          Validasi & Perbarui PDF
        </button>
      </div>

      {/* Content 2 kolom */}
      <div className="flex flex-grow gap-4 p-4">
        {/* Form kiri */}
        <div className="w-1/3 bg-white rounded shadow p-4 flex flex-col">
          <h2 className="text-lg font-bold mb-4">Kesimpulan</h2>
          <label className="font-semibold mb-1">Kesimpulan:</label>
          <textarea
            className="w-full h-40 p-2 border rounded mb-4"
            value={kesimpulan}
            onChange={(e) => setKesimpulan(e.target.value)}
          />
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-auto"
          >
            Simpan
          </button>
        </div>

        {/* Preview PDF kanan */}
        <div className="flex-grow">
          <PDFViewer key={pdfKey} style={{ width: '100%', height: '100%' }}>
            <PDFTemplate {...pdfProps} />
          </PDFViewer>
        </div>
      </div>
    </div>
  );
}

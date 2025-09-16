'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import ReportISTDocument from '../../../../components/report/reportDocument';
import ReportCPMIDocument from '../../../../components/report/reportDocumentCPMI';

const PDFComponents: Record<string, any> = {
  IST: ReportISTDocument,
  CPMI: ReportCPMIDocument,
};

export default function HasilPage() {
  const { id } = useParams();
  const [attempt, setAttempt] = useState<any | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [cpmiResult, setCpmiResult] = useState<any | null>(null);
  const [subtestResults, setSubtestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk edit kesimpulan & ttd
  const [kesimpulan, setKesimpulan] = useState('');
  const [ttd, setTtd] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/attempts/${id}`);
        const data = await res.json();
        setAttempt(data.attempt);
        setResult(data.result);
        setCpmiResult(data.cpmiResult);
        setSubtestResults(data.subtestResults || []);

        // Ambil kesimpulan & ttd
        if (data.cpmiResult) {
          setKesimpulan(data.cpmiResult.kesimpulan || '');
          setTtd(data.cpmiResult.ttd || '');
        } else if (data.result) {
          setKesimpulan(data.result.kesimpulan || '');
          setTtd(data.result.ttd || '');
        }
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

  const pdfProps =
    testType === 'CPMI' && cpmiResult
      ? { attempt, result: cpmiResult, kesimpulan, ttd }
      : { attempt, result, subtestResults, kesimpulan, ttd };

  const fileName = `${attempt.TestType?.name}_${attempt.User?.fullName}.pdf`.replace(/\s+/g, '_');

  const handleTTDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setTtd(reader.result as string); // simpan base64
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      await fetch('/api/reports/update-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId: id, kesimpulan, ttd }),
      });
      alert('Berhasil disimpan!');
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan!');
    }
  };

  // Key unik untuk re-render PDF saat kesimpulan/ttd berubah
  const pdfKey = JSON.stringify({ kesimpulan, ttd, result, cpmiResult, subtestResults });

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
      </div>

      {/* Content 2 kolom */}
      <div className="flex flex-grow gap-4 p-4">
        {/* Form kiri */}
        <div className="w-1/3 bg-white rounded shadow p-4 flex flex-col">
          <h2 className="text-lg font-bold mb-4">Kesimpulan & TTD</h2>

          <label className="font-semibold mb-1">Kesimpulan:</label>
          <textarea
            className="w-full h-40 p-2 border rounded mb-4"
            value={kesimpulan}
            onChange={(e) => setKesimpulan(e.target.value)}
          />

          <label className="font-semibold mb-1">TTD:</label>
          {ttd ? (
            <img src={ttd} alt="TTD Barcode" className="mb-2 w-32 h-32 border" />
          ) : null}
          <input type="file" onChange={handleTTDChange} className="mb-4" />

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

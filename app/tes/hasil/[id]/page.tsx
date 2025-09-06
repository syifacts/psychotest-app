// app/hasil/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import ReportDocument from '../../../../components/report/reportDocument';

export default function HasilPage() {
  const { id } = useParams();
  const [attempt, setAttempt] = useState<any | null>(null);
  const [subtestResults, setSubtestResults] = useState<any[]>([]);
  const [result, setResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/attempts/${id}`);
        if (!res.ok) throw new Error('Gagal ambil data report');
        const data = await res.json();
        setAttempt(data.attempt);
        setSubtestResults(data.subtestResults);
        setResult(data.result);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchReport();
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

  const fileName = `${attempt.TestType?.name || 'Tes'}_${attempt.User?.fullName || 'User'}.pdf`;

  return (
    <div className="h-screen flex flex-col">
      {/* Tombol Download */}
      <div className="p-4 bg-gray-100 flex justify-end">
        <PDFDownloadLink
          document={
            <ReportDocument attempt={attempt} subtestResults={subtestResults} result={result} />
          }
          fileName={fileName.replace(/\s+/g, '_')}
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
          <ReportDocument attempt={attempt} subtestResults={subtestResults} result={result} />
        </PDFViewer>
      </div>
    </div>
  );
}

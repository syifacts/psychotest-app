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
  const [cpmiResult, setCpmiResult] = useState<any | null>(null); // Tambahkan state untuk CPMI
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/attempts/${id}`);
        if (!res.ok) throw new Error('Gagal ambil data report');
        const data = await res.json();
        
        setAttempt(data.attempt);
        setSubtestResults(data.subtestResults || []);
        setResult(data.result || null);
        setCpmiResult(data.cpmiResult || null); // Set CPMI result

        // Debug: tampilkan data
        console.log('Fetched attempt:', data.attempt);
        console.log('CPMI Result:', data.cpmiResult);
        console.log('TestType:', data.attempt.TestType);
      } catch (err) {
        console.error('Error fetching report:', err);
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

  // Tentukan jenis tes dan template PDF yang akan digunakan
  const rawTestType = attempt.TestType?.name || attempt.TestType?.code || attempt.TestType?.id || 'IST';
  const testType = String(rawTestType).toUpperCase();
  const PDFTemplate = PDFComponents[testType] || ReportISTDocument;

  // Debug: cek PDFTemplate yang dipilih
  console.log('Test Type:', testType);
  console.log('Using PDFTemplate:', PDFTemplate.name);

  const fileName = `${attempt.TestType?.name || 'Tes'}_${attempt.User?.fullName || 'User'}.pdf`.replace(/\s+/g, '_');

  // Tentukan props yang akan dikirim ke PDF berdasarkan jenis tes
  const getPDFProps = () => {
    if (testType === 'CPMI' && cpmiResult) {
      return {
        attempt,
        result: cpmiResult, // Untuk CPMI, gunakan cpmiResult
      };
    } else {
      return {
        attempt,
        subtestResults,
        result, // Untuk IST, gunakan result biasa
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
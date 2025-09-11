'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import ReportCPMIDocument from '../../../../components/report/reportDocumentCPMI';

export default function ViewReportPage() {
  const { barcode } = useParams();
  const [reportData, setReportData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!barcode) return;
    setLoading(true);
    axios.get(`/api/report/view/${barcode}`)
      .then(res => {
        const data = res.data;

        // Cek expired
        if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
          setError('QR Code ini sudah kadaluarsa.');
          setReportData(null);
        } else {
          setReportData(data);
          setError(null);
        }
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Gagal memuat report');
        setReportData(null);
      })
      .finally(() => setLoading(false));
  }, [barcode]);

  if (loading) return <div style={{ padding: 20 }}>Memuat report...</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>;
  if (!reportData) return null;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1 }}>
        <PDFViewer width="100%" height="100%">
          <ReportCPMIDocument
            attempt={reportData.attempt}
            result={reportData.result}
            kesimpulan={reportData.kesimpulan}
            ttd={reportData.ttd}
            barcode={reportData.barcode}
            expiresAt={reportData.expiresAt}
            validationNotes={reportData.validationNotes}
          />
        </PDFViewer>
      </div>

      {/* Tombol Download */}
      <div style={{ padding: 10, textAlign: 'center', background: '#f0f0f0' }}>
        <PDFDownloadLink
          document={
            <ReportCPMIDocument
              attempt={reportData.attempt}
              result={reportData.result}
              kesimpulan={reportData.kesimpulan}
              ttd={reportData.ttd}
              barcode={reportData.barcode}
              expiresAt={reportData.expiresAt}
              validationNotes={reportData.validationNotes}
            />
          }
          fileName={`Report_CPMI_${reportData.attempt.User?.fullName || 'user'}.pdf`}
        >
          {({ loading }) =>
            loading ? 'Mempersiapkan PDF...' : 'Download PDF'
          }
        </PDFDownloadLink>
      </div>
    </div>
  );
}

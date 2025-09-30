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
const [kesimpulan, setKesimpulan] = useState({
  kesimpulan: '',
  kesimpulanSikap: '',
  kesimpulanKepribadian: '',
  kesimpulanBelajar: '',
    saranpengembangan: '',
    kesimpulanumum: '',

});


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

      const source = data.cpmiResult || data.result || {};
setKesimpulan((prev) => ({
  kesimpulan: source.kesimpulan ?? prev.kesimpulan,
  kesimpulanSikap: source.kesimpulanSikap ?? prev.kesimpulanSikap,
  kesimpulanKepribadian: source.kesimpulanKepribadian ?? prev.kesimpulanKepribadian,
  kesimpulanBelajar: source.kesimpulanBelajar ?? prev.kesimpulanBelajar,
  saranpengembangan: source.saranpengembangan ?? prev.saranpengembangan,
  kesimpulanumum: source.kesimpulanumum ?? prev.kesimpulanumum,
}));




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
       kesimpulan: kesimpulan.kesimpulan,
kesimpulanSikap: kesimpulan.kesimpulanSikap,
kesimpulanKepribadian: kesimpulan.kesimpulanKepribadian,
kesimpulanBelajar: kesimpulan.kesimpulanBelajar,
kesimpulanumum: kesimpulan.kesimpulanumum,
saranpengembangan: kesimpulan.saranpengembangan,

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
    : { 
    attempt, 
    result, 
    subtestResults, 
    kesimpulan: kesimpulan.kesimpulan, // <--- ubah ini
    ttd 
  };


  const fileName = `${attempt.TestType?.name}_${attempt.User?.fullName}.pdf`.replace(/\s+/g, '_');

  const handleSave = async () => {
  try {
    const res = await fetch('/api/reports/update-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attemptId: id,
        kesimpulan: kesimpulan.kesimpulan,
        kesimpulanSikap: kesimpulan.kesimpulanSikap,
        kesimpulanKepribadian: kesimpulan.kesimpulanKepribadian,
        kesimpulanBelajar: kesimpulan.kesimpulanBelajar,
        kesimpulanumum: kesimpulan.kesimpulanumum,
        saranpengembangan: kesimpulan.saranpengembangan,
        ttd
      }),
    });

    const data = await res.json();
    if (data.success) {
      alert('Berhasil disimpan! ✅');

      // 🔹 Fetch ulang agar textarea & preview PDF sinkron dengan DB
      const updated = await fetch(`/api/attempts/${id}`);
      const updatedData = await updated.json();

      const source = updatedData.cpmiResult || updatedData.result || {};
      setKesimpulan({
        kesimpulan: source.kesimpulan || '',
        kesimpulanSikap: source.kesimpulanSikap || '',
        kesimpulanKepribadian: source.kesimpulanKepribadian || '',
        kesimpulanBelajar: source.kesimpulanBelajar || '',
        saranpengembangan: source.saranpengembangan || '',
        kesimpulanumum: source.kesimpulanumum || '',
      });
    } else {
      alert('Gagal menyimpan: ' + (data.error || 'Unknown error'));
    }
  } catch (err) {
    console.error(err);
    alert('Terjadi kesalahan saat menyimpan!');
  }
};

//   const handleSave = async () => {
//   try {
//     const res = await fetch('/api/reports/update-summary', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         attemptId: id,
//         kesimpulan: kesimpulan.kesimpulan,
//         kesimpulanSikap: kesimpulan.kesimpulanSikap,
//         kesimpulanKepribadian: kesimpulan.kesimpulanKepribadian,
//         kesimpulanBelajar: kesimpulan.kesimpulanBelajar,
//         kesimpulanumum: kesimpulan.kesimpulanumum,
// saranpengembangan: kesimpulan.saranpengembangan,

//         ttd
//       }),
//     });
//     const data = await res.json();
//     if(data.success){
//       alert('Berhasil disimpan!');
//     } else {
//       alert('Gagal menyimpan: ' + (data.error || 'Unknown error'));
//     }
//   } catch (err) {
//     console.error(err);
//     alert('Terjadi kesalahan saat menyimpan!');
//   }
// };


  const handleValidate = async () => {
  if (!result && !cpmiResult) return;

  try {
    const reportId = testType === 'CPMI' ? cpmiResult?.id : result?.id;
    const res = await fetch('/api/reports/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        reportId, 
        kesimpulan: kesimpulan,
        kesimpulanSikap: kesimpulan.kesimpulanSikap,
        kesimpulanKepribadian: kesimpulan.kesimpulanKepribadian,
        kesimpulanBelajar: kesimpulan.kesimpulanBelajar,
        kesimpulanumum: kesimpulan.kesimpulanumum,
saranpengembangan: kesimpulan.saranpengembangan,
        ttd 
      }),
    });
    const data = await res.json();

    if (data.success) {
      alert('Berhasil validasi!');
      // re-fetch report untuk update PDF
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
const pdfKey = JSON.stringify({
  kesimpulan: kesimpulan.kesimpulan,
  kesimpulanSikap: kesimpulan.kesimpulanSikap,
  kesimpulanKepribadian: kesimpulan.kesimpulanKepribadian,
  kesimpulanBelajar: kesimpulan.kesimpulanBelajar,
  saranpengembangan: kesimpulan.saranpengembangan,
  kesimpulanumum: kesimpulan.kesimpulanumum,
  result,
  cpmiResult,
  msdtResult,
  subtestResults,
});

  return (
//     <div className="h-screen flex flex-col">
//       {/* Header */}
//       <div className="p-4 flex justify-between bg-gray-100">
//         <h1>{attempt.User?.fullName} - {attempt.TestType?.name}</h1>
//         {/* <PDFDownloadLink key={pdfKey} document={<PDFTemplate {...pdfProps} />} fileName={fileName}>
//           {({ loading }) => (
//             <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
//               {loading ? 'Menyiapkan...' : 'Unduh PDF'}
//             </button>
//           )}
//         </PDFDownloadLink> */}
//         <PDFDownloadLink
//   document={<PDFTemplate {...pdfProps} />}
//   fileName={fileName}
// >
//   {({ loading }) => (
//     <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
//       {loading ? 'Menyiapkan...' : 'Unduh PDF'}
//     </button>
//   )}
// </PDFDownloadLink>

//         {/* <button
//           onClick={handleValidate}
//           className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mt-2"
//         >
//           Validasi & Perbarui PDF
//         </button> */}
//       </div>

//       {/* Content 2 kolom */}
//       <div className="flex flex-grow gap-4 p-4">
//        {/* Form kiri */}
// <div className="w-1/3 bg-white rounded shadow p-4 flex flex-col">
//   <h2 className="text-lg font-bold mb-4">Kesimpulan</h2>

// {testType === "CPMI" ? (
//   <>
//     <label className="font-semibold mb-1"> I. KEMAMPUAN INTELEKTUAL:</label>
//     <textarea
//       className="w-full h-20 p-2 border rounded mb-4"
//       value={kesimpulan.kesimpulan}
//       onChange={(e) => setKesimpulan({ ...kesimpulan, kesimpulan: e.target.value })}
//     />

//     <label className="font-semibold mb-1">II. SIKAP DAN CARA KERJA:</label>
//     <textarea
//       className="w-full h-20 p-2 border rounded mb-4"
//       value={kesimpulan.kesimpulanSikap}
//       onChange={(e) => setKesimpulan({ ...kesimpulan, kesimpulanSikap: e.target.value })}
//     />

//     <label className="font-semibold mb-1"> III. KEPRIBADIAN:</label>
//     <textarea
//       className="w-full h-20 p-2 border rounded mb-4"
//       value={kesimpulan.kesimpulanKepribadian}
//       onChange={(e) =>
//         setKesimpulan({ ...kesimpulan, kesimpulanKepribadian: e.target.value })
//       }
//     />

//     <label className="font-semibold mb-1">IV. KEMAMPUAN BELAJAR:</label>
//     <textarea
//       className="w-full h-20 p-2 border rounded mb-4"
//       value={kesimpulan.kesimpulanBelajar}
//       onChange={(e) =>
//         setKesimpulan({ ...kesimpulan, kesimpulanBelajar: e.target.value })
//       }
//     />

//     <label className="font-semibold mb-1">Saran Pengembangan:</label>
//     <textarea
//       className="w-full h-32 p-2 border rounded mb-4"
//       value={kesimpulan.saranpengembangan}
//       onChange={(e) => setKesimpulan({ ...kesimpulan, saranpengembangan: e.target.value })}
//     />
//         <label className="font-semibold mb-1">Kesimpulan Umum:</label>
//     <textarea
//       className="w-full h-32 p-2 border rounded mb-4"
//       value={kesimpulan.kesimpulanumum}
//       onChange={(e) => setKesimpulan({ ...kesimpulan, kesimpulanumum: e.target.value })}
//     />
//   </>
// ) : (
//   <>
//     <label className="font-semibold mb-1">Kesimpulan:</label>
//     <textarea
//       className="w-full h-32 p-2 border rounded mb-4"
//       value={kesimpulan.kesimpulan}
//       onChange={(e) => setKesimpulan({ ...kesimpulan, kesimpulan: e.target.value })}
//     />
    
//   </>
// )}

//   <button
//     onClick={handleSave}
//     className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-auto"
//   >
//     Simpan
//   </button>
// </div>


//         {/* Preview PDF kanan */}
//         {/* <div className="flex-grow">
//           <PDFViewer key={pdfKey} style={{ width: '100%', height: '100%' }}>
//             <PDFTemplate {...pdfProps} />
//           </PDFViewer>
//         </div> */}
//         {/* Preview PDF kanan */}
// <div className="flex-grow">
//   <PDFViewer style={{ width: '100%', height: '100%' }}>
//     <PDFTemplate {...pdfProps} />
//   </PDFViewer>
// </div>


<div className="h-screen flex flex-col bg-gray-50">
  {/* Header */}
  <div className="p-4 bg-white border-b flex items-center justify-between shadow-sm">
    <h1 className="text-lg font-semibold">
      {attempt.User?.fullName} - {attempt.TestType?.name}
    </h1>
    <div className="flex gap-2">
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
      >
        💾 Simpan
      </button>
      <PDFDownloadLink
      key={pdfKey}
        document={<PDFTemplate {...pdfProps} />}
        fileName={fileName}
      >
        {({ loading }) => (
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600">
            {loading ? 'Menyiapkan...' : '⬇️ Unduh PDF'}
          </button>
        )}
      </PDFDownloadLink>
    </div>
  </div>

  {/* Content */}
  <div className="flex flex-grow gap-4 p-4">
    {/* Form Kesimpulan */}
    <div className="w-1/3 flex flex-col gap-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow p-4 space-y-3">
        <h2 className="text-hd font-bold border-b pb-2">
          Kesimpulan
        </h2>

        {/* Tab style atau section */}
        {testType === "CPMI" ? (
          <>
            <label className="block text-hd font-bold">I. Kemampuan Intelektual</label>
            <textarea
              className="w-full h-20 p-2 border rounded focus:ring-2 focus:ring-blue-400"
              value={kesimpulan.kesimpulan}
              onChange={(e) =>
                setKesimpulan({ ...kesimpulan, kesimpulan: e.target.value })
              }
            />

            <label className="block text-hd font-bold">II. Sikap & Cara Kerja</label>
            <textarea
              className="w-full h-20 p-2 border rounded focus:ring-2 focus:ring-blue-400"
              value={kesimpulan.kesimpulanSikap}
              onChange={(e) =>
                setKesimpulan({ ...kesimpulan, kesimpulanSikap: e.target.value })
              }
            />

            <label className="block text-hd font-bold">III. Kepribadian</label>
            <textarea
              className="w-full h-20 p-2 border rounded focus:ring-2 focus:ring-blue-400"
              value={kesimpulan.kesimpulanKepribadian}
              onChange={(e) =>
                setKesimpulan({ ...kesimpulan, kesimpulanKepribadian: e.target.value })
              }
            />

            <label className="block text-hd font-bold">IV. Kemampuan Belajar</label>
            <textarea
              className="w-full h-20 p-2 border rounded focus:ring-2 focus:ring-blue-400"
              value={kesimpulan.kesimpulanBelajar}
              onChange={(e) =>
                setKesimpulan({ ...kesimpulan, kesimpulanBelajar: e.target.value })
              }
            />

            <label className="block text-hd font-bold">Saran Pengembangan</label>
            <textarea
              className="w-full h-24 p-2 border rounded focus:ring-2 focus:ring-blue-400"
              value={kesimpulan.saranpengembangan}
              onChange={(e) =>
                setKesimpulan({ ...kesimpulan, saranpengembangan: e.target.value })
              }
            />

            <label className="block text-hd font-bold">Kesimpulan Umum</label>
            <textarea
              className="w-full h-24 p-2 border rounded focus:ring-2 focus:ring-blue-400"
              value={kesimpulan.kesimpulanumum}
              onChange={(e) =>
                setKesimpulan({ ...kesimpulan, kesimpulanumum: e.target.value })
              }
            />
          </>
        ) : (
          <>
            <label className="block text-hd font-bold">Kesimpulan</label>
            <textarea
              className="w-full h-32 p-2 border rounded focus:ring-2 focus:ring-blue-400"
              value={kesimpulan.kesimpulan}
              onChange={(e) =>
                setKesimpulan({ ...kesimpulan, kesimpulan: e.target.value })
              }
            />
          </>
        )}
      </div>
    </div>

    {/* PDF Preview */}
    <div className="flex-grow bg-white rounded-lg shadow p-2">
      <div className="text-sm font-medium text-gray-500 mb-2">Preview Laporan</div>
      <PDFViewer key={pdfKey} style={{ width: "100%", height: "100%" }}>
        <PDFTemplate {...pdfProps} />
      </PDFViewer>
    </div>
  </div>
</div>
  );
}

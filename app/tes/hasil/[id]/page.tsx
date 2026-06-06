'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { useRouter } from "next/navigation";

import QRCode from "qrcode";
// Import semua template PDF
import ReportISTDocument from '../../../../components/report/reportDocument';
import ReportCPMIDocument from '../../../../components/report/reportDocumentCPMI';
import ReportMSDTDocument from '@/components/report/reportDocumentMSDT';

// Mapping testType → PDF component
const PDFComponents: Record<string, any> = {
  IST: ReportISTDocument,
  CPMI: ReportCPMIDocument,
    MSDT: ReportMSDTDocument, // ✅ tambahkan ini

};

export default function HasilPage() {
  const router = useRouter();
    const { id } = useParams(); // ✅ pakai useParams saja
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<any | null>(null);
  const [subtestResults, setSubtestResults] = useState<any[]>([]);
  const [result, setResult] = useState<any | null>(null);
  const [cpmiResult, setCpmiResult] = useState<any | null>(null); 
    const [msdtResult, setmsdtResult] = useState<any | null>(null); 
    const [unauthorized, setUnauthorized] = useState(false);
    // Tambahkan ini setelah useState
useEffect(() => {
  if (unauthorized) {
    const timer = setTimeout(() => router.push("/login"), 2000);
    return () => clearTimeout(timer); // cleanup jika component unmount
  }
}, [unauthorized, router]);

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
  const [qrCodeBase64, setQrCodeBase64] =
  useState("");

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
     if (res.status === 401) {
  setUnauthorized(true); // trigger tampilan login
  return;
}

        if (res.status === 403) {
          setError("Anda tidak memiliki akses untuk melihat hasil test ini.");
          return;
        }
        if (res.status === 404) {
          setError("Hasil test tidak ditemukan.");
          return;
        }

      
      if (!res.ok) throw new Error("Gagal ambil data report");
   const data = await res.json();

console.log("FULL API DATA:", data);
console.log("ATTEMPT:", data.attempt);
console.log("RESULT:", data.result);
console.log("CPMI:", data.cpmiResult);

setAttempt(data.attempt || data);

setSubtestResults(data.subtestResults || []);

setResult(data.result || data.Result || null);

setCpmiResult(data.cpmiResult || null);

setmsdtResult(data.msdtResult || null);

      console.log("📌 Full API response:", data);

      setAttempt(data.attempt);
      setSubtestResults(data.subtestResults || []);
      setResult(data.result || null);
      setCpmiResult(data.cpmiResult || null);
      setmsdtResult(data.msdtResult || null);

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
useEffect(() => {
  async function generateQr() {
    const currentBarcode =
      cpmiResult?.barcode ||
      result?.barcode ||
      msdtResult?.barcode;

    if (currentBarcode) {
      const qr =
        await QRCode.toDataURL(
          `https://psiko.deltaindonesialab.com/validate/${currentBarcode}`
        );

      setQrCodeBase64(qr);
    }
  }

  generateQr();
}, [cpmiResult, result, msdtResult]);

// Render desain unauthorized
if (unauthorized) {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center max-w-sm text-center animate-fadeIn">
        <svg className="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-semibold text-red-600 mb-2">Perlu Login</h2>
        <p className="text-gray-700">Anda harus login dulu untuk melihat hasil test.</p>
        <p className="mt-4 text-sm text-gray-500">Anda akan diarahkan ke halaman login...</p>
      </div>
    </div>
  );
}


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

const validatedAt =
  result?.validatedAt ||
  cpmiResult?.validatedAt ||
  msdtResult?.validatedAt ||
  new Date();

const wibDate = new Date(
  new Date(validatedAt).toLocaleString("en-US", {
    timeZone: "Asia/Jakarta",
  })
);
const timestamp =
  wibDate.getFullYear().toString() +
  String(wibDate.getMonth() + 1).padStart(2, "0") +
  String(wibDate.getDate()).padStart(2, "0") +
  "_" +
  String(wibDate.getHours()).padStart(2, "0") +
  String(wibDate.getMinutes()).padStart(2, "0") +
  String(wibDate.getSeconds()).padStart(2, "0");

const fileName = `HPP_${attempt.User?.fullName || "User"}_${timestamp}.pdf`
  .replace(/\s+/g, "_")
  .trim();

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
        qrCodeBase64,
      };
    } 
    else if (testType === 'MSDT' && msdtResult) {
    return {
     attempt,
           result: msdtResult,       // MSDT pakai result utama
          kesimpulan: msdtResult?.kesimpulan || kesimpulan,
          ttd,
  barcode: msdtResult?.barcode,
    barcodettd: msdtResult?.barcodettd,
    expiresAt: msdtResult?.expiresAt
    };
  }
  else {
      return {
        attempt,
        subtestResults,
        result,
       // kesimpulan,
        ttd,
         barcode: result?.barcode,
      };
    }
  };

  const pdfProps = getPDFProps();

  if (error) {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center max-w-sm text-center animate-fadeIn">
        <svg
          className="w-12 h-12 text-red-500 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 className="text-xl font-semibold text-red-600 mb-2">Perlu Login</h2>
        <p className="text-gray-700">{error}</p>
        <p className="mt-4 text-sm text-gray-500">
          Anda akan diarahkan ke halaman login...
        </p>
      </div>
    </div>
  );
}
const displayTimestamp =
  `${String(wibDate.getDate()).padStart(2, "0")}` +
  `${String(wibDate.getMonth() + 1).padStart(2, "0")}` +
  `${wibDate.getFullYear()}_` +
  `${String(wibDate.getHours()).padStart(2, "0")}` +
  `${String(wibDate.getMinutes()).padStart(2, "0")}` +
  `${String(wibDate.getSeconds()).padStart(2, "0")}`;
  return (
    
    <div className="h-screen flex flex-col">
      
      {/* Tombol Download */}
      <div className="p-4 bg-gray-100 flex justify-between items-center">
        <div>
<h1 className="text-lg font-bold">
  HPP {attempt.TestType?.name || 'Test'} - {attempt.User?.fullName || 'User'} {displayTimestamp}
</h1>
          {cpmiResult && (
            <p className="text-sm text-gray-600">
              Skor IQ: {cpmiResult.scoreiq} | Status: {cpmiResult.keteranganiqCPMI}
            </p>
          )}
        </div>
        {/* <PDFDownloadLink
          document={<PDFTemplate {...pdfProps} />}
          fileName={fileName}
        >
          {({ loading }) => (
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">
              {loading ? 'Menyiapkan...' : 'Unduh PDF'}
            </button>
          )}
        </PDFDownloadLink> */}
        <a
 href={
  cpmiResult?.url ||
  result?.url ||
  msdtResult?.url
}
  download
  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg"
>
  Download PDF
</a>
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

// 'use client';

// import { useEffect, useState } from 'react';
// import { useParams } from 'next/navigation';
// import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
// import { useRouter } from "next/navigation";


// // Import semua template PDF
// import ReportISTDocument from '../../../../components/report/reportDocument';
// import ReportCPMIDocument from '../../../../components/report/reportDocumentCPMI';
// import ReportMSDTDocument from '@/components/report/reportDocumentMSDT';

// // Mapping testType → PDF component
// const PDFComponents: Record<string, any> = {
//   IST: ReportISTDocument,
//   CPMI: ReportCPMIDocument,
//     MSDT: ReportMSDTDocument, // ✅ tambahkan ini

// };

// export default function HasilPage() {
//   const router = useRouter();
//     const { id } = useParams(); // ✅ pakai useParams saja
//   const [data, setData] = useState<any>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [attempt, setAttempt] = useState<any | null>(null);
//   const [subtestResults, setSubtestResults] = useState<any[]>([]);
//   const [result, setResult] = useState<any | null>(null);
//   const [cpmiResult, setCpmiResult] = useState<any | null>(null); 
//     const [msdtResult, setmsdtResult] = useState<any | null>(null); 
//     const [unauthorized, setUnauthorized] = useState(false);
//     // Tambahkan ini setelah useState
// useEffect(() => {
//   if (unauthorized) {
//     const timer = setTimeout(() => router.push("/login"), 2000);
//     return () => clearTimeout(timer); // cleanup jika component unmount
//   }
// }, [unauthorized, router]);

// const [kesimpulan, setKesimpulan] = useState({
//   kesimpulan: '',
//   kesimpulanSikap: '',
//   kesimpulanKepribadian: '',
//   kesimpulanBelajar: '',
//   saranpengembangan: '',
//   kesimpulanumum: ''
// });

//  // ✅ Tambah
//   const [ttd, setTtd] = useState('');                 // ✅ Tambah
//   const [isLoading, setIsLoading] = useState(true);

// //   useEffect(() => {
// //   if (!id) return;

// //   const fetchReport = async () => {
// //     try {
// //       const res = await fetch(`/api/attempts/${id}`);
// //       if (!res.ok) throw new Error("Gagal ambil data report");
// //       const data = await res.json();

// //       console.log("📌 Full API response:", data);

// //       setAttempt(data.attempt);
// //       setSubtestResults(data.subtestResults || []);
// //       setResult(data.result || null);
// //       setCpmiResult(data.cpmiResult || null);

// //       if (data.cpmiResult) {
// //         console.log("✅ CPMI TTD dari API:", data.cpmiResult.ttd);
// //         setKesimpulan(data.cpmiResult.kesimpulan || "");
// //         setTtd(data.cpmiResult.ttd || "");
// //       } else if (data.result) {
// //         console.log("✅ IST TTD dari API:", data.result.ttd);
// //         setKesimpulan(data.result.kesimpulan || "");
// //         setTtd(data.result.ttd || "");
// //       }
// //     } catch (err) {
// //       console.error("❌ Error fetching report:", err);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   fetchReport();
// // }, [id]);



// useEffect(() => {
//   if (!id) return;

//   const fetchReport = async () => {
//     try {
//       const res = await fetch(`/api/attempts/${id}`);
//      if (res.status === 401) {
//   setUnauthorized(true); // trigger tampilan login
//   return;
// }

//         if (res.status === 403) {
//           setError("Anda tidak memiliki akses untuk melihat hasil test ini.");
//           return;
//         }
//         if (res.status === 404) {
//           setError("Hasil test tidak ditemukan.");
//           return;
//         }

      
//       if (!res.ok) throw new Error("Gagal ambil data report");
//       const data = await res.json();

//       console.log("📌 Full API response:", data);

//       setAttempt(data.attempt);
//       setSubtestResults(data.subtestResults || []);
//       setResult(data.result || null);
//       setCpmiResult(data.cpmiResult || null);
//       setmsdtResult(data.msdtResult || null);

//       // Ambil source data: CPMI kalau ada, kalau tidak pakai result
//       const source = data.cpmiResult || data.result || {};

//       setKesimpulan({
//         kesimpulan: source.kesimpulan || '',
//         kesimpulanSikap: source.kesimpulanSikap || '',
//         kesimpulanKepribadian: source.kesimpulanKepribadian || '',
//         kesimpulanBelajar: source.kesimpulanBelajar || '',
//         saranpengembangan: source.saranpengembangan || '',
//         kesimpulanumum: source.kesimpulanumum || '',
//       });

//       setTtd(source.ttd || '');
      
//     } catch (err) {
//       console.error("❌ Error fetching report:", err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   fetchReport();

// }, [id]);


// // Render desain unauthorized
// if (unauthorized) {
//   return (
//     <div className="flex items-center justify-center h-screen bg-gray-50">
//       <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center max-w-sm text-center animate-fadeIn">
//         <svg className="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//         </svg>
//         <h2 className="text-xl font-semibold text-red-600 mb-2">Perlu Login</h2>
//         <p className="text-gray-700">Anda harus login dulu untuk melihat hasil test.</p>
//         <p className="mt-4 text-sm text-gray-500">Anda akan diarahkan ke halaman login...</p>
//       </div>
//     </div>
//   );
// }


// if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <p>Memuat laporan...</p>
//       </div>
//     );
//   }

//   if (!attempt) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <p>Data laporan tidak ditemukan.</p>
//       </div>
//     );
//   }

//   // Tentukan jenis tes
// const rawTestType = attempt.TestType?.name || attempt.TestType?.code || attempt.TestType?.id || 'IST';
// const testType = String(rawTestType).toUpperCase();

//   const PDFTemplate = PDFComponents[testType] || ReportISTDocument;

// const validatedAt =
//   result?.validatedAt ||
//   cpmiResult?.validatedAt ||
//   msdtResult?.validatedAt ||
//   new Date();

// const wibDate = new Date(
//   new Date(validatedAt).toLocaleString("en-US", {
//     timeZone: "Asia/Jakarta",
//   })
// );
// const timestamp =
//   wibDate.getFullYear().toString() +
//   String(wibDate.getMonth() + 1).padStart(2, "0") +
//   String(wibDate.getDate()).padStart(2, "0") +
//   "_" +
//   String(wibDate.getHours()).padStart(2, "0") +
//   String(wibDate.getMinutes()).padStart(2, "0") +
//   String(wibDate.getSeconds()).padStart(2, "0");

// const fileName = `HPP_${attempt.User?.fullName || "User"}_${timestamp}.pdf`
//   .replace(/\s+/g, "_")
//   .trim();

//   // Tentukan props yang akan dikirim ke PDF berdasarkan jenis tes
//   const getPDFProps = () => {
//     if (testType === 'CPMI' && cpmiResult) {
//       return {
//         attempt,
//         result: cpmiResult,
//         kesimpulan: kesimpulan.kesimpulan,
// kesimpulanSikap: kesimpulan.kesimpulanSikap,
// kesimpulanKepribadian: kesimpulan.kesimpulanKepribadian,
// kesimpulanBelajar: kesimpulan.kesimpulanBelajar,
// saranpengembangan: kesimpulan.saranpengembangan,
// kesimpulanumum: kesimpulan.kesimpulanumum,
//   // ✅ sekarang sudah ada
//         ttd,          // ✅ sekarang sudah ada
//         barcode: cpmiResult.barcode,
//       };
//     } 
//     else if (testType === 'MSDT' && msdtResult) {
//     return {
//      attempt,
//            result: msdtResult,       // MSDT pakai result utama
//           kesimpulan: msdtResult?.kesimpulan || kesimpulan,
//           ttd,
//   barcode: msdtResult?.barcode,
//     barcodettd: msdtResult?.barcodettd,
//     expiresAt: msdtResult?.expiresAt
//     };
//   }
//   else {
//       return {
//         attempt,
//         subtestResults,
//         result,
//        // kesimpulan,
//         ttd,
//          barcode: result?.barcode,
//       };
//     }
//   };

//   const pdfProps = getPDFProps();

//   if (error) {
//   return (
//     <div className="flex items-center justify-center h-screen bg-gray-50">
//       <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center max-w-sm text-center animate-fadeIn">
//         <svg
//           className="w-12 h-12 text-red-500 mb-4"
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//           xmlns="http://www.w3.org/2000/svg"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//           />
//         </svg>
//         <h2 className="text-xl font-semibold text-red-600 mb-2">Perlu Login</h2>
//         <p className="text-gray-700">{error}</p>
//         <p className="mt-4 text-sm text-gray-500">
//           Anda akan diarahkan ke halaman login...
//         </p>
//       </div>
//     </div>
//   );
// }
// const displayTimestamp =
//   `${String(wibDate.getDate()).padStart(2, "0")}` +
//   `${String(wibDate.getMonth() + 1).padStart(2, "0")}` +
//   `${wibDate.getFullYear()}_` +
//   `${String(wibDate.getHours()).padStart(2, "0")}` +
//   `${String(wibDate.getMinutes()).padStart(2, "0")}` +
//   `${String(wibDate.getSeconds()).padStart(2, "0")}`;
//   return (
    
//     <div className="h-screen flex flex-col">
      
//       {/* Tombol Download */}
//       <div className="p-4 bg-gray-100 flex justify-between items-center">
//         <div>
// <h1 className="text-lg font-bold">
//   HPP {attempt.TestType?.name || 'Test'} - {attempt.User?.fullName || 'User'} {displayTimestamp}
// </h1>
//           {cpmiResult && (
//             <p className="text-sm text-gray-600">
//               Skor IQ: {cpmiResult.scoreiq} | Status: {cpmiResult.keteranganiqCPMI}
//             </p>
//           )}
//         </div>
//         <PDFDownloadLink
//           document={<PDFTemplate {...pdfProps} />}
//           fileName={fileName}
//         >
//           {({ loading }) => (
//             <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">
//               {loading ? 'Menyiapkan...' : 'Unduh PDF'}
//             </button>
//           )}
//         </PDFDownloadLink>
//       </div>

//       {/* Preview PDF */}
      
//       <div className="flex-grow">
//         <PDFViewer style={{ width: '100%', height: '100%' }}>
//           <PDFTemplate {...pdfProps} />
//         </PDFViewer>
//       </div>
//     </div>
//   );
// }


// // 'use client';

// // import { useEffect, useState } from 'react';
// // import { useParams } from 'next/navigation';
// // import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
// // import { useRouter } from "next/navigation";


// // // Import semua template PDF
// // import ReportISTDocument from '../../../../components/report/reportDocument';
// // import ReportCPMIDocument from '../../../../components/report/reportDocumentCPMI';
// // import ReportMSDTDocument from '@/components/report/reportDocumentMSDT';

// // // Mapping testType → PDF component
// // const PDFComponents: Record<string, any> = {
// //   IST: ReportISTDocument,
// //   CPMI: ReportCPMIDocument,
// //     MSDT: ReportMSDTDocument, // ✅ tambahkan ini

// // };

// // export default function HasilPage() {
// //   const router = useRouter();
// //     const { id } = useParams(); // ✅ pakai useParams saja
// //   const [data, setData] = useState<any>(null);
// //   const [error, setError] = useState<string | null>(null);
// //   const [attempt, setAttempt] = useState<any | null>(null);
// //   const [subtestResults, setSubtestResults] = useState<any[]>([]);
// //   const [result, setResult] = useState<any | null>(null);
// //   const [cpmiResult, setCpmiResult] = useState<any | null>(null); 
// //     const [msdtResult, setmsdtResult] = useState<any | null>(null); 
// //     const [unauthorized, setUnauthorized] = useState(false);
// //     // Tambahkan ini setelah useState
// // useEffect(() => {
// //   if (unauthorized) {
// //     const timer = setTimeout(() => router.push("/login"), 2000);
// //     return () => clearTimeout(timer); // cleanup jika component unmount
// //   }
// // }, [unauthorized, router]);

// // const [kesimpulan, setKesimpulan] = useState({
// //   kesimpulan: '',
// //   kesimpulanSikap: '',
// //   kesimpulanKepribadian: '',
// //   kesimpulanBelajar: '',
// //   saranpengembangan: '',
// //   kesimpulanumum: ''
// // });

// //  // ✅ Tambah
// //   const [ttd, setTtd] = useState('');                 // ✅ Tambah
// //   const [isLoading, setIsLoading] = useState(true);

// // //   useEffect(() => {
// // //   if (!id) return;

// // //   const fetchReport = async () => {
// // //     try {
// // //       const res = await fetch(`/api/attempts/${id}`);
// // //       if (!res.ok) throw new Error("Gagal ambil data report");
// // //       const data = await res.json();

// // //       console.log("📌 Full API response:", data);

// // //       setAttempt(data.attempt);
// // //       setSubtestResults(data.subtestResults || []);
// // //       setResult(data.result || null);
// // //       setCpmiResult(data.cpmiResult || null);

// // //       if (data.cpmiResult) {
// // //         console.log("✅ CPMI TTD dari API:", data.cpmiResult.ttd);
// // //         setKesimpulan(data.cpmiResult.kesimpulan || "");
// // //         setTtd(data.cpmiResult.ttd || "");
// // //       } else if (data.result) {
// // //         console.log("✅ IST TTD dari API:", data.result.ttd);
// // //         setKesimpulan(data.result.kesimpulan || "");
// // //         setTtd(data.result.ttd || "");
// // //       }
// // //     } catch (err) {
// // //       console.error("❌ Error fetching report:", err);
// // //     } finally {
// // //       setIsLoading(false);
// // //     }
// // //   };

// // //   fetchReport();
// // // }, [id]);



// // useEffect(() => {
// //   if (!id) return;

// //   const fetchReport = async () => {
// //     try {
// //       const res = await fetch(`/api/attempts/${id}`);
// //      if (res.status === 401) {
// //   setUnauthorized(true); // trigger tampilan login
// //   return;
// // }

// //         if (res.status === 403) {
// //           setError("Anda tidak memiliki akses untuk melihat hasil test ini.");
// //           return;
// //         }
// //         if (res.status === 404) {
// //           setError("Hasil test tidak ditemukan.");
// //           return;
// //         }

      
// //       if (!res.ok) throw new Error("Gagal ambil data report");
// //       const data = await res.json();

// //       console.log("📌 Full API response:", data);

// //       setAttempt(data.attempt);
// //       setSubtestResults(data.subtestResults || []);
// //       setResult(data.result || null);
// //       setCpmiResult(data.cpmiResult || null);
// //       setmsdtResult(data.msdtResult || null);

// //       // Ambil source data: CPMI kalau ada, kalau tidak pakai result
// //       const source = data.cpmiResult || data.result || {};

// //       setKesimpulan({
// //         kesimpulan: source.kesimpulan || '',
// //         kesimpulanSikap: source.kesimpulanSikap || '',
// //         kesimpulanKepribadian: source.kesimpulanKepribadian || '',
// //         kesimpulanBelajar: source.kesimpulanBelajar || '',
// //         saranpengembangan: source.saranpengembangan || '',
// //         kesimpulanumum: source.kesimpulanumum || '',
// //       });

// //       setTtd(source.ttd || '');
      
// //     } catch (err) {
// //       console.error("❌ Error fetching report:", err);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   fetchReport();

// // }, [id]);


// // // Render desain unauthorized
// // if (unauthorized) {
// //   return (
// //     <div className="flex items-center justify-center h-screen bg-gray-50">
// //       <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center max-w-sm text-center animate-fadeIn">
// //         <svg className="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
// //         </svg>
// //         <h2 className="text-xl font-semibold text-red-600 mb-2">Perlu Login</h2>
// //         <p className="text-gray-700">Anda harus login dulu untuk melihat hasil test.</p>
// //         <p className="mt-4 text-sm text-gray-500">Anda akan diarahkan ke halaman login...</p>
// //       </div>
// //     </div>
// //   );
// // }


// // if (isLoading) {
// //     return (
// //       <div className="flex items-center justify-center h-screen">
// //         <p>Memuat laporan...</p>
// //       </div>
// //     );
// //   }

// //   if (!attempt) {
// //     return (
// //       <div className="flex items-center justify-center h-screen">
// //         <p>Data laporan tidak ditemukan.</p>
// //       </div>
// //     );
// //   }

// //   // Tentukan jenis tes
// // const rawTestType = attempt.TestType?.name || attempt.TestType?.code || attempt.TestType?.id || 'IST';
// // const testType = String(rawTestType).toUpperCase();

// //   const PDFTemplate = PDFComponents[testType] || ReportISTDocument;

// // const fileName = `HPP_${attempt.User?.fullName || 'User'}.pdf`
// //   .replace(/\s+/g, ' ')     // normalisasi spasi, kalau ada spasi double jadi satu
// //   .trim();                  // hilangkan spasi di awal/akhir

// //   // Tentukan props yang akan dikirim ke PDF berdasarkan jenis tes
// //   const getPDFProps = () => {
// //     if (testType === 'CPMI' && cpmiResult) {
// //       return {
// //         attempt,
// //         result: cpmiResult,
// //         kesimpulan: kesimpulan.kesimpulan,
// // kesimpulanSikap: kesimpulan.kesimpulanSikap,
// // kesimpulanKepribadian: kesimpulan.kesimpulanKepribadian,
// // kesimpulanBelajar: kesimpulan.kesimpulanBelajar,
// // saranpengembangan: kesimpulan.saranpengembangan,
// // kesimpulanumum: kesimpulan.kesimpulanumum,
// //   // ✅ sekarang sudah ada
// //         ttd,          // ✅ sekarang sudah ada
// //         barcode: cpmiResult.barcode,
// //       };
// //     } 
// //     else if (testType === 'MSDT' && msdtResult) {
// //     return {
// //      attempt,
// //            result: msdtResult,       // MSDT pakai result utama
// //           kesimpulan: msdtResult?.kesimpulan || kesimpulan,
// //           ttd,
// //   barcode: msdtResult?.barcode,
// //     barcodettd: msdtResult?.barcodettd,
// //     expiresAt: msdtResult?.expiresAt
// //     };
// //   }
// //   else {
// //       return {
// //         attempt,
// //         subtestResults,
// //         result,
// //        // kesimpulan,
// //         ttd,
// //          barcode: result?.barcode,
// //       };
// //     }
// //   };

// //   const pdfProps = getPDFProps();

// //   if (error) {
// //   return (
// //     <div className="flex items-center justify-center h-screen bg-gray-50">
// //       <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center max-w-sm text-center animate-fadeIn">
// //         <svg
// //           className="w-12 h-12 text-red-500 mb-4"
// //           fill="none"
// //           stroke="currentColor"
// //           viewBox="0 0 24 24"
// //           xmlns="http://www.w3.org/2000/svg"
// //         >
// //           <path
// //             strokeLinecap="round"
// //             strokeLinejoin="round"
// //             strokeWidth={2}
// //             d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
// //           />
// //         </svg>
// //         <h2 className="text-xl font-semibold text-red-600 mb-2">Perlu Login</h2>
// //         <p className="text-gray-700">{error}</p>
// //         <p className="mt-4 text-sm text-gray-500">
// //           Anda akan diarahkan ke halaman login...
// //         </p>
// //       </div>
// //     </div>
// //   );
// // }

// //   return (
    
// //     <div className="h-screen flex flex-col">
      
// //       {/* Tombol Download */}
// //       <div className="p-4 bg-gray-100 flex justify-between items-center">
// //         <div>
// //           <h1 className="text-lg font-bold">
// //             Laporan {attempt.TestType?.name || 'Test'} - {attempt.User?.fullName || 'User'}
// //           </h1>
// //           {cpmiResult && (
// //             <p className="text-sm text-gray-600">
// //               Skor IQ: {cpmiResult.scoreiq} | Status: {cpmiResult.keteranganiqCPMI}
// //             </p>
// //           )}
// //         </div>
// //         <PDFDownloadLink
// //           document={<PDFTemplate {...pdfProps} />}
// //           fileName={fileName}
// //         >
// //           {({ loading }) => (
// //             <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">
// //               {loading ? 'Menyiapkan...' : 'Unduh PDF'}
// //             </button>
// //           )}
// //         </PDFDownloadLink>
// //       </div>

// //       {/* Preview PDF */}
      
// //       <div className="flex-grow">
// //         <PDFViewer style={{ width: '100%', height: '100%' }}>
// //           <PDFTemplate {...pdfProps} />
// //         </PDFViewer>
// //       </div>
// //     </div>
// //   );
// // }

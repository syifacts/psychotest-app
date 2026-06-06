"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BlobProvider } from "@react-pdf/renderer";
import ReportCPMIDocument from "@/components/report/reportDocumentCPMI";
  import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
  
export default function ValidatePage() {
  const params = useParams<{ barcode: string }>();
  const barcode = params?.barcode;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPdf, setShowPdf] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const { toast } = useToast();
const handleUpload = async (e: any) => {
  const file = e.target.files[0];
  if (!file) return;

  // Hanya PDF
  if (
    file.type !== "application/pdf" ||
    !file.name.toLowerCase().endsWith(".pdf")
  ) {
    toast({
      title: "Upload gagal",
      description: "File harus berupa PDF",
      variant: "error",
      duration: 3000,
      position: "top",
    });

    e.target.value = "";
    setUploadResult(null);
    return;
  }

  // Maksimal 5 MB
  if (file.size > 5 * 1024 * 1024) {
    toast({
      title: "Upload gagal",
      description: "Ukuran file maksimal 5 MB",
      variant: "error",
      duration: 3000,
      position: "top",
    });

    e.target.value = "";
    setUploadResult(null);
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("barcode", barcode!);

  const res = await fetch("/api/report/verify-file", {
    method: "POST",
    body: formData,
  });

  const result = await res.json();

  if (!res.ok) {
    toast({
      title: "Upload gagal",
      description: result.error || "Terjadi kesalahan",
      variant: "error",
      duration: 3000,
      position: "top",
    });

    setUploadResult(null);
    return;
  }

  setUploadResult(result);
};


  useEffect(() => {
    if (!barcode) return;
    fetch(`/api/report/view/${barcode}`)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [barcode]);

  if (loading) return <div>Loading...</div>;
  if (!data || data.error) return <div>{data?.error || "Report tidak ditemukan"}</div>;

//   return (
//     <div>
//     {/* 🔥 STATUS VALIDASI */}
// <h3 style={{ marginBottom: 5 }}>
//   🔐 Verifikasi dari Sistem (QR Code)
// </h3>

// <div style={{ fontSize: 12, marginBottom: 5 }}>
//   Status Verifikasi:
// </div>
// <div
//   style={{
//     marginBottom: 20,
//     padding: 12,
//     borderRadius: 6,
//     fontWeight: "bold",
//     backgroundColor:
//       data.verificationStatus === "VALID"
//         ? "#d4edda"
//         : data.verificationStatus === "INVALID_DATA" ||
//           data.verificationStatus === "INVALID_PDF"
//         ? "#f8d7da"
//         : "#fff3cd",

//     color:
//       data.verificationStatus === "VALID"
//         ? "#155724"
//         : data.verificationStatus === "INVALID_DATA" ||
//           data.verificationStatus === "INVALID_PDF"
//         ? "#721c24"
//         : "#856404",

//     border: "1px solid #ccc",
//   }}
// >
//   {/* ICON + TEXT */}
//   {data.verificationStatus === "VALID" && "✅ "}
//   {data.verificationStatus === "INVALID_DATA" && "❌ "}
//   {data.verificationStatus === "INVALID_PDF" && "❌ "}
//   {data.verificationStatus === "UNSIGNED" && "⚠️ "}

//   {data.verificationMessage}
// </div>
//       <h1>Hasil Validasi</h1>

//       {/* Tampilkan pesan TTD langsung di halaman */}
//       {data.ttdValidationMessage && (
//         <div
//           style={{
//             marginBottom: 20,
//             padding: 10,
//             border: "1px solid #ccc",
//             borderRadius: 4,
//             backgroundColor: "#f5f5f5",
//           }}
//         >
//           {data.ttdValidationMessage}
//         </div>
//       )}
//       {/* 🔥 IDENTITAS PENANDATANG */}
// {/* {data.verifiedBy && (
//   <div style={{ marginBottom: 20 }}>
//     <b>Ditandatangani oleh:</b><br />
//     {data.verifiedBy.name}<br />
//     STR: {data.verifiedBy.str}<br />
//     SIPP: {data.verifiedBy.sipp}
//   </div>
// )} */}
// <h3 style={{ marginBottom: 5 }}>
//   📄 Verifikasi File dari Pengguna
// </h3>

// <div style={{ marginBottom: 20 }}>
//   <span style={{ fontSize: 12 }}>
//     Upload PDF untuk memastikan file tidak mengalami perubahan:
//   </span>
//   <br />
//   <input type="file" accept="application/pdf" onChange={handleUpload} />
// </div>
// {uploadResult && (
//   <div
//     style={{
//       marginBottom: 20,
//       padding: 10,
//       borderRadius: 6,
//       fontWeight: "bold",
//       backgroundColor: uploadResult.status === "VALID" ? "#d4edda" : "#f8d7da",
//       color: uploadResult.status === "VALID" ? "#155724" : "#721c24",
//     }}
//   >
//     {uploadResult.status === "VALID" && "✅ "}
//     {uploadResult.status !== "VALID" && "❌ "}
//     {uploadResult.message}
//   </div>
// )}
// {/* 🔥 DETAIL ERROR */}
// {data.verificationStatus === "INVALID_DATA" && (
//   <div style={{ marginBottom: 10 }}>
//     ⚠️ Data pada database telah diubah
//   </div>
// )}

// {data.verificationStatus === "INVALID_PDF" && (
//   <div style={{ marginBottom: 10 }}>
//     ⚠️ File PDF tidak sesuai dengan data asli
//   </div>
// )}
//       <BlobProvider
//         document={
//           <ReportCPMIDocument
//             attempt={data.attempt}
//             result={data.result}
//             kesimpulan={data.kesimpulan}
//              kesimpulanSikap={data.kesimpulanSikap}
//   kesimpulanKepribadian={data.kesimpulanKepribadian}
//   kesimpulanBelajar={data.kesimpulanBelajar}
//   kesimpulanumum={data.kesimpulanUmum}
//   saranpengembangan={data.saranPengembangan}

//             ttd={data.ttd}
//             barcode={data.barcode}
//             expiresAt={data.expiresAt}
//             validationNotes={data.validationNotes} // pakai ttdValidationMessage juga di PDF
//           />
//         }
//       >
        
//         {({ url, loading, error }) => {
//           if (loading) return <p>Mempersiapkan PDF...</p>;
//           if (error) return <p>Error membuat PDF</p>;
//           if (!url) return <p>PDF tidak tersedia</p>;

//           return (
            
//             <div>
//               <iframe
//                 src={url}
//                 width="100%"
//                 height="800px"
//                 style={{ border: "1px solid #ccc" }}
//               />

//               <a
//                 href={url}
// download={`HPP_${(
//   data?.attempt?.User?.fullName || "User"
// )}.pdf`.replaceAll(" ", " ")}
//                 style={{
//                   display: "inline-block",
//                   marginTop: 10,
//                   padding: "8px 16px",
//                   backgroundColor: "#0070f3",
//                   color: "#fff",
//                   borderRadius: 4,
//                   textDecoration: "none",
//                   fontWeight: "bold",
//                 }}
//               >
//                 Download PDF
//               </a>
//             </div>
            
//           );
//         }}
//       </BlobProvider>
//     </div>
//   );
return (
  <>
    <Toaster />

    <div
    style={{
      padding: 24,
      maxWidth: 900,
      margin: "0 auto",
      fontFamily: "sans-serif",
    }}
  >
    {/* ========================= */}
    {/* 🔐 FINAL STATUS */}
    {/* ========================= */}

    {(() => {
const finalStatus =
  uploadResult
    ? uploadResult.status === "VALID"
      ? "VALID"
      : "MODIFIED"
    : "REGISTERED";

let finalMessage = "";

if (finalStatus === "REGISTERED") {
  finalMessage =
    "Dokumen terdaftar di sistem dan telah divalidasi oleh psikolog.";
}
else if (finalStatus === "VALID") {
  finalMessage =
    "Dokumen berhasil diverifikasi dan tidak mengalami perubahan.";
}
// else if (finalStatus === "REVISED") {
//   finalMessage =
//     "Dokumen ini telah direvisi setelah proses validasi sebelumnya. Versi yang Anda miliki sudah tidak berlaku. Silakan gunakan dokumen terbaru yang telah divalidasi ulang.";
// }
else {
  finalMessage =
    "File PDF yang diunggah berbeda dengan dokumen asli yang tersimpan di sistem.";
}

      return (
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
        padding: 22,
borderRadius: 14,

backgroundColor:
  finalStatus === "VALID"
    ? "#f0fdf4"
    : finalStatus === "MODIFIED"
    // ? "#fef2f2"
    // : finalStatus === "REVISED"
    ? "#fffbeb"
    : "#eff6ff",

border:
  finalStatus === "VALID"
    ? "1px solid #86efac"
    : finalStatus === "MODIFIED"
    // ? "1px solid #fca5a5"
    // : finalStatus === "REVISED"
    ? "1px solid #fcd34d"
    : "1px solid #93c5fd",
    
boxShadow:
  "0 3px 10px rgba(0,0,0,0.06)",
      
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: "bold",
                marginBottom: 10,
              }}
            >
              {finalStatus === "VALID" &&
                "✅ Dokumen Terverifikasi"}

    {/* {finalStatus === "REVISED" &&
  "⚠️ Dokumen Telah Direvisi"} */}

          {finalStatus === "MODIFIED" &&
  "⚠️ File PDF Tidak Sesuai"}
                {finalStatus === "REGISTERED" &&
  "📄 Dokumen Terdaftar di Sistem"}
            </div>

            <div
              style={{
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              
              {finalMessage}
            </div>
          </div>
        </div>
      );
    })()}

    {/* ========================= */}
    {/* PAGE TITLE */}
    {/* ========================= */}

    <h1
      style={{
        marginBottom: 20,
        fontSize: 28,
      }}
    >
      Hasil Validasi Dokumen
    </h1>

    {/* ========================= */}
    {/* 🔎 DETAIL VERIFIKASI */}
    {/* ========================= */}



    {/* ========================= */}
    {/* 🔥 TTD VALIDATION */}
    {/* ========================= */}

    {data.ttdValidationMessage && (
      <div
        style={{
          marginBottom: 24,
          padding: 16,
          borderRadius: 12,
          backgroundColor: "#f9f9f9",
          border: "1px solid #ddd",
          boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
        }}
      >
        <h3 style={{ marginBottom: 10 }}>
          ✍️ Informasi Penandatangan
        </h3>

        <div
          style={{
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          {data.ttdValidationMessage}
        </div>
      </div>
    )}
        <div
      style={{
        marginBottom: 24,
        padding: 18,
        borderRadius: 12,
        border: "1px solid #ddd",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      }}
    >
      <h3 style={{ marginBottom: 12 }}>
        📄 Verifikasi File PDF
      </h3>

      <div
        style={{
          fontSize: 13,
          marginBottom: 12,
          color: "#555",
          lineHeight: 1.6,
        }}
      >
        Upload file PDF untuk memastikan file
        tidak mengalami perubahan setelah
        diterbitkan oleh sistem.
      </div>

      <input
        type="file"
        accept="application/pdf"
        onChange={handleUpload}
        style={{
          padding: 10,
          border: "1px solid #ccc",
          borderRadius: 8,
          width: "100%",
          backgroundColor: "#fff",
        }}
      />
    </div>
{uploadResult && (
  <div
    style={{
      marginBottom: 24,
      padding: 18,
      borderRadius: 12,

      backgroundColor:
        uploadResult.status === "VALID"
          ? "#f0fdf4"
          : "#fef2f2",

      border:
        uploadResult.status === "VALID"
          ? "1px solid #86efac"
          : "1px solid #fca5a5",

      boxShadow:
        "0 2px 6px rgba(0,0,0,0.05)",
    }}
  >
    <h3
      style={{
        marginBottom: 14,
        fontSize: 18,
      }}
    >
      🔍 Hasil Verifikasi PDF
    </h3>

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        fontSize: 15,
      }}
    >
      <div>
        {uploadResult.signatureValid
          ? "✅ Signature Digital Valid"
          : "❌ Signature Digital Tidak Valid"}
      </div>

      <div>
        {uploadResult.isValid
          ? "✅ Integritas Dokumen Terjaga"
          : "❌ Integritas Dokumen Berubah"}
      </div>

      <div>
        {uploadResult.status === "VALID"
          ? "✅ File Sesuai Dengan Dokumen Asli"
          : "⚠️ File Berbeda Dari Dokumen Asli"}
      </div>
    </div>
  </div>
)}

    {/* ========================= */}
    {/* 📄 FILE VERIFICATION */}
    {/* ========================= */}



    {/* ========================= */}
    {/* 📤 UPLOAD RESULT */}
    {/* ========================= */}

    {/* {uploadResult && (
      <div
        style={{
          marginBottom: 24,
          padding: 16,
          borderRadius: 12,
          fontWeight: "bold",

          backgroundColor:
            uploadResult.status === "VALID"
              ? "#e6f4ea"
              : "#fdecea",

          color:
            uploadResult.status === "VALID"
              ? "#1e7e34"
              : "#b71c1c",

          border: "1px solid #ddd",

          boxShadow:
            "0 2px 6px rgba(0,0,0,0.05)",
        }}
      >
        {uploadResult.status === "VALID" &&
          "✅ "}

        {uploadResult.status !== "VALID" &&
          "❌ "}

        {uploadResult.message}
      </div>
    )} */}

    {/* ========================= */}
    {/* PDF VIEWER */}
    {/* ========================= */}


    {/* <BlobProvider
      document={
        <ReportCPMIDocument
          attempt={data.attempt}
          result={data.result}
          kesimpulan={data.kesimpulan}
          kesimpulanSikap={
            data.kesimpulanSikap
          }
          kesimpulanKepribadian={
            data.kesimpulanKepribadian
          }
          kesimpulanBelajar={
            data.kesimpulanBelajar
          }
          kesimpulanumum={
            data.kesimpulanUmum
          }
          saranpengembangan={
            data.saranPengembangan
          }
          ttd={data.ttd}
          barcode={data.barcode}
          expiresAt={data.expiresAt}
          validationNotes={
            data.validationNotes
          }
        />
      }
    >
      {({ url, loading, error }) => {
        if (loading)
          return (
            <p>Mempersiapkan PDF...</p>
          );

        if (error)
          return (
            <p>Error membuat PDF</p>
          );

        if (!url)
          return (
            <p>PDF tidak tersedia</p>
          );

        return (
          <div
            style={{
              marginTop: 20,
              padding: 18,
              borderRadius: 12,
              border: "1px solid #ddd",
              boxShadow:
                "0 2px 6px rgba(0,0,0,0.05)",
            }}
          >
            <iframe
              src={url}
              width="100%"
              height="700px"
              style={{
                borderRadius: 10,
                border: "1px solid #ccc",
                marginBottom: 14,
              }}
            />

            <a
              href={url}
              download={`HPP_${(
                data?.attempt?.User
                  ?.fullName || "User"
              )}.pdf`}
              style={{
                display: "inline-block",
                padding: "11px 18px",
                backgroundColor: "#0070f3",
                color: "#fff",
                borderRadius: 8,
                textDecoration: "none",
                fontWeight: "bold",
                boxShadow:
                  "0 2px 6px rgba(0,0,0,0.1)",
              }}
            >
              ⬇ Download PDF
            </a>
          </div>
        );
      }}
    </BlobProvider> */}
<button
  onClick={() => setShowPdf(!showPdf)}
  style={{
    padding: "10px 16px",
    borderRadius: 8,
    border: "1px solid #ddd",
    cursor: "pointer",
    marginBottom: 16,
  }}
>
  {showPdf
    ? "📕 Sembunyikan Dokumen"
    : "📄 Lihat Dokumen PDF"}
</button>

{showPdf && (
  <div
    style={{
      marginTop: 20,
      padding: 18,
      borderRadius: 12,
      border: "1px solid #ddd",
      boxShadow:
        "0 2px 6px rgba(0,0,0,0.05)",
    }}
  >
    <iframe
      src={data.result.url}
      width="100%"
      height="700px"
      style={{
        borderRadius: 10,
        border: "1px solid #ccc",
        marginBottom: 14,
      }}
    />

    <a
      href={data.result.url}
      download
      style={{
        display: "inline-block",
        padding: "11px 18px",
        backgroundColor: "#0070f3",
        color: "#fff",
        borderRadius: 8,
        textDecoration: "none",
        fontWeight: "bold",
        boxShadow:
          "0 2px 6px rgba(0,0,0,0.1)",
      }}
    >
      ⬇ Download PDF
    </a>
  </div>
)}
    </div>
  </>
);
}

// "use client";
// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import ReportCPMIDocument from "@/components/report/reportDocumentCPMI";
// import {
//   BlobProvider,
//   pdf,
// } from "@react-pdf/renderer";
// import { useToast } from "@/components/ui/use-toast";
// import { Toaster } from "@/components/ui/toaster";



// export default function ValidatePage() {
//   const params = useParams<{ barcode: string }>();
//   const barcode = params?.barcode;
//   const [data, setData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [uploadResult, setUploadResult] = useState<any>(null);
//   const { toast } = useToast();
//   const handleUpload = async (e: any) => {
// const file = e.target.files[0];

// if (!file) return;

// // VALIDASI PDF
// if (file.type !== "application/pdf") {
//   toast({
//     title: "Upload gagal",
//     description: "File harus berupa PDF",
//     variant: "error",
//     duration: 3000,
//   });

//   e.target.value = "";
//   return;
// }

// if (file.size > 5 * 1024 * 1024) {
//   toast({
//     title: "Upload gagal",
//     description: "Ukuran file maksimal 5MB",
//     variant: "error",
//     duration: 3000,
//   });

//   e.target.value = "";
//   return;
// }

//   const formData = new FormData();
//   formData.append("file", file);
//   formData.append("barcode", barcode!);

//   const res = await fetch("/api/report/verify-file", {
//     method: "POST",
//     body: formData,
//   });

//   const result = await res.json();
//   setUploadResult(result);
// };

//   useEffect(() => {
//     if (!barcode) return;
//     fetch(`/api/report/view/${barcode}`)
//       .then((res) => res.json())
//       .then(setData)
//       .finally(() => setLoading(false));
//   }, [barcode]);

//   if (loading) return <div>Loading...</div>;
//   if (!data || data.error) return <div>{data?.error || "Report tidak ditemukan"}</div>;

// //   return (
// //     <div>
// //     {/* 🔥 STATUS VALIDASI */}
// // <h3 style={{ marginBottom: 5 }}>
// //   🔐 Verifikasi dari Sistem (QR Code)
// // </h3>

// // <div style={{ fontSize: 12, marginBottom: 5 }}>
// //   Status Verifikasi:
// // </div>
// // <div
// //   style={{
// //     marginBottom: 20,
// //     padding: 12,
// //     borderRadius: 6,
// //     fontWeight: "bold",
// //     backgroundColor:
// //       data.verificationStatus === "VALID"
// //         ? "#d4edda"
// //         : data.verificationStatus === "INVALID_DATA" ||
// //           data.verificationStatus === "INVALID_PDF"
// //         ? "#f8d7da"
// //         : "#fff3cd",

// //     color:
// //       data.verificationStatus === "VALID"
// //         ? "#155724"
// //         : data.verificationStatus === "INVALID_DATA" ||
// //           data.verificationStatus === "INVALID_PDF"
// //         ? "#721c24"
// //         : "#856404",

// //     border: "1px solid #ccc",
// //   }}
// // >
// //   {/* ICON + TEXT */}
// //   {data.verificationStatus === "VALID" && "✅ "}
// //   {data.verificationStatus === "INVALID_DATA" && "❌ "}
// //   {data.verificationStatus === "INVALID_PDF" && "❌ "}
// //   {data.verificationStatus === "UNSIGNED" && "⚠️ "}

// //   {data.verificationMessage}
// // </div>
// //       <h1>Hasil Validasi</h1>

// //       {/* Tampilkan pesan TTD langsung di halaman */}
// //       {data.ttdValidationMessage && (
// //         <div
// //           style={{
// //             marginBottom: 20,
// //             padding: 10,
// //             border: "1px solid #ccc",
// //             borderRadius: 4,
// //             backgroundColor: "#f5f5f5",
// //           }}
// //         >
// //           {data.ttdValidationMessage}
// //         </div>
// //       )}
// //       {/* 🔥 IDENTITAS PENANDATANG */}
// // {/* {data.verifiedBy && (
// //   <div style={{ marginBottom: 20 }}>
// //     <b>Ditandatangani oleh:</b><br />
// //     {data.verifiedBy.name}<br />
// //     STR: {data.verifiedBy.str}<br />
// //     SIPP: {data.verifiedBy.sipp}
// //   </div>
// // )} */}
// // <h3 style={{ marginBottom: 5 }}>
// //   📄 Verifikasi File dari Pengguna
// // </h3>

// // <div style={{ marginBottom: 20 }}>
// //   <span style={{ fontSize: 12 }}>
// //     Upload PDF untuk memastikan file tidak mengalami perubahan:
// //   </span>
// //   <br />
// //   <input type="file" accept="application/pdf" onChange={handleUpload} />
// // </div>
// // {uploadResult && (
// //   <div
// //     style={{
// //       marginBottom: 20,
// //       padding: 10,
// //       borderRadius: 6,
// //       fontWeight: "bold",
// //       backgroundColor: uploadResult.status === "VALID" ? "#d4edda" : "#f8d7da",
// //       color: uploadResult.status === "VALID" ? "#155724" : "#721c24",
// //     }}
// //   >
// //     {uploadResult.status === "VALID" && "✅ "}
// //     {uploadResult.status !== "VALID" && "❌ "}
// //     {uploadResult.message}
// //   </div>
// // )}
// // {/* 🔥 DETAIL ERROR */}
// // {data.verificationStatus === "INVALID_DATA" && (
// //   <div style={{ marginBottom: 10 }}>
// //     ⚠️ Data pada database telah diubah
// //   </div>
// // )}

// // {data.verificationStatus === "INVALID_PDF" && (
// //   <div style={{ marginBottom: 10 }}>
// //     ⚠️ File PDF tidak sesuai dengan data asli
// //   </div>
// // )}
// //       <BlobProvider
// //         document={
// //           <ReportCPMIDocument
// //             attempt={data.attempt}
// //             result={data.result}
// //             kesimpulan={data.kesimpulan}
// //              kesimpulanSikap={data.kesimpulanSikap}
// //   kesimpulanKepribadian={data.kesimpulanKepribadian}
// //   kesimpulanBelajar={data.kesimpulanBelajar}
// //   kesimpulanumum={data.kesimpulanUmum}
// //   saranpengembangan={data.saranPengembangan}

// //             ttd={data.ttd}
// //             barcode={data.barcode}
// //             expiresAt={data.expiresAt}
// //             validationNotes={data.validationNotes} // pakai ttdValidationMessage juga di PDF
// //           />
// //         }
// //       >
        
// //         {({ url, loading, error }) => {
// //           if (loading) return <p>Mempersiapkan PDF...</p>;
// //           if (error) return <p>Error membuat PDF</p>;
// //           if (!url) return <p>PDF tidak tersedia</p>;

// //           return (
            
// //             <div>
// //               <iframe
// //                 src={url}
// //                 width="100%"
// //                 height="800px"
// //                 style={{ border: "1px solid #ccc" }}
// //               />

// //               <a
// //                 href={url}
// // download={`HPP_${(
// //   data?.attempt?.User?.fullName || "User"
// // )}.pdf`.replaceAll(" ", " ")}
// //                 style={{
// //                   display: "inline-block",
// //                   marginTop: 10,
// //                   padding: "8px 16px",
// //                   backgroundColor: "#0070f3",
// //                   color: "#fff",
// //                   borderRadius: 4,
// //                   textDecoration: "none",
// //                   fontWeight: "bold",
// //                 }}
// //               >
// //                 Download PDF
// //               </a>
// //             </div>
            
// //           );
// //         }}
// //       </BlobProvider>
// //     </div>
// //   );
// const wibDate = new Date(
//   new Date(data.expiresAt || new Date()).toLocaleString("en-US", {
//     timeZone: "Asia/Jakarta",
//   })
// );

// const displayTimestamp =
//   `${String(wibDate.getDate()).padStart(2, "0")}` +
//   `${String(wibDate.getMonth() + 1).padStart(2, "0")}` +
//   `${wibDate.getFullYear()}_` +
//   `${String(wibDate.getHours()).padStart(2, "0")}` +
//   `${String(wibDate.getMinutes()).padStart(2, "0")}` +
//   `${String(wibDate.getSeconds()).padStart(2, "0")}`;

// const fileName = `HPP_${data?.attempt?.User?.fullName || "User"}_${displayTimestamp}.pdf`
//   .replace(/\s+/g, "_")
//   .trim();
// return (
//     <>
//     <Toaster />

//   <div
//     style={{
//       padding: 24,
//       maxWidth: 900,
//       margin: "0 auto",
//       fontFamily: "sans-serif",
//     }}
//   >
//     {/* ========================= */}
//     {/* 🔐 FINAL STATUS */}
//     {/* ========================= */}

//     {(() => {
//       const finalStatus =
//   uploadResult
//     ? uploadResult.status === "VALID"
//       ? "VALID"
//       : "INVALID"
//     : data.verificationStatus === "VALID"
//     ? "VALID"
//     : "INVALID";

//      const finalMessage =
//   finalStatus === "VALID"
//     ? "Dokumen berhasil diverifikasi dan tidak mengalami perubahan."
//     : "Dokumen tidak valid atau telah dimodifikasi.";

//       return (
//         <div style={{ marginBottom: 24 }}>
//           <div
//             style={{
//               padding: 22,
//               borderRadius: 14,

//               border: "1px solid #ddd",
//               boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
//             }}
//           >
//             <div
//               style={{
//                 fontSize: 24,
//                 fontWeight: "bold",
//                 marginBottom: 10,
//               }}
//             >
//               {finalStatus === "VALID" &&
//                 "✅ Dokumen Terverifikasi"}

    

//               {finalStatus === "INVALID" &&
//                 "❌ Dokumen Tidak Valid"}
//             </div>

//             <div
//               style={{
//                 fontSize: 14,
//                 lineHeight: 1.6,
//               }}
//             >
//               {finalMessage}
//             </div>
//           </div>
//         </div>
//       );
//     })()}

//     {/* ========================= */}
//     {/* PAGE TITLE */}
//     {/* ========================= */}

//     <h1
//       style={{
//         marginBottom: 20,
//         fontSize: 28,
//       }}
//     >
//       Hasil Validasi Dokumen
//     </h1>

//     {/* ========================= */}
//     {/* 🔎 DETAIL VERIFIKASI */}
//     {/* ========================= */}

//     <div
//       style={{
//         marginBottom: 24,
//         padding: 18,
//         borderRadius: 12,
//         border: "1px solid #ddd",
//         backgroundColor: "#fafafa",
//         boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
//       }}
//     >
//       <h3 style={{ marginBottom: 14 }}>
//         🔎 Detail Verifikasi
//       </h3>

//       <div style={{ marginBottom: 10 }}>
//      <strong>Signature Digital:</strong>{" "}
// {uploadResult
//   ? uploadResult.signatureValid
//     ? "✅ Valid"
//     : "❌ Tidak Valid"
//   : data.verificationStatus === "VALID"
//   ? "✅ Valid"
//   : "❌ Tidak Valid"}
//       </div>

//       <div style={{ marginBottom: 10 }}>
//         <strong>Integritas Data:</strong>{" "}
// {uploadResult
//   ? uploadResult.isValid
//     ? "✅ Aman"
//     : "❌ Berubah"
//   : data.verificationStatus === "VALID"
//   ? "✅ Aman"
//   : "❌ Berubah"}
//       </div>

//       {/* <div style={{ marginBottom: 10 }}>
//         <strong>Status Dokumen:</strong>{" "}
//         {data.verificationMessage}
//       </div> */}

//       {uploadResult && (
//         <div>
//           <strong>File Upload:</strong>{" "}
//           {uploadResult.status === "VALID"
//             ? "✅ Sesuai dengan dokumen asli"
//             : "⚠️ Berbeda dari dokumen asli"}
//         </div>
//       )}
//     </div>

//     {/* ========================= */}
//     {/* 🔥 TTD VALIDATION */}
//     {/* ========================= */}

//     {data.ttdValidationMessage && (
//       <div
//         style={{
//           marginBottom: 24,
//           padding: 16,
//           borderRadius: 12,
//           backgroundColor: "#f9f9f9",
//           border: "1px solid #ddd",
//           boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
//         }}
//       >
//         <h3 style={{ marginBottom: 10 }}>
//           ✍️ Informasi Penandatangan
//         </h3>

//         <div
//           style={{
//             fontSize: 14,
//             lineHeight: 1.6,
//           }}
//         >
//           {data.ttdValidationMessage}
//         </div>
//       </div>
//     )}

//     {/* ========================= */}
//     {/* 📄 FILE VERIFICATION */}
//     {/* ========================= */}

//     <div
//       style={{
//         marginBottom: 24,
//         padding: 18,
//         borderRadius: 12,
//         border: "1px solid #ddd",
//         boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
//       }}
//     >
//       <h3 style={{ marginBottom: 12 }}>
//         📄 Verifikasi File PDF
//       </h3>

//       <div
//         style={{
//           fontSize: 13,
//           marginBottom: 12,
//           color: "#555",
//           lineHeight: 1.6,
//         }}
//       >
//         Upload file PDF untuk memastikan file
//         tidak mengalami perubahan setelah
//         diterbitkan oleh sistem.
//       </div>

//       <input
//         type="file"
//         accept="application/pdf"
//         onChange={handleUpload}
//         style={{
//           padding: 10,
//           border: "1px solid #ccc",
//           borderRadius: 8,
//           width: "100%",
//           backgroundColor: "#fff",
//         }}
//       />
//     </div>

//     {/* ========================= */}
//     {/* 📤 UPLOAD RESULT */}
//     {/* ========================= */}

//     {uploadResult && (
//       <div
//         style={{
//           marginBottom: 24,
//           padding: 16,
//           borderRadius: 12,
//           fontWeight: "bold",

//           backgroundColor:
//             uploadResult.status === "VALID"
//               ? "#e6f4ea"
//               : "#fdecea",

//           color:
//             uploadResult.status === "VALID"
//               ? "#1e7e34"
//               : "#b71c1c",

//           border: "1px solid #ddd",

//           boxShadow:
//             "0 2px 6px rgba(0,0,0,0.05)",
//         }}
//       >
//         {uploadResult.status === "VALID" &&
//           "✅ "}

//         {uploadResult.status !== "VALID" &&
//           "❌ "}

//         {uploadResult.message}
//       </div>
//     )}

//     {/* ========================= */}
//     {/* PDF VIEWER */}
//     {/* ========================= */}

//     <BlobProvider
//       document={
//         <ReportCPMIDocument
//           attempt={data.attempt}
//           result={data.result}
//           kesimpulan={data.kesimpulan}
//           kesimpulanSikap={
//             data.kesimpulanSikap
//           }
//           kesimpulanKepribadian={
//             data.kesimpulanKepribadian
//           }
//           kesimpulanBelajar={
//             data.kesimpulanBelajar
//           }
//           kesimpulanumum={
//             data.kesimpulanUmum
//           }
//           saranpengembangan={
//             data.saranPengembangan
//           }
//           ttd={data.ttd}
//           barcode={data.barcode}
//           expiresAt={data.expiresAt}
//           validationNotes={
//             data.validationNotes
//           }
//         />
//       }
//     >
//       {({ url, loading, error }) => {
//         if (loading)
//           return (
//             <p>Mempersiapkan PDF...</p>
//           );

//         if (error)
//           return (
//             <p>Error membuat PDF</p>
//           );

//         if (!url)
//           return (
//             <p>PDF tidak tersedia</p>
//           );

//         return (
//           <div
//             style={{
//               marginTop: 20,
//               padding: 18,
//               borderRadius: 12,
//               border: "1px solid #ddd",
//               boxShadow:
//                 "0 2px 6px rgba(0,0,0,0.05)",
//             }}
//           >
//             <iframe
//               src={url}
//               width="100%"
//               height="700px"
//               style={{
//                 borderRadius: 10,
//                 border: "1px solid #ccc",
//                 marginBottom: 14,
//               }}
//             />

// <button
//   onClick={async () => {
//     const blob = await pdf(
//       <ReportCPMIDocument
//         attempt={data.attempt}
//         result={data.result}
//         kesimpulan={data.kesimpulan}
//         kesimpulanSikap={data.kesimpulanSikap}
//         kesimpulanKepribadian={data.kesimpulanKepribadian}
//         kesimpulanBelajar={data.kesimpulanBelajar}
//         kesimpulanumum={data.kesimpulanUmum}
//         saranpengembangan={data.saranPengembangan}
//         ttd={data.ttd}
//         barcode={data.barcode}
//         expiresAt={data.expiresAt}
//         validationNotes={data.validationNotes}
//       />
//     ).toBlob();

//     const blobUrl = URL.createObjectURL(blob);

//     const link = document.createElement("a");
//     link.href = blobUrl;
//     link.download = fileName;

//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);

//     URL.revokeObjectURL(blobUrl);
//   }}
//   style={{
//     display: "inline-block",
//     padding: "11px 18px",
//     backgroundColor: "#0070f3",
//     color: "#fff",
//     borderRadius: 8,
//     textDecoration: "none",
//     fontWeight: "bold",
//     boxShadow:
//       "0 2px 6px rgba(0,0,0,0.1)",
//     border: "none",
//     cursor: "pointer",
//   }}
// >
//   ⬇ Download PDF
// </button>
//           </div>
//         );
//       }}
//     </BlobProvider>
//   </div>
//     </>
// );
// }


// // "use client";
// // import { useEffect, useState } from "react";
// // import { useParams } from "next/navigation";
// // import { BlobProvider } from "@react-pdf/renderer";
// // import ReportCPMIDocument from "@/components/report/reportDocumentCPMI";

// // export default function ValidatePage() {
// //   const params = useParams<{ barcode: string }>();
// //   const barcode = params?.barcode;
// //   const [data, setData] = useState<any>(null);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     if (!barcode) return;
// //     fetch(`/api/report/view/${barcode}`)
// //       .then((res) => res.json())
// //       .then(setData)
// //       .finally(() => setLoading(false));
// //   }, [barcode]);

// //   if (loading) return <div>Loading...</div>;
// //   if (!data || data.error) return <div>{data?.error || "Report tidak ditemukan"}</div>;

// //   return (
// //     <div>
// //       <h1>Hasil Validasi</h1>

// //       {/* Tampilkan pesan TTD langsung di halaman */}
// //       {data.ttdValidationMessage && (
// //         <div
// //           style={{
// //             marginBottom: 20,
// //             padding: 10,
// //             border: "1px solid #ccc",
// //             borderRadius: 4,
// //             backgroundColor: "#f5f5f5",
// //           }}
// //         >
// //           {data.ttdValidationMessage}
// //         </div>
// //       )}

// //       <BlobProvider
// //         document={
// //           <ReportCPMIDocument
// //             attempt={data.attempt}
// //             result={data.result}
// //             kesimpulan={data.kesimpulan}
// //              kesimpulanSikap={data.kesimpulanSikap}
// //   kesimpulanKepribadian={data.kesimpulanKepribadian}
// //   kesimpulanBelajar={data.kesimpulanBelajar}
// //   kesimpulanumum={data.kesimpulanUmum}
// //   saranpengembangan={data.saranPengembangan}

// //             ttd={data.ttd}
// //             barcode={data.barcode}
// //             expiresAt={data.expiresAt}
// //             validationNotes={data.validationNotes} // pakai ttdValidationMessage juga di PDF
// //           />
// //         }
// //       >
// //         {({ url, loading, error }) => {
// //           if (loading) return <p>Mempersiapkan PDF...</p>;
// //           if (error) return <p>Error membuat PDF</p>;
// //           if (!url) return <p>PDF tidak tersedia</p>;

// //           return (
// //             <div>
// //               <iframe
// //                 src={url}
// //                 width="100%"
// //                 height="800px"
// //                 style={{ border: "1px solid #ccc" }}
// //               />

// //               <a
// //                 href={url}
// // download={`HPP_${(
// //   data?.attempt?.User?.fullName || "User"
// // )}.pdf`.replaceAll(" ", " ")}
// //                 style={{
// //                   display: "inline-block",
// //                   marginTop: 10,
// //                   padding: "8px 16px",
// //                   backgroundColor: "#0070f3",
// //                   color: "#fff",
// //                   borderRadius: 4,
// //                   textDecoration: "none",
// //                   fontWeight: "bold",
// //                 }}
// //               >
// //                 Download PDF
// //               </a>
// //             </div>
// //           );
// //         }}
// //       </BlobProvider>
// //     </div>
// //   );
// // }

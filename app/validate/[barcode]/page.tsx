"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReportCPMIDocument from "@/components/report/reportDocumentCPMI";
import {
  BlobProvider,
  pdf,
} from "@react-pdf/renderer";


export default function ValidatePage() {
  const params = useParams<{ barcode: string }>();
  const barcode = params?.barcode;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const handleUpload = async (e: any) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("barcode", barcode!);

  const res = await fetch("/api/report/verify-file", {
    method: "POST",
    body: formData,
  });

  const result = await res.json();
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
const wibDate = new Date(
  new Date(data.expiresAt || new Date()).toLocaleString("en-US", {
    timeZone: "Asia/Jakarta",
  })
);

const displayTimestamp =
  `${String(wibDate.getDate()).padStart(2, "0")}` +
  `${String(wibDate.getMonth() + 1).padStart(2, "0")}` +
  `${wibDate.getFullYear()}_` +
  `${String(wibDate.getHours()).padStart(2, "0")}` +
  `${String(wibDate.getMinutes()).padStart(2, "0")}` +
  `${String(wibDate.getSeconds()).padStart(2, "0")}`;

const fileName = `HPP_${data?.attempt?.User?.fullName || "User"}_${displayTimestamp}.pdf`
  .replace(/\s+/g, "_")
  .trim();
return (
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
      : "INVALID"
    : data.verificationStatus === "VALID"
    ? "VALID"
    : "INVALID";

     const finalMessage =
  finalStatus === "VALID"
    ? "Dokumen berhasil diverifikasi dan tidak mengalami perubahan."
    : "Dokumen tidak valid atau telah dimodifikasi.";

      return (
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              padding: 22,
              borderRadius: 14,

              border: "1px solid #ddd",
              boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
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

    

              {finalStatus === "INVALID" &&
                "❌ Dokumen Tidak Valid"}
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

    <div
      style={{
        marginBottom: 24,
        padding: 18,
        borderRadius: 12,
        border: "1px solid #ddd",
        backgroundColor: "#fafafa",
        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
      }}
    >
      <h3 style={{ marginBottom: 14 }}>
        🔎 Detail Verifikasi
      </h3>

      <div style={{ marginBottom: 10 }}>
     <strong>Signature Digital:</strong>{" "}
{uploadResult
  ? uploadResult.signatureValid
    ? "✅ Valid"
    : "❌ Tidak Valid"
  : data.verificationStatus === "VALID"
  ? "✅ Valid"
  : "❌ Tidak Valid"}
      </div>

      <div style={{ marginBottom: 10 }}>
        <strong>Integritas Data:</strong>{" "}
{uploadResult
  ? uploadResult.isValid
    ? "✅ Aman"
    : "❌ Berubah"
  : data.verificationStatus === "VALID"
  ? "✅ Aman"
  : "❌ Berubah"}
      </div>

      {/* <div style={{ marginBottom: 10 }}>
        <strong>Status Dokumen:</strong>{" "}
        {data.verificationMessage}
      </div> */}

      {uploadResult && (
        <div>
          <strong>File Upload:</strong>{" "}
          {uploadResult.status === "VALID"
            ? "✅ Sesuai dengan dokumen asli"
            : "⚠️ Berbeda dari dokumen asli"}
        </div>
      )}
    </div>

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

    {/* ========================= */}
    {/* 📄 FILE VERIFICATION */}
    {/* ========================= */}

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

    {/* ========================= */}
    {/* 📤 UPLOAD RESULT */}
    {/* ========================= */}

    {uploadResult && (
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
    )}

    {/* ========================= */}
    {/* PDF VIEWER */}
    {/* ========================= */}

    <BlobProvider
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

<button
  onClick={async () => {
    const blob = await pdf(
      <ReportCPMIDocument
        attempt={data.attempt}
        result={data.result}
        kesimpulan={data.kesimpulan}
        kesimpulanSikap={data.kesimpulanSikap}
        kesimpulanKepribadian={data.kesimpulanKepribadian}
        kesimpulanBelajar={data.kesimpulanBelajar}
        kesimpulanumum={data.kesimpulanUmum}
        saranpengembangan={data.saranPengembangan}
        ttd={data.ttd}
        barcode={data.barcode}
        expiresAt={data.expiresAt}
        validationNotes={data.validationNotes}
      />
    ).toBlob();

    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(blobUrl);
  }}
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
    border: "none",
    cursor: "pointer",
  }}
>
  ⬇ Download PDF
</button>
          </div>
        );
      }}
    </BlobProvider>
  </div>
);
}


// "use client";
// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import { BlobProvider } from "@react-pdf/renderer";
// import ReportCPMIDocument from "@/components/report/reportDocumentCPMI";

// export default function ValidatePage() {
//   const params = useParams<{ barcode: string }>();
//   const barcode = params?.barcode;
//   const [data, setData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!barcode) return;
//     fetch(`/api/report/view/${barcode}`)
//       .then((res) => res.json())
//       .then(setData)
//       .finally(() => setLoading(false));
//   }, [barcode]);

//   if (loading) return <div>Loading...</div>;
//   if (!data || data.error) return <div>{data?.error || "Report tidak ditemukan"}</div>;

//   return (
//     <div>
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
// }

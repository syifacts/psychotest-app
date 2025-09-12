"use client";
import { useEffect, useState } from "react";
import { BlobProvider } from "@react-pdf/renderer";
import ReportCPMIDocument from "@/components/report/reportDocumentCPMI";

export default function ValidatePage({ params }: { params: { barcode: string } }) {
  const { barcode } = params;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/report/view/${barcode}`)
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [barcode]);

  if (loading) return <div>Loading...</div>;
  if (!data || data.error) return <div>{data?.error || "Report tidak ditemukan"}</div>;

  return (
    <div>
      <h1>Hasil Validasi</h1>
      <BlobProvider
        document={
          <ReportCPMIDocument
            attempt={data.attempt}
            result={data.result}
            kesimpulan={data.kesimpulan}
            ttd={data.ttd}
            barcode={data.barcode}
            expiresAt={data.expiresAt}
            validationNotes={data.validationNotes}
          />
        }
      >
        {({ url, loading, error }) => {
          if (loading) return <p>Mempersiapkan PDF...</p>;
          if (error) return <p>Error membuat PDF</p>;
          if (!url) return <p>PDF tidak tersedia</p>;

          return (
            <div>
              {/* Preview PDF */}
              <iframe src={url} width="100%" height="800px" style={{ border: "1px solid #ccc" }} />

              {/* Tombol download */}
              <a
                href={url}
                download={`Report-${barcode}.pdf`}
                style={{
                  display: "inline-block",
                  marginTop: 10,
                  padding: "8px 16px",
                  backgroundColor: "#0070f3",
                  color: "#fff",
                  borderRadius: 4,
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                Download PDF
              </a>
            </div>
          );
        }}
      </BlobProvider>
    </div>
  );
}

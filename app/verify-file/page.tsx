"use client";

import { useState } from "react";
import { Toast, ToastTitle, ToastDescription } from "@/components/ui/toast";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";


export default function VerifyFilePage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
const [toast, setToast] = useState<{
  message: string;
  variant: "error" | "success" | "warning";
} | null>(null);

const showToast = (
  message: string,
  variant: "error" | "success" | "warning" = "error"
) => {
  setToast({ message, variant });

  setTimeout(() => {
    setToast(null);
  }, 3000);
};

  const handleVerify = async () => {
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/report/verify-file", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Navbar />
   <div className="min-h-screen bg-slate-50 pt-24 pb-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-6">
          <h1 className="text-3xl font-bold text-center">
            Verifikasi Dokumen PDF
          </h1>

          <p className="text-center text-gray-500 mt-2">
            Upload dokumen PDF yang telah ditandatangani
            untuk memverifikasi keaslian dan integritasnya.
          </p>
        </div>

        {/* FORM */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4">
            📄 Upload Dokumen
          </h2>

          <input
            type="file"
            accept=".pdf"
          onChange={(e) => {
  const selectedFile = e.target.files?.[0];

  if (!selectedFile) return;

  // hanya PDF
  if (selectedFile.type !== "application/pdf") {
    showToast("Hanya file PDF yang diperbolehkan", "error");
    e.target.value = "";
    setFile(null);
    return;
  }

  // maksimal 5 MB
  if (selectedFile.size > 5 * 1024 * 1024) {
    showToast("Ukuran file maksimal 5 MB", "error");
    e.target.value = "";
    setFile(null);
    return;
  }

  setFile(selectedFile);
}}
            className="w-full border rounded-lg p-3"
          />

          <button
            onClick={handleVerify}
            disabled={!file || loading}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-medium disabled:opacity-50"
          >
            {loading
              ? "Memverifikasi..."
              : "Verifikasi Dokumen"}
          </button>
        </div>

        {/* HASIL */}
{result && (
  <div
    className={`rounded-2xl border shadow-sm overflow-hidden ${
      result.status === "VALID"
        ? "border-green-200"
        : "border-red-200"
    }`}
  >
    {/* HEADER STATUS */}
    <div
      className={`p-6 ${
        result.status === "VALID"
          ? "bg-green-50"
          : "bg-red-50"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
            result.status === "VALID"
              ? "bg-green-100"
              : "bg-red-100"
          }`}
        >
          {result.status === "VALID" ? "✓" : "✕"}
        </div>

        <div>
          <h2
            className={`text-2xl font-bold ${
              result.status === "VALID"
                ? "text-green-700"
                : "text-red-700"
            }`}
          >
            {result.status === "VALID"
              ? "Dokumen Valid"
              : "Dokumen Tidak Valid"}
          </h2>

          <p
            className={`mt-1 ${
              result.status === "VALID"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {result.status === "VALID"
              ? "Dokumen berhasil diverifikasi dan tidak mengalami perubahan."
              : "Dokumen telah dimodifikasi atau tidak sesuai dengan dokumen asli."}
          </p>
        </div>
      </div>
    </div>

    {/* DETAIL */}
    <div className="bg-white p-6">
      <div className="grid md:grid-cols-3 gap-4">

        <div className="border rounded-xl p-4">
          <p className="text-sm text-gray-500">
            Signature Digital
          </p>

          <p
            className={`font-semibold mt-2 ${
              result.signatureValid
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {result.signatureValid
              ? "✓ Valid"
              : "✕ Tidak Valid"}
          </p>
        </div>

        <div className="border rounded-xl p-4">
          <p className="text-sm text-gray-500">
            Integritas Dokumen
          </p>

          <p
            className={`font-semibold mt-2 ${
              result.isValid
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {result.isValid
              ? "✓ Terjaga"
              : "✕ Berubah"}
          </p>
        </div>

        <div className="border rounded-xl p-4">
          <p className="text-sm text-gray-500">
            Status File
          </p>

          <p
            className={`font-semibold mt-2 ${
              result.status === "VALID"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {result.status === "VALID"
              ? "✓ Asli"
              : "⚠ Berbeda"}
          </p>
        </div>

      </div>

      {result.message && (
        <div className="mt-6 border rounded-xl p-4 bg-slate-50">
          <p className="font-semibold mb-2">
            Keterangan
          </p>

          <p className="text-gray-700">
            {result.message}
          </p>
        </div>
      )}
    </div>
  </div>
)}

      </div>
           {toast && (
        <Toast variant={toast.variant}>
          <ToastTitle>Upload Gagal</ToastTitle>
          <ToastDescription>
            {toast.message}
          </ToastDescription>
        </Toast>
      )}
    </div>

    <Footer />
  </>
);
}
"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PaymentNotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f7fe]">
      <div className="bg-white p-10 rounded-[2rem] shadow-xl flex flex-col items-center border border-red-100 max-w-sm w-full mx-4">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Tidak Ditemukan
        </h2>
        <p className="text-gray-500 mb-8 text-center">
          Data tagihan dengan referensi tersebut tidak tersedia.
        </p>
        <button
          onClick={() => router.back()}
          className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
        >
          Kembali
        </button>
      </div>
    </div>
  );
}

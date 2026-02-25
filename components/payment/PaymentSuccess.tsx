"use client";

import React from "react";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  totalAmount: number;
  methodName: string;
  reference: string;
}

export default function PaymentSuccess({
  totalAmount,
  methodName,
  reference,
}: Props) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f4f7fe] py-12 px-4 md:px-8 font-sans flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-emerald-400 opacity-20 rounded-full blur-[100px] pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[25rem] h-[25rem] bg-teal-400 opacity-20 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/3 translate-y-1/3"></div>

      <div className="bg-white rounded-[2rem] shadow-2xl p-8 md:p-12 max-w-md w-full relative z-10 animate-in zoom-in-95 duration-500 border border-emerald-50">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center shadow-inner">
            <CheckCircle className="w-12 h-12" />
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-2">
          Pembayaran Berhasil!
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Terima kasih, tagihan Anda sudah lunas.
        </p>

        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4 mb-8">
          <div className="flex justify-between items-center border-b border-dashed border-gray-300 pb-4">
            <span className="text-gray-500 text-sm">Nominal</span>
            <span className="font-bold text-gray-800 text-lg">
              Rp {totalAmount.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-dashed border-gray-300 pb-4">
            <span className="text-gray-500 text-sm">Metode</span>
            <span className="font-semibold text-gray-800">{methodName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">No Referensi</span>
            <span className="font-mono text-xs text-gray-600 bg-white px-2 py-1 rounded border">
              {reference}
            </span>
          </div>
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold shadow-lg hover:shadow-emerald-200 transition-all flex items-center justify-center gap-2"
        >
          Selesai & Mulai Tes <span className="text-xl">🚀</span>
        </button>
      </div>
    </div>
  );
}

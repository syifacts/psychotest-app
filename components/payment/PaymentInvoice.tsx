"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Receipt,
  ShieldCheck,
} from "lucide-react";

interface Props {
  paymentData: any;
  reference: string;
  timeLeft: number | null;
  formatTime: (sec: number) => string;
  isChecking: boolean;
  handleCheckStatus: () => void;
  handleCopy: (text: string) => void;
  copied: boolean;
}

export default function PaymentInvoice({
  paymentData,
  reference,
  timeLeft,
  formatTime,
  isChecking,
  handleCheckStatus,
  handleCopy,
  copied,
}: Props) {
  const router = useRouter();
  const [openInstruction, setOpenInstruction] = useState<number | null>(0);

  const methodCode =
    paymentData?.payment_method_code || paymentData?.method || "default";
  const methodName =
    paymentData?.payment_method || paymentData?.method || "Pembayaran";

  const totalAmount = paymentData?.amount || paymentData?.total_amount || 0;

  const itemName = paymentData?.order_items?.[0]?.name || "Tiket Tes Psikologi";

  const isQris =
    methodCode.toUpperCase() === "QRIS" || methodName.toUpperCase() === "QRIS";
  const isExpired = timeLeft !== null && timeLeft <= 0;

  return (
    <div className="min-h-screen bg-[#f4f7fe] py-10 px-4 md:px-8 font-sans relative overflow-hidden flex flex-col items-center justify-center">
      <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-indigo-500 opacity-20 rounded-full blur-[100px] pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[25rem] h-[25rem] bg-blue-400 opacity-20 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-5xl w-full space-y-6 relative z-10 my-auto">
        <div className="bg-white rounded-[2rem] shadow-2xl flex flex-col lg:flex-row overflow-hidden border border-white">
          {/* BAGIAN KIRI */}
          <div className="lg:w-5/12 bg-slate-50 p-8 md:p-12 flex flex-col justify-between border-r border-gray-100">
            <div>
              <div className="flex items-center gap-3 mb-10">
                <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-200">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h1 className="text-xl font-bold text-gray-800 tracking-wide">
                  Psikologi Test
                </h1>
              </div>

              <div className="space-y-6 mb-8">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">
                    Nomor Referensi
                  </p>
                  <p className="text-sm font-mono text-gray-800 bg-white inline-block px-3 py-1 rounded-md border border-gray-200 shadow-sm">
                    {reference}
                  </p>
                </div>

                <div className="border-t border-dashed border-gray-300 pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-semibold text-gray-800">{itemName}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Kuantitas: {paymentData?.quantity || 1}x
                      </p>
                    </div>
                    {/* ✅ Tampil dengan Nominal Akurat */}
                    <p className="font-semibold text-gray-800">
                      Rp {totalAmount.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mt-auto">
              <div className="flex justify-between items-end">
                <p className="text-gray-500 font-medium mb-1">Total Tagihan</p>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  Rp {totalAmount.toLocaleString("id-ID")}
                </h2>
              </div>
            </div>
          </div>

          {/* BAGIAN KANAN */}
          <div className="lg:w-7/12 p-8 md:p-12 bg-white flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3 px-4 py-2 border border-gray-100 rounded-xl shadow-sm bg-gray-50/50">
                <img
                  src={`/logos/${methodCode.toLowerCase()}.png`}
                  alt={methodName}
                  className="h-6 object-contain"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
                <span className="font-semibold text-gray-700">
                  {methodName}
                </span>
              </div>
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${isExpired ? "bg-red-50 border-red-200 text-red-600" : "bg-indigo-50 border-indigo-100 text-indigo-700"}`}
              >
                <Clock className={`w-5 h-5 ${!isExpired && "animate-pulse"}`} />
                <span className="font-bold tracking-wider text-sm">
                  {timeLeft !== null ? formatTime(timeLeft) : "--:--:--"}
                </span>
              </div>
            </div>

            <div className="mb-10">
              <p className="text-sm font-medium text-gray-500 mb-3">
                {isQris
                  ? "Pindai kode QR berikut untuk membayar:"
                  : "Transfer ke Nomor Virtual Account:"}
              </p>
              {isQris ? (
                <div className="flex justify-center bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <img
                    src={paymentData?.qr_url}
                    alt="QRIS"
                    className="w-56 h-56 rounded-xl shadow-sm"
                  />
                </div>
              ) : (
                <div className="relative">
                  <div className="w-full bg-indigo-50/50 border-2 border-indigo-100 rounded-2xl p-6 pr-32 flex items-center">
                    <p className="text-3xl sm:text-3xl font-mono font-bold text-indigo-900 tracking-widest break-all">
                      {paymentData?.pay_code || "Menunggu..."}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(paymentData?.pay_code || "")}
                    disabled={!paymentData?.pay_code}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md font-medium text-sm"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copied ? "Tersalin" : "Salin"}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-auto space-y-3">
              <button
                onClick={handleCheckStatus}
                disabled={isChecking}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw
                  className={`w-5 h-5 ${isChecking ? "animate-spin" : ""}`}
                />
                SAYA SUDAH MEMBAYAR
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full py-4 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-600 rounded-xl font-bold transition-all"
              >
                Bayar Nanti (Kembali ke Dashboard)
              </button>
            </div>
          </div>
        </div>

        {/* ACCORDION */}
        {paymentData.instructions && paymentData.instructions.length > 0 && (
          <div className="bg-white rounded-[2rem] shadow-xl border border-white overflow-hidden">
            <div className="p-6 md:px-10 bg-slate-50 border-b border-gray-100 flex items-center gap-3">
              <Receipt className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-gray-800 text-lg">
                Instruksi Pembayaran
              </h3>
            </div>
            <div className="p-4 md:p-6 divide-y divide-gray-100">
              {paymentData.instructions.map((inst: any, idx: number) => (
                <div key={idx} className="group">
                  <button
                    onClick={() =>
                      setOpenInstruction(openInstruction === idx ? null : idx)
                    }
                    className="w-full py-4 px-4 flex justify-between items-center text-left hover:text-indigo-600 transition-colors"
                  >
                    <span className="font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors">
                      {inst.title}
                    </span>
                    <div
                      className={`p-1.5 rounded-full transition-colors ${openInstruction === idx ? "bg-indigo-100" : "bg-gray-100"}`}
                    >
                      {openInstruction === idx ? (
                        <ChevronUp className="w-5 h-5 text-indigo-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </button>

                  {openInstruction === idx && (
                    <div className="pb-6 px-4 text-sm text-gray-600">
                      <ol className="list-decimal list-outside ml-4 space-y-3">
                        {inst.steps.map((step: string, i: number) => (
                          <li
                            key={i}
                            className="pl-2 leading-relaxed text-gray-600"
                            dangerouslySetInnerHTML={{ __html: step }}
                          ></li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

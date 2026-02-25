import React from "react";

export default function PaymentLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f7fe]">
      <div className="w-14 h-14 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="mt-6 text-gray-500 font-medium animate-pulse text-lg">
        Menyiapkan halaman pembayaran...
      </p>
    </div>
  );
}

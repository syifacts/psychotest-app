"use client";

import React from "react";

interface Props {
  onStartTest: () => void;
}

const MSDTInstruction: React.FC<Props> = ({ onStartTest }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4">
      {/* Card Instruksi Utama */}
      <div className="max-w-2xl w-full bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl p-8 md:p-10 border border-blue-100 relative overflow-hidden">
        {/* Aksen dekoratif di pojok kanan atas */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-400 opacity-10 rounded-bl-full" />

        {/* Header dengan Icon */}
        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-blue-100">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 text-center">
            Instruksi Tes MSDT
          </h2>
          <div className="w-16 h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mt-4"></div>
        </div>

        {/* Content Instruksi */}
        <div className="space-y-5 text-gray-700 relative z-10">
          {/* Callout Box 1 */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-xl shadow-sm">
            <p className="leading-relaxed text-base md:text-lg">
              Pilihlah jawaban{" "}
              <span className="font-bold text-blue-700 text-xl">“A”</span> atau{" "}
              <span className="font-bold text-blue-700 text-xl">“B”</span> pada
              pasangan pernyataan-pernyataan berikut dan jawablah dengan jujur
              sesuai dengan preferensi Anda.
            </p>
          </div>

          {/* Callout Box 2 */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-xl shadow-sm">
            <p className="leading-relaxed text-base md:text-lg">
              Silakan periksa kembali pekerjaan Anda sebelum mengakhiri tes,
              pastikan tidak ada pernyataan yang terlewat. Bila sudah yakin,
              selesaikan tes dengan menekan tombol{" "}
              <span className="font-bold text-gray-900 bg-amber-200 px-2 py-0.5 rounded">
                Submit
              </span>
              .
            </p>
          </div>
        </div>

        {/* Tombol Mulai */}
        <div className="mt-10 relative z-10">
          <button
            onClick={onStartTest}
            className="w-full py-4 bg-gradient-to-r from-blue-500 hover:from-blue-600 to-indigo-600 hover:to-indigo-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1 flex justify-center items-center gap-2 group"
          >
            <span>Mulai Kerjakan Tes</span>
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MSDTInstruction;

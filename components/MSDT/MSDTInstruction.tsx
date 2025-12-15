// components/MSDT/MSDTInstruction.tsx
"use client";

import React from "react";

interface Props {
  onStartTest: () => void;
}

const MSDTInstruction: React.FC<Props> = ({ onStartTest }) => {
  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Instruksi Tes MSDT</h2>

      <p className="text-gray-700 leading-relaxed">
        Pilihlah jawaban <b>“A”</b> atau <b>“B”</b> pada pasangan pernyataan-pernyataan berikut
        dan jawablah dengan jawaban yang sesuai.
      </p>

      <p className="text-gray-700 leading-relaxed">
        Silahkan periksa kembali pekerjaan Anda, apakah masih ada pernyataan yang
        belum Anda selesaikan. Bila sudah, selesaikan tes dengan menekan tombol{" "}
        <b>Submit</b>.
      </p>

      <button
        onClick={onStartTest}
        className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow"
      >
        Mulai Tes MSDT
      </button>
    </div>
  );
};

export default MSDTInstruction;

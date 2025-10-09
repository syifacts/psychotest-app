// components/CPMI/CPMIInstruction.tsx
"use client";

import React, { useState } from "react";

interface Question {
  id: number;
  code: string;
  content: string;
  options: string[];
  notes?: string;
  type: "single" | "mc" | "essay";
}

interface Props {
  exampleQuestions: Question[];
  onFinishExamples: () => void;
}

const CPMIInstruction: React.FC<Props> = ({ exampleQuestions, onFinishExamples }) => {
  const [step, setStep] = useState<"instructions" | "examples">("instructions");
  const [exampleIndex, setExampleIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const nextExample = () => {
    if (exampleIndex < exampleQuestions.length - 1) {
      setExampleIndex(exampleIndex + 1);
    } else {
      onFinishExamples(); // lanjut ke soal asli
    }
  };

  const currentQuestion = exampleQuestions[exampleIndex];

  return (
  <div className=" flex justify-center w-full max-w-5xl mx-auto p-8 space-y-6 ">
    {step === "instructions" && (
  <div className="bg-white/90 backdrop-blur-sm border border-blue-100 rounded-2xl shadow-xl p-8 mt-15">
    <div className="text-center mb-6">
      <h2 className="text-3xl font-bold text-blue-700 mb-2">
        🧠 Instruksi Tes WPT untuk CPMI
      </h2>
      <p className="text-gray-600 text-sm">
        Baca dengan seksama sebelum memulai tes.
      </p>
    </div>

    <div className="space-y-6">
      {/* 1️⃣ Tentang Tes */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 bg-blue-100 text-blue-600 w-10 h-10 flex items-center justify-center rounded-full font-bold">
          1
        </div>
        <div>
          <h3 className="font-semibold text-blue-700 mb-1">
            Mengenai the Wonderlic Personnel Test
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Ini merupakan tes untuk kemampuan memecahkan masalah. Tes ini
                mencakup berbagai jenis pertanyaan yang harus diselesaikan tanpa
                alat bantu seperti kalkulator atau alat sejenis. Bacalah dengan
                seksama petunjuk dan kerjakanlah contoh pertanyaan.
          </p>
        </div>
      </div>

      {/* 2️⃣ Petunjuk Pengerjaan */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 bg-blue-100 text-blue-600 w-10 h-10 flex items-center justify-center rounded-full font-bold">
          2
        </div>
        <div>
          <h3 className="font-semibold text-blue-700 mb-1">Petunjuk (Bacalah dengan seksama)</h3>
           <p className="text-gray-700 leading-relaxed">
            Tes ini berisi 50 pertanyaan yang secara bertahap menjadi
                semakin sulit. Anda tidak mungkin dapat menyelesaikan semua
                pertanyaan, tetapi selesaikan semampu Anda. Setelah petugas tes
                meminta Anda untuk mulai, Anda memiliki waktu 12 menit untuk
                memberi jawaban yang benar sebanyak mungkin. Kerjakan dengan
                teliti, namun jangan menghabiskan waktu lama pada setiap
                pertanyaan atau lewati pertanyaan itu. Pastikan Anda menulis
                jawaban pada tanda kurung yang tersedia. Sebelum Anda memulai
                tes ini, bacalah contoh pertanyaan di bawah ini.
          </p>
          {/* <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Tes berisi 50 pertanyaan dengan tingkat kesulitan meningkat.</li>
            <li>Waktu pengerjaan adalah <b>12 menit</b>.</li>
            <li>Jawablah sebanyak mungkin secara teliti dan cepat.</li>
            <li>
              Jika ragu pada suatu soal, lanjutkan ke soal berikutnya —
              jangan terlalu lama di satu soal.
            </li>
          </ul> */}
        </div>
      </div>

      {/* 3️⃣ Contoh Soal */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 bg-blue-100 text-blue-600 w-10 h-10 flex items-center justify-center rounded-full font-bold">
          3
        </div>
        <div>
          <h3 className="font-semibold text-blue-700 mb-1">
            Contoh Pertanyaan
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Perhatikan contoh pertanyaan yang terisi dengan benar: (contoh
                soal dan catatan akan ditampilkan di step berikutnya)
          </p>
        </div>
      </div>
    </div>

    {/* Tombol Lanjut */}
    <div className="mt-8 text-center">
      <button
        onClick={() => setStep("examples")}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 transition text-white font-semibold rounded-lg shadow-lg hover:scale-[1.02]"
      >
        Lanjut ke Contoh Soal ➜
      </button>
    </div>
  </div>
)}


      {step === "examples" && (
        <div className="bg-white shadow-md rounded-lg p-6 space-y-4 mt-40">
          {exampleQuestions.length === 0 ? (
            <p className="text-gray-600">Loading contoh soal...</p>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Contoh Soal {exampleIndex + 1}
              </h2>

              {/* Soal */}
              <p className="mb-4 text-gray-700">{currentQuestion.content}</p>

              {/* Jawaban */}
              {currentQuestion.type === "single" || currentQuestion.type === "mc" ? (
                <ul className="space-y-2 mb-2">
                  {currentQuestion.options.map((opt, idx) => (
                    <li key={idx}>
                     <label className="flex items-center space-x-3 p-2 border rounded-md cursor-pointer hover:bg-blue-50">
  <input
    type="radio"
    name={`example-${currentQuestion.id}`}
    value={opt}
    checked={answers[currentQuestion.id] === opt}
    onChange={() =>
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: opt,
      }))
    }
    className="form-radio h-5 w-5 text-blue-600"
  />
  <span className="font-semibold text-gray-700">{idx + 1}.</span>
  <span className="text-gray-700">{opt}</span>
</label>

                    </li>
                  ))}
                </ul>
              ) : currentQuestion.type === "essay" ? (
                <textarea
                  className="w-full p-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  rows={4}
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [currentQuestion.id]: e.target.value,
                    }))
                  }
                  placeholder="Tulis jawaban Anda di sini..."
                />
              ) : null}

              {/* Notes */}
              {currentQuestion.notes && (
                <p className="text-sm italic text-gray-500 mt-2">{currentQuestion.notes}</p>
              )}

              {/* Tombol */}
              <button
                onClick={nextExample}
                className="mt-4 w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow"
              >
                {exampleIndex < exampleQuestions.length - 1
                  ? "Soal Berikutnya"
                  : "Mulai Tes Asli"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CPMIInstruction;

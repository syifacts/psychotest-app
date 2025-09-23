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
     <div className="max-w-xl mx-auto p-6 space-y-6">
      {step === "instructions" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Instruksi Tes CPMI</h2>

          <ol className="list-decimal ml-6 space-y-3">
            <li>
              <b>Mengenai the Wonderlic Personnel Test</b>
              <p>
                Ini merupakan tes untuk kemampuan memecahkan masalah. Tes ini
                mencakup berbagai jenis pertanyaan yang harus diselesaikan tanpa
                alat bantu seperti kalkulator atau alat sejenis. Bacalah dengan
                seksama petunjuk dan kerjakanlah contoh pertanyaan.
              </p>
            </li>
            <li>
              <b>Petunjuk (Bacalah dengan seksama)</b>
              <p>
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
            </li>
            <li>
              <b>Contoh Pertanyaan</b>
              <p>
                Perhatikan contoh pertanyaan yang terisi dengan benar: (contoh
                soal dan catatan akan ditampilkan di step berikutnya)
              </p>
            </li>
          </ol>

          <button
            onClick={() => setStep("examples")}
            className="mt-6 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Lanjut ke Contoh Soal
          </button>
        </div>
      )}

      {step === "examples" && (
        <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
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

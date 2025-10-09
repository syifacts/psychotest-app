// components/TIU6/TIU6Instruction.tsx
"use client";

import React, { useState } from "react";

interface Question {
  id: number;
  code: string;
  content: string;
  options: string[];
  notes?: string;
  type: "single" | "mc" | "essay" | "tiu6";
}

interface Props {
  exampleQuestions: Question[];
  onFinishExamples: () => void;
}

const TIU6Instruction: React.FC<Props> = ({ exampleQuestions, onFinishExamples }) => {
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
          <h2 className="text-xl font-bold mb-4">Instruksi Tes TIU6</h2>

          <ol className="list-decimal ml-6 space-y-3 text-gray-700">
            <li>
              Pada soal, terdapat sebuah benda atau bentuk. Lalu ada 5 guntingan karton. Beberapa diantaranya telah digunting betul, sehingga daripadanya dapat dibentuk benda seperti yang tergambar pada soal. Sedang beberapa buah lainnya digunting salah, sehingga selalu ada sebuah sisi yang tetap terbuka.
            </li>
            <li>
              Bidang yang dibuat tebal dimaksudkan sebagai bidang yang terletak di tanah atau yang merupakan alas. Ingatlah: semua sisi harus tertutup.
            </li>
            <li>
              Pilihlah pada guntingan-guntingan yang betul sebuah pilihan <b>B</b>, dan pada guntingan-guntingan yang salah sebuah pilihan <b>S</b>. Banyaknya guntingan yang betul untuk tiap baris tidak sama. Perhatikan guntingan-guntingan tersebut satu per satu.
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

              <p className="mb-4 text-gray-700">{currentQuestion.content}</p>

              {currentQuestion.type === "tiu6" && (
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
                        <span className="font-semibold text-gray-700">{opt}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}

              {currentQuestion.notes && (
                <p className="text-sm italic text-gray-500 mt-2">{currentQuestion.notes}</p>
              )}

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

export default TIU6Instruction;

import React from "react";

interface Question {
  id: number;
  code: string;
  content: string;
  options: string[];
  type: "single";
}

interface AnswerSummaryProps {
  questions: Question[];
  answers: Record<number, string>;
  currentIndex: number;
  onSelect: (index: number) => void;
}

const AnswerSummary: React.FC<AnswerSummaryProps> = ({
  questions,
  answers,
  currentIndex,
  onSelect,
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm border border-blue-100 shadow-lg rounded-2xl p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <svg
          className="w-5 h-5 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        </svg>
        Navigasi Soal
      </h3>

      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2 md:gap-3">
        {questions.map((q, idx) => {
          const isAnswered = !!answers[q.id];
          const isCurrent = currentIndex === idx;

          return (
            <button
              key={q.id}
              onClick={() => onSelect(idx)}
              className={`
                w-full aspect-square flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200
                ${isCurrent ? "ring-2 ring-offset-2 ring-blue-500 transform scale-110" : ""}
                ${
                  isAnswered
                    ? "bg-blue-500 text-white shadow-md hover:bg-blue-600"
                    : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200 hover:text-gray-700"
                }
              `}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Legend / Keterangan Warna */}
      <div className="flex items-center gap-4 mt-6 text-xs text-gray-600 justify-center">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-500"></div>
          <span>Terjawab</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded border border-gray-300 bg-gray-100"></div>
          <span>Belum</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-500 ring-2 ring-offset-1 ring-blue-500"></div>
          <span>Sekarang</span>
        </div>
      </div>
    </div>
  );
};

export default AnswerSummary;

import React from "react";

interface Question {
  id: number;
  code: string;
  content: string;
  image: string;
  options: string[];
  type: "single" | "essay";
}

interface QuestionCardProps {
  question: Question;
  selected?: string;
  onSelect: (choice: string, optIndex?: number) => void | Promise<void>;
}

const CPMIQuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selected,
  onSelect,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-blue-100 shadow-sm rounded-2xl p-6 md:p-8 mb-6 transition-all">
      {/* Teks Soal & Gambar */}
      <div className="mb-6">
        {question.content.split("\n").map((line, idx) => {
          const isImage = /\.(png|jpg|jpeg|gif)$/i.test(line.trim());
          return isImage ? (
            <img
              key={idx}
              src={line.trim()}
              alt={`Soal part ${idx}`}
              className="max-w-[300px] block my-3 rounded shadow-sm"
            />
          ) : (
            <p
              key={idx}
              className="text-lg text-gray-800 font-medium my-1 leading-relaxed"
            >
              {line}
            </p>
          );
        })}

        {question.image && (
          <div className="mt-4">
            <img
              src={question.image}
              alt="Gambar utama soal"
              className="max-w-[400px] w-full object-contain rounded-lg border border-gray-200 shadow-sm"
            />
          </div>
        )}
      </div>

      {/* Pilihan Jawaban */}
      {question.type === "single" ? (
        <div className="space-y-3">
          {question.options.map((opt, idx) => {
            const optValue = String(idx + 1);
            const isSelected = selected === optValue;
            const isImage =
              opt.startsWith("/") || /\.(png|jpg|jpeg|gif)$/i.test(opt);

            return (
              <label
                key={idx}
                className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500 shadow-sm"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  className="hidden"
                  value={optValue}
                  checked={isSelected}
                  onChange={() => onSelect(optValue, idx)}
                />

                <div
                  className={`w-5 h-5 rounded-full border flex flex-shrink-0 items-center justify-center mr-4 transition-colors ${
                    isSelected ? "border-blue-600" : "border-gray-400"
                  }`}
                >
                  {isSelected && (
                    <div className="w-3 h-3 bg-blue-600 rounded-full" />
                  )}
                </div>

                <span className="flex items-center gap-3">
                  {isImage ? (
                    <img
                      src={opt}
                      alt={`Pilihan ${idx + 1}`}
                      className="w-28 h-auto rounded-md object-contain border bg-white"
                    />
                  ) : (
                    <span
                      className={`text-base ${isSelected ? "text-blue-900 font-medium" : "text-gray-700"}`}
                    >
                      {`${idx + 1}. ${opt}`}
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      ) : (
        <div>
          {question.options?.length > 0 && (
            <div className="mb-4">
              {question.options.map((opt, idx) => (
                <img
                  key={idx}
                  src={opt.trim()}
                  alt={`Referensi ${idx + 1}`}
                  className="max-w-[200px] block my-2 rounded border"
                />
              ))}
            </div>
          )}
          <textarea
            className="w-full p-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all shadow-sm bg-gray-50 resize-none text-gray-800 placeholder-gray-400"
            value={selected || ""}
            onChange={(e) => onSelect(e.target.value)}
            placeholder="✏️ Tuliskan jawaban Anda di sini..."
            rows={5}
          />
        </div>
      )}
    </div>
  );
};

export default CPMIQuestionCard;

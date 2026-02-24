import React from "react";

interface Question {
  id: number;
  code: string;
  content: string;
  options: string[];
  type: "single";
}

interface QuestionCardProps {
  question: Question;
  selected?: string;
  onSelect: (choice: string) => void | Promise<void>;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selected,
  onSelect,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-blue-100 shadow-sm rounded-2xl p-6 md:p-8 mb-6 transition-all">
      <p className="text-lg md:text-xl font-semibold text-gray-800 mb-6 leading-relaxed">
        {question.content}
      </p>

      <div className="space-y-3">
        {question.options.map((opt) => {
          const isSelected = selected === opt;
          return (
            <label
              key={opt}
              className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500 shadow-sm"
                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
              }`}
            >
              {/* Radio Asli Di-hidden */}
              <input
                type="radio"
                className="hidden"
                value={opt}
                checked={isSelected}
                onChange={() => onSelect(opt)}
              />

              {/* Custom Radio Button */}
              <div
                className={`w-5 h-5 rounded-full border flex flex-shrink-0 items-center justify-center mr-4 transition-colors ${
                  isSelected ? "border-blue-600" : "border-gray-400"
                }`}
              >
                {isSelected && (
                  <div className="w-3 h-3 bg-blue-600 rounded-full" />
                )}
              </div>

              <span
                className={`text-base ${isSelected ? "text-blue-900 font-medium" : "text-gray-700"}`}
              >
                {opt}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionCard;

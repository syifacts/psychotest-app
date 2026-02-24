"use client";
import React from "react";

interface NavigationButtonsProps {
  currentIndex: number;
  totalQuestions: number;
  goNext: () => void;
  goBack: () => void;
  onSubmit: () => void;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentIndex,
  totalQuestions,
  goNext,
  goBack,
  onSubmit,
}) => {
  return (
    <div className="flex items-center justify-between mt-8">
      <button
        onClick={goBack}
        disabled={currentIndex === 0}
        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
          currentIndex === 0
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
        }`}
      >
        <span>←</span> Back
      </button>

      {currentIndex < totalQuestions - 1 ? (
        <button
          onClick={goNext}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2"
        >
          Next <span>→</span>
        </button>
      ) : (
        <button
          onClick={onSubmit}
          className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          Submit Tes
        </button>
      )}
    </div>
  );
};

export default NavigationButtons;

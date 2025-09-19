import React from "react";
import styles from "../../app/tes/msdt/msdt.module.css";

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

const AnswerSummary: React.FC<AnswerSummaryProps> = ({ questions, answers, currentIndex, onSelect }) => {
  return (
    <div className={styles.answerGrid}>
      {questions.map((q, idx) => (
        <button
          key={q.id}
          className={`${styles.answerNumber} 
                      ${answers[q.id] ? styles.answered : styles.unanswered} 
                      ${currentIndex === idx ? styles.current : ""}`}
          onClick={() => onSelect(idx)}
        >
          {idx + 1}
        </button>
      ))}
    </div>
  );
};

export default AnswerSummary;

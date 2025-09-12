"use client";
import React from "react";
import styles from "../../app/tes/ist/Ist.module.css";

interface Props {
  questions: any[];
  answers: Record<number, string | string[]>;
  currentIndex: number;
  onSelect: (idx: number) => void;
}

const AnswerSummary: React.FC<Props> = ({
  questions,
  answers,
  currentIndex,
  onSelect,
}) => {
  return (
    <div className={styles.answerCard}>
      <h3>Ringkasan Jawaban</h3>
      <div className={styles.answerGrid}>
        {questions.map((q, idx) => (
          <button
            key={q.id}
            className={`${styles.answerNumber} ${
              answers[q.id] ? styles.answered : styles.unanswered
            } ${currentIndex === idx ? styles.current : ""}`}
            onClick={() => onSelect(idx)}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AnswerSummary;

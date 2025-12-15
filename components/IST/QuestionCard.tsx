"use client";
import React from "react";
import styles from "../../app/tes/ist/Ist.module.css";
import { useEffect, useState } from 'react';


interface Question {
  id: number;
  content: string; // teks atau URL gambar
  type: "single" | "mc" | "essay" | "image";
  options?: string[]; // teks atau URL gambar
}

interface Props {
  question: Question;
  answer: string | string[];
  subtestDesc: string; // 🆕 deskripsi subtest
  onAnswer: (qid: number, choice: string | string[]) => void;
  onShowSubtestDetail: () => void; // 🆕 callback ke parent untuk tampilkan SubtestDetail
}

const QuestionCard: React.FC<Props> = ({ question, answer, subtestDesc, onAnswer, onShowSubtestDetail }) => {
  const isMC = question.type === "mc";
  const isImageQuestion = question.type === "image";
  //  const [showDesc, setShowDesc] = useState(false);


  const handleOptionChange = (idx: number) => {
    const choice = isMC || isImageQuestion ? question.options![idx] : String.fromCharCode(65 + idx);

    if (isMC) {
      const newAnswer: string[] = Array.isArray(answer) ? [...answer] : [];
      if (!newAnswer.includes(choice)) newAnswer.push(choice);
      else newAnswer.splice(newAnswer.indexOf(choice), 1);
      onAnswer(question.id, newAnswer);
    } else {
      onAnswer(question.id, choice);
    }
  };

  const optionIndices = question.options?.map((_, idx) => idx) || [];

  return (
    <div className={styles.questionSection}>
      {/* Tombol lihat instruksi subtest */}
      <button
        className={styles.btn}
        style={{ marginBottom: "16px" }}
        onClick={onShowSubtestDetail}
      >
        📖 Lihat Instruksi Subtest
      </button>

      {/* Render deskripsi subtest jika toggle aktif */}
      {/* {showDesc && (
        <div
          className={styles.subtestDesc}
          dangerouslySetInnerHTML={{ __html: subtestDesc }}
          style={{ marginBottom: "24px", padding: "12px", border: "1px solid #ccc", borderRadius: "12px", background: "#f9f9f9" }}
        />
      )} */}
      {/* Render soal */}
      {question.content.match(/\.(jpg|jpeg|png|gif)$/i) ? (
        <img
          src={question.content}
          alt="Soal"
          className={styles.questionImage}
          style={{ maxWidth: "100%", marginBottom: "16px", borderRadius: "12px" }}
        />
      ) : (
        <p style={{ fontSize: "18px", marginBottom: "16px" }}>{question.content}</p>
      )}

      {/* Render jawaban */}
      {question.type === "essay" ? (
        <textarea
          value={answer || ""}
          onChange={(e) => onAnswer(question.id, e.target.value)}
          className={styles.textarea}
          placeholder="Ketik jawaban Anda..."
          style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #ccc" }}
        />
      ) : (
        <ul className={styles.optionsList}>
          {optionIndices.map((idx) => {
            const inputType = isMC ? "checkbox" : "radio";

            const valueForBackend = isMC || isImageQuestion
              ? question.options![idx]
              : String.fromCharCode(65 + idx);

            const displayContent = question.options![idx].match(/\.(jpg|jpeg|png|gif)$/i)
              ? <img
                  src={question.options![idx]}
                  alt={String.fromCharCode(65 + idx)}
                  className={styles.optionImage}
                  style={{ maxWidth: "150px", height: "auto", borderRadius: "8px" }}
                />
              : (!isMC ? `${String.fromCharCode(65 + idx)}) ${question.options![idx]}` : question.options![idx]);

            const isChecked = isMC
              ? Array.isArray(answer) && answer.includes(valueForBackend)
              : answer === valueForBackend;

            return (
              <li key={idx}>
                <label className={styles.optionLabel}>
                  <input
                    type={inputType}
                    name={`question-${question.id}`}
                    value={valueForBackend}
                    checked={isChecked}
                    onChange={() => handleOptionChange(idx)}
                  />
                  <span className={styles.optionContent}>
                    {displayContent}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default QuestionCard;

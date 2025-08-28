"use client";

import React, { useState, useEffect } from "react";
import styles from "./Ist.module.css";
import Link from "next/link";

interface Question {
  id: number;
  content: string;
  options: string[];
}

const TesISTPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(6 * 60); // 6 menit → 360 detik

  // Timer hitung mundur
  useEffect(() => {
    if (!showQuestions) return;
    if (timeLeft <= 0) {
      handleSubmit(); // auto submit jika waktu habis
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [showQuestions, timeLeft]);

  const handleStartTest = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tes?type=IST&sub=SE");
      const data = await res.json();
      setQuestions(data.questions || []);
      setShowQuestions(true);
      setTimeLeft(6 * 60); // reset timer saat mulai
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionId: number, choice: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choice }));
  };

  const handleSubmit = () => {
    console.log("Jawaban peserta:", answers);
    alert("Jawaban sudah dikirim (sementara di console).");
    setShowQuestions(false);
  };

  const currentQuestion = questions[currentIndex];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (showQuestions && currentQuestion) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Soal IST - SE</h1>
          <div className={styles.timer}>⏳ {formatTime(timeLeft)}</div>
        </div>

        <div className={styles.mainContent}>
          {/* Bagian soal */}
          <div className={styles.questionSection}>
            <p>
              <b>{currentIndex + 1}. </b>
              {currentQuestion.content}
            </p>
            <ul className={styles.optionsList}>
              {currentQuestion.options?.map((opt) => (
                <li key={opt}>
                  <label>
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={opt}
                      checked={answers[currentQuestion.id] === opt}
                      onChange={() => handleSelectAnswer(currentQuestion.id, opt)}
                    />
                    {opt}
                  </label>
                </li>
              ))}
            </ul>

            <div className={styles.navButtons}>
              <button
                className={styles.backBtn}
                onClick={() => setCurrentIndex((i) => i - 1)}
                disabled={currentIndex === 0}
              >
                ← Back
              </button>
              {currentIndex < questions.length - 1 ? (
                <button
                  className={styles.btn}
                  onClick={() => setCurrentIndex((i) => i + 1)}
                >
                  Next →
                </button>
              ) : (
                <button className={styles.btn} onClick={handleSubmit}>
                  Submit Jawaban
                </button>
              )}
            </div>
          </div>

          {/* Bagian ringkasan jawaban */}
          <div className={styles.answerCard}>
            <h3>Ringkasan Jawaban</h3>
            <div className={styles.answerGrid}>
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  className={`${styles.answerNumber} ${
                    answers[q.id] ? styles.answered : styles.unanswered
                  } ${currentIndex === idx ? styles.current : ""}`}
                  onClick={() => setCurrentIndex(idx)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.introContainer}>
      <h1 className={styles.title}>Tes IST (Intelligence Structure Test)</h1>
      <p className={styles.description}>
        Tes ini bertujuan untuk mengukur inteligensi berdasarkan 9 komponen utama.
      </p>

      <div className={styles.infoBox}>
        <p>
          <b>💰 Harga:</b> Rp 150.000
        </p>
        <p>
          <b>⏳ Durasi:</b> 60 menit (subtes ini: 6 menit)
        </p>
        <button
          className={styles.btn}
          onClick={handleStartTest}
          disabled={loading}
        >
          {loading ? "Memuat soal..." : "Ikuti Tes"}
        </button>
      </div>

      <div className={styles.backWrapper}>
        <Link href="/dashboard">
          <button className={styles.backBtn}>← Kembali</button>
        </Link>
      </div>
    </div>
  );
};

export default TesISTPage;

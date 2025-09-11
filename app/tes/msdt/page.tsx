"use client";

import React, { useState, useEffect } from "react";
import styles from "./msdt.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Question {
  id: number;
  code: string;
  content: string;
  options: string[];
  type: "single";
}

type AnswerPayload = {
  questionId: number;
  choice: string;
};

const TesMSDTPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);

  const [showIntro, setShowIntro] = useState(true);
  const [showQuestions, setShowQuestions] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // ⏳ FIX 30 menit = 1800 detik

  const [testInfo, setTestInfo] = useState<{
    id: number;
    name: string;
    duration: number;
    price: number | null;
  } | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  const [attemptId, setAttemptId] = useState<number | null>(null);

  const router = useRouter();

  // -------------------------
  // Fetch test info MSDT
  // -------------------------
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await fetch("/api/tes/info?type=MSDT");
        const data = await res.json();
        setTestInfo(data);

        const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (savedUser.id) {
          const accessRes = await fetch(
            `/api/tes/check-access?userId=${savedUser.id}&type=MSDT`
          );
          const accessData = await accessRes.json();
          setHasAccess(accessData.access);
        }
      } catch (err) {
        console.error("Gagal fetch info MSDT:", err);
      }
    };
    fetchInfo();
  }, []);

  // -------------------------
  // Load soal MSDT
  // -------------------------
  const loadQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tes?type=MSDT`);
      const data = await res.json();

      const qList: Question[] = Array.isArray(data) ? data : data.questions;
      setQuestions(qList || []);

      // ⏳ Set timer ke 30 menit (override)
      setTimeLeft(30 * 60);
    } catch (err) {
      console.error("Gagal load soal MSDT:", err);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Start Attempt
  // -------------------------
  const startAttempt = async () => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!savedUser.id || !testInfo?.id) return;

    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: savedUser.id,
          testTypeId: testInfo.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memulai attempt");

      setAttemptId(data.id);
    } catch (err) {
      console.error("Gagal memulai attempt:", err);
    }
  };

  // -------------------------
  // Timer
  // -------------------------
  useEffect(() => {
    if (!showQuestions) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleSubmit();
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showQuestions]);

  // -------------------------
  // Save answer
  // -------------------------
  const handleSelectAnswer = (qid: number, choice: string) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev };
      if (prev[qid] === choice) {
        delete newAnswers[qid];
      } else {
        newAnswers[qid] = choice;
      }
      return newAnswers;
    });
  };

  // -------------------------
  // Submit
  // -------------------------
  const handleSubmit = async () => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (!savedUser.id || !attemptId) return;

      const payload: AnswerPayload[] = Object.entries(answers).map(
        ([qid, choice]) => ({
          questionId: Number(qid),
          choice,
        })
      );

      const res = await fetch("/api/tes/submit-msdt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: savedUser.id,
          type: "MSDT",
          attemptId,
          answers: payload,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal submit MSDT");

      alert("🎉 Tes MSDT selesai! Hasil bisa dilihat di Dashboard.");
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const currentQuestion = questions[currentIndex];
  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60)
      .toString()
      .padStart(2, "0")}`;

  // -------------------------
  // Render
  // -------------------------
  if (showIntro) {
    return (
      <div className={styles.introContainer}>
        <h1 className={styles.title}>
          Tes MSDT (Minnesota Supervisor Diagnostic Test)
        </h1>
        <p className={styles.description}>
          Tes ini terdiri dari 64 soal, masing-masing dengan dua pilihan A atau
          B.
        </p>
        <p>
          <b>⏳ Durasi:</b> 30 menit
        </p>

        {!hasAccess ? (
          <button
            className={styles.btn}
            onClick={async () => {
              const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
              if (!savedUser.id || !testInfo?.id) return;

            const payRes = await fetch("/api/payment/start", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userId: savedUser.id,
    testTypeId: testInfo.id,
  }),
});
const payData = await payRes.json();
if (!payRes.ok || !payData.success) {
  alert("❌ Pembayaran gagal!");
  return;
}

// ✅ Kirim paymentId ke attempt
const attemptRes = await fetch("/api/attempts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userId: savedUser.id,
    testTypeId: testInfo.id,
    paymentId: payData.payment.id, // <--- ini harus ada
  }),
});
const attemptData = await attemptRes.json();
setAttemptId(attemptData.id);


              alert("✅ Pembayaran berhasil! Anda bisa mengikuti tes.");
              setHasAccess(true);

              await startAttempt();
              await loadQuestions();
              setShowIntro(false);
              setShowQuestions(true);
            }}
          >
            Bayar untuk Ikut Tes
          </button>
        ) : (
          <button
            className={styles.btn}
            onClick={async () => {
              await startAttempt();
              await loadQuestions();
              setShowIntro(false);
              setShowQuestions(true);
            }}
          >
            Mulai Tes
          </button>
        )}

        <div className={styles.backWrapper}>
          <Link href="/dashboard">
            <button className={styles.backBtn}>← Kembali</button>
          </Link>
        </div>
      </div>
    );
  }

  // -------------------------
  // Question View
  // -------------------------
  if (showQuestions && currentQuestion) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Soal MSDT</h1>
          <div className={styles.timer}>⏳ {formatTime(timeLeft)}</div>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.questionSection}>
            <p>
              <b>{currentIndex + 1}. </b>
              {currentQuestion.content}
            </p>

            <ul className={styles.optionsList}>
              {currentQuestion.options.map((opt, idx) => (
                <li key={idx}>
                  <label className={styles.optionLabel}>
                    <input
                      type="radio"
                      name={`q-${currentQuestion.id}`}
                      value={opt}
                      checked={answers[currentQuestion.id] === opt}
                      onChange={() =>
                        handleSelectAnswer(currentQuestion.id, opt)
                      }
                    />
                    <span>{opt}</span>
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
                  Submit Tes
                </button>
              )}
            </div>
          </div>

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

  return null;
};

export default TesMSDTPage;

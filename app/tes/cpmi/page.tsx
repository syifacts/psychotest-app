"use client";

import React, { useState, useEffect } from "react";
import styles from "./cpmi.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CPMIIntro from "../../../components/CPMI/CPMIIntro";

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

const CPMIPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);

  const [showIntro, setShowIntro] = useState(true);
  const [showQuestions, setShowQuestions] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  const [testInfo, setTestInfo] = useState<{ id: number; name: string; duration: number; price: number | null } | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  const [attemptId, setAttemptId] = useState<number | null>(null);

  const router = useRouter();

  // -------------------------
  // Fetch CPMI Test Info
  // -------------------------
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await fetch("/api/tes/info?type=CPMI");
        const data = await res.json();
        setTestInfo(data);

        const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (savedUser.id) {
          const accessRes = await fetch(`/api/tes/check-access?userId=${savedUser.id}&type=CPMI`);
          const accessData = await accessRes.json();
          setHasAccess(accessData.access);
        }
      } catch (err) {
        console.error("Gagal fetch info CPMI:", err);
      }
    };
    fetchInfo();
  }, []);

  // -------------------------
  // Load CPMI Questions
  // -------------------------
  const loadQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tes?type=CPMI`);
      const data = await res.json();
      const qList: Question[] = Array.isArray(data) ? data : data.questions;
      setQuestions(qList || []);
      setTimeLeft(testInfo?.duration ? testInfo.duration * 60 : 30 * 60);
    } catch (err) {
      console.error("Gagal load soal CPMI:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingAnswers = async (attemptId: number) => {
    try {
      const res = await fetch(`/api/attempts/${attemptId}`);
      const data = await res.json();

      if (res.ok && data.attempt?.answers) {
        const mapped: Record<number, string> = {};
        data.attempt.answers.forEach((a: any) => {
          const q = questions.find((q) => q.code === a.questionCode);
          if (q) mapped[q.id] = a.choice;
        });
        setAnswers(mapped);
      }
    } catch (err) {
      console.error("❌ Gagal load jawaban:", err);
    }
  };

  // -------------------------
  // Start Attempt
  // -------------------------
  const startAttempt = async () => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!savedUser.id || !testInfo?.id) return;

    localStorage.removeItem("attemptId");
    localStorage.removeItem("endTime");
    localStorage.removeItem("currentIndex");
    setAttemptId(null);
    setAnswers({});
    setCurrentIndex(0);
    setTimeLeft(testInfo.duration ? testInfo.duration * 60 : 30 * 60);

    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: savedUser.id, testTypeId: testInfo.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memulai attempt");

      setAttemptId(data.id);
      localStorage.setItem("attemptId", data.id.toString());

      const duration = testInfo.duration || 30;
      const endTime = new Date();
      endTime.setMinutes(endTime.getMinutes() + duration);
      localStorage.setItem("endTime", endTime.toISOString());

      setCurrentIndex(0);
      localStorage.setItem("currentIndex", "0");

      await loadQuestions();
    } catch (err) {
      console.error("Gagal memulai attempt:", err);
    }
  };

  // -------------------------
  // Timer
  // -------------------------
  useEffect(() => {
    if (!showQuestions) return;

    const savedEnd = localStorage.getItem("endTime");
    if (!savedEnd) return;

    const endTime = new Date(savedEnd);

    const timer = setInterval(() => {
      const diff = Math.max(0, Math.floor((endTime.getTime() - Date.now()) / 1000));
      setTimeLeft(diff);

      if (diff <= 0) {
        handleSubmit();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [showQuestions]);

  // -------------------------
  // Save answer
  // -------------------------
  const handleSelectAnswer = async (qid: number, choice: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: choice }));

    try {
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (!savedUser.id || !attemptId) return;

      await fetch("/api/tes/save-answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: savedUser.id,
          attemptId,
          questionCode: questions.find((q) => q.id === qid)?.code,
          choice,
        }),
      });
    } catch (err) {
      console.error("❌ Gagal simpan jawaban:", err);
    }
  };

  // -------------------------
  // Submit
  // -------------------------
  const handleSubmit = async () => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (!savedUser.id || !attemptId) return;

      const payload: AnswerPayload[] = Object.entries(answers).map(([qid, choice]) => {
        const q = questions.find((q) => q.id === Number(qid));
        return { questionId: Number(qid), questionCode: q?.code, choice };
      });

      const res = await fetch("/api/tes/submit-cpmi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: savedUser.id, type: "CPMI", attemptId, answers: payload }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal submit CPMI");
      const aspekScores = data.aspek;

      localStorage.removeItem("attemptId");
      localStorage.removeItem("endTime");
      localStorage.removeItem("currentIndex");

      alert("🎉 Tes CPMI selesai! Hasil bisa dilihat di Dashboard.");
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message);
      localStorage.removeItem("attemptId");
      localStorage.removeItem("endTime");
      localStorage.removeItem("currentIndex");
    }
  };

  const currentQuestion = questions[currentIndex];
  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // -------------------------
  // Restore attempt on refresh
  // -------------------------
  useEffect(() => {
    const restoreAttempt = async () => {
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const savedAttemptId = localStorage.getItem("attemptId");
      const savedIndex = localStorage.getItem("currentIndex");
      const savedEnd = localStorage.getItem("endTime");

      if (!savedUser.id || !savedAttemptId) return;

      try {
        const res = await fetch(`/api/attempts/${savedAttemptId}`);
        const data = await res.json();

        if (!res.ok || data.attempt?.isCompleted) {
          localStorage.removeItem("attemptId");
          localStorage.removeItem("endTime");
          localStorage.removeItem("currentIndex");
          setAttemptId(null);
          setShowIntro(true);
          setShowQuestions(false);
          setHasAccess(false);
          return;
        }

        setAttemptId(Number(savedAttemptId));
        setCurrentIndex(savedIndex ? Number(savedIndex) : 0);

        if (savedEnd) {
          const endTime = new Date(savedEnd);
          const diff = Math.max(0, Math.floor((endTime.getTime() - Date.now()) / 1000));
          setTimeLeft(diff);
        }

        await loadQuestions();
        await loadExistingAnswers(Number(savedAttemptId));

        setShowIntro(false);
        setShowQuestions(true);
      } catch (err) {
        console.error("Gagal restore attempt:", err);
        localStorage.removeItem("attemptId");
        localStorage.removeItem("endTime");
        localStorage.removeItem("currentIndex");
        setAttemptId(null);
        setShowIntro(true);
        setShowQuestions(false);
        setHasAccess(false);
      }
    };

    restoreAttempt();
  }, []);

  useEffect(() => {
    if (attemptId && questions.length > 0) loadExistingAnswers(attemptId);
  }, [attemptId, questions]);

  useEffect(() => localStorage.setItem("currentIndex", currentIndex.toString()), [currentIndex]);

  // -------------------------
  // Render
  // -------------------------
  if (showIntro) {
    return (
      <CPMIIntro
        testInfo={testInfo}
        hasAccess={hasAccess}
        setHasAccess={setHasAccess}
        startAttempt={async () => {
          await startAttempt();
          setShowIntro(false);
          setShowQuestions(true);
        }}
      />
    );
  }

  if (showQuestions && currentQuestion) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Soal CPMI</h1>
          <div className={styles.timer}>⏳ {formatTime(timeLeft)}</div>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.questionSection}>
            <p><b>{currentIndex + 1}. </b>{currentQuestion.content}</p>
            <ul className={styles.optionsList}>
              {currentQuestion.options.map((opt, idx) => (
                <li key={idx}>
                  <label className={styles.optionLabel}>
                    <input
                      type="radio"
                      name={`q-${currentQuestion.id}`}
                      value={opt}
                      checked={answers[currentQuestion.id] === opt}
                      onChange={() => handleSelectAnswer(currentQuestion.id, opt)}
                    />
                    <span>{opt}</span>
                  </label>
                </li>
              ))}
            </ul>

            <div className={styles.navButtons}>
              <button className={styles.backBtn} onClick={() => setCurrentIndex(i => i - 1)} disabled={currentIndex === 0}>← Back</button>
              {currentIndex < questions.length - 1 ? (
                <button className={styles.btn} onClick={() => setCurrentIndex(i => i + 1)}>Next →</button>
              ) : (
                <button className={styles.btn} onClick={handleSubmit}>Submit Tes</button>
              )}
            </div>
          </div>

          <div className={styles.answerCard}>
            <h3>Ringkasan Jawaban</h3>
            <div className={styles.answerGrid}>
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  className={`${styles.answerNumber} ${answers[q.id] ? styles.answered : styles.unanswered} ${currentIndex === idx ? styles.current : ""}`}
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

export default CPMIPage;

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
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  const [testInfo, setTestInfo] = useState<{
    id: number;
    name: string;
    duration: number;
    price: number | null;
  } | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [user, setUser] = useState<{ id: number } | null>(null);

  const router = useRouter();

  // -------------------------
  // Ambil user & test info
  // -------------------------
  useEffect(() => {
    const fetchUserAndTest = async () => {
      try {
        // ambil user
        const userRes = await fetch("/api/auth/me", { credentials: "include" });
        if (!userRes.ok) return router.push("/login");
        const userData = await userRes.json();
        if (!userData.user) return router.push("/login");
        setUser(userData.user);

        // ambil test info
        const testRes = await fetch("/api/tes/info?type=MSDT");
        const testData = await testRes.json();
        setTestInfo(testData);

        // cek akses
        const accessRes = await fetch(`/api/tes/check-access?userId=${userData.user.id}&type=MSDT`);
        const accessData = await accessRes.json();
        setHasAccess(accessData.access);

      } catch (err) {
        console.error(err);
      }
    };
    fetchUserAndTest();
  }, [router]);

  // -------------------------
  // Load soal
  // -------------------------
  const loadQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tes?type=MSDT`, { credentials: "include" });
      const data = await res.json();
      const qList: Question[] = Array.isArray(data) ? data : data.questions;
      setQuestions(qList || []);
      setTimeLeft(testInfo?.duration ? testInfo.duration * 60 : 30 * 60);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Start Attempt
  // -------------------------
  const startAttempt = async () => {
    if (!user?.id || !testInfo?.id) return;

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
        body: JSON.stringify({ userId: user.id, testTypeId: testInfo.id }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memulai attempt");

      setAttemptId(data.id);
      localStorage.setItem("attemptId", data.id.toString());

      const endTime = new Date();
      endTime.setMinutes(endTime.getMinutes() + (testInfo.duration || 30));
      localStorage.setItem("endTime", endTime.toISOString());

      localStorage.setItem("currentIndex", "0");
      await loadQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------
  // Restore attempt
  // -------------------------
  useEffect(() => {
    const restoreAttempt = async () => {
      if (!user) return;

      const savedAttemptId = localStorage.getItem("attemptId");
      const savedIndex = localStorage.getItem("currentIndex");
      const savedEnd = localStorage.getItem("endTime");

      if (!savedAttemptId) return;

      try {
        const res = await fetch(`/api/attempts/${savedAttemptId}`, { credentials: "include" });
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
        if (data.attempt?.answers) {
          const mapped: Record<number, string> = {};
          data.attempt.answers.forEach((a: any) => {
            const q = questions.find((q) => q.code === a.questionCode);
            if (q) mapped[q.id] = a.choice;
          });
          setAnswers(mapped);
        }

        setShowIntro(false);
        setShowQuestions(true);
      } catch (err) {
        console.error(err);
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
  }, [user, questions]);

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
    localStorage.setItem("answers", JSON.stringify({ ...answers, [qid]: choice }));

    if (!user?.id || !attemptId) return;
    try {
      await fetch("/api/tes/save-answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          attemptId,
          questionCode: questions.find((q) => q.id === qid)?.code,
          choice,
        }),
        credentials: "include",
      });
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------
  // Submit test
  // -------------------------
  const handleSubmit = async () => {
    if (!user?.id || !attemptId) return;

    try {
      const payload: AnswerPayload[] = Object.entries(answers).map(([qid, choice]) => ({
        questionId: Number(qid),
        choice,
      }));

      const res = await fetch("/api/tes/submit-msdt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, type: "MSDT", attemptId, answers: payload }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal submit MSDT");

      localStorage.removeItem("attemptId");
      localStorage.removeItem("endTime");
      localStorage.removeItem("currentIndex");
      localStorage.removeItem("answers");

      alert("🎉 Tes MSDT selesai! Hasil bisa dilihat di Dashboard.");
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message);
    }
  };

  useEffect(() => localStorage.setItem("currentIndex", currentIndex.toString()), [currentIndex]);

  const currentQuestion = questions[currentIndex];
  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // -------------------------
  // Render
  // -------------------------
  if (showIntro) {
    return (
      <div className={styles.introContainer}>
        <h1 className={styles.title}>Tes MSDT (Minnesota Supervisor Diagnostic Test)</h1>
        <p className={styles.description}>Tes ini terdiri dari 64 soal, masing-masing dengan dua pilihan A atau B.</p>
        <p><b>⏳ Durasi:</b> 30 menit</p>

        {!hasAccess ? (
          <button className={styles.btn} onClick={startAttempt}>Mulai Tes</button>
        ) : (
          <button className={styles.btn} onClick={() => { setShowIntro(false); setShowQuestions(true); }}>Lanjut Tes</button>
        )}

        <div className={styles.backWrapper}>
          <Link href="/dashboard"><button className={styles.backBtn}>← Kembali</button></Link>
        </div>
      </div>
    );
  }

  if (showQuestions && currentQuestion) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Soal MSDT</h1>
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
                <button key={q.id} className={`${styles.answerNumber} ${answers[q.id] ? styles.answered : styles.unanswered} ${currentIndex === idx ? styles.current : ""}`} onClick={() => setCurrentIndex(idx)}>{idx + 1}</button>
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

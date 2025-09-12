"use client";

import React, { useState, useEffect } from "react";
import styles from "./cpmi.module.css";
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
  questionCode?: string;
  choice: string;
};

const CPMIPage = () => {
  const router = useRouter();

  const [user, setUser] = useState<{ id: number; role: "USER" | "PERUSAHAAN" } | null>(null);
  const [role, setRole] = useState<"USER" | "PERUSAHAAN">("USER");
  const [testInfo, setTestInfo] = useState<{ id: number; name: string; duration: number; price: number | null } | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);

  const [showIntro, setShowIntro] = useState(true);
  const [showQuestions, setShowQuestions] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  const [attemptId, setAttemptId] = useState<number | null>(null);

  // -------------------------
  // Ambil user & test info dari server
  // -------------------------
  useEffect(() => {
    const fetchUserAndTest = async () => {
      try {
        // fetch user
        const userRes = await fetch("/api/auth/me", { credentials: "include" });
        if (!userRes.ok) {
          router.push("/login");
          return;
        }
        const userData = await userRes.json();
        if (!userData.user) {
          router.push("/login");
          return;
        }
        setUser(userData.user);
        setRole(userData.user.role === "PERUSAHAAN" ? "PERUSAHAAN" : "USER");

        // fetch test info
        const testRes = await fetch("/api/tes/info?type=CPMI");
        const testData = await testRes.json();
        setTestInfo(testData);

        // cek akses
        const accessRes = await fetch(`/api/tes/check-access?userId=${userData.user.id}&type=CPMI`);
        const accessData = await accessRes.json();
        setHasAccess(accessData.access);
      } catch (err) {
        console.error("Gagal fetch user/test info CPMI:", err);
      }
    };
    fetchUserAndTest();
  }, [router]);

  // -------------------------
  // Load CPMI Questions
  // -------------------------
  const loadQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tes?type=CPMI`, { credentials: "include" });
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

  // -------------------------
  // Load existing answers
  // -------------------------
  const loadExistingAnswers = async (attemptId: number) => {
    try {
      const res = await fetch(`/api/attempts/${attemptId}`, { credentials: "include" });
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
    if (!testInfo?.id || !user) return;

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
  // Select Answer
  // -------------------------
  const handleSelectAnswer = async (qid: number, choice: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: choice }));

    if (!user || !attemptId) return;

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
      console.error("❌ Gagal simpan jawaban:", err);
    }
  };

  // -------------------------
  // Submit Test
  // -------------------------
  const handleSubmit = async () => {
    if (!user || !attemptId) return;

    try {
      const payload: AnswerPayload[] = Object.entries(answers).map(([qid, choice]) => {
        const q = questions.find((q) => q.id === Number(qid));
        return { questionId: Number(qid), questionCode: q?.code, choice };
      });

      const res = await fetch("/api/tes/submit-cpmi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, type: "CPMI", attemptId, answers: payload }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal submit CPMI");

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

  // -------------------------
  // Restore attempt on refresh
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
  }, [user]);

  useEffect(() => {
    if (attemptId && questions.length > 0) loadExistingAnswers(attemptId);
  }, [attemptId, questions]);

  useEffect(() => localStorage.setItem("currentIndex", currentIndex.toString()), [currentIndex]);

  const currentQuestion = questions[currentIndex];
  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

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
        role={role}
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

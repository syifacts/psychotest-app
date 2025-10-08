"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./msdt.module.css";
import MSDTIntro from "@/components/MSDT/MSDTIntro";
import BiodataForm from "@/components/MSDT/BiodataForm";
import MSDTInstruction from "@/components/MSDT/MSDTInstruction";

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

const TesMSDTPage = () => {
  const router = useRouter();

  const [user, setUser] = useState<{ id: number; role: "USER" | "PERUSAHAAN" } | null>(null);
  const [role, setRole] = useState<"USER" | "PERUSAHAAN">("USER");
  const [testInfo, setTestInfo] = useState<{ id: number; duration: number; name: string } | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessReason, setAccessReason] = useState("");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [attemptId, setAttemptId] = useState<number | null>(null);

  const [showIntro, setShowIntro] = useState(true);
   const [showBiodata, setShowBiodata] = useState(false);   // ✅ tambahan
  const [showInstruction, setShowInstruction] = useState(false); // ✅ tambahan
  const [showQuestions, setShowQuestions] = useState(false);

  // -------------------------
  // Ambil user & test info
  // -------------------------
  useEffect(() => {
    const fetchUserAndTest = async () => {
      try {
        const userRes = await fetch("/api/auth/me", { credentials: "include" });
        if (!userRes.ok) return router.push("/login");
        const userData = await userRes.json();
        if (!userData.user) return router.push("/login");
        setUser(userData.user);
        setRole(userData.user.role === "PERUSAHAAN" ? "PERUSAHAAN" : "USER");

        const testRes = await fetch("/api/tes/info?type=MSDT");
        const testData = await testRes.json();
        setTestInfo(testData);

        const accessRes = await fetch(`/api/tes/check-access?userId=${userData.user.id}&type=MSDT`);
        const accessData = await accessRes.json();
        setHasAccess(accessData.access);
        setAccessReason(accessData.reason || "");
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
    try {
      const res = await fetch(`/api/tes?type=MSDT`, { credentials: "include" });
      const data = await res.json();
      const qList: Question[] = Array.isArray(data) ? data : data.questions;
      setQuestions(qList || []);
      //setTimeLeft(testInfo?.duration ? testInfo.duration * 60 : 30 * 60);
        // ✅ hitung ulang sisa waktu dari endTime
    const savedEnd = localStorage.getItem("endTime");
    if (savedEnd) {
      const diff = Math.max(0, Math.floor((new Date(savedEnd).getTime() - Date.now()) / 1000));
      setTimeLeft(diff);
    } else {
      setTimeLeft(testInfo?.duration ? testInfo.duration * 60 : 30 * 60);
    }
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------
  // Start attempt
  // -------------------------
  const startAttempt = async () => {
    if (!user || !testInfo) return;

    localStorage.removeItem("attemptId");
    localStorage.removeItem("endTime");
    localStorage.removeItem("currentIndex");
    localStorage.setItem("stage", "biodata"); 


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
      setShowIntro(false);
      setShowBiodata(true);

      //setShowQuestions(true);
    } catch (err) {
      console.error(err);
    }
  };
useEffect(() => {
  const savedStage = localStorage.getItem("stage");
  const savedAttemptId = localStorage.getItem("attemptId");
  const savedIndex = localStorage.getItem("currentIndex");
  const savedAnswers = localStorage.getItem("answers");

  if (savedAttemptId && savedStage) {
    setAttemptId(Number(savedAttemptId));
   if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers)); // ✅ restore jawaban
    }
    if (savedStage === "biodata") {
      setShowIntro(false);
      setShowBiodata(true);
    } else if (savedStage === "instruction") {
      setShowIntro(false);
      setShowInstruction(true);
    } else if (savedStage === "questions") {
      setShowIntro(false);
      setShowQuestions(true);
      if (savedIndex) setCurrentIndex(Number(savedIndex));
      loadQuestions();
    }
  }
}, []);

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
  // Pilih jawaban
  // -------------------------
  const handleSelectAnswer = async (qid: number, choice: string) => {
    const newAnswers = { ...answers, [qid]: choice };
  setAnswers(newAnswers);
  localStorage.setItem("answers", JSON.stringify(newAnswers)); // ✅ simpan jawaban

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
      console.error(err);
    }
  };
const handleNext = () => {
  setCurrentIndex(i => {
    const newIndex = i + 1;
    localStorage.setItem("currentIndex", newIndex.toString());
    return newIndex;
  });
};

const handleBack = () => {
  setCurrentIndex(i => {
    const newIndex = i - 1;
    localStorage.setItem("currentIndex", newIndex.toString());
    return newIndex;
  });
};

  // -------------------------
  // Submit test
  // -------------------------
  const handleSubmit = async () => {
    if (!user || !attemptId) return;

    try {
      const payload: AnswerPayload[] = Object.entries(answers).map(([qid, choice]) => {
        const q = questions.find((q) => q.id === Number(qid));
        return { questionId: Number(qid), questionCode: q?.code, choice };
      });

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

      setHasAccess(false);
      alert("🎉 Tes MSDT selesai! Hasil bisa dilihat di Dashboard.");
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message);
      setHasAccess(false);
    }
  };

  // -------------------------
  // Render
  // -------------------------
  const currentQuestion = questions[currentIndex];
  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  if (showIntro) {
    return (
      <MSDTIntro
        testInfo={testInfo}
        hasAccess={hasAccess}
        setHasAccess={setHasAccess}
        startAttempt={startAttempt}
        accessReason={accessReason}
        role={role}
      />
    );
  }
   // ✅ setelah start → tampilkan biodata
  if (showBiodata) {
    return (
      <BiodataForm onSaved={() => {
        setShowBiodata(false);
        setShowInstruction(true); // lanjut ke instruksi
        localStorage.setItem("stage", "instruction");

      }} />
    );
  }

   // ✅ setelah biodata → instruksi
if (showInstruction) {
  return (
    <MSDTInstruction
      onStartTest={async () => {
        await loadQuestions();
        setShowInstruction(false);
        setShowQuestions(true);
        localStorage.setItem("stage", "questions");

      }}
    />
  );
}

  if (showQuestions && currentQuestion) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{testInfo?.name || "Tes MSDT"}</h1>
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
  <button
    className={styles.backBtn}
    onClick={handleBack}
    disabled={currentIndex === 0}
  >
    ← Back
  </button>
  {currentIndex < questions.length - 1 ? (
    <button className={styles.btn} onClick={handleNext}>Next →</button>
  ) : (
    <button className={styles.btn} onClick={handleSubmit}>Submit Tes</button>
  )}
</div>
<div className="mt-4 text-center">
  <button
    onClick={() => {
      setShowInstruction(true);
      setShowQuestions(false);
      localStorage.setItem("stage", "instruction");
    }}
    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
  >
    📖 Lihat Instruksi
  </button>
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

export default TesMSDTPage;

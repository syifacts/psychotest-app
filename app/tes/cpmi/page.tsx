"use client";

import React, { useState, useEffect } from "react";
import styles from "./cpmi.module.css";
import { useRouter } from "next/navigation";
import CPMIIntro from "../../../components/CPMI/CPMIIntro";
import CPMIInstruction from "@/components/CPMI/CPMIInstruction";
import BiodataForm from "@/components/CPMI/BiodataForm";

interface Question {
  id: number;
  code: string;
  content: string;
  image: string;
  options: string[];
   type: "single" | "essay";
}

type AnswerPayload = {
  questionId: number;
  questionCode?: string;
  choice: string;
};
type CPMIUser = {
  id: number;
  role: "USER" | "PERUSAHAAN" | "GUEST";
  name?: string;
  email?: string;
};

const CPMIPage = () => {
  const router = useRouter();

  // const [user, setUser] = useState<{ id: number; role: "USER" | "PERUSAHAAN" } | null>(null);
  // const [role, setRole] = useState<"USER" | "PERUSAHAAN">("USER");
  const [user, setUser] = useState<CPMIUser | null>(null);
const [role, setRole] = useState<"USER" | "PERUSAHAAN" | "GUEST">("USER");
  const [testInfo, setTestInfo] = useState<{ id: number; name: string; duration: number; price: number | null } | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessReason, setAccessReason] = useState("");

  const [questions, setQuestions] = useState<Question[]>([]);
const [answers, setAnswers] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);

  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  const [exampleQuestions, setExampleQuestions] = useState<Question[]>([]);
  

  // Step: intro -> biodata -> instruction -> questions
  const [step, setStep] = useState<"intro" | "biodata" | "instruction" | "questions">("intro");

  // -------------------------
  // Fetch user & test info
  // -------------------------
 useEffect(() => {
  const fetchUserAndTest = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      if (token) {
        // Ambil info token
        const tokenRes = await fetch(`/api/token/info?token=${token}`);
        const tokenData = await tokenRes.json();
        if (tokenRes.ok && tokenData.companyName) {
          setUser({ id: 0, name: tokenData.companyName, role: "GUEST", email: "" });
          setRole("GUEST");
          // cek akses otomatis
          setHasAccess(true);
        } else {
          console.warn(tokenData.error);
        }
      } else {
        // Hanya fetch user login kalau tidak ada token
        const userRes = await fetch("/api/auth/me", { credentials: "include" });
        const userData = await userRes.json();
        if (!userRes.ok || !userData.user) return router.push("/login");

        setUser(userData.user);
        setRole(userData.user.role === "PERUSAHAAN" ? "PERUSAHAAN" : "USER");

        // cek akses
        const accessRes = await fetch(`/api/tes/check-access?userId=${userData.user.id}&type=CPMI`);
        const accessData = await accessRes.json();
        setHasAccess(accessData.access);
        setAccessReason(accessData.reason || "");
      }

      // load test info tetap dilakukan
      const testRes = await fetch("/api/tes/info?type=CPMI");
      const testData = await testRes.json();
      setTestInfo(testData);

    } catch (err) {
      console.error("Gagal fetch user/test info CPMI:", err);
    }
  };

  fetchUserAndTest();
}, [router]);


  // -------------------------
  // Load questions
  // -------------------------
const loadQuestions = async (attemptId?: number) => {
  setLoading(true);
  try {
    const res = await fetch(`/api/tes?type=CPMI`, { credentials: "include" });
    const data = await res.json();

    // console.log("API raw questions:", data); // <-- lihat data mentah dari API

    // pastikan ambil array questions
    let qList: Question[] = Array.isArray(data) ? data : data.questions || [];

    // 🔴 FILTER contoh soal (CPMI-1, CPMI-2, CPMI-3)
    qList = qList.filter((q) => !["CPMI-1", "CPMI-2", "CPMI-3"].includes(q.code));

    // 🔹 Pastikan setiap question punya field image (fallback ke "")
    qList = qList.map((q) => ({
      ...q,
      image: q.image || "", // jika undefined atau null, set ke ""
    }));

    console.log("Filtered questions with images:", qList); // <-- cek image sudah ada

    setQuestions(qList || []);
    setTimeLeft(testInfo?.duration ? testInfo.duration * 60 : 30 * 60);

    // cari index soal awal
    const startIndex = qList.findIndex((q) => q.code === "CPMI-4" || q.id === 329);
    setCurrentIndex(startIndex >= 0 ? startIndex : 0);
    localStorage.setItem("currentIndex", (startIndex >= 0 ? startIndex : 0).toString());

    // load jawaban lama jika ada attempt
    if (attemptId) {
      await loadExistingAnswers(attemptId, qList);
    }
  } catch (err) {
    console.error("Gagal load soal CPMI:", err);
  } finally {
    setLoading(false);
  }
};


const loadExistingAnswers = async (attemptId: number, qList?: Question[]) => {
  try {
    const res = await fetch(`/api/tes/answers?attemptId=${attemptId}`, {
      credentials: "include",
    });
    const data = await res.json();
    console.log("🔍 API answers:", data.answers);

    if (res.ok && data.answers) {
      // langsung assign object hasil API
      setAnswers(data.answers);
      console.log("✅ restored answers:", data.answers);
    }
  } catch (err) {
    console.error("❌ Gagal load jawaban:", err);
  }
};


  // -------------------------
  // Start attempt
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
    const body: any = { testTypeId: testInfo.id };

    if (role === "GUEST") {
      // ambil guestToken dari URL atau state
      const urlParams = new URLSearchParams(window.location.search);
      const guestToken = urlParams.get("token");
      if (!guestToken) throw new Error("Guest token tidak ditemukan");
      body.guestToken = guestToken;
    } else {
      body.userId = user.id;
    }

    const res = await fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include", // tetap untuk user login
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

    await loadQuestions(data.id); // teruskan attemptId baru

  } catch (err) {
    console.error("Gagal memulai attempt:", err);
  }
};


  // -------------------------
  // Timer
  // -------------------------
  useEffect(() => {
    if (step !== "questions") return;

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
  }, [step]);

  // -------------------------
  // Select answer
  // -------------------------
 // -------------------------
// Select answer
// -------------------------
const handleSelectAnswer = async (
  qid: number,
  qcode: string,
  choice: string,
  optIndex?: number
) => {
  const finalChoice = optIndex !== undefined ? String(optIndex + 1) : choice;

  // simpan ke state pakai qcode
  setAnswers((prev) => ({ ...prev, [qcode]: finalChoice }));

  if (!user || !attemptId) return;

  try {
    await fetch("/api/tes/answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attemptId,
        answers: [{ questionId: qid, choice: finalChoice }],
      }),
      credentials: "include",
    });
  } catch (err) {
    console.error("❌ Gagal simpan jawaban:", err);
  }
};


  // -------------------------
  // Submit
  // -------------------------
  const handleSubmit = async () => {
    if (!user || !attemptId) return;

    try {
     const payload: AnswerPayload[] = Object.entries(answers).map(([qcode, choice]) => {
  const q = questions.find((q) => q.code === qcode);
  return {
    questionId: q?.id ?? 0, // tetap kirim id biar relasi aman
    questionCode: qcode,
    choice: choice,
  };
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
      setHasAccess(false);

      alert("🎉 Tes CPMI selesai! Hasil bisa dilihat di Dashboard.");
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message);
      localStorage.removeItem("attemptId");
      localStorage.removeItem("endTime");
      localStorage.removeItem("currentIndex");
      setHasAccess(false);
    }
  };

  // -------------------------
  // Restore attempt
  // -------------------------
  useEffect(() => {
    const restoreAttempt = async () => {
      if (!user) return;
      const savedAttemptId = localStorage.getItem("attemptId");
      if (!savedAttemptId) return;

      try {
        const res = await fetch(`/api/attempts/${savedAttemptId}`, { credentials: "include" });
        const data = await res.json();

        if (!res.ok || data.attempt?.isCompleted) {
          localStorage.removeItem("attemptId");
          localStorage.removeItem("endTime");
          localStorage.removeItem("currentIndex");
          setAttemptId(null);
          setStep("intro");
          setHasAccess(false);
          return;
        }

        setAttemptId(Number(savedAttemptId));
        const savedIndex = localStorage.getItem("currentIndex");
        setCurrentIndex(savedIndex ? Number(savedIndex) : 0);

        const savedEnd = localStorage.getItem("endTime");
        if (savedEnd) {
          const endTime = new Date(savedEnd);
          const diff = Math.max(0, Math.floor((endTime.getTime() - Date.now()) / 1000));
          setTimeLeft(diff);
        }

        await loadQuestions(Number(savedAttemptId)); // langsung load beserta jawaban lama
setStep("questions");

      } catch (err) {
        console.error("Gagal restore attempt:", err);
        localStorage.removeItem("attemptId");
        localStorage.removeItem("endTime");
        localStorage.removeItem("currentIndex");
        setAttemptId(null);
        setStep("intro");
        setHasAccess(false);
      }
    };
    restoreAttempt();
  }, [user]);

  useEffect(() => {
    localStorage.setItem("currentIndex", currentIndex.toString());
  }, [currentIndex]);

  const currentQuestion = questions[currentIndex];
  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  useEffect(() => {
  const loadExampleQuestions = async () => {
    try {
      const res = await fetch("/api/tes/cpmi-examples");
      const data = await res.json();
      if (res.ok) setExampleQuestions(data);
      else console.warn(data.error);
    } catch (err) {
      console.error("Gagal load contoh soal:", err);
    }
  };

  loadExampleQuestions();
}, []);


  // -------------------------
  // Render
  // -------------------------
  switch (step) {
    case "intro":
      return (
        <CPMIIntro
          testInfo={testInfo}
          hasAccess={hasAccess}
          accessReason={accessReason}
          setHasAccess={setHasAccess}
          startAttempt={async (): Promise<void> => {
  setStep("biodata");
}}

          role={role}
        />
      );

    case "biodata":
      return (
        <BiodataForm
         // userId={user!.id}
          onSaved={() => setStep("instruction")}
        />
      );

    case "instruction":
      return (
        <CPMIInstruction
          exampleQuestions={exampleQuestions}
          onFinishExamples={async () => {
            await startAttempt();
            setStep("questions");
          }}
        />
      );
case "questions":
  if (!currentQuestion) return null;
  // console.log("currentQuestion:", currentQuestion);
  // console.log("currentQuestion.image:", currentQuestion.image); 
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Soal CPMI</h1>
        <div className={styles.timer}>⏳ {formatTime(timeLeft)}</div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.questionSection}>
          {/* Soal */}
 <div className={styles.questionContent}>
  {/* Inline teks + gambar dari content */}
{currentQuestion.content.split("\n").map((line, idx) => {
  const isImage = /\.(png|jpg|jpeg|gif)$/i.test(line.trim());
  return isImage ? (
    <img
      key={idx}
      src={line.trim()}
      alt={`Soal ${currentIndex + 1} part ${idx}`}
      style={{ maxWidth: "300px", display: "block", margin: "10px 0" }}
    />
  ) : (
    <p key={idx} style={{ margin: "5px 0" }}>{line}</p>
  );
})}


{/* Gambar utama soal (jika ada) */}
{currentQuestion.image && (
  <div style={{ marginTop: "15px" }}>
    <img
      src={currentQuestion.image}
      alt={`Soal ${currentIndex + 1} utama`}
      style={{ maxWidth: "400px", display: "block" }}
    />
    
  </div>
)}


</div>

{/* Opsi */}
{currentQuestion.type === "single" ? (
  <ul className={styles.optionsList}>
    {currentQuestion.options.map((opt, idx) => {
      const isImage = opt.startsWith("/") || /\.(png|jpg|jpeg|gif)$/i.test(opt);
      return (
        <li key={idx}>
          <label className={styles.optionLabel}>
            <input
              type="radio"
              name={`q-${currentQuestion.id}`}
              value={idx + 1}
              checked={answers[currentQuestion.code] === String(idx + 1)}
              onChange={() =>
                handleSelectAnswer(currentQuestion.id, currentQuestion.code, String(idx + 1))
              }
            />
            <span>
              {isImage ? (
                <img
                  src={opt}
                  alt={`Pilihan ${idx + 1}`}
                  style={{ maxWidth: "150px", display: "block", marginTop: "5px" }}
                />
              ) : (
                `${idx + 1}. ${opt}`
              )}
            </span>
          </label>
        </li>
      );
    })}
  </ul>
) : (
  <textarea
    className={styles.essayInput}
    value={answers[currentQuestion.code] || ""}
    onChange={(e) =>
      handleSelectAnswer(currentQuestion.id, currentQuestion.code, e.target.value)
    }
    placeholder="Tuliskan jawaban Anda di sini..."
    rows={5}
  />

          )}

          {/* Navigasi Back / Next / Submit */}
          <div className={styles.navButtons}>
            <button
              className={styles.backBtn}
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
            >
              ← Back
            </button>
            {currentIndex < questions.length - 1 ? (
              <button className={styles.btn} onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}>
                Next →
              </button>
            ) : (
              <button className={styles.btn} onClick={handleSubmit}>Submit Tes</button>
            )}
          </div>
        </div>

        {/* Ringkasan Jawaban */}
        <div className={styles.answerCard}>
          <h3>Ringkasan Jawaban</h3>
          <div className={styles.answerGrid}>
            {questions.map((q, idx) => (
              <button
                key={q.id}
                className={`${styles.answerNumber} ${
                  answers[q.code] ? styles.answered : styles.unanswered
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
  }}
export default CPMIPage;

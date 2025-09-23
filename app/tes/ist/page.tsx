"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import styles from "./Ist.module.css";
import TestIntro from "@/components/IST/TestIntro";
import UserProfileForm from "@/components/IST/UserProfileForm";
import SubtestDetail from "@/components/IST/SubtestDetail";
import QuestionCard from "@/components/IST/QuestionCard";
import AnswerSummary from "@/components/IST/AnswerSummary";

interface Question {
  id: number;
  code: string;
  content: string;
  options: string[];
  type: "single" | "mc" | "essay" | "image";
}

interface SubtestInfo {
  name: string;
  description: string;
  durationMinutes: number;
}

type AnswerMap = Record<number, string | string[]>;

const TesISTPage = () => {
  const router = useRouter();

  // ------------------------- STATE -------------------------
  const [user, setUser] = useState<{ id: number; role: string } | null>(null);
  const [testInfo, setTestInfo] = useState<{ id: number; name: string; duration: number; price: number | null } | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [alreadyTaken, setAlreadyTaken] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});

  const [showIntro, setShowIntro] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSubtestDetail, setShowSubtestDetail] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);

  const [currentSubtest, setCurrentSubtest] = useState<SubtestInfo | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [testDate, setTestDate] = useState("");
  const [checkReason, setCheckReason] = useState(""); // ✅
  const [attemptId, setAttemptId] = useState<number | null>(null);



  // ------------------------- UTIL -------------------------
  const calculateAge = (dob: string) => {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // -------------------------
  // Fetch user & test info (middleware)
  // -------------------------
useEffect(() => {
  const fetchUserAndTest = async () => {
    try {
      const userRes = await fetch("/api/auth/me", { credentials: "include" });
if (!userRes.ok) return router.push("/login");

const userData = await userRes.json();

// **GUEST boleh lanjut**
if (!userData.user && !window.location.pathname.startsWith("/tes")) {
  return router.push("/login");
}

setUser(userData.user); // bisa { role: "GUEST" }


      setUser(userData.user);
      setFullName(userData.user.fullName || "");
      setBirthDate(userData.user.birthDate ? new Date(userData.user.birthDate).toISOString().split("T")[0] : "");
      setTestDate(new Date().toLocaleDateString("id-ID"));

      // fetch test info
      const testRes = await fetch("/api/tes/info?type=IST");
      const testData = await testRes.json();
      setTestInfo(testData);

      // check access
      const accessRes = await fetch(`/api/tes/check-access?userId=${userData.user.id}&type=IST`);
      const accessData = await accessRes.json();
      setHasAccess(accessData.access);
      setCheckReason(accessData.reason || "");

      if (!accessData.access) return;

      // ambil attempt terakhir
      const attemptRes = await fetch(`/api/attempts?userId=${userData.user.id}&testTypeId=${testData.id}`);
      const attempts = await attemptRes.json();
      const activeAttempt = attempts.find((a: any) => !a.isCompleted); // pilih attempt yg belum selesai
      if (activeAttempt) {
        setAttemptId(activeAttempt.id); // simpan attempt aktif

        // ambil progress
        const progressRes = await fetch(`/api/tes/progress?userId=${userData.user.id}&type=IST`);
        const progress = await progressRes.json();

        if (progress.isCompleted) {
          setAlreadyTaken(true);
          return;
        }

        if (progress.nextSubtest) {
          setCurrentSubtest({
            name: progress.nextSubtest,
            description: "Deskripsi subtest...",
            durationMinutes: progress.durationMinutes || 6,
          });

          // load soal & jawaban lama
          await loadQuestions(progress.nextSubtest, userData.user.id, activeAttempt.id);

          // atur timer
          if (progress.startTime) {
            const endTime = new Date(progress.startTime);
            endTime.setMinutes(endTime.getMinutes() + (progress.durationMinutes || 6));
            const secondsLeft = Math.floor((endTime.getTime() - Date.now()) / 1000);
            setTimeLeft(secondsLeft > 0 ? secondsLeft : 0);
          }

          // set index soal terakhir
          setCurrentIndex(progress.nextQuestionIndex || 0);

          // tampilkan soal
          setShowIntro(false);
          setShowForm(false);
          setShowSubtestDetail(false);
          setShowQuestions(true);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  fetchUserAndTest();
}, [router]);


 const [quantity, setQuantity] = useState(1); // default 1

const handlePayAndFollow = async () => {
  if (!user) {
    alert("Silahkan login terlebih dahulu untuk membeli test!");
    return router.push("/login");
  }

  if (user.role === "GUEST") {
    alert("Silahkan login terlebih dahulu untuk membeli test!");
    return router.push("/login");
  }

  if (!testInfo) return;

  try {
    // 1️⃣ Mulai pembayaran
    const res = await fetch("/api/payment/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        testTypeId: testInfo.id,
        quantity: user.role === "PERUSAHAAN" ? quantity : 1,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Gagal bayar");
    }

    console.log("Payment berhasil:", data.payment);
    alert("✅ Pembayaran berhasil!");

    setHasAccess(true);
    setAlreadyTaken(false);
    setCheckReason(data.reason || "Sudah bayar sendiri");
    handleFollowTest();
  } catch (err: any) {
    console.error(err);
    alert("Pembayaran gagal: " + err.message);
  }
};



  // -------------------------
  // Load Questions
  // -------------------------
  const loadQuestions = async (subtestName: string, userId: number, attemptId?: number) => {
  try {
    const res = await fetch(`/api/tes?type=IST&sub=${subtestName}`);
    const data: { questions: Question[] } = await res.json();
    setQuestions(data.questions || []);

    if (attemptId) {
      const answerRes = await fetch(`/api/tes/answers?attemptId=${attemptId}&type=IST&sub=${subtestName}`);
      const savedAnswersData: { answers: Record<string, string> } = await answerRes.json();

      const answersMap: AnswerMap = {};
      if (savedAnswersData.answers) {
        Object.entries(savedAnswersData.answers).forEach(([questionCode, choice]) => {
          const q = data.questions.find(q => q.code === questionCode);
          if (!q) return;
          const parsedChoice: string | string[] = choice.includes(",") ? choice.split(",") : choice;
          answersMap[q.id] = parsedChoice;
        });
      }
      setAnswers(answersMap);
    } else {
      setAnswers({}); // jika attempt baru, kosongkan jawaban lama
    }
  } catch (err) {
    console.error("Gagal load questions:", err);
  }
};

  // -------------------------
  // Timer
  // -------------------------
  useEffect(() => {
    if (!showQuestions) return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
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
  // Handlers
  // -------------------------
  const handleFollowTest = () => {
    setShowIntro(false);
    setShowForm(true);
    if (!currentSubtest && testInfo?.id) {
      setCurrentSubtest({
        name: "SE",
        description: "Deskripsi subtest pertama...",
        durationMinutes: 6,
      });
    }
  };

const handleStartSubtest = async () => {
  if (!currentSubtest || !user || !testInfo) return;

  try {
    // 1️⃣ Buat attempt baru
    const attemptRes = await fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        testTypeId: testInfo.id,
      }),
    });

    const newAttempt = await attemptRes.json();
    if (!attemptRes.ok || !newAttempt.id) throw new Error("Gagal buat attempt baru");

    setAttemptId(newAttempt.id); // simpan attempt baru di state

    // 2️⃣ Load soal
    await loadQuestions(currentSubtest.name, user.id, newAttempt.id);

    // 3️⃣ Atur timer
    setTimeLeft(currentSubtest.durationMinutes * 60);

    // 4️⃣ Tampilkan soal
    setShowSubtestDetail(false);
    setShowQuestions(true);

    // 5️⃣ Simpan start time di backend
    await fetch("/api/tes/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, attemptId: newAttempt.id, subtest: currentSubtest.name }),
    });

  } catch (err) {
    console.error(err);
  }
};


  const handleSaveProfile = async () => {
    if (!user) return;
    if (!fullName || !birthDate) return alert("Nama lengkap dan tanggal lahir wajib diisi!");
    try {
      const res = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, birthDate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal simpan data diri");
      setShowForm(false);
      setShowSubtestDetail(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectAnswer = (qid: number, choice: string | string[]) => {
    setAnswers(prev => ({ ...prev, [qid]: choice }));
    if (!user) return;
    saveAnswerToBackend(qid, choice);
  };

const saveAnswerToBackend = async (qid: number, choice: string | string[]) => {
  if (!user || !attemptId) return;

  try {
    await fetch("/api/tes/answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        attemptId, // pakai state
        answers: [{ questionId: qid, choice: Array.isArray(choice) ? choice.join(",") : choice }],
      }),
    });
  } catch (err) {
    console.error(err);
  }
};

 const handleSubmit = async () => {
  if (!user || !currentSubtest) return;

  try {
    // 1️⃣ Kirim jawaban subtest saat ini
    const payload = Object.entries(answers).map(([qid, choice]) => ({
      questionId: Number(qid),
      choice: Array.isArray(choice) ? choice.join(",") : choice,
    }));

    const res = await fetch("/api/tes/submit-subtest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        type: "IST",
        subtest: currentSubtest.name,
        answers: payload,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal submit jawaban");

    alert(`✅ Subtest ${currentSubtest.name} selesai!`);
    setAnswers({});
    setCurrentIndex(0);

    // 2️⃣ Ambil progress terbaru untuk tahu subtest berikutnya
    const progressRes = await fetch(`/api/tes/progress?userId=${user.id}&type=IST`);
    const progress = await progressRes.json();

    if (progress.nextSubtest) {
      // set subtest berikutnya
      setCurrentSubtest({
        name: progress.nextSubtest,
        description: "Deskripsi subtest...",
        durationMinutes: progress.durationMinutes || 6,
      });
      setShowSubtestDetail(true);
      setShowQuestions(false);
    } else {
      // semua subtest selesai
      await fetch("/api/tes/submit-finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, type: "IST" }),
      });
      alert("🎉 Tes IST selesai! Hasil ada di Dashboard.");
      router.push("/dashboard");
    }
  } catch (err: any) {
    alert(err.message);
  }
};


// -------------------------
// Render
// -------------------------
if (showIntro)
  return (
    <TestIntro
      testInfo={testInfo}
      hasAccess={hasAccess}
      alreadyTaken={alreadyTaken}
      onFollowTest={handleFollowTest}
      onPayAndFollow={handlePayAndFollow} // callback menerima quantity
        role={user?.role === "PERUSAHAAN" ? "PERUSAHAAN" : "USER"}
  quantity={quantity}            // ✅ dikirim
  setQuantity={setQuantity}      // ✅ dikirim
  checkReason={checkReason} // ✅
    />
  );

if (showForm)
  return (
    <UserProfileForm
      fullName={fullName}
      birthDate={birthDate}
      testDate={testDate}
      calculateAge={calculateAge}
      onSave={handleSaveProfile}
    />
  );

if (showSubtestDetail && currentSubtest)
  return <SubtestDetail subtest={currentSubtest} onStart={handleStartSubtest} />;

if (showQuestions && currentSubtest) {
  const currentQuestion = questions[currentIndex];
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Soal IST - {currentSubtest.name}</h1>
        <div className={styles.timer}>⏳ {formatTime(timeLeft)}</div>
      </div>

      <div className={styles.mainContent}>
        <div style={{ flex: 3, display: "flex", flexDirection: "column", gap: "20px" }}>
          {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              answer={answers[currentQuestion.id]}
              onAnswer={handleSelectAnswer}
            />
          )}

          <div className={styles.navButtons}>
            <button
              className={styles.backBtn}
              onClick={() => setCurrentIndex((i) => i - 1)}
              disabled={currentIndex === 0}
            >
              ← Back
            </button>
            {currentIndex < questions.length - 1 ? (
              <button className={styles.btn} onClick={() => setCurrentIndex((i) => i + 1)}>
                Next →
              </button>
            ) : (
              <button className={styles.btn} onClick={handleSubmit}>
                Submit Subtest
              </button>
            )}
          </div>
        </div>

        <AnswerSummary
          questions={questions}
          answers={answers}
          currentIndex={currentIndex}
          onSelect={setCurrentIndex}
        />
      </div>
    </div>
  );
}

return null;
};

export default TesISTPage;

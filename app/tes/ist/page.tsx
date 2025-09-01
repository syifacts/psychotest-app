"use client";

import React, { useState, useEffect } from "react";
import styles from "./Ist.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Question {
  id: number;
  content: string;
  options: string[];
}

interface SubtestInfo {
  name: string;
  description: string;
  durationMinutes: number;
}

type AnswerPayload = {
  questionId: number;
  choice: string;
};

const TesISTPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);

  const [showIntro, setShowIntro] = useState(true); // tahap 1
  const [showSubtestDetail, setShowSubtestDetail] = useState(false); // tahap 2
  const [showForm, setShowForm] = useState(false); // tahap 3
  const [showQuestions, setShowQuestions] = useState(false); // tahap 4

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); 

  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const [currentSubtest, setCurrentSubtest] = useState<SubtestInfo | null>(null);
const [typeTestDuration, setTypeTestDuration] = useState(60); // durasi tipe test
const [subtestDuration, setSubtestDuration] = useState(6); // durasi subtest
const [testInfo, setTestInfo] = useState<{ id: number; name: string; duration: number; price: number | null } | null>(null);
const [hasAccess, setHasAccess] = useState(false);


  const router = useRouter();

  // -------------------------
  // Fetch progress & info subtest pertama
  // -------------------------
  const [alreadyTaken, setAlreadyTaken] = useState(false);
  const fetchProgress = async () => {
  try {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!savedUser.id) return;

    const res = await fetch(`/api/tes/progress?userId=${savedUser.id}&type=IST`);
    const data = await res.json();

    if (data.isCompleted) {
      setAlreadyTaken(true); // ✅ tandai pernah ikut
    }

    setTypeTestDuration(data.durationMinutes ?? typeTestDuration);

    if (data.nextSubtest) {
      setCurrentSubtest({
        name: data.nextSubtest,
        description: "Deskripsi subtest...",
        durationMinutes: data.durationMinutes || 6,
      });

      // Jika user sedang mengerjakan subtest
      if (data.startTime) {
        setShowIntro(false);
        setShowSubtestDetail(false);
        setShowForm(false);
        setShowQuestions(true);

        // Load soal + restore jawaban
        await loadQuestions(data.nextSubtest);

        // Hitung sisa waktu dari startTime
        const endTime = new Date(data.startTime);
        endTime.setMinutes(endTime.getMinutes() + (data.durationMinutes || 6));
        const secondsLeft = Math.floor((endTime.getTime() - new Date().getTime()) / 1000);
        setTimeLeft(secondsLeft > 0 ? secondsLeft : 0);

        // Set index soal terakhir yang belum dijawab
        setCurrentIndex(data.nextQuestionIndex || 0);
      }
    }
  } catch (err) {
    console.error("Gagal fetch progress:", err);
  }
};



  useEffect(() => {
    fetchProgress();
  }, []);
useEffect(() => {
  const fetchTestInfo = async () => {
    try {
      const res = await fetch("/api/tes/info?type=IST");
      const data = await res.json();
      setTestInfo(data);

      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (savedUser.id) {
        const accessRes = await fetch(`/api/tes/check-access?userId=${savedUser.id}&type=IST`);
        const accessData = await accessRes.json();
        setHasAccess(accessData.access);
      }
    } catch (err) {
      console.error("Gagal fetch test info:", err);
    }
  };
  fetchTestInfo();
}, []);

  // -------------------------
  // Load soal subtest
  // -------------------------
const loadQuestions = async (subtest: string) => {
  setLoading(true);
  try {
    // Ambil soal
    const res = await fetch(`/api/tes?type=IST&sub=${subtest}`);
    const data = await res.json();
    setQuestions(data.questions || []);

    // 🔥 Ambil jawaban user dari backend
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (savedUser.id) {
      const answerRes = await fetch(`/api/tes/answers?userId=${savedUser.id}&sub=${subtest}`);
      const savedAnswersData = await answerRes.json();
      setAnswers(savedAnswersData.answers || {});
    }
  } finally {
    setLoading(false);
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
  // Prefill user profile
  // -------------------------
  useEffect(() => {
    if (showForm) {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setFullName(user.fullName || "");
        setBirthDate(user.birthDate ? user.birthDate.split("T")[0] : "");
      }
    }
  }, [showForm]);

  // -------------------------
  // Button "Ikuti Tes"
  // -------------------------
  const handleFollowTest = () => {
    setShowIntro(false);
     setShowForm(true);
    setShowSubtestDetail(false);
    setShowQuestions(false);
  };

  // -------------------------
  // Button "Mulai Mengerjakan"
  // -------------------------
const handleStartSubtest = async () => {
  if (!currentSubtest) return;

  const savedUser = JSON.parse(localStorage.getItem("user") || "{}");

  // 1️⃣ Panggil API start → simpan startTime di DB
  const res = await fetch("/api/tes/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: savedUser.id,
      subtest: currentSubtest.name,
    }),
  });

  const progress = await res.json();

  // 2️⃣ Hitung sisa waktu dari DB (startTime + duration - sekarang)
  const startTime = new Date(progress.startTime).getTime();
  const endTime = startTime + currentSubtest.durationMinutes * 60 * 1000;
  const now = Date.now();
  const remaining = Math.max(0, Math.floor((endTime - now) / 1000));

  setTimeLeft(remaining);

  // 3️⃣ Load soal
  await loadQuestions(currentSubtest.name);

  setShowSubtestDetail(false);
  setShowQuestions(true);
};

  // -------------------------
  // Simpan data diri
  // -------------------------
  const handleSaveProfile = async () => {
  if (!fullName || !birthDate) {
    alert("Nama lengkap dan tanggal lahir wajib diisi!");
    return;
  }
  try {
    const token = localStorage.getItem("token");
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");

    const res = await fetch("/api/user/update-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fullName, birthDate }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal simpan data diri");

    localStorage.setItem(
      "user",
      JSON.stringify({ ...savedUser, fullName, birthDate })
    );

    // 🔥 Panggil API start untuk simpan startTime di DB
    if (currentSubtest) {
      await fetch("/api/tes/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: savedUser.id,
          subtest: currentSubtest.name,
        }),
      });

      // Load soal dari backend
      await loadQuestions(currentSubtest.name);

      // Timer sekarang dihitung dari startTime di DB, 
      // bukan langsung set di sini
      // Jadi cukup setShowForm(false) → nanti fetchProgress hitung ulang
    }

    setShowForm(false);
    setShowSubtestDetail(true);
    setShowQuestions(false);
  } catch (err) {
    console.error(err);
  }
};


  // -------------------------
  // Select jawaban
  // -------------------------
  // -------------------------
// Select jawaban (klik lagi → undo)
// -------------------------
const handleSelectAnswer = async (qid: number, choice: string) => {
  setAnswers((prev) => {
    const newAnswers = { ...prev };
    // Jika jawaban sama dengan sebelumnya → hapus (undo)
    if (prev[qid] === choice) {
      delete newAnswers[qid];
    } else {
      newAnswers[qid] = choice;
    }
    return newAnswers;
  });

  // Kirim ke backend tetap optional, bisa hapus juga jika undo
  const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
  if (!savedUser.id) return;

  try {
    await fetch("/api/tes/save-answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: savedUser.id,
        questionId: qid,
        choice: answers[qid] === choice ? null : choice, // null artinya hapus jawaban
      }),
    });
  } catch (err) {
    console.error(err);
  }
};


  // -------------------------
  // Submit subtest
  // -------------------------
  const handleSubmit = async () => {
  try {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!savedUser.id || !currentSubtest) return;

    const payload: AnswerPayload[] = Object.entries(answers).map(([qid, choice]) => ({
      questionId: Number(qid),
      choice,
    }));

    const res = await fetch("/api/tes/submit-subtest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: savedUser.id,
        type: "IST",
        subtest: currentSubtest.name,
        answers: payload,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal submit jawaban");

    alert(`Subtest ${currentSubtest.name} selesai!`);

    setAnswers({});
    setCurrentIndex(0);

    // 🔥 ambil progress terbaru
    const progressRes = await fetch(`/api/tes/progress?userId=${savedUser.id}&type=IST`);
    const progress = await progressRes.json();

    if (progress.nextSubtest) {
      // langsung lanjut ke subtest berikutnya
      setCurrentSubtest({
        name: progress.nextSubtest,
        description: "Deskripsi subtest...",
        durationMinutes: progress.durationMinutes || 6,
      });

      // langsung masuk ke detail subtest berikutnya
      setShowQuestions(false);
      setShowIntro(false);
      setShowForm(false);
      setShowSubtestDetail(true);
    } else {
  // Hitung total skor dari semua subtest
  try {
    const totalRes = await fetch("/api/tes/submit-finish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: savedUser.id, type: "IST" }),
    });
    const totalData = await totalRes.json();
    alert(`Tes IST selesai! Total skor: ${totalData.totalScore}`);
  } catch (err) {
    console.error("Gagal submit total skor:", err);
  }

  router.push("/dashboard"); // arahkan ke dashboard/hasil
}

  } catch (err: any) {
    alert(err.message);
  }
};

  const currentQuestion = questions[currentIndex];
  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // -------------------------
  // RENDER
  // -------------------------
  if (showIntro) {
    return (
      <div className={styles.introContainer}>
        <h1 className={styles.title}>Tes IST (Intelligence Structure Test)</h1>
        <p className={styles.description}>
          Tes ini bertujuan untuk mengukur inteligensi berdasarkan 9 komponen utama.
        </p>
        <div className={styles.infoBox}>
          <p>
  <b>💰 Harga:</b>{" "}
  {testInfo?.price && testInfo.price > 0
    ? `Rp ${testInfo.price.toLocaleString("id-ID")}`
    : "Gratis"}
</p>
<p>
  <b>⏳ Durasi:</b> {testInfo?.duration ?? typeTestDuration} menit
</p>

{alreadyTaken && (
  <p className="text-red-500 font-semibold mt-2">
    ⚠️ Anda sudah pernah mengikutinya
  </p>
)}

{!hasAccess ? (
  <button
    className={styles.btn}
    onClick={async () => {
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const res = await fetch("/api/payment/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: savedUser.id, testTypeId: testInfo?.id }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Pembayaran berhasil diverifikasi!");
        setHasAccess(true);
      }
    }}
  >
    Bayar untuk Ikut Tes
  </button>
) : (
  <button className={styles.btn} onClick={handleFollowTest}>
    Ikuti Tes
  </button>
)}

        </div>
        <div className={styles.backWrapper}>
          <Link href="/dashboard">
            <button className={styles.backBtn}>← Kembali</button>
          </Link>
        </div>
      </div>
    );
  }

  if (showSubtestDetail && currentSubtest) {
    return (
      <div className={styles.introContainer}>
        <h2 className={styles.title}>Subtest {currentSubtest.name}</h2>
        <p>{currentSubtest.description}</p>
        <p><b>⏳ Durasi subtest:</b> {currentSubtest.durationMinutes} menit</p>
        <button className={styles.btn} onClick={handleStartSubtest}>Mulai Mengerjakan</button>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className={styles.introContainer}>
        <h2 className={styles.title}>Lengkapi Data Diri</h2>
        <div className={styles.formGroup}>
          <label>Nama Lengkap</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Tanggal Lahir</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <button className={styles.btn} onClick={handleSaveProfile}>
          Simpan Data Diri & Mulai Tes
        </button>
      </div>
    );
  }

  if (showQuestions && currentQuestion) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Soal IST - {currentSubtest?.name}</h1>
          <div className={styles.timer}>⏳ {formatTime(timeLeft)}</div>
        </div>

        <div className={styles.mainContent}>
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
                  Submit Subtest
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

export default TesISTPage;

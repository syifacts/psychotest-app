"use client";

import React, { useState, useEffect } from "react";
import styles from "./Ist.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Question {
  id: number;
  code: string; 
  content: string;        // teks soal atau URL gambar
  options: string[];      // teks atau URL gambar
  type: "single" | "mc" | "essay" | "image"; // atau "single" untuk imageQuestion juga
  answerScores?: { keyword: string; score: number }[]; // untuk essay
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
  // Ubah tipe state answers:
const [answers, setAnswers] = useState<Record<number, string | string[]>>({});

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

    // 1️⃣ Cek apakah user sudah bayar
    const accessRes = await fetch(`/api/tes/check-access?userId=${savedUser.id}&type=IST`);
    const accessData = await accessRes.json();
    setHasAccess(accessData.access);

    // 2️⃣ Kalau belum bayar, jangan lanjut load soal
    if (!accessData.access) return;

    // 3️⃣ Ambil progress user
    const res = await fetch(`/api/tes/progress?userId=${savedUser.id}&type=IST`);
    const data = await res.json();

    if (data.isCompleted) {
      setAlreadyTaken(true);
      return; // sudah selesai → tidak perlu lanjut
    }

    setTypeTestDuration(data.durationMinutes ?? typeTestDuration);

    if (data.nextSubtest) {
      setCurrentSubtest({
        name: data.nextSubtest,
        description: "Deskripsi subtest...",
        durationMinutes: data.durationMinutes || 6,
      });

      // 4️⃣ Hanya load soal kalau user sedang mengerjakan
      if (data.startTime && !data.isCompleted) {
        await loadQuestions(data.nextSubtest);
        const endTime = new Date(data.startTime);
        endTime.setMinutes(endTime.getMinutes() + (data.durationMinutes || 6));
        const secondsLeft = Math.floor((endTime.getTime() - new Date().getTime()) / 1000);
        setTimeLeft(secondsLeft > 0 ? secondsLeft : 0);

        setCurrentIndex(data.nextQuestionIndex || 0);

        setShowIntro(false);
        setShowForm(false);
        setShowSubtestDetail(false);
        setShowQuestions(true);
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
    const data: { questions: Question[] } = await res.json();
    const loadedQuestions = data.questions || [];
    setQuestions(loadedQuestions);

    // Ambil jawaban user dari backend
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!savedUser.id) return;

    const attemptRes = await fetch(
  `/api/attempts?userId=${savedUser.id}&testTypeId=${testInfo?.id}`
);
const attempts = await attemptRes.json();
const attemptId = attempts[0]?.id; // ambil attempt aktif user

if (attemptId) {
  const answerRes = await fetch(
    `/api/tes/answers?attemptId=${attemptId}&type=IST&sub=${subtest}`
  );
  const savedAnswersData: { answers: Record<string, string> } = await answerRes.json();

  const answersMap: Record<number, string | string[]> = {};
  if (savedAnswersData.answers) {
    Object.entries(savedAnswersData.answers).forEach(([questionCode, choice]) => {
      const q = loadedQuestions.find((q) => q.code === questionCode);
      if (!q) return;

      const parsedChoice: string | string[] =
        choice.includes(",") ? choice.split(",") : choice;

      answersMap[q.id] = parsedChoice;
    });
  }
  setAnswers(answersMap);
}

  } catch (err) {
    console.error("Gagal load questions:", err);
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
    // Jika belum ada currentSubtest, set subtest pertama
  if (!currentSubtest && testInfo?.id) {
    setCurrentSubtest({
      name: "SE", // ambil dari DB subtest pertama
      description: "Deskripsi subtest pertama...",
      durationMinutes: 6,
    });
  }
  };

  // -------------------------
  // Button "Mulai Mengerjakan"
  // -------------------------
const handleStartSubtest = async () => {
  if (!currentSubtest) return;

  const savedUser = JSON.parse(localStorage.getItem("user") || "{}");

  // ⏱️ Optimistic: langsung set timer full duration
  setTimeLeft(currentSubtest.durationMinutes * 60);

  // 🔥 Langsung load soal dulu, biar user bisa lihat tanpa delay
  await loadQuestions(currentSubtest.name);

  // Tampilkan halaman soal
  setShowSubtestDetail(false);
  setShowQuestions(true);

  try {
    // Simpan startTime ke DB
    const res = await fetch("/api/tes/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: savedUser.id,
        subtest: currentSubtest.name,
      }),
    });

    const progress = await res.json();

    // Sync ulang dengan DB (jaga2 kalau server kasih offset)
    const startTime = new Date(progress.startTime).getTime();
    const endTime = startTime + currentSubtest.durationMinutes * 60 * 1000;
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((endTime - now) / 1000));

    setTimeLeft(remaining);
  } catch (err) {
    console.error("Gagal start subtest:", err);
  }
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

    // Pastikan subtest pertama sudah ada
    if (!currentSubtest && testInfo?.id) {
      setCurrentSubtest({
        name: "SE", // ambil subtest pertama dari DB
        description: "Deskripsi subtest pertama...",
        durationMinutes: 6,
      });
    }

    // Baru tampilkan detail subtest
    setShowForm(false);
    setShowSubtestDetail(true);

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
const handleSelectAnswer = async (
  qid: number,
  choice: string,
  type: "single" | "mc" | "essay" | "image"
) => {
  const q = questions.find((qq) => qq.id === qid);
  if (!q) return;

  setAnswers((prev) => {
    const newAnswers: Record<number, string | string[]> = { ...prev };

    if (type === "mc") {
      // Multiple choice → simpan option asli
      const prevChoices: string[] = Array.isArray(prev[qid]) ? prev[qid] : [];
      if (prevChoices.includes(choice)) {
        const filtered = prevChoices.filter((c) => c !== choice);
        if (filtered.length > 0) newAnswers[qid] = filtered;
        else delete newAnswers[qid];
      } else {
        newAnswers[qid] = [...prevChoices, choice];
      }
    } else {
      // SINGLE / ESSAY
      // khusus kalau opsi berupa gambar → ubah jadi huruf (A, B, C, D, ...)
      let finalChoice = choice;
      if (
        type === "single" &&
        q.options.every((opt) => opt.match(/\.(jpg|jpeg|png|gif)$/i)) // semua opsi gambar
      ) {
        const idx = q.options.indexOf(choice);
        if (idx >= 0) {
          finalChoice = String.fromCharCode(65 + idx); // A, B, C, dst
        }
      }

      if (prev[qid] === finalChoice) delete newAnswers[qid];
      else newAnswers[qid] = finalChoice;
    }

    // simpan ke backend
    saveAnswerToBackend(qid, newAnswers[qid]!);

    return newAnswers;
  });
};

const saveAnswerToBackend = async (qid: number, choice: string | string[]) => {
  const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
  if (!savedUser.id) return;

  try {
    const attemptRes = await fetch(
  `/api/attempts?userId=${savedUser.id}&testTypeId=${testInfo?.id}`
);
const attempts = await attemptRes.json();
const attemptId = attempts[0]?.id;
if (!attemptId) return;

await fetch("/api/tes/answers", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userId: savedUser.id,
    attemptId,
    answers: [
      { questionId: qid, choice: Array.isArray(choice) ? choice.join(",") : choice }
    ],
  }),
});

  } catch (err) {
    console.error("Gagal simpan jawaban:", err);
  }
};


  // -------------------------
  // Submit subtest
  // -------------------------
  const handleSubmit = async () => {
  try {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!savedUser.id || !currentSubtest) return;

    // Mapping ke format backend
    const payload: AnswerPayload[] = Object.entries(answers).map(([qid, choice]) => ({
      questionId: Number(qid),
      choice: Array.isArray(choice) ? choice.join(",") : choice,
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

    alert(`✅ Subtest ${currentSubtest.name} selesai!`);

    setAnswers({});
    setCurrentIndex(0);

    // 🔥 ambil progress terbaru
    const progressRes = await fetch(
      `/api/tes/progress?userId=${savedUser.id}&type=IST`
    );
    const progress = await progressRes.json();

   if (progress.nextSubtest) {
  setCurrentSubtest({
    name: progress.nextSubtest,
    description: "Deskripsi subtest...",
    durationMinutes: progress.durationMinutes || 6,
  });
  setShowQuestions(false);
  setShowIntro(false);
  setShowForm(false);
  setShowSubtestDetail(true);
} else {
  // Semua subtest selesai → langsung alert & redirect
  alert("🎉 Tes IST selesai! Hasil ada di Dashboard.");
  router.push("/dashboard");
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
  // Kalau belum bayar
  <button
    className={styles.btn}
    onClick={async () => {
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (!savedUser.id || !testInfo?.id) return;

      // 1️⃣ Trigger payment
      const payRes = await fetch("/api/payment/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: savedUser.id, testTypeId: testInfo.id }),
      });

      const payData = await payRes.json();
      if (!payRes.ok || !payData.success) {
        alert("❌ Pembayaran gagal!");
        return;
      }

      // ✅ Munculkan alert sukses
      alert("✅ Pembayaran berhasil! Anda sekarang bisa mengikuti tes.");

      // 2️⃣ Kalau payment sukses → buat attempt
      await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: savedUser.id,
          testTypeId: testInfo.id,
          paymentId: payData.payment.id, // optional kalau ada
        }),
      });

      setHasAccess(true);
      setShowForm(true);
      setShowIntro(false);
    }}
  >
    Bayar untuk Ikut Tes
  </button>
) : (
  // Kalau sudah punya akses
  <button
    className={styles.btn}
    onClick={async () => {
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (!savedUser.id || !testInfo?.id) return;

      // pastikan attempt ada
      const attemptRes = await fetch(`/api/attempts?userId=${savedUser.id}&testTypeId=${testInfo.id}`);
      const attempts = await attemptRes.json();

      if (!attempts.length) {
        await fetch("/api/attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: savedUser.id, testTypeId: testInfo.id }),
        });
      }

      setShowForm(true);
      setShowIntro(false);
    }}
  >
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
    </p>

   {/* Render content soal */}
{currentQuestion.type === "essay" ? (
  <>
    <p>{currentQuestion.content}</p>
   <textarea
  value={answers[currentQuestion.id] || ""}
  onChange={(e) => {
    const val = e.target.value;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }));
    // langsung simpan ke backend
    saveAnswerToBackend(currentQuestion.id, val);
  }}
  className={styles.textarea}
  placeholder="Ketik jawaban Anda..."
/>

  </>
) : (
  <>
    {/* Render soal gambar jika ada */}
    {currentQuestion.content &&
      currentQuestion.content.match(/\.(jpg|jpeg|png|gif)$/i) && (
        <img
          src={currentQuestion.content}
          alt={`Soal ${currentIndex + 1}`}
          className={styles.questionImage}
        />
      )}

    {/* Render soal teks jika ada dan bukan gambar */}
    {currentQuestion.content &&
      !currentQuestion.content.match(/\.(jpg|jpeg|png|gif)$/i) && (
        <p>{currentQuestion.content}</p>
      )}

  <ul className={styles.optionsList}>
  {currentQuestion.options?.map((opt, idx) => {
    let optionLetter = "";
    const isImageQuestion =
      currentQuestion.content?.match(/\.(jpg|jpeg|png|gif)$/i);
    if (isImageQuestion) {
      optionLetter = String.fromCharCode(65 + idx) + ". ";
    }

    const isImageOption = opt.match(/\.(jpg|jpeg|png|gif)$/i);

    // Tentukan input type
    const inputType = currentQuestion.type === "mc" ? "checkbox" : "radio";

    // Untuk mc, checked: answers[qid] array
    const isChecked =
  currentQuestion.type === "mc"
    ? Array.isArray(answers[currentQuestion.id]) &&
      (answers[currentQuestion.id] as string[]).includes(opt)
    : answers[currentQuestion.id] === opt;


    return (
      <li key={idx}>
        <label className={styles.optionLabel}>
          <input
            type={inputType}
            name={`question-${currentQuestion.id}`}
            value={opt}
            checked={isChecked}
            onChange={() =>
              handleSelectAnswer(currentQuestion.id, opt, currentQuestion.type)
            }
          />
          <span className={styles.optionContent}>
            {optionLetter}
            {isImageOption ? (
              <img src={opt} alt={`Option ${idx + 1}`} className={styles.optionImage} />
            ) : (
              opt
            )}
          </span>
        </label>
      </li>
    );
  })}
</ul>


  </>
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

export default TesISTPage;

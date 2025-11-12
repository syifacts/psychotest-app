"use client";

import React, { useState, useEffect } from "react";
import styles from "./bfi.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BigFiveQuestions, LikertOptions } from "@/prisma/data/BFI/questionBFI";

interface Question {
  id: number;
  content: string;
  type: "single";
}

type AnswerPayload = {
  questionId: number;
  choice: string;
};

const TesBFIPage = () => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showIntro, setShowIntro] = useState(true); // tahap 1
  const [showForm, setShowForm] = useState(false); // tahap 2
  const [showQuestions, setShowQuestions] = useState(false); // tahap 3
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 menit
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [testDate, setTestDate] = useState<string>("");

  const [testInfo, setTestInfo] = useState<{ id: number; name: string; duration: number; price: number | null } | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [alreadyTaken, setAlreadyTaken] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchTestInfo = async () => {
      try {
        const res = await fetch("/api/tes/info?type=BFI");
        const data = await res.json();
        setTestInfo(data);

        const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (savedUser.id) {
          const accessRes = await fetch(`/api/tes/check-access?userId=${savedUser.id}&type=BFI`);
          const accessData = await accessRes.json();
          setHasAccess(accessData.access);
        }
      } catch (err) {
        console.error("Gagal fetch test info:", err);
      }
    };
    fetchTestInfo();
  }, []);

  // Timer
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

  const calculateAge = (dob: string) => {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const handleSaveProfile = () => {
    if (!fullName || !birthDate) {
      alert("Nama lengkap dan tanggal lahir wajib diisi!");
      return;
    }
    setTestDate(new Date().toISOString().split("T")[0]);
    setShowForm(false);
    setShowQuestions(true);
  };

  const handleSelectAnswer = (qid: number, choice: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: choice }));
  };

  const handleSubmit = async () => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (!savedUser.id) return;

      const payload: AnswerPayload[] = Object.entries(answers).map(([qid, choice]) => ({
        questionId: Number(qid),
        choice,
      }));

      const res = await fetch("/api/tes/submit-subtest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: savedUser.id,
          type: "BFI",
          subtest: "BFI",
          answers: payload,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal submit jawaban");

      await fetch("/api/tes/submit-finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: savedUser.id, type: "BFI" }),
      });

      alert("🎉 Tes BFI selesai! Hasil ada di Dashboard.");
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const currentQuestion = BigFiveQuestions[currentIndex];

  // ================== RENDER ==================
  if (showIntro) {
    return (
      <div className={styles.introContainer}>
        <h1 className={styles.title}>Tes BFI (Big Five Inventory)</h1>
        <p className={styles.description}>
          Tes ini bertujuan untuk mengukur kepribadian berdasarkan 5 dimensi utama: Openness,
          Conscientiousness, Extraversion, Agreeableness, dan Neuroticism.
        </p>
        <div className={styles.infoBox}>
          <p>
            <b>💰 Harga:</b>{" "}
            {testInfo?.price && testInfo.price > 0
              ? `Rp ${testInfo.price.toLocaleString("id-ID")}`
              : "Gratis"}
          </p>
          <p>
            <b>⏳ Durasi:</b> 60 menit
          </p>

          {alreadyTaken && (
            <p className="text-red-500 font-semibold mt-2">⚠️ Anda sudah pernah mengikutinya</p>
          )}

          {!hasAccess ? (
            <button
              className={styles.btn}
              onClick={async () => {
                const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
                if (!savedUser.id || !testInfo?.id) return;

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

                alert("✅ Pembayaran berhasil! Anda sekarang bisa mengikuti tes.");

                await fetch("/api/attempts", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    userId: savedUser.id,
                    testTypeId: testInfo.id,
                    paymentId: payData.payment.id,
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
            <button
              className={styles.btn}
              onClick={async () => {
                const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
                if (!savedUser.id || !testInfo?.id) return;

                const attemptRes = await fetch(
                  `/api/attempts?userId=${savedUser.id}&testTypeId=${testInfo.id}`
                );
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

  if (showForm) {
    return (
      <div className={styles.introContainer}>
        <h2 className={styles.title}>Data Diri Peserta</h2>

        <div className={styles.formGroup}>
          <label>Nama Lengkap</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Tanggal Lahir</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className={styles.input}
          />
        </div>

        {birthDate && (
          <div className={styles.formGroup}>
            <label>Usia</label>
            <input type="text" value={`${calculateAge(birthDate)} tahun`} className={styles.input} readOnly />
          </div>
        )}

        {testDate && (
          <div className={styles.formGroup}>
            <label>Tanggal Tes</label>
            <input type="text" value={testDate} className={styles.input} readOnly />
          </div>
        )}

        <button className={styles.btn} onClick={handleSaveProfile}>
          Mulai Tes
        </button>
      </div>
    );
  }

  if (showQuestions && currentQuestion) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Soal BFI</h1>
          <div className={styles.timer}>⏳ {formatTime(timeLeft)}</div>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.questionSection}>
            <p>
              <b>{currentIndex + 1}. </b> {currentQuestion.content}
            </p>

            <ul className={styles.optionsList}>
              {LikertOptions.map((opt) => (
                <li key={opt.value}>
                  <label className={styles.optionLabel}>
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={opt.value}
                      checked={answers[currentQuestion.id] === String(opt.value)}
                      onChange={() => handleSelectAnswer(currentQuestion.id, String(opt.value))}
                    />
                    {opt.label}
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
              {currentIndex < BigFiveQuestions.length - 1 ? (
                <button className={styles.btn} onClick={() => setCurrentIndex((i) => i + 1)}>
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
              {BigFiveQuestions.map((q, idx) => (
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

export default TesBFIPage;

"use client";

import React, { useState, useEffect } from "react";
import styles from "./Mbti.module.css";
import Link from "next/link";

// =======================
// Tipe Data
// =======================
interface Question {
  id: number;
  code: string;
  content: string;
  options: { a: string; b: string };
}

interface TestResult {
  type: string;
  scores: Record<string, number>;
}

// Tipe untuk data soal yang sudah digabung dengan attemptId
type QuestionWithAttempt = Question & { attemptId: number };

// =======================
// Component Tes MBTI
// =======================
const TesMBTIPage = () => {
  const [stage, setStage] = useState<"intro" | "test" | "result">("intro");
  const [testInfo, setTestInfo] = useState<{ id: number; name: string; price: number | null } | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [questions, setQuestions] = useState<QuestionWithAttempt[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // Key: question.code, Value: 'a' atau 'b'
  const [result, setResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =======================
  // Inisialisasi tes
  // =======================
  useEffect(() => {
    const initializeTest = async () => {
      setIsLoading(true);
      try {
        const infoRes = await fetch("/api/tes/info?type=MBTI");
        const infoData = await infoRes.json();
        setTestInfo(infoData);

        const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (savedUser.id) {
          const accessRes = await fetch(`/api/tes/check-access?userId=${savedUser.id}&type=MBTI`);
          const accessData = await accessRes.json();
          setHasAccess(accessData.access);
        }
      } catch (err) {
        console.error("Gagal inisialisasi tes:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initializeTest();
  }, []);

  // =======================
  // Buat attempt baru
  // =======================
  const createAttempt = async () => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!savedUser.id || !testInfo?.id) return null;

    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: savedUser.id, testTypeId: testInfo.id }),
      });

      if (!res.ok) {
        console.error("Gagal membuat attempt di server");
        return null;
      }
      const data = await res.json();
      return data.id;
    } catch (error) {
        console.error("Error saat request pembuatan attempt:", error);
        return null;
    }
  };

  // =======================
  // Simpan jawaban per soal (auto-save)
  // =======================
  const saveMbtiAnswer = async (attemptId: number, questionCode: string, choice: string) => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!attemptId || !savedUser.id) return;

    await fetch("/api/tes/mbti/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: savedUser.id,
        attemptId,
        answers: [{ preferenceQuestionCode: questionCode, choice }],
      }),
    });
  };

  // =======================
  // Logika Mulai Tes
  // =======================
  const handleStartTest = async () => {
    setIsLoading(true);
    try {
      const attemptId = await createAttempt();
      if (!attemptId) throw new Error("Gagal membuat sesi tes (attempt) baru.");

      const res = await fetch("/api/tes/mbti/questions");
      const data = await res.json();

      // Gabungkan attemptId ke setiap soal untuk referensi nanti
      setQuestions(data.map((q: Question) => ({ ...q, attemptId })));
      setAnswers({}); // Reset jawaban setiap memulai tes baru
      setStage("test");
    } catch (err) {
      console.error(err);
      alert("Gagal memulai tes. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // =======================
  // Logika Memilih Jawaban (Telah Diperbaiki)
  // =======================
  const handleAnswerChange = async (questionCode: string, answer: "a" | "b") => {
    const question = questions.find((q) => q.code === questionCode);
    if (!question) return;

    // Simpan jawaban ke state menggunakan `code` soal sebagai key
    setAnswers((prev) => ({ ...prev, [questionCode]: answer }));

    // Kirim jawaban ke backend untuk auto-save
    if (question.attemptId) {
      await saveMbtiAnswer(question.attemptId, questionCode, answer);
    }
  };

  // =======================
  // Submit akhir dan proses scoring
  // =======================
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Ambil attemptId dari soal pertama (semua soal punya attemptId yang sama)
      const attemptId = questions[0]?.attemptId;
      if (!attemptId) throw new Error("Sesi tes (attemptId) tidak ditemukan.");

      const res = await fetch("/api/tes/mbti/scoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mendapatkan hasil skor.");

      setResult({
        type: data.result.resultType,
        scores: data.result.scores,
      });
      setStage("result");
    } catch (err) {
      console.error(err);
      alert("Gagal menghitung skor. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // =======================
  // Render Komponen
  // =======================
  if (isLoading) {
    return <div className={styles.container}>Memuat...</div>;
  }

  if (stage === "intro") {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Tes Kepribadian MBTI</h1>
        <p className={styles.description}>Tes ini dirancang untuk memahami preferensi psikologis Anda.</p>
        <div className={styles.infoBox}>
          <p><b>💰 Harga:</b> {testInfo?.price ? `Rp ${testInfo.price.toLocaleString("id-ID")}` : "Gratis"}</p>
          <button className={styles.btn} onClick={handleStartTest}>
            {hasAccess ? "Mulai Tes" : "Bayar untuk Ikut Tes"}
          </button>
        </div>
        <Link href="/dashboard"><button className={styles.backBtn}>← Kembali</button></Link>
      </div>
    );
  }

  if (stage === "test") {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Pilih yang Paling Sesuai Dengan Diri Anda</h1>
        {questions.map((q, index) => (
          <div key={q.id} className={styles.questionBox}>
            <p><b>{index + 1}.</b> {q.content}</p>
            <div className={styles.optionsContainer}>
              <label className={answers[q.code] === "a" ? styles.selected : ""}>
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  checked={answers[q.code] === "a"}
                  onChange={() => handleAnswerChange(q.code, "a")}
                /> {q.options.a}
              </label>
              <label className={answers[q.code] === "b" ? styles.selected : ""}>
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  checked={answers[q.code] === "b"}
                  onChange={() => handleAnswerChange(q.code, "b")}
                /> {q.options.b}
              </label>
            </div>
          </div>
        ))}
        <button className={styles.btn} onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Memproses..." : "Submit Test"}
        </button>
      </div>
    );
  }

  if (stage === "result" && result) {
    return (
      <div className={styles.container}>
        <div className={styles.resultBox}>
          <h2>Tipe Kepribadian Anda:</h2>
          <h3 className={styles.resultType}>{result.type}</h3>
          <h4>Skor per Dimensi:</h4>
          <ul>
            {Object.entries(result.scores).map(([key, value]) => (
              <li key={key}><b>{key}:</b> {value}%</li>
            ))}
          </ul>
          <p>Terima kasih telah menyelesaikan tes. Hasil lengkap dapat dilihat di dashboard.</p>
          <Link href="/dashboard"><button className={styles.btn}>Kembali ke Dashboard</button></Link>
        </div>
      </div>
    );
  }

  return <div className={styles.container}>Terjadi kesalahan. Silakan coba lagi.</div>;
};

export default TesMBTIPage;
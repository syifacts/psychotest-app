"use client";

import React, { useState, useEffect } from "react";
import styles from "./Mbti.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

// =======================
// Component Tes MBTI
// =======================
const TesMBTIPage = () => {
  // State Management
  const [stage, setStage] = useState<"intro" | "test" | "result">("intro");
  const [testInfo, setTestInfo] = useState<{ id: number; name: string; price: number | null } | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [paymentSuccessful, setPaymentSuccessful] = useState(false); // State baru
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const router = useRouter();

  // ==================================
  // Inisialisasi & Restore Attempt
  // ==================================
  useEffect(() => {
    const initializeOrRestore = async () => {
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (!savedUser.id) {
        alert("Anda harus login terlebih dahulu untuk mengikuti tes.");
        router.push('/login');
        return;
      }

      setLoading(true);
      try {
        const infoRes = await fetch("/api/tes/info?type=MBTI");
        const infoData = await infoRes.json();
        setTestInfo(infoData);
        
        const accessRes = await fetch(`/api/tes/check-access?userId=${savedUser.id}&type=MBTI`);
        const accessData = await accessRes.json();
        setHasAccess(accessData.access);

        const savedAttemptId = localStorage.getItem("mbtiAttemptId");
        if (savedAttemptId) {
          const attemptRes = await fetch(`/api/attempts/${savedAttemptId}`);
          const attemptData = await attemptRes.json();

          if (attemptRes.ok && !attemptData.attempt?.isCompleted) {
            setAttemptId(Number(savedAttemptId));
            await loadQuestionsAndAnswers(Number(savedAttemptId));
            setStage("test");
          } else {
            localStorage.removeItem("mbtiAttemptId");
          }
        }
      } catch (err) {
        console.error("Gagal inisialisasi atau restore tes:", err);
        localStorage.removeItem("mbtiAttemptId");
      } finally {
        setLoading(false);
      }
    };
    initializeOrRestore();
  }, [router]);
  
  const loadQuestionsAndAnswers = async (currentAttemptId: number) => {
    try {
      const questionsRes = await fetch("/api/tes/mbti/questions");
      const questionsData = await questionsRes.json();
      setQuestions(questionsData);

      const answersRes = await fetch(`/api/attempts/${currentAttemptId}`);
      const attemptData = await answersRes.json();

      if (answersRes.ok && attemptData.attempt?.answers) {
        const mappedAnswers: Record<string, string> = {};
        attemptData.attempt.answers.forEach((ans: { preferenceQuestionCode: string; choice: string }) => {
          mappedAnswers[ans.preferenceQuestionCode] = ans.choice;
        });
        setAnswers(mappedAnswers);
      }
    } catch (error) {
      console.error("Gagal memuat soal dan jawaban:", error);
    }
  };

  const startAttempt = async () => {
    setLoading(true);
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!savedUser.id || !testInfo?.id) {
      alert("Sesi pengguna tidak valid."); setLoading(false); return;
    }

    localStorage.removeItem("mbtiAttemptId");

    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: savedUser.id, testTypeId: testInfo.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat sesi tes baru.");

      setAttemptId(data.id);
      localStorage.setItem("mbtiAttemptId", data.id.toString());
      await loadQuestionsAndAnswers(data.id);
      setAnswers({});
      setStage("test");
    } catch (err) {
      console.error("Gagal memulai attempt:", err);
    } finally {
      setLoading(false);
    }
  };
  
  // FUNGSI HANDLEPAYMENT DIUBAH
  const handlePayment = async () => {
    setIsPaying(true);
    try {
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (!savedUser.id || !testInfo?.id) { throw new Error("Sesi pengguna tidak valid."); }
      
      const response = await fetch('/api/payment/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: savedUser.id,
          testTypeId: testInfo.id,
        }),
      });

      const data = await response.json();
      if (!response.ok) { throw new Error(data.error || 'Gagal memproses pembayaran.'); }
      
      if (data.success) {
        alert("Pembayaran berhasil!");
        // Update state, jangan langsung mulai tes
        setHasAccess(true);
        setPaymentSuccessful(true);
      } else {
        throw new Error('Server tidak mengonfirmasi pembayaran.');
      }
    } catch (error: any) {
      console.error("Error saat pembayaran:", error);
      alert(`Terjadi kesalahan: ${error.message}`);
    } finally {
      setIsPaying(false);
    }
  };

  const handleAnswerChange = async (questionCode: string, choice: "a" | "b") => {
    setAnswers((prev) => ({ ...prev, [questionCode]: choice }));
    if (!attemptId) return;
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!savedUser.id) return;
    try {
      await fetch("/api/tes/mbti/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: savedUser.id,
          attemptId,
          answers: [{ preferenceQuestionCode: questionCode, choice }],
        }),
      });
    } catch (error) {
        console.error("Gagal menyimpan jawaban:", error);
    }
  };

  const handleSubmit = async () => {
    if (!attemptId) { return; }
    if (Object.keys(answers).length < questions.length) {
        if (!confirm("Anda belum menjawab semua soal. Yakin ingin submit?")) { return; }
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tes/mbti/scoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mendapatkan hasil skor.");

      setResult({ type: data.result.resultType, scores: data.result.scores });
      localStorage.removeItem("mbtiAttemptId");
      setStage("result");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =======================
  // Render Komponen
  // =======================
  if (loading) {
    return <div className={styles.container}>Memuat...</div>;
  }

  // Tampilan Intro dengan Logika BARU
  if (stage === "intro") {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Tes Kepribadian MBTI</h1>
        <p className={styles.description}>Tes ini dirancang untuk memahami preferensi psikologis Anda.</p>
        <div className={styles.infoBox}>
          <p><b>💰 Harga:</b> {testInfo?.price ? `Rp ${testInfo.price.toLocaleString("id-ID")}` : "Gratis"}</p>
          
          {paymentSuccessful ? (
            // Jika pembayaran BARU SAJA berhasil, tampilkan tombol Mulai Tes
            <button className={styles.btn} onClick={startAttempt}>
              Mulai Tes
            </button>
          ) : (
            // Jika belum bayar (atau sudah bayar di sesi lama), tampilkan tombol Bayar
            <button 
              className={styles.btn} 
              onClick={handlePayment} 
              disabled={isPaying || !testInfo}
            >
              {isPaying ? "Memproses..." : "Bayar untuk Ikut Tes"}
            </button>
          )}

        </div>
        <Link href="/dashboard"><button className={styles.backBtn}>← Kembali</button></Link>
      </div>
    );
  }

  // Sisa render (stage 'test' dan 'result' tidak berubah)
  if (stage === "test") {
    return (
        <div className={styles.container}>
          <h1 className={styles.title}>Pilih yang Paling Sesuai Dengan Diri Anda</h1>
          {questions.map((q, index) => (
            <div key={q.id} className={styles.questionBox}>
              <p><b>{index + 1}.</b> {q.content}</p>
              <div className={styles.optionsContainer}>
                <label className={answers[q.code] === "a" ? styles.selected : ""}>
                  <input type="radio" name={`q-${q.id}`} checked={answers[q.code] === "a"} onChange={() => handleAnswerChange(q.code, "a")}/> {q.options.a}
                </label>
                <label className={answers[q.code] === "b" ? styles.selected : ""}>
                  <input type="radio" name={`q-${q.id}`} checked={answers[q.code] === "b"} onChange={() => handleAnswerChange(q.code, "b")}/> {q.options.b}
                </label>
              </div>
            </div>
          ))}
          <button className={styles.btn} onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Memproses..." : "Lihat Hasil Tes"}
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
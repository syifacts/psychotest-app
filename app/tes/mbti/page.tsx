// "use client";

// import React, { useState, useEffect } from "react";
// import styles from "./Mbti.module.css"; // Gunakan file CSS yang sama
// import Link from "next/link";
// import { useRouter } from "next/navigation";

// // Tipe data untuk soal & hasil
// interface Question {
//   id: number;
//   code: string;
//   content: string;
//   options: { a: string; b: string };
// }
// interface TestResult {
//   type: string;
//   scores: Record<string, number>;
// }
// type UserAnswers = { [questionCode: string]: 'a' | 'b' };

// const TesMBTIPage = () => {
//   // State untuk mengontrol tahapan tes (tahap 'form' dihapus)
//   const [stage, setStage] = useState<'intro' | 'test' | 'result'>('intro');
  
//   // State untuk data tes
//   const [testInfo, setTestInfo] = useState<{ id: number; name: string; price: number | null } | null>(null);
//   const [hasAccess, setHasAccess] = useState(false);

//   // State untuk pengerjaan tes
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [answers, setAnswers] = useState<UserAnswers>({});
//   const [result, setResult] = useState<TestResult | null>(null);
  
//   // State untuk loading
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const router = useRouter();

//   // Efek untuk mengambil info tes & status pembayaran di awal
//   useEffect(() => {
//     const initializeTest = async () => {
//       setIsLoading(true);
//       try {
//         const infoRes = await fetch("/api/tes/info?type=MBTI");
//         const infoData = await infoRes.json();
//         setTestInfo(infoData);

//         const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
//         if (savedUser.id) {
//           const accessRes = await fetch(`/api/tes/check-access?userId=${savedUser.id}&type=MBTI`);
//           const accessData = await accessRes.json();
//           setHasAccess(accessData.access);
//         }
//       } catch (err) {
//         console.error("Gagal inisialisasi tes:", err);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     initializeTest();
//   }, []);

//   // Handler yang memulai tes atau pembayaran
//   const handleStartTest = async () => {
//     const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
//     if (!savedUser.id || !testInfo?.id) {
//       alert("Anda harus login untuk mengikuti tes.");
//       return;
//     }
    
//     // Fungsi untuk memuat soal dan memulai tes
//     const loadAndStartTest = async () => {
//         setIsLoading(true);
//         try {
//             const res = await fetch('/api/tes/mbti/questions');
//             const data = await res.json();
//             setQuestions(data);
//             setStage('test'); // Langsung ke tahap tes
//         } catch (err) {
//             console.error("Gagal memuat soal:", err);
//             alert("Gagal memuat soal. Silakan coba lagi.");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Jika sudah punya akses, langsung mulai
//     if (hasAccess) {
//       await loadAndStartTest();
//     } else {
//       // Jika belum, proses pembayaran dulu
//       try {
//         const res = await fetch("/api/payment/start", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ userId: savedUser.id, testTypeId: testInfo.id }),
//         });
//         const data = await res.json();
//         if (data.success) {
//           alert("Pembayaran berhasil! Tes akan segera dimulai.");
//           setHasAccess(true);
//           await loadAndStartTest(); // Setelah bayar, langsung mulai
//         } else {
//           alert("Pembayaran gagal, silakan coba lagi.");
//         }
//       } catch (err) {
//         console.error("Error pembayaran:", err);
//       }
//     }
//   };

//   const handleAnswerChange = (questionCode: string, answer: 'a' | 'b') => {
//     setAnswers(prev => ({ ...prev, [questionCode]: answer }));
//   };

//   const handleSubmit = async () => {
//     if (Object.keys(answers).length < questions.length) {
//       alert("Harap jawab semua pertanyaan.");
//       return;
//     }
//     setIsSubmitting(true);
//     try {
//       const response = await fetch('/api/tes/mbti/submit', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(answers),
//       });
//       const data = await response.json();
//       setResult(data);
//       setStage('result');
//     } catch (err) {
//       console.error("Gagal submit jawaban:", err);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };
  
//   // RENDER TAHAPAN TES
//   if (isLoading) return <div className={styles.container}>Memuat...</div>;

//   if (stage === 'intro') {
//     return (
//       <div className={styles.container}>
//         <h1 className={styles.title}>Tes Kepribadian MBTI</h1>
//         <p className={styles.description}>
//           Tes ini dirancang untuk memahami preferensi psikologis Anda dalam melihat dunia dan membuat keputusan.
//         </p>
//         <div className={styles.infoBox}>
//           <p><b>💰 Harga:</b> {testInfo?.price ? `Rp ${testInfo.price.toLocaleString("id-ID")}` : "Gratis"}</p>
//           <button className={styles.btn} onClick={handleStartTest}>
//             {hasAccess ? "Mulai Tes" : "Bayar untuk Ikut Tes"}
//           </button>
//         </div>
//         <Link href="/dashboard"><button className={styles.backBtn}>← Kembali</button></Link>
//       </div>
//     );
//   }

//   // TAHAP FORM SUDAH DIHAPUS

//   if (stage === 'test') {
//     return (
//       <div className={styles.container}>
//         <h1 className={styles.title}>Pilih yang Paling Sesuai Dengan Diri Anda</h1>
//         {questions.map((q, index) => (
//           <div key={q.id} className={styles.questionBox}>
//             <p><b>{index + 1}.</b> {q.content}</p>
//             <div className={styles.optionsContainer}>
//               <label className={answers[q.code] === 'a' ? styles.selected : ''}>
//                 <input type="radio" name={q.code} onChange={() => handleAnswerChange(q.code, 'a')} /> {q.options.a}
//               </label>
//               <label className={answers[q.code] === 'b' ? styles.selected : ''}>
//                 <input type="radio" name={q.code} onChange={() => handleAnswerChange(q.code, 'b')} /> {q.options.b}
//               </label>
//             </div>
//           </div>
//         ))}
//         <button className={styles.btn} onClick={handleSubmit} disabled={isSubmitting}>
//           {isSubmitting ? 'Memproses...' : 'Lihat Hasil'}
//         </button>
//       </div>
//     );
//   }

//   if (stage === 'result' && result) {
//     return (
//       <div className={styles.container}>
//         <div className={styles.resultBox}>
//           <h2>Tipe Kepribadian Anda:</h2>
//           <h3 className={styles.resultType}>{result.type}</h3>
//           <p>Terima kasih telah menyelesaikan tes. Hasil lengkap dapat dilihat di halaman dashboard Anda.</p>
//           <Link href="/dashboard"><button className={styles.btn}>Kembali ke Dashboard</button></Link>
//         </div>
//       </div>
//     );
//   }

//   return <div className={styles.container}>Terjadi kesalahan. Silakan coba lagi.</div>;
// };

// export default TesMBTIPage;


// app/tes/mbti/page.tsx
export default function MBTIPage() {
  return <div>Halaman MBTI sedang dalam pengembangan.</div>;
}

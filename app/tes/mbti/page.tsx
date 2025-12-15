// // "use client";

// import React, { useState, useEffect } from "react";
// import styles from "./Mbti.module.css"; 
// import { useRouter } from "next/navigation";
// import Navbar from "../../../components/layout/navbar"; // ❗️❗️ 1. KITA IMPOR NAVBARNYA DI SINI

// // =======================
// // Tipe Data (Baru)
// // =======================

// // Interface Soal MBTI
// interface Question {
//   id: number;
//   code: string; // ini adalah preferenceQuestionCode
//   content: string;
//   options: { a: string; b: string }; // Tipe opsi spesifik MBTI
// }

// // Interface User (dicopy dari CPMI)
// type TestUser = {
//   id: number;
//   role: "USER" | "PERUSAHAAN" | "GUEST";
//   name?: string;
//   email?: string;
// };

// // Interface payload (dicopy dari CPMI)
// type AnswerPayload = {
//   preferenceQuestionCode: string; // Kita akan kirim ini
//   choice: string;
// };

// // =======================
// // Komponen Utama
// // =======================

// const MBTIPage = () => {
//   const router = useRouter();

//   // =======================
//   // State Management (Dicopy dari CPMI)
//   // =======================
//   const [user, setUser] = useState<TestUser | null>(null);
//   const [role, setRole] = useState<"USER" | "PERUSAHAAN" | "GUEST">("USER");
//   const [testInfo, setTestInfo] = useState<{ id: number; name: string; duration: number; price: number | null } | null>(null);
//   const [hasAccess, setHasAccess] = useState(false);
//   const [accessReason, setAccessReason] = useState("");

//   // Step alur (menggantikan 'stage')
//   const [step, setStep] = useState<"intro" | "instruction" | "questions">("intro");

//   // State Soal & Jawaban
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [answers, setAnswers] = useState<Record<string, string>>({}); // <Record<questionCode, choice>>

//   // State Pengerjaan (Pagination & Timer)
//   const [attemptId, setAttemptId] = useState<number | null>(null);
//   const [currentIndex, setCurrentIndex] = useState(0); // <-- 'Nyawa' pagination
//   const [timeLeft, setTimeLeft] = useState(0); // Durasi default
//   const [endTime, setEndTime] = useState<Date | null>(null); // Waktu selesai

//   // State UI/Loading
//   const [loading, setLoading] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isPaying, setIsPaying] = useState(false); 
//   const [quantity, setQuantity] = useState(1);

//   // ==========================
//   // Inisialisasi (Tiru CPMI)
//   // ==========================
//   useEffect(() => {
//     const fetchUserAndTest = async () => {
//       setLoading(true);
//       try {
//         const urlParams = new URLSearchParams(window.location.search);
//         const token = urlParams.get("token");

//         let fetchedUser: TestUser | null = null;
//         let fetchedRole: "USER" | "PERUSAHAAN" | "GUEST" = "USER";
//         let fetchedHasAccess = false;
//         let fetchedAccessReason = "";

//         if (token) {
//           const tokenRes = await fetch(`/api/token/info?token=${token}`);
//           const tokenData = await tokenRes.json();
//           if (tokenRes.ok && tokenData.companyName) {
//             fetchedUser = { id: 0, name: tokenData.companyName, role: "GUEST", email: "" };
//             fetchedRole = "GUEST";
//             fetchedHasAccess = true;
//           } else {
//             console.warn(tokenData.error);
//             fetchedAccessReason = tokenData.error || "Token tidak valid";
//           }
//         } else {
//           const userRes = await fetch("/api/auth/me", { credentials: "include" });
//           const userData = await userRes.json();
//           if (!userRes.ok || !userData.user) {
//             router.push("/login");
//             return;
//           }
//           fetchedUser = userData.user;
//           fetchedRole = userData.user.role; // ❗️ Ambil role dari user
          
//           // Cek akses user (GANTI TYPE)
//           const accessRes = await fetch(`/api/tes/check-access?userId=${userData.user.id}&type=MBTI`);
//           const accessData = await accessRes.json();
//           fetchedHasAccess = accessData.access;
//           fetchedAccessReason = accessData.reason || "";
//         }

//         // Ambil Info Tes (GANTI TYPE)
//         const testRes = await fetch("/api/tes/info?type=MBTI");
//         const testData = await testRes.json();
        
//         setUser(fetchedUser);
//         setRole(fetchedRole); // ❗️ Set state role
//         setTestInfo(testData);
//         setHasAccess(fetchedHasAccess);
//         setAccessReason(fetchedAccessReason);

//         const durationInSeconds = (testData?.duration || 30) * 60;
//         setTimeLeft(durationInSeconds);

//       } catch (err) {
//         console.error("Gagal fetch user/test info MBTI:", err);
//         setAccessReason("Gagal memuat data tes. Coba refresh halaman.");
//       } 
//     };
//     fetchUserAndTest();
//   }, [router]);

  
//   // ==========================
//   // FUNGSI HANDLE PAYMENT
//   // ==========================
//   const handlePayment = async () => {
//     if (!user || !testInfo) {
//       alert("Sesi tidak valid, silakan refresh.");
//       return;
//     }
  
//     setIsPaying(true);
//     try {
//       const body = {
//         testTypeId: testInfo.id,
//         quantity: quantity, 
//       };
  
//       const res = await fetch("/api/payment/start", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body),
//         credentials: "include", 
//       });
  
//       const data = await res.json();
  
//       if (!res.ok) {
//         throw new Error(data.error || "Gagal memulai pembayaran.");
//       }
  
//       if (data.success && data.startTest) {
//         alert(data.message || "Akses tes didapat, silakan mulai.");
//         setHasAccess(true); 
//         setStep("instruction"); 
//       } 
//       else if (data.success && data.paymentUrl) {
//         window.location.href = data.paymentUrl;
//       } 
//       else {
//         throw new Error("Respon tidak dikenal dari server.");
//       }
  
//     } catch (err: any) {
//       console.error("Error di handlePayment:", err);
//       alert(err.message || "Terjadi kesalahan.");
//     } finally {
//       setIsPaying(false);
//     }
//   };


//   // ==========================
//   // Load Soal (Standarisasi API)
//   // ==========================
//   const loadQuestions = async (attemptId?: number) => {
//     try {
//       const res = await fetch(`/api/tes?type=MBTI`, { credentials: "include" });
//       const data = await res.json();
//       let qList: Question[] = Array.isArray(data) ? data : data.questions || [];

//       qList = qList.map((q) => ({
//         ...q,
//         options: q.options || { a: "Opsi A Error", b: "Opsi B Error" },
//       }));

//       setQuestions(qList || []);
      
//       const savedIndex = localStorage.getItem("mbti_currentIndex");
//       const startIndex = savedIndex ? Number(savedIndex) : 0;
//       setCurrentIndex(startIndex);

//       if (attemptId) {
//         await loadExistingAnswers(attemptId, qList);
//       }
//     } catch (err) {
//       console.error("Gagal load soal MBTI:", err);
//     } 
//   };

//   // ==========================
//   // Load Jawaban (Tiru CPMI)
//   // ==========================
//   const loadExistingAnswers = async (attemptId: number, qList?: Question[]) => {
//     try {
//       const res = await fetch(`/api/tes/answers?attemptId=${attemptId}`, {
//         credentials: "include",
//       });
//       const data = await res.json();
//       if (res.ok && data.answers) {
//         setAnswers(data.answers);
//       }
//     } catch (err) {
//       console.error("Gagal load jawaban:", err);
//     }
//   };

//   // ==========================
//   // Start Attempt (Tiru CPMI)
//   // ==========================
//   const startAttempt = async () => {
//     if (!testInfo?.id || !user) return;

//     if (attemptId) {
//       await loadQuestions(attemptId);
//       return;
//     }

//     localStorage.removeItem("mbti_attemptId");
//     localStorage.removeItem("mbti_endTime");
//     localStorage.removeItem("mbti_currentIndex");
//     setAttemptId(null);
//     setAnswers({});
//     setCurrentIndex(0);

//     try {
//       const body: any = { testTypeId: testInfo.id };

//       if (role === "GUEST") {
//         const urlParams = new URLSearchParams(window.location.search);
//         const guestToken = urlParams.get("token");
//         if (!guestToken) throw new Error("Guest token tidak ditemukan");
//         body.guestToken = guestToken;
//       } else {
//         body.userId = user.id;
//       }

//       const res = await fetch("/api/attempts", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body),
//         credentials: "include",
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Gagal memulai attempt");

//       const newAttemptId = data.id;
//       setAttemptId(newAttemptId);
//       localStorage.setItem("mbti_attemptId", newAttemptId.toString());

//       const duration = testInfo.duration || 30;
//       const newEndTime = new Date();
//       newEndTime.setSeconds(newEndTime.getSeconds() + duration * 60);
//       setEndTime(newEndTime);
//       localStorage.setItem("mbti_endTime", newEndTime.toISOString());
//       setTimeLeft(duration * 60); 

//       await loadQuestions(newAttemptId); 

//     } catch (err) {
//       console.error("Gagal memulai attempt:", err);
//     }
//   };

//   // ==========================
//   // Timer (Tiru CPMI)
//   // ==========================
//   useEffect(() => {
//     if (!endTime) return;

//     const timer = setInterval(() => {
//       const diff = Math.max(0, Math.floor((endTime.getTime() - Date.now()) / 1000));
//       setTimeLeft(diff);
//       if (diff <= 0) {
//         handleSubmit(); 
//         clearInterval(timer);
//       }
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [endTime]); // eslint-disable-line react-hooks/exhaustive-deps

//   // ==========================
//   // Simpan Jawaban (Per-klik)
//   // ==========================
//   const handleSelectAnswer = async (
//     qcode: string,
//     choice: string
//   ) => {
//     setAnswers((prev) => ({ ...prev, [qcode]: choice }));

//     if (!user || !attemptId) return;

//     try {
//       await fetch("/api/tes/answers", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           attemptId,
//           answers: [{ preferenceQuestionCode: qcode, choice: choice }],
//         }),
//         credentials: "include",
//       });
//     } catch (err) {
//       console.error("Gagal simpan jawaban:", err);
//     }
//   };

//   // ==========================
//   // Submit Tes (Tiru CPMI)
//   // ==========================
//   const handleSubmit = async () => {
//     if (!user || !attemptId || isSubmitting) return; 

//     setIsSubmitting(true);
//     try {
//       const payload: AnswerPayload[] = Object.entries(answers).map(([qcode, choice]) => {
//         return {
//           preferenceQuestionCode: qcode, 
//           choice: choice,
//         };
//       });

//       const res = await fetch("/api/tes/submit-mbti", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ 
//           userId: user.id, 
//           type: "MBTI", 
//           attemptId, 
//           answers: payload 
//         }),
//         credentials: "include",
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Gagal submit MBTI");

//       localStorage.removeItem("mbti_attemptId");
//       localStorage.removeItem("mbti_endTime");
//       localStorage.removeItem("mbti_currentIndex");
//       setHasAccess(false);

//       alert("🎉 Tes MBTI selesai! Hasil bisa dilihat di Dashboard.");
//       router.push("/dashboard"); 

//     } catch (err: any) {
//       alert(err.message);
//       localStorage.removeItem("mbti_attemptId");
//       localStorage.removeItem("mbti_endTime");
//       localStorage.removeItem("mbti_currentIndex");
//       setHasAccess(false);
//       router.push("/dashboard"); 
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // ==========================
//   // Restore Attempt (Tiru CPMI)
//   // ==========================
//   useEffect(() => {
//     const restoreAttempt = async () => {
//       if (!user) return; 
      
//       const savedAttemptId = localStorage.getItem("mbti_attemptId"); 
//       if (!savedAttemptId) {
//         setLoading(false); 
//         return;
//       }

//       try {
//         const res = await fetch(`/api/attempts/${savedAttemptId}`, { credentials: "include" });
//         const data = await res.json();

//         if (!res.ok || data.attempt?.isCompleted) {
//           localStorage.removeItem("mbti_attemptId"); 
//           localStorage.removeItem("mbti_endTime"); 
//           localStorage.removeItem("mbti_currentIndex"); 
//           setAttemptId(null);
//           setStep("intro");
//           setLoading(false); 
//           return;
//         }

//         setAttemptId(Number(savedAttemptId));
        
//         const savedEnd = localStorage.getItem("mbti_endTime"); 
//         if (savedEnd) {
//           const endTime = new Date(savedEnd);
//           const diff = Math.max(0, Math.floor((endTime.getTime() - Date.now()) / 1000));
//           if (diff <= 0) {
//             handleSubmit(); 
//             return;
//           }
//           setTimeLeft(diff);
//           setEndTime(endTime); 
//         }

//         await loadQuestions(Number(savedAttemptId)); 
//         setStep("questions"); 

//       } catch (err) {
//         console.error("Gagal restore attempt:", err);
//         localStorage.removeItem("mbti_attemptId");
//         localStorage.removeItem("mbti_endTime");
//         localStorage.removeItem("mbti_currentIndex");
//         setAttemptId(null);
//         setStep("intro");
//       } finally {
//          setLoading(false); 
//       }
//     };
//     restoreAttempt();
//   }, [user]); 

//   // Simpan index terakhir (Tiru CPMI)
//   useEffect(() => {
//     if (currentIndex > 0 || (questions.length > 0 && answers[questions[0]?.code])) {
//       localStorage.setItem("mbti_currentIndex", currentIndex.toString());
//     }
//   }, [currentIndex, questions, answers]);

//   // Helper
//   const formatTime = (s: number) =>
//     `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

//   // ==========================
//   // Render (Tiru CPMI)
//   // ==========================
  
//   if (loading) {
//      return <div style={{textAlign: "center", marginTop: "80px", fontSize: "1.2rem"}}>Memuat...</div>;
//   }
  
//   return (
//     // ❗️❗️ 2. KITA TAMBAH NAVBARNYA DI SINI (di luar wrapper gradien) ❗️❗️
//     <div className={styles.pageContainer}> 
//       <Navbar />
//       <div className={styles.mbtiPageWrapper}>
//         {(() => {
//           // Tampilan utama pake switch(step)
//           switch (step) {
//             case "intro":
//               return (
//                 <>
//                   <div className={styles.heroSection}>
//                     <h1 className={styles.heroTitle}>Tes Kepribadian MBTI</h1>
//                     <p className={styles.heroSubtitle}>
//                       Tes ini dirancang untuk memahami preferensi psikologis Anda, 
//                       mengidentifikasi kekuatan, dan menemukan tipe kepribadian unik Anda.
//                     </p>
//                   </div>
                
//                   <div className={styles.pageWrapper}>
//                     {/* === KOLOM KIRI (Info) === */}
//                     <div className={styles.leftColumn}>
//                       <div className={styles.benefitsBox}>
//                         <h2 className={styles.sectionTitle}>🎯 Mengapa Ikut Tes MBTI?</h2>
//                         <ul className={styles.benefitList}>
//                           <li>Memahami 4 dimensi kepribadian (E/I, S/N, T/F, J/P).</li>
//                           <li>Menemukan 16 tipe kepribadian yang paling sesuai.</li>
//                           <li>Mendapat wawasan tentang kekuatan & area pengembangan.</li>
//                           <li>Membantu dalam eksplorasi karir dan hubungan interpersonal.</li>
//                         </ul>
//                       </div>

//                       <div className={styles.benefitsBox}>
//                         <h2 className={styles.sectionTitle}>💡 Terdapat 4 Aspek yang Diujikan:</h2>
//                         <ul className={styles.benefitList}>
//                           <li>
//                             <div>
//                               <b>Introversion (I) vs. Extraversion (E)</b><br/>
//                               <span style={{fontSize: "0.9rem", color: "#555"}}>Dari mana Anda mendapat energi.</span>
//                             </div>
//                           </li>
//                           <li style={{marginTop: "8px"}}>
//                             <div>
//                               <b>Sensing (S) vs. Intuition (N)</b><br/>
//                               <span style={{fontSize: "0.9rem", color: "#555"}}>Bagaimana Anda memproses informasi.</span>
//                             </div>
//                           </li>
//                           <li style={{marginTop: "8px"}}>
//                             <div>
//                               <b>Thinking (T) vs. Feeling (F)</b><br/>
//                               <span style={{fontSize: "0.9rem", color: "#555"}}>Bagaimana Anda mengambil keputusan.</span>
//                             </div>
//                           </li>
//                           <li style={{marginTop: "8px"}}>
//                             <div>
//                               <b>Judging (J) vs. Perceiving (P)</b><br/>
//                               <span style={{fontSize: "0.9rem", color: "#555"}}>Bagaimana Anda menjalani hidup.</span>
//                             </div>
//                           </li>
//                         </ul>
//                       </div>
//                     </div>

//                     {/* === KOLOM KANAN (Aksi) === */}
//                     <div className={styles.rightColumn}>
//                       <div className={styles.paymentBox}>
                        
//                         <img 
//                           src="/images/mbti-illustration.png" 
//                           alt="Tes MBTI" 
//                           className={styles.illustration}
//                           style={{ maxWidth: "200px" }} 
//                           onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/200"; }} 
//                         />

//                         <div className={styles.extraInfo}>
//                           <p><b>💰 Harga:</b> {testInfo?.price ? `Rp ${testInfo.price.toLocaleString("id-ID")}` : "GratIS"}</p>
//                           <p><b>⏱️ Durasi:</b> {testInfo?.duration || 30} Menit</p>
//                         </div>

                        
//                         {role === "SUPERADMIN" ? (
//                           <div className={styles.adminInfoBox}>
//                             Anda login sebagai <b>Superadmin</b>.
//                             <br />
//                             Admin tidak dapat mengerjakan tes.
//                           </div>
//                         ) : (
//                           <>
//                             {!hasAccess && accessReason && (
//                               <p style={{ color: "#dc2626", fontSize: "14px", marginBottom: "12px", fontWeight: "500" }}>
//                                 {accessReason}
//                               </p>
//                             )}
                            
//                             {hasAccess ? (
//                               <button className={styles.btn} onClick={() => setStep("instruction")}>
//                                 Mulai Tes
//                               </button>
//                             ) : (
//                               <>
//                                 {role === "PERUSAHAAN" && (
//                                   <div>
//                                     <label htmlFor="quantity" className={styles.quantityLabel}>
//                                       Jumlah Kuantitas
//                                     </label>
//                                     <input
//                                       id="quantity"
//                                       type="number"
//                                       className={styles.quantityInput}
//                                       value={quantity}
//                                       onChange={(e) => setQuantity(Number(e.target.value) || 1)}
//                                       min="1"
//                                     />
//                                   </div>
//                                 )}

//                                 <button 
//                                   className={styles.btn} 
//                                   onClick={handlePayment} 
//                                   disabled={isPaying || !testInfo || quantity < 1}
//                                   style={{ marginTop: "16px" }} 
//                                 >
//                                   {isPaying ? "Memproses..." 
//                                     : (role === "PERUSAHAAN" ? `Beli Tes (dengan Kuantitas)` : `Bayar untuk Ikut Tes`)
//                                   }
//                                 </button>
//                               </>
//                             )}
//                           </>
//                         )}
                        
//                         <button className={styles.backBtn} onClick={() => router.push("/dashboard")}>
//                           ← Kembali ke Dashboard
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </>
//               );

//             case "instruction":
//               return (
//                 <div className={styles.container} style={{ maxWidth: "800px", margin: "40px auto", background: "#fff", padding: "30px", borderRadius: "16px", boxShadow: "0 4px 14px rgba(0,0,0,0.06)" }}>
//                    <h1 className={styles.title} style={{ textAlign: "center", fontSize: "1.8rem" }}>Instruksi Tes MBTI</h1>
//                    <p className={styles.subtitle} style={{ textAlign: "center", marginBottom: "20px", maxWidth: "100%" }}>
//                      Baca instruksi dengan teliti sebelum memulai.
//                    </p>

//                    <div className={styles.instructionsText}>
//                       <p style={{ marginBottom: "10px" }}>Tes ini terdiri dari sejumlah pertanyaan yang menyajikan dua pilihan (A atau B).<br/>
//                       Pilih salah satu jawaban yang paling mewakili atau paling sesuai dengan diri Anda.</p>
//                       <ul style={{ paddingLeft: "20px", listStyle: "decimal" }}>
//                         <li>Tidak ada jawaban benar atau salah.</li>
//                         <li>Jawablah dengan jujur sesuai preferensi alami Anda.</li>
//                         <li>Waktu tes akan berjalan otomatis setelah Anda menekan tombol "Mulai Pengerjaan".</li>
//                         <li>Anda dapat kembali ke soal sebelumnya menggunakan tombol "Back".</li>
//                         <li>Pastikan Anda menyelesaikan semua soal sebelum menekan "Submit Tes".</li>
//                       </ul>
//                    </div>
                   
//                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "30px" }}>
//                      <button
//                        className={styles.backBtn}
//                        style={{ marginTop: 0 }} 
//                        onClick={() => setStep("intro")}
//                      >
//                        ← Kembali
//                      </button>
//                      <button
//                        className={styles.btn}
//                        onClick={async () => {
//                          setLoading(true); 
//                          await startAttempt(); 
//                          setStep("questions"); 
//                        }}
//                      >
//                        Mulai Pengerjaan
//                      </button>
//                    </div>
//                 </div>
//               );

//             case "questions":
//               const currentQuestion = questions[currentIndex];
//               if (!currentQuestion) return <div style={{textAlign: "center", marginTop: "80px", fontSize: "1.2rem"}}>Memuat soal...</div>;

//               return (
//                 <div className={styles.container}>
//                   <div className={styles.header}>
//                     <h1 className={styles.title}>Soal MBTI</h1>
//                     <div className={styles.timer}>⏳ {formatTime(timeLeft)}</div>
//                   </div>

//                   <div className={styles.mainContent}>
//                     <div className={styles.questionSection}>
                      
//                       <div className={styles.questionContent}>
//                         <p style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "20px", minHeight: "50px" }}>
//                           {currentIndex + 1} / {questions.length}. {currentQuestion.content}
//                         </p>
//                       </div>

//                       <ul className={styles.optionsList}>
//                         <li key="a">
//                           <label 
//                             className={`${styles.optionLabel} ${answers[currentQuestion.code] === "a" ? styles.selected : ""}`}
//                           >
//                             <input
//                               type="radio"
//                               name={`q-${currentQuestion.id}`}
//                               value="a"
//                               checked={answers[currentQuestion.code] === "a"}
//                               onChange={() =>
//                                 handleSelectAnswer(currentQuestion.code, "a")
//                               }
//                             />
//                             <span>{currentQuestion.options.a}</span>
//                           </label>
//                         </li>
//                         <li key="b">
//                           <label 
//                             className={`${styles.optionLabel} ${answers[currentQuestion.code] === "b" ? styles.selected : ""}`}
//                           >
//                             <input
//                               type="radio"
//                               name={`q-${currentQuestion.id}`}
//                               value="b"
//                               checked={answers[currentQuestion.code] === "b"}
//                               onChange={() =>
//                                 handleSelectAnswer(currentQuestion.code, "b")
//                               }
//                             />
//                             <span>{currentQuestion.options.b}</span>
//                           </label>
//                         </li>
//                       </ul>
                      
//                       <div className={styles.navButtons}>
//                         <button
//                           className={styles.backBtn}
//                           style={{ marginTop: 0 }} 
//                           onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
//                           disabled={currentIndex === 0}
//                         >
//                           ← Back
//                         </button>
//                         {currentIndex < questions.length - 1 ? (
//                           <button className={styles.btn} onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}>
//                             Next →
//                           </button>
//                         ) : (
//                           <button className={styles.btn} onClick={handleSubmit} disabled={isSubmitting}>
//                             {isSubmitting ? "Memproses..." : "Submit Tes"}
//                           </button>
//                         )}
//                       </div>
//                     </div>
                    
//                     <div className={styles.answerCard}>
//                       <h3>Ringkasan Jawaban</h3>
//                       <div className={styles.answerGrid}>
//                         {questions.map((q, idx) => (
//                           <button
//                             key={q.id}
//                             className={`${styles.answerNumber} ${
//                               answers[q.code] ? styles.answered : styles.unanswered
//                             } ${currentIndex === idx ? styles.current : ""}`}
//                             onClick={() => setCurrentIndex(idx)}
//                           >
//                             {idx + 1}
//                           </button>
//                         ))}
//                       </div>
//                     </div>

//                   </div>
//                 </div>
//               );

//             default:
//               return <div className={styles.container}>Halaman tidak ditemukan.</div>;
//           }
//         })()}
//       </div>
//     </div>
//   );
// };

// export default MBTIPage;

// yg atas kode baru tampilan mbti


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

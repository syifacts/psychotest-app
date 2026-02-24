"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import CPMIIntro from "../../../components/CPMI/CPMIIntro";
import CPMIInstruction from "@/components/CPMI/CPMIInstruction";
import BiodataForm from "@/components/CPMI/BiodataForm";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import CPMIQuestionCard from "@/components/CPMI/CPMIQuestionCard";
import CPMIAnswerSummary from "@/components/CPMI/CPMIAnswerSummary";

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
  role: "USER" | "PERUSAHAAN" | "GUEST" | "SUPERADMIN";
  name?: string;
  email?: string;
};

const CPMIPage = () => {
  const router = useRouter();

  const [user, setUser] = useState<CPMIUser | null>(null);
  const [role, setRole] = useState<
    "USER" | "PERUSAHAAN" | "GUEST" | "SUPERADMIN"
  >("USER");
  const [testInfo, setTestInfo] = useState<{
    id: number;
    name: string;
    duration: number;
    price: number | null;
  } | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessReason, setAccessReason] = useState("");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [loadingIntro, setLoadingIntro] = useState(true);

  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  const [exampleQuestions, setExampleQuestions] = useState<Question[]>([]);

  const [endTime, setEndTime] = useState<Date | null>(null);

  const [step, setStep] = useState<
    "intro" | "biodata" | "instruction" | "questions"
  >("intro");

  const [isSubmittingTest, setIsSubmittingTest] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    show: boolean;
    isTimeout: boolean;
    message: string;
    error?: boolean;
  }>({ show: false, isTimeout: false, message: "" });

  const clearLocalState = () => {
    localStorage.removeItem("attemptId");
    localStorage.removeItem("endTime");
    localStorage.removeItem("currentIndex");
    localStorage.removeItem("stage");
    setAttemptId(null);
    setEndTime(null);
  };

  useEffect(() => {
    const fetchUserAndTest = async () => {
      try {
        setLoadingIntro(true);
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        if (token) {
          const tokenRes = await fetch(`/api/token/info?token=${token}`);
          const tokenData = await tokenRes.json();
          if (tokenRes.ok && tokenData.companyName) {
            setUser({
              id: 0,
              name: tokenData.companyName,
              role: "GUEST",
              email: "",
            });
            setRole("GUEST");
            setHasAccess(true);
          } else {
            console.warn(tokenData.error);
          }
        } else {
          const userRes = await fetch("/api/auth/me", {
            credentials: "include",
          });
          const userData = await userRes.json();
          if (!userRes.ok || !userData.user) return router.push("/login");

          setUser({
            ...userData.user,
            role: userData.user.role,
          });
          setRole(userData.user.role);

          const accessRes = await fetch(
            `/api/tes/check-access?userId=${userData.user.id}&type=CPMI`,
          );
          const accessData = await accessRes.json();
          setHasAccess(accessData.access);
          setAccessReason(accessData.reason || "");
        }

        const testRes = await fetch("/api/tes/info?type=CPMI");
        const testData = await testRes.json();
        setTestInfo(testData);
      } catch (err) {
        console.error("Gagal fetch user/test info CPMI:", err);
      } finally {
        setTimeout(() => setLoadingIntro(false), 600);
      }
    };

    fetchUserAndTest();
  }, [router]);

  useEffect(() => {
    const restoreAttempt = async () => {
      if (!user) return;

      const savedAttemptId = localStorage.getItem("attemptId");
      const savedStage = localStorage.getItem("stage");
      const savedEnd = localStorage.getItem("endTime");

      if (savedAttemptId && savedStage) {
        if (savedEnd) {
          const endDate = new Date(savedEnd);
          const diff = Math.floor((endDate.getTime() - Date.now()) / 1000);
          if (diff <= 0) {
            clearLocalState();
            setHasAccess(false);
            return;
          }
        }

        try {
          const res = await fetch(`/api/attempts/${savedAttemptId}`, {
            credentials: "include",
          });
          const data = await res.json();

          if (!res.ok || data.attempt?.isCompleted) {
            clearLocalState();
            setStep("intro");
            setHasAccess(false);
            return;
          }

          setAttemptId(Number(savedAttemptId));
          const savedIndex = localStorage.getItem("currentIndex");
          if (savedIndex) setCurrentIndex(Number(savedIndex));

          if (savedEnd) {
            const endDate = new Date(savedEnd);
            setEndTime(endDate);
            const diff = Math.max(
              0,
              Math.floor((endDate.getTime() - Date.now()) / 1000),
            );
            setTimeLeft(diff);
          }

          setStep(
            savedStage as "intro" | "biodata" | "instruction" | "questions",
          );
          if (savedStage === "questions") {
            await loadQuestions(Number(savedAttemptId));
          }
        } catch (err) {
          console.error("Gagal restore attempt:", err);
          clearLocalState();
          setStep("intro");
          setHasAccess(false);
        }
      }
    };
    restoreAttempt();
  }, [user]);

  const loadQuestions = async (attemptId?: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tes?type=CPMI`, { credentials: "include" });
      const data = await res.json();

      let qList: Question[] = Array.isArray(data) ? data : data.questions || [];

      qList = qList.filter(
        (q) => !["CPMI-1", "CPMI-2", "CPMI-3"].includes(q.code),
      );

      qList = qList.map((q) => ({
        ...q,
        image: q.image || "",
      }));

      setQuestions(qList || []);

      const savedIndex = localStorage.getItem("currentIndex");
      if (savedIndex) {
        setCurrentIndex(Number(savedIndex));
      } else {
        const startIndex = qList.findIndex(
          (q) => q.code === "CPMI-4" || q.id === 329,
        );
        setCurrentIndex(startIndex >= 0 ? startIndex : 0);
        localStorage.setItem(
          "currentIndex",
          (startIndex >= 0 ? startIndex : 0).toString(),
        );
      }

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

      if (res.ok && data.answers) {
        setAnswers(data.answers);
      }
    } catch (err) {
      console.error("❌ Gagal load jawaban:", err);
    }
  };

  const startAttempt = async () => {
    if (!testInfo?.id || !user) return;

    if (attemptId && step !== "intro") {
      await loadQuestions(attemptId);
      return;
    }

    clearLocalState();

    setAnswers({});
    setCurrentIndex(0);

    try {
      const body: any = { testTypeId: testInfo.id };

      if (role === "GUEST") {
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
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memulai attempt");

      setAttemptId(data.id);
      localStorage.setItem("attemptId", data.id.toString());
      localStorage.setItem("stage", "biodata");

      const duration = testInfo.duration || 30;
      const newEndTime = new Date();
      newEndTime.setSeconds(newEndTime.getSeconds() + duration * 60);
      setEndTime(newEndTime);
      localStorage.setItem("endTime", newEndTime.toISOString());

      await loadQuestions(data.id);

      setStep("biodata");
    } catch (err) {
      console.error("Gagal memulai attempt:", err);
    }
  };

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (step !== "questions" || !endTime) return;

    timerRef.current = setInterval(() => {
      const diff = Math.max(
        0,
        Math.floor((endTime.getTime() - Date.now()) / 1000),
      );
      setTimeLeft(diff);

      if (diff <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        handleSubmit(true);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [endTime, step]);

  const handleSelectAnswer = async (
    qid: number,
    qcode: string,
    choice: string,
    optIndex?: number,
  ) => {
    const finalChoice = optIndex !== undefined ? String(optIndex + 1) : choice;

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

  const handleSubmit = async (isTimeOut = false) => {
    if (!user || !attemptId) {
      clearLocalState();
      return;
    }

    setIsSubmittingTest(true);

    try {
      const payload: AnswerPayload[] = Object.entries(answers).map(
        ([qcode, choice]) => {
          const q = questions.find((q) => q.code === qcode);
          return {
            questionId: q?.id ?? 0,
            questionCode: qcode,
            choice: choice,
          };
        },
      );

      const res = await fetch("/api/tes/submit-cpmi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          type: "CPMI",
          attemptId,
          answers: payload,
        }),
        credentials: "include",
      });

      const data = await res.json();

      clearLocalState();
      setHasAccess(false);

      if (!res.ok) throw new Error(data.error || "Gagal submit CPMI");

      setIsSubmittingTest(false);

      setSubmitStatus({
        show: true,
        isTimeout: isTimeOut,
        message: isTimeOut
          ? "Waktu pengerjaan telah habis. Jawaban kamu otomatis tersimpan dan sedang menunggu verifikasi psikolog."
          : "Tes CPMI berhasil diselesaikan! Hasil bisa kamu lihat di menu Dashboard.",
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 3500);
    } catch (err: any) {
      clearLocalState();
      setHasAccess(false);
      setIsSubmittingTest(false);

      setSubmitStatus({
        show: true,
        isTimeout: false,
        error: true,
        message: err.message || "Terjadi kesalahan saat mensubmit tes.",
      });

      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  };

  useEffect(() => {
    localStorage.setItem("currentIndex", currentIndex.toString());
  }, [currentIndex]);

  const currentQuestion = questions[currentIndex];
  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

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

  if (step === "intro" && loadingIntro) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-cyan-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-gray-600 font-medium animate-pulse">
          Menyiapkan Tes CPMI...
        </p>
      </div>
    );
  }

  return (
    <>
      {(isSubmittingTest || submitStatus.show) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all duration-300">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center text-center animate-in zoom-in-95 duration-300 border border-gray-100">
            {isSubmittingTest ? (
              <>
                <div className="relative mb-6 mt-4">
                  <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full opacity-50"></div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Menyimpan Jawaban...
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Mohon tunggu sebentar ya.
                </p>
              </>
            ) : (
              <>
                {submitStatus.error ? (
                  <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <svg
                      className="w-10 h-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                ) : submitStatus.isTimeout ? (
                  <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <svg
                      className="w-10 h-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <svg
                      className="w-10 h-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}

                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {submitStatus.error
                    ? "Oops! Terjadi Kesalahan"
                    : submitStatus.isTimeout
                      ? "Waktu Habis!"
                      : "Selesai!"}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {submitStatus.message}
                </p>

                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 animate-[progress_3.5s_ease-in-out_forwards]"></div>
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  Mengalihkan secara otomatis...
                </p>
              </>
            )}
          </div>
        </div>
      )}
      {/* ========================================================= */}

      {step === "intro" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <CPMIIntro
            testInfo={testInfo}
            hasAccess={hasAccess}
            accessReason={accessReason}
            setHasAccess={setHasAccess}
            startAttempt={startAttempt}
            role={role}
            savedStage={step}
          />
        </motion.div>
      )}

      {step === "biodata" && (
        <BiodataForm
          onSaved={() => {
            setStep("instruction");
            localStorage.setItem("stage", "instruction");
          }}
        />
      )}

      {step === "instruction" && (
        <CPMIInstruction
          exampleQuestions={exampleQuestions}
          onFinishExamples={async () => {
            if (attemptId) {
              await loadQuestions(attemptId);
            }
            setStep("questions");
            localStorage.setItem("stage", "questions");
          }}
        />
      )}

      {step === "questions" && currentQuestion && (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4 md:p-8 font-sans relative">
          {/* HEADER: Judul & Timer */}
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center bg-white/80 backdrop-blur-md shadow-sm rounded-2xl p-4 md:px-8 mb-6 border border-blue-100">
            <h1 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Soal Tes WPT untuk CPMI
            </h1>
            <div
              className={`flex items-center gap-2 px-4 py-2 font-bold rounded-lg border mt-4 md:mt-0 shadow-sm transition-colors ${
                timeLeft <= 60
                  ? "bg-red-50 text-red-600 border-red-200 animate-pulse"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}
            >
              <span className="text-xl">⏳</span>
              <span className="text-lg tracking-wider">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* MAIN CONTENT: 2 Kolom */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* KOLOM KIRI: Pertanyaan & Navigasi */}
            <div className="lg:col-span-2 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600 text-white w-10 h-10 flex items-center justify-center rounded-xl font-bold shadow-md">
                  {currentIndex + 1}
                </div>
                <span className="text-gray-500 font-medium">
                  dari {questions.length} soal
                </span>
              </div>

              {/* PANGGIL KOMPONEN QUESTION CARD CPMI */}
              <CPMIQuestionCard
                question={currentQuestion}
                selected={answers[currentQuestion.code]}
                onSelect={(choice, optIndex) =>
                  handleSelectAnswer(
                    currentQuestion.id,
                    currentQuestion.code,
                    choice,
                    optIndex,
                  )
                }
              />

              {/* NAVIGASI BUTTONS (Bisa pinjem punya MSDT) */}
              <div className="flex justify-between items-center mt-10 space-x-4">
                <button
                  onClick={() =>
                    setCurrentIndex((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentIndex === 0}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                    currentIndex === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
                  }`}
                >
                  <span>←</span> Kembali
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        Math.min(questions.length - 1, prev + 1),
                      )
                    }
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-md transition-all duration-300"
                  >
                    Selanjutnya <span>→</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubmit(false)}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold shadow-md transition-all duration-300"
                  >
                    ✅ Submit Tes
                  </button>
                )}
              </div>

              <div className="mt-8 text-center lg:text-left">
                <button
                  onClick={() => {
                    setStep("instruction");
                    localStorage.setItem("stage", "instruction");
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors shadow-sm"
                >
                  <ArrowLeft size={16} /> Kembali ke Instruksi
                </button>
              </div>
            </div>

            {/* KOLOM KANAN: Ringkasan Jawaban (Sticky) */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                {/* PANGGIL KOMPONEN ANSWER SUMMARY CPMI */}
                <CPMIAnswerSummary
                  questions={questions}
                  answers={answers}
                  currentIndex={currentIndex}
                  onSelect={(idx) => setCurrentIndex(idx)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default CPMIPage;

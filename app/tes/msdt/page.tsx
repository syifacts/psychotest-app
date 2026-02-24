"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import MSDTIntro from "@/components/MSDT/MSDTIntro";
import BiodataForm from "@/components/MSDT/BiodataForm";
import MSDTInstruction from "@/components/MSDT/MSDTInstruction";

import QuestionCard from "@/components/MSDT/QuestionCard";
import NavigationButtons from "@/components/MSDT/NavigationButtons";
import AnswerSummary from "@/components/MSDT/AnswerSummary";

interface Question {
  id: number;
  code: string;
  content: string;
  options: string[];
  type: "single";
}

type AnswerPayload = {
  questionId: number;
  questionCode?: string;
  choice: string;
};

const TesMSDTPage = () => {
  const router = useRouter();

  const [user, setUser] = useState<{
    id: number;
    role: "USER" | "PERUSAHAAN" | "GUEST" | "SUPERADMIN";
    name: string;
    email: string;
    phone: string;
  } | null>(null);
  const [role, setRole] = useState<
    "USER" | "PERUSAHAAN" | "GUEST" | "SUPERADMIN"
  >("USER");
  const [testInfo, setTestInfo] = useState<{
    id: number;
    duration: number;
    name: string;
  } | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessReason, setAccessReason] = useState("");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [attemptId, setAttemptId] = useState<number | null>(null);

  const [showIntro, setShowIntro] = useState(true);
  const [showBiodata, setShowBiodata] = useState(false);
  const [showInstruction, setShowInstruction] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [savedStage, setSavedStage] = useState<string | null>(null);

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
    localStorage.removeItem("answers");
    localStorage.removeItem("stage");
    setAttemptId(null);
    setSavedStage(null);
  };

  useEffect(() => {
    const fetchUserAndTest = async () => {
      try {
        const [userRes, testRes] = await Promise.all([
          fetch("/api/auth/me", { credentials: "include" }),
          fetch("/api/tes/info?type=MSDT"),
        ]);

        if (!userRes.ok) return router.push("/login");

        const userData = await userRes.json();
        const testData = await testRes.json();

        if (!userData.user) return router.push("/login");

        setUser({
          id: userData.user.id,
          role: userData.user.role,
          name: userData.user.fullName || "",
          email: userData.user.email || "",
          phone: userData.user.phone || "",
        });
        setRole(userData.user.role);
        setTestInfo(testData);

        const accessRes = await fetch(
          `/api/tes/check-access?userId=${userData.user.id}&type=MSDT`,
        );
        const accessData = await accessRes.json();
        setHasAccess(accessData.access);
        setAccessReason(accessData.reason || "");
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserAndTest();
  }, [router]);

  useEffect(() => {
    const stage = localStorage.getItem("stage");
    const savedAttemptId = localStorage.getItem("attemptId");
    const savedIndex = localStorage.getItem("currentIndex");
    const savedAnswers = localStorage.getItem("answers");
    const savedEnd = localStorage.getItem("endTime");

    if (savedAttemptId && stage) {
      if (savedEnd) {
        const diff = Math.floor(
          (new Date(savedEnd).getTime() - Date.now()) / 1000,
        );
        if (diff <= 0) {
          clearLocalState();
          return;
        }
      }

      setAttemptId(Number(savedAttemptId));
      setSavedStage(stage);

      if (savedAnswers) {
        setAnswers(JSON.parse(savedAnswers));
      }
      if (savedIndex) {
        setCurrentIndex(Number(savedIndex));
      }
    }
  }, []);

  const loadQuestions = async () => {
    try {
      const res = await fetch(`/api/tes?type=MSDT`, { credentials: "include" });
      const data = await res.json();
      const qList: Question[] = Array.isArray(data) ? data : data.questions;
      setQuestions(qList || []);

      const savedEnd = localStorage.getItem("endTime");
      if (savedEnd) {
        const diff = Math.max(
          0,
          Math.floor((new Date(savedEnd).getTime() - Date.now()) / 1000),
        );
        setTimeLeft(diff);
      } else {
        setTimeLeft(testInfo?.duration ? testInfo.duration * 60 : 30 * 60);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startAttempt = async () => {
    if (!user || !testInfo) return;

    if (savedStage) {
      setShowIntro(false);
      if (savedStage === "biodata") {
        setShowBiodata(true);
      } else if (savedStage === "instruction") {
        setShowInstruction(true);
      } else if (savedStage === "questions") {
        await loadQuestions();
        setShowQuestions(true);
      }
      return;
    }

    clearLocalState();

    setTimeLeft(testInfo.duration ? testInfo.duration * 60 : 30 * 60);
    setCurrentIndex(0);
    setAnswers({});

    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, testTypeId: testInfo.id }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memulai attempt");

      setAttemptId(data.id);
      localStorage.setItem("attemptId", data.id.toString());

      const endTime = new Date();
      endTime.setMinutes(endTime.getMinutes() + (testInfo.duration || 30));
      localStorage.setItem("endTime", endTime.toISOString());
      localStorage.setItem("currentIndex", "0");

      localStorage.setItem("stage", "biodata");
      setSavedStage("biodata");

      await loadQuestions();
      setShowIntro(false);
      setShowBiodata(true);
    } catch (err) {
      console.error(err);
    }
  };

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!showQuestions) return;
    const savedEnd = localStorage.getItem("endTime");
    if (!savedEnd) return;

    const endTime = new Date(savedEnd);
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
  }, [showQuestions]);

  const handleSelectAnswer = async (qid: number, choice: string) => {
    const newAnswers = { ...answers, [qid]: choice };
    setAnswers(newAnswers);
    localStorage.setItem("answers", JSON.stringify(newAnswers));

    if (!user || !attemptId) return;
    try {
      await fetch("/api/tes/save-answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          attemptId,
          questionCode: questions.find((q) => q.id === qid)?.code,
          choice,
        }),
        credentials: "include",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleNext = () => {
    setCurrentIndex((i) => {
      const newIndex = i + 1;
      localStorage.setItem("currentIndex", newIndex.toString());
      return newIndex;
    });
  };

  const handleBack = () => {
    setCurrentIndex((i) => {
      const newIndex = i - 1;
      localStorage.setItem("currentIndex", newIndex.toString());
      return newIndex;
    });
  };

  const handleSubmit = async (isTimeOut = false) => {
    if (!user || !attemptId) {
      clearLocalState();
      return;
    }

    setIsSubmittingTest(true);

    try {
      const payload: AnswerPayload[] = Object.entries(answers).map(
        ([qid, choice]) => {
          const q = questions.find((q) => q.id === Number(qid));
          return { questionId: Number(qid), questionCode: q?.code, choice };
        },
      );

      const res = await fetch("/api/tes/submit-msdt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          type: "MSDT",
          attemptId,
          answers: payload,
        }),
        credentials: "include",
      });
      const data = await res.json();

      clearLocalState();
      setHasAccess(false);

      if (!res.ok) throw new Error(data.error || "Gagal submit MSDT");

      setIsSubmittingTest(false);

      setSubmitStatus({
        show: true,
        isTimeout: isTimeOut,
        message: isTimeOut
          ? "Waktu pengerjaan telah habis. Jawaban kamu otomatis tersimpan dan sedang menunggu verifikasi psikolog."
          : "Tes MSDT berhasil diselesaikan! Hasil bisa kamu lihat di menu Dashboard.",
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

  const currentQuestion = questions[currentIndex];
  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-cyan-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-gray-600 font-medium animate-pulse">
          Menyiapkan Tes MSDT...
        </p>
      </div>
    );
  }

  if (showIntro) {
    return (
      <MSDTIntro
        testInfo={testInfo}
        hasAccess={hasAccess}
        setHasAccess={setHasAccess}
        startAttempt={startAttempt}
        accessReason={accessReason}
        role={role}
        userData={user}
        savedStage={savedStage}
      />
    );
  }

  if (showBiodata) {
    return (
      <BiodataForm
        onSaved={() => {
          setShowBiodata(false);
          setShowInstruction(true);
          localStorage.setItem("stage", "instruction");
          setSavedStage("instruction");
        }}
      />
    );
  }

  if (showInstruction) {
    return (
      <MSDTInstruction
        onStartTest={async () => {
          await loadQuestions();
          setShowInstruction(false);
          setShowQuestions(true);
          localStorage.setItem("stage", "questions");
          setSavedStage("questions");
        }}
      />
    );
  }

  if (showQuestions && currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4 md:p-8 font-sans relative">
        {/* ========================================================= */}
        {/* OVERLAY LOADING & POPUP MUNCUL DI SINI */}
        {/* ========================================================= */}
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

        {/* HEADER: Judul & Timer */}
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center bg-white/80 backdrop-blur-md shadow-sm rounded-2xl p-4 md:px-8 mb-6 border border-blue-100">
          <h1 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            {testInfo?.name || "Tes MSDT"}
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

        {/* MAIN CONTENT: 2 Kolom (Kiri Soal, Kanan Ringkasan) */}
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

            <QuestionCard
              question={currentQuestion}
              selected={answers[currentQuestion.id]}
              onSelect={(choice) =>
                handleSelectAnswer(currentQuestion.id, choice)
              }
            />

            <NavigationButtons
              currentIndex={currentIndex}
              totalQuestions={questions.length}
              goNext={handleNext}
              goBack={handleBack}
              onSubmit={() => handleSubmit(false)}
            />

            <div className="mt-8 text-center lg:text-left">
              <button
                onClick={() => {
                  setShowInstruction(true);
                  setShowQuestions(false);
                  localStorage.setItem("stage", "instruction");
                  setSavedStage("instruction");
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors shadow-sm"
              >
                📖 Lihat Instruksi Kembali
              </button>
            </div>
          </div>

          {/* KOLOM KANAN: Ringkasan Jawaban (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <AnswerSummary
                questions={questions}
                answers={answers}
                currentIndex={currentIndex}
                onSelect={(idx) => setCurrentIndex(idx)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default TesMSDTPage;

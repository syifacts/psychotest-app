"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import styles from "./Ist.module.css";
import TestIntro from "@/components/IST/TestIntro";
import UserProfileForm from "@/components/IST/UserProfileForm";
import SubtestDetail from "@/components/IST/SubtestDetail";
import QuestionCard from "@/components/IST/QuestionCard";
import AnswerSummary from "@/components/IST/AnswerSummary";
import { useRef } from "react";


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
  hapalan?: string;
}

type AnswerMap = Record<number, string | string[]>;

const TesISTPage = () => {
  const router = useRouter();

  // ------------------------- STATE -------------------------
  const [user, setUser] = useState<{ id: number; role: string } | null>(null);
  const [testInfo, setTestInfo] = useState<{
    id: number;
    name: string;
    duration: number;
    price: number | null;
    subTests: { name: string; description: string; durationMinutes: number; hapalan?: string; }[];
  } | null>(null);

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
  const [checkReason, setCheckReason] = useState("");
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHapalanME, setShowHapalanME] = useState(false);
  const [showInstructionsME, setShowInstructionsME] = useState(false);
  const [quantity, setQuantity] = useState(1);


  function parseDescription(desc: any): string {
    if (!desc) return "";
    if (typeof desc === "string") {
      try {
        const parsed = JSON.parse(desc);
        if (Array.isArray(parsed)) {
          return parsed.map(item => (typeof item === "string" ? item : JSON.stringify(item))).join("\n");
        }
        return typeof parsed === "object" ? JSON.stringify(parsed) : String(parsed);
      } catch {
        return desc;
      }
    } else if (Array.isArray(desc)) {
      return desc.map(item => (typeof item === "string" ? item : JSON.stringify(item))).join("\n");
    } else {
      return String(desc);
    }
  }

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
  // Fetch user & test info
  // -------------------------
  useEffect(() => {
    const fetchUserAndTest = async () => {
      try {
        const userRes = await fetch("/api/auth/me", { credentials: "include" });
        if (!userRes.ok) {
          setLoading(false);
          return router.push("/login");
        }
        const userData = await userRes.json();
        setUser(userData.user);
        setFullName(userData.user.fullName || "");
        setBirthDate(
          userData.user.birthDate
            ? new Date(userData.user.birthDate).toISOString().split("T")[0]
            : ""
        );
        setTestDate(new Date().toLocaleDateString("id-ID"));

        const testRes = await fetch("/api/tes/info?type=IST");
        const testData = await testRes.json();
        setTestInfo(testData);

        const accessRes = await fetch(
          `/api/tes/check-access?userId=${userData.user.id}&type=IST`
        );
        const accessData = await accessRes.json();
        setHasAccess(accessData.access);
        setCheckReason(accessData.reason || "");
        if (!accessData.access) {
          setLoading(false);
          return;
        }

        const progressRes = await fetch(
          `/api/tes/progress?userId=${userData.user.id}&type=IST`
        );
        const progress = await progressRes.json();
        console.log("Progress:", progress);

        if (progress.isCompleted) {
          setAlreadyTaken(true);
          setShowIntro(true);
          setLoading(false);
          return;
        }

        if (progress.nextSubtest && progress.attemptId) {
          const subtestData = testData.subTests.find(
            (st: SubtestInfo) =>
              st.name?.trim().toLowerCase() ===
              progress.nextSubtest.trim().toLowerCase()
          );

          const duration = subtestData?.durationMinutes || 6;

          setCurrentSubtest({
            name: subtestData?.name || progress.nextSubtest,
            description: subtestData?.description || "Deskripsi subtest...",
            durationMinutes: duration,
            hapalan: subtestData?.hapalan || "",
          });

          setAttemptId(progress.attemptId);
          setCurrentIndex(progress.nextQuestionIndex || 0);

          const startSeconds =
            progress.startTime &&
            Math.floor(
              (new Date(progress.startTime).getTime() - Date.now()) / 1000 +
                duration * 60
            );
          setTimeLeft(startSeconds > 0 ? startSeconds : duration * 60);

          if (progress.nextSubtest === "HAPALAN_ME") {
            setShowHapalanME(true);
            setShowSubtestDetail(false);
            setShowQuestions(false);
          } else {
            await loadQuestions(
              progress.nextSubtest,
              userData.user.id,
              progress.attemptId
            );
            setShowIntro(false);
            setShowForm(false);
            setShowSubtestDetail(false);
            setShowQuestions(true);
          }

          setLoading(false);
          return;
        }

        setShowIntro(true);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchUserAndTest();
  }, [router]);

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
        setAnswers({});
      }
    } catch (err) {
      console.error("Gagal load questions:", err);
    }
  };

  // -------------------------
  // Timer
  // -------------------------
  const timeLeftRef = useRef(timeLeft);
  useEffect(() => { timeLeftRef.current = timeLeft }, [timeLeft]);

  const currentSubtestRef = useRef(currentSubtest);
  useEffect(() => { currentSubtestRef.current = currentSubtest }, [currentSubtest]);

  useEffect(() => {
    if (!showQuestions) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (attemptId && Object.keys(answers).length > 0) {
            handleSubmit();
          } else {
            console.warn("Timer habis tapi tidak ada jawaban, skip submit.");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showQuestions, attemptId, answers]);

  useEffect(() => {
    if (!showHapalanME) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSkipHapalan();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showHapalanME, testInfo]);

  // -------------------------
  // Handlers
  // -------------------------
  const handleFollowTest = async () => {
    if (!user?.id) {
      alert("User belum terdeteksi, silakan login ulang.");
      return;
    }

    setShowIntro(false);
    setShowForm(true);

    // if (!currentSubtest && testInfo?.subTests?.length) {
    //   try {
    //     const progressRes = await fetch(`/api/tes/progress?userId=${user.id}&type=IST`);
    //     const progress = await progressRes.json();

    //     let subtestToSet: typeof testInfo.subTests[0] | undefined;

    //     if (progress.nextSubtest) {
    //       subtestToSet = testInfo.subTests.find(
    //         st => st.name.toLowerCase() === progress.nextSubtest.toLowerCase()
    //       );
    //     }

    //     if (!subtestToSet) {
    //       subtestToSet = testInfo.subTests[0];
    //     }

    //     if (subtestToSet.name === "HAPALAN_ME") {
    //       const hapalanDesc = parseDescription(subtestToSet.description);
    //       setCurrentSubtest({
    //         ...subtestToSet,
    //         durationMinutes: 3,
    //         description: hapalanDesc,
    //         hapalan: subtestToSet.description || "[]",
    //       });
    //       setTimeLeft(3 * 60);
    //       setShowHapalanME(true);
    //       setShowQuestions(false);
    //       setShowSubtestDetail(false);
    //     } else {
    //       setCurrentSubtest({
    //         name: subtestToSet.name,
    //         description: parseDescription(subtestToSet.description),
    //         durationMinutes: subtestToSet.durationMinutes || 6,
    //         hapalan: subtestToSet.hapalan || "",
    //       });
    //       setShowForm(false);
    //       setShowSubtestDetail(true);
    //       setShowQuestions(false);
    //     }

    //   } catch (err: any) {
    //     alert(err.message);
    //   }
    // }
  };
// ✅ Helper untuk memastikan attemptId ada
const ensureAttemptId = async (): Promise<number | null> => {
  if (attemptId) return attemptId;
  if (!user || !testInfo) return null;

  try {
    // Cek attempt aktif
    const activeRes = await fetch(
      `/api/attempts/active?userId=${user.id}&testTypeId=${testInfo.id}`
    );
    const activeData = await activeRes.json();
    if (activeData?.id) {
      setAttemptId(activeData.id);
      return activeData.id;
    }

    // Buat attempt baru
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
    setAttemptId(newAttempt.id);
    return newAttempt.id;
  } catch (err) {
    console.error("❌ ensureAttemptId gagal:", err);
    return null;
  }
};

  // ✅ Handler untuk skip hapalan
const handleSkipHapalan = async () => {
  setShowHapalanME(false);

  if (!user || !testInfo) return;

  try {
    // 🔹 Pastikan attemptId tetap ada
    let currentAttemptId = attemptId;

    if (!currentAttemptId) {
      const activeRes = await fetch(
        `/api/attempts/active?userId=${user.id}&testTypeId=${testInfo.id}`
      );
      const activeData = await activeRes.json();

      if (activeData?.id) {
        currentAttemptId = activeData.id;
        setAttemptId(activeData.id);
      } else {
        const attemptRes = await fetch("/api/attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            testTypeId: testInfo.id,
          }),
        });

        if (!attemptRes.ok) throw new Error("Gagal membuat attempt baru");

        const newAttempt = await attemptRes.json();
        if (!newAttempt?.id) throw new Error("Respon attempt tidak valid");

        currentAttemptId = newAttempt.id;
        setAttemptId(newAttempt.id);
      }
    }

    // 🔹 Kalau tetap belum ada ID, hentikan
    if (!currentAttemptId) {
      alert("Gagal menyiapkan attempt. Silakan coba lagi.");
      return;
    }

    // 🔹 Lanjut ke subtest ME
    const meSubtest = testInfo.subTests?.find(
      (st) => st.name.trim().toUpperCase() === "ME"
    );

    if (!meSubtest) {
      console.warn("❌ Subtest ME tidak ditemukan di testInfo.subTests");
      alert("Subtest ME tidak ditemukan.");
      return;
    }

    // 🔹 Set state untuk instruksi ME
    setCurrentSubtest({
      name: meSubtest.name,
      description: meSubtest.description || "",
      durationMinutes: meSubtest.durationMinutes || 3,
      hapalan: "",
    });
    setShowInstructionsME(true);
    setShowQuestions(false);
    setCurrentIndex(0);
  } catch (err) {
    console.error("❌ Gagal skip hapalan / set attempt untuk ME:", err);
    alert("Terjadi kesalahan saat lanjut ke subtest ME. Silakan coba lagi.");
  }
};


  const handleStartSubtest = async () => {
  if (!currentSubtest || !user || !testInfo) return;

  try {
    let currentAttemptId = attemptId;

    // 🔹 Pastikan attemptId ada
    if (!currentAttemptId) {
      const activeRes = await fetch(
        `/api/attempts/active?userId=${user.id}&testTypeId=${testInfo.id}`
      );
      const activeData = await activeRes.json();

      if (activeData?.id) {
        currentAttemptId = activeData.id;
        setAttemptId(activeData.id);
      } else {
        const attemptRes = await fetch("/api/attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            testTypeId: testInfo.id,
          }),
        });

        const newAttempt = await attemptRes.json();
        if (!attemptRes.ok || !newAttempt.id)
          throw new Error("Gagal membuat attempt baru");

        currentAttemptId = newAttempt.id;
        setAttemptId(newAttempt.id);
      }
    }

    // 🔹 Kalau tetap belum ada, hentikan
    if (!currentAttemptId) {
      alert("Gagal menyiapkan attempt. Silakan coba lagi.");
      return;
    }

    // 🔹 Hitung waktu sisa berdasarkan progress
    let seconds = currentSubtest.durationMinutes * 60;

    const progressRes = await fetch(
      `/api/tes/progress?userId=${user.id}&type=IST`
    );
    const progress = await progressRes.json();

    if (
      progress?.startTime &&
      progress?.nextSubtest === currentSubtest.name
    ) {
      const start = new Date(progress.startTime);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + currentSubtest.durationMinutes);

      const diff = Math.floor((end.getTime() - Date.now()) / 1000);
      seconds = diff > 0 ? diff : currentSubtest.durationMinutes * 60;
    }

    // 🔹 Load soal menggunakan attemptId yang pasti valid
    await loadQuestions(currentSubtest.name, user.id, currentAttemptId);

    // 🔹 Update UI
    setTimeLeft(seconds);
    setShowSubtestDetail(false);
    setShowQuestions(true);
  } catch (err) {
    console.error("❌ handleStartSubtest gagal:", err);
    alert("Terjadi kesalahan saat memulai subtest. Silakan coba lagi.");
  }
};


 const handleSaveProfile = async () => {
  if (!user) return;
  if (!fullName || !birthDate)
    return alert("Nama lengkap dan tanggal lahir wajib diisi!");
  try {
    const res = await fetch("/api/user/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, birthDate }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal simpan data diri");

    alert("✅ Data diri berhasil disimpan. Klik tombol 'Mulai Tes' untuk melanjutkan.");
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
          attemptId,
          answers: [{ questionId: qid, choice: Array.isArray(choice) ? choice.join(",") : choice }],
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
  const handleStartAfterProfile = async () => {
    if (!user || !testInfo) return;

    try {
      const progressRes = await fetch(`/api/tes/progress?userId=${user.id}&type=IST`);
      const progress = await progressRes.json();

      let subtestToSet: typeof testInfo.subTests[0] | undefined;

      if (progress.nextSubtest) {
        subtestToSet = testInfo.subTests.find(
          st => st.name.toLowerCase() === progress.nextSubtest.toLowerCase()
        );
      }

      if (!subtestToSet) {
        subtestToSet = testInfo.subTests[0];
      }

      // ✅ sekarang baru pindah ke subtest detail
      if (subtestToSet.name === "HAPALAN_ME") {
        const hapalanDesc = parseDescription(subtestToSet.description);
        setCurrentSubtest({
          ...subtestToSet,
          durationMinutes: 3,
          description: hapalanDesc,
          hapalan: subtestToSet.description || "[]",
        });
        setTimeLeft(3 * 60);
        setShowHapalanME(true);
        setShowForm(false);
      } else {
        setCurrentSubtest({
          name: subtestToSet.name,
          description: parseDescription(subtestToSet.description),
          durationMinutes: subtestToSet.durationMinutes || 6,
          hapalan: subtestToSet.hapalan || "",
        });
        setShowForm(false);
        setShowSubtestDetail(true);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  window.addEventListener("startTestAfterProfile", handleStartAfterProfile);
  return () => window.removeEventListener("startTestAfterProfile", handleStartAfterProfile);
}, [user, testInfo]);



  const handleSubmit = async () => {
    if (!user || !currentSubtest) return;

    try {
      const payload = Object.entries(answers).map(([qid, choice]) => ({
        questionId: Number(qid),
        choice: Array.isArray(choice) ? choice.join(",") : choice,
      }));

      const res = await fetch("/api/tes/submit-subtest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          attemptId,
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

      const progressRes = await fetch(`/api/tes/progress?userId=${user.id}&type=IST`);
      const progress = await progressRes.json();

      if (progress.nextSubtest && testInfo?.subTests) {
        const nextSubtestData = testInfo.subTests.find(
          st => st.name.toLowerCase() === progress.nextSubtest.toLowerCase()
        );

        if (nextSubtestData) {
          // ✅ Cek apakah next subtest adalah HAPALAN_ME
          if (nextSubtestData.name === "HAPALAN_ME") {
            setCurrentSubtest({
              name: nextSubtestData.name,
              description: parseDescription(nextSubtestData.description),
              durationMinutes: nextSubtestData.durationMinutes || 3,
              hapalan: nextSubtestData.hapalan || "[]",
            });
            setTimeLeft(3 * 60);
            setShowHapalanME(true);
            setShowQuestions(false);
            setShowSubtestDetail(false);
            return;
          }

          setShowSubtestDetail(false);
          setCurrentSubtest({
            name: nextSubtestData.name,
            description: parseDescription(nextSubtestData.description),
            durationMinutes: nextSubtestData.durationMinutes || 6,
            hapalan: nextSubtestData.hapalan || "",
          });
          setShowQuestions(false);
          setShowSubtestDetail(true);
          return;
        }
      }

      await fetch("/api/tes/submit-finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, type: "IST", attemptId }),
      });
      alert("🎉 Tes IST selesai! Hasil ada di Dashboard.");
      router.push("/dashboard");

    } catch (err: any) {
      alert(err.message);
    }
  };

  // -------------------------
  // Render
  // -------------------------
  if (loading) return <div>Loading...</div>;

  if (showIntro)
    return (
      <TestIntro
        testInfo={testInfo}
        hasAccess={hasAccess}
        alreadyTaken={alreadyTaken}
        onFollowTest={handleFollowTest}
        onPayAndFollow={handlePayAndFollow}
        role={user?.role === "PERUSAHAAN" ? "PERUSAHAAN" : "USER"}
        quantity={quantity}
        setQuantity={setQuantity}
        checkReason={checkReason}
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

  if (showSubtestDetail && currentSubtest) {
    return <SubtestDetail subtest={currentSubtest} onStart={handleStartSubtest} />;
  }

  // ✅ Tampilan Hapalan ME
  if (showHapalanME && currentSubtest) {
    console.log("showHapalanME", showHapalanME, "timeLeft", timeLeft, "currentSubtest", currentSubtest);
    
let hapalanList: any[] = [];

try {
  // kalau API kirim array langsung
  if (Array.isArray(currentSubtest.hapalan)) {
    hapalanList = currentSubtest.hapalan;
  }

  // kalau API kirim string JSON
  else if (
    typeof currentSubtest.hapalan === "string" &&
    currentSubtest.hapalan.trim() !== ""
  ) {
    hapalanList = JSON.parse(currentSubtest.hapalan);
  }

  // fallback: parse dari description (kalau hapalan kosong tapi ada data di description)
  else if (
    typeof currentSubtest.description === "string" &&
    currentSubtest.description.trim() !== ""
  ) {
    const parsed = JSON.parse(currentSubtest.description);
    hapalanList = Array.isArray(parsed) ? parsed : [];
  }
} catch (e) {
  console.warn("Gagal parse hapalan:", e);
  hapalanList = [];
}




    return (
 <div className={styles.container}>
  <div className={styles.header}>
    <h1 className={styles.title}>Hapalan untuk Subtest ME</h1>
    <div className={styles.timer}>⏳ {formatTime(timeLeft)}</div>
  </div>

  <div className={styles.mainContent}>
    {/* Teks instruksi */}
    <p
      style={{
        marginBottom: "30px",
        fontSize: "16px",
        lineHeight: "1.7",
        textAlign: "center",
        color: "#333",
        maxWidth: "600px",
        marginInline: "auto",
      }}
    >
      Kamu punya waktu <strong>{currentSubtest.durationMinutes} menit</strong>{" "}
      untuk menghapal kata-kata berikut. Setelah itu, kamu akan diminta mengingat
      kata-kata ini pada subtest ME.
    </p>

    {/* Daftar hapalan */}
    {hapalanList.length > 0 ? (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "25px",
          justifyItems: "center",
          marginBottom: "40px",
        }}
      >
        {hapalanList.map((item, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "16px",
              width: "100%",
              maxWidth: "240px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-3px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <h4
              style={{
                fontWeight: 600,
                fontSize: "16px",
                marginBottom: "10px",
                textAlign: "center",
                color: "#111827",
              }}
            >
              {item.category}
            </h4>
            <ul
              style={{
                listStyleType: "disc",
                paddingLeft: "20px",
                color: "#374151",
                lineHeight: "1.7",
                textAlign: "left",
              }}
            >
              {item.words.map((word: string, i: number) => (
                <li key={i}>{word}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    ) : (
      <div className={styles.hapalanBox}>Tidak ada hapalan tersedia</div>
    )}

    {/* Tombol Skip */}
    <div style={{ textAlign: "center" }}>
      <button
        className={styles.btn}
        style={{
          marginTop: "10px",
          padding: "12px 30px",
          backgroundColor: "#2563eb",
          borderRadius: "8px",
          fontSize: "15px",
          color: "white",
          fontWeight: 500,
          transition: "background 0.3s ease",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#1d4ed8")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "#2563eb")
        }
        onClick={handleSkipHapalan}
      >
        Skip / Lanjutkan ke Instruksi ME
      </button>
    </div>
  </div>
</div>

    );
  }

  // ✅ Tampilan Instruksi ME
  if (showInstructionsME && currentSubtest) {
    const instructions = parseDescription(currentSubtest.description);

    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Instruksi Subtest {currentSubtest.name}</h1>
        </div>
        <div className={styles.mainContent}>
          <p style={{ whiteSpace: "pre-line", lineHeight: "1.8" }}>{instructions}</p>
          <button
            className={styles.btn}
            style={{ marginTop: "30px" }}
            onClick={() => {
              setShowInstructionsME(false);
              setTimeout(() => handleStartSubtest(), 100); 
              handleStartSubtest();
            }}
          >
            Mulai Soal ME
          </button>
        </div>
      </div>
    );
  }

if (showQuestions && currentSubtest) {
  const currentQuestion = questions[currentIndex];
  let instructions = "";

  // 🔹 Ambil teks instruksi dari deskripsi ME
  if (currentSubtest.name === "ME" && currentSubtest.description) {
    try {
      const parsed = JSON.parse(currentSubtest.description);
      instructions = Array.isArray(parsed) ? parsed.join("\n") : String(parsed);
    } catch {
      instructions = String(currentSubtest.description);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Soal IST - {currentSubtest.name}</h1>
        <div className={styles.timer}>⏳ {formatTime(timeLeft)}</div>
      </div>

      <div className={styles.mainContent}>
        {/* 🔹 Tampilkan instruksi hanya di awal ME */}
        {currentSubtest.name === "ME" &&
          showInstructionsME &&
          currentIndex === 0 && (
            <p style={{ whiteSpace: "pre-line", lineHeight: "1.8" }}>
              {instructions}
            </p>
          )}

        {/* 🔹 Komponen soal */}
        <div
          style={{
            flex: 3,
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <QuestionCard
            question={currentQuestion}
            answer={answers[currentQuestion.id]}
            onAnswer={handleSelectAnswer}
            subtestDesc={currentSubtest.description}
            onShowSubtestDetail={() => {
              setShowQuestions(false);
              setShowSubtestDetail(true);
            }}
          />

          {/* 🔹 Navigasi soal */}
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
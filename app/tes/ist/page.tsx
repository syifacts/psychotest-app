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
  hapalan?: string; // optional

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
  subTests: { name: string; description: string; durationMinutes: number;   hapalan?: string; // optional
 }[];
} | null>(null);

  //const [testInfo, setTestInfo] = useState<{ id: number; name: string; duration: number; price: number | null } | null>(null);
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
  const [checkReason, setCheckReason] = useState(""); // ✅
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
const [showHapalanME, setShowHapalanME] = useState(false);
const [showInstructionsME, setShowInstructionsME] = useState(false);


function parseDescription(desc: any): string {
  if (!desc) return "";
  if (typeof desc === "string") {
    try {
      const parsed = JSON.parse(desc);
      if (Array.isArray(parsed)) {
        // jika array of string
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
  // Fetch user & test info (middleware)
  // -------------------------
useEffect(() => {
  const fetchUserAndTest = async () => {
    try {
      // 1️⃣ Ambil user
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

      // 2️⃣ Ambil test info
      const testRes = await fetch("/api/tes/info?type=IST");
      const testData = await testRes.json();
      setTestInfo(testData);

      // 3️⃣ Cek akses
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

      // 4️⃣ Ambil progress & attemptId
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
          // --- HAPALAN_ME langsung tampil & timer jalan ---
          setShowHapalanME(true);
          setShowSubtestDetail(false);
          setShowQuestions(false);
        } else {
          await loadQuestions(
            progress.nextSubtest,
            userData.user.id,
            progress.attemptId
          );
          // langsung ke soal
          setShowIntro(false);
          setShowForm(false);
          setShowSubtestDetail(false);
          setShowQuestions(true);
        }

        setLoading(false);
        return;
      }

      // Default: tampilkan intro
      setShowIntro(true);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  fetchUserAndTest();
}, [router]);


 const [quantity, setQuantity] = useState(1); // default 1

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
    // 1️⃣ Mulai pembayaran
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
      setAnswers({}); // jika attempt baru, kosongkan jawaban lama
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
        // 🛑 Jangan submit kalau belum ada jawaban sama sekali
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
        setShowHapalanME(false); // tutup hapalan

        // lanjut ke instruksi ME
        const meSubtest = testInfo?.subTests?.find(st => st.name === "ME");
        if (meSubtest) {
          setCurrentSubtest({
            name: meSubtest.name,
            description: meSubtest.description || "",
            durationMinutes: meSubtest.durationMinutes || 3,
            hapalan: "",
          });
          setShowInstructionsME(true);  // tampilkan instruksi ME
          setShowQuestions(false);
        }
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

  if (!currentSubtest && testInfo?.subTests?.length) {
    try {
      const progressRes = await fetch(`/api/tes/progress?userId=${user.id}&type=IST`);
      const progress = await progressRes.json();

      // Tentukan subtest yang akan dijalankan
      let subtestToSet: typeof testInfo.subTests[0] | undefined;

      if (progress.nextSubtest) {
        subtestToSet = testInfo.subTests.find(
          st => st.name.toLowerCase() === progress.nextSubtest.toLowerCase()
        );
      }

      if (!subtestToSet) {
        subtestToSet = testInfo.subTests[0]; // user baru
      }

      // --- HAPALAN_ME khusus ---
   if (subtestToSet.name === "HAPALAN_ME") {
  const hapalanDesc = parseDescription(subtestToSet.description);
  setCurrentSubtest({
    ...subtestToSet,
    durationMinutes: 3, // timer 3 menit
    description: hapalanDesc,
    hapalan: subtestToSet.hapalan || "[]", // pastikan string JSON valid
  });
  setTimeLeft(3 * 60);   // langsung start timer
  setShowHapalanME(true); 
  setShowQuestions(false);
  setShowSubtestDetail(false);
}
else {
        // Subtest biasa
        setCurrentSubtest({
          name: subtestToSet.name,
          description: parseDescription(subtestToSet.description),
          durationMinutes: subtestToSet.durationMinutes || 6,
          hapalan: subtestToSet.hapalan || "",
        });
        setShowForm(false);
        setShowSubtestDetail(true);
        setShowQuestions(false);
      }

    } catch (err: any) {
      alert(err.message);
    }
  }
};

useEffect(() => {
  if (showHapalanME && timeLeft <= 0) {
    setShowHapalanME(false);
    // Ambil subtest ME
    const meSubtest = testInfo?.subTests?.find(st => st.name === "ME");
    if (meSubtest) {
      setCurrentSubtest({
        name: meSubtest.name,
        description: meSubtest.description || "",
        durationMinutes: meSubtest.durationMinutes || 3,
        hapalan: "", // hapalan kosong
      });
      setShowInstructionsME(true); // tampilkan instruksi ME
      setShowQuestions(false);
    }
  }
}, [showHapalanME, timeLeft]);


const handleStartSubtest = async () => {
  if (!currentSubtest || !user || !testInfo) return;

  try {
    // 1️⃣ Buat attempt baru hanya jika belum ada attemptId
   if (!attemptId) {
  // ✅ Cek attempt aktif
  const activeRes = await fetch(`/api/attempts/active?userId=${user.id}&testTypeId=${testInfo.id}`);
  const activeData = await activeRes.json();

  if (activeData?.id) {
    setAttemptId(activeData.id);
  } else {
    // ✅ Buat attempt baru
    const attemptRes = await fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, testTypeId: testInfo.id }),
    });
    const newAttempt = await attemptRes.json();
    if (!attemptRes.ok || !newAttempt.id) throw new Error("Gagal buat attempt baru");
    setAttemptId(newAttempt.id);
  }
}
 else {
      // 2️⃣ Ambil progress subtest dari backend
      const progressRes = await fetch(`/api/tes/progress?userId=${user.id}&type=IST`);
      const progress = await progressRes.json();

if (progress.startTime && progress.nextSubtest === currentSubtest.name) {
  // ⏳ Hitung dari DB
  const start = new Date(progress.startTime);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + currentSubtest.durationMinutes);
  const secondsLeft = Math.floor((end.getTime() - Date.now()) / 1000);
  setTimeLeft(secondsLeft > 0 ? secondsLeft : currentSubtest.durationMinutes * 60); // fallback
} else {
  // Subtest baru → durasi penuh
  setTimeLeft(currentSubtest.durationMinutes * 60);
}

    }

    // 3️⃣ Load soal dari backend, jawaban lama akan tetap ada
    await loadQuestions(currentSubtest.name, user.id, attemptId || undefined);

    // 4️⃣ Tampilkan soal
    setShowSubtestDetail(false);
    setShowQuestions(true);

  } catch (err) {
    console.error(err);
  }
};


  const handleSaveProfile = async () => {
    if (!user) return;
    if (!fullName || !birthDate) return alert("Nama lengkap dan tanggal lahir wajib diisi!");
    try {
      const res = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, birthDate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal simpan data diri");
      setShowForm(false);
      setShowSubtestDetail(true);
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
        attemptId, // pakai state
        answers: [{ questionId: qid, choice: Array.isArray(choice) ? choice.join(",") : choice }],
      }),
    });
  } catch (err) {
    console.error(err);
  }
};

 const handleSubmit = async () => {
  if (!user || !currentSubtest) return;

  try {
    // 1️⃣ Kirim jawaban subtest saat ini
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

    // -------------------------------
    // Ambil progress terbaru
    const progressRes = await fetch(`/api/tes/progress?userId=${user.id}&type=IST`);
    const progress = await progressRes.json();

    if (progress.nextSubtest && testInfo?.subTests) {
      // Masih ada subtest berikutnya
      const nextSubtestData = testInfo.subTests.find(
        st => st.name.toLowerCase() === progress.nextSubtest.toLowerCase()
      );

      if (nextSubtestData) {
        setShowSubtestDetail(false);
        setCurrentSubtest({
          name: nextSubtestData.name,
         // description: (nextSubtestData.description || "").replace(/\\n/g, "\n"),
           description: parseDescription(nextSubtestData.description),

          durationMinutes: nextSubtestData.durationMinutes || 6,
            hapalan: nextSubtestData.hapalan || "", // ✅ ambil dari DB

        });
        setShowQuestions(false);
        setShowSubtestDetail(true);
        return;
      }
    }

    // -------------------------------
    // Jika tidak ada nextSubtest = semua selesai
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
if (loading) return <div>Loading...</div>; // atau skeleton

if (showIntro)
  return (
    <TestIntro
      testInfo={testInfo}
      hasAccess={hasAccess}
      alreadyTaken={alreadyTaken}
      onFollowTest={handleFollowTest}
      onPayAndFollow={handlePayAndFollow} // callback menerima quantity
        role={user?.role === "PERUSAHAAN" ? "PERUSAHAAN" : "USER"}
  quantity={quantity}            // ✅ dikirim
  setQuantity={setQuantity}      // ✅ dikirim
  checkReason={checkReason} // ✅
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
if (showHapalanME && currentSubtest) {
  console.log(
    "showHapalanME",
    showHapalanME,
    "timeLeft",
    timeLeft,
    "currentSubtest",
    currentSubtest
  );
  const hapalanList = currentSubtest.hapalan
    ? JSON.parse(currentSubtest.hapalan) // <-- parse JSON
    : [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Hapalan Subtest {currentSubtest.name}</h1>
        <div className={styles.timer}>⏳ {formatTime(timeLeft)}</div>
      </div>
      <div className={styles.mainContent}>
        <p>Kamu punya waktu {currentSubtest.durationMinutes} menit untuk menghapal teks berikut:</p>
        {hapalanList.length > 0 ? (
          hapalanList.map((cat: any) => (
            <div key={cat.category} className={styles.hapalanBox}>
              <strong>{cat.category}:</strong> {cat.words.join(", ")}
            </div>
          ))
        ) : (
          <div className={styles.hapalanBox}>Tidak ada hapalan tersedia</div>
        )}
        <button
  onClick={() => {
    setShowHapalanME(false);
    const meSubtest = testInfo?.subTests?.find(st => st.name === "ME");
    if (meSubtest) {
      setCurrentSubtest({
        name: meSubtest.name,
        description: meSubtest.description || "",
        durationMinutes: meSubtest.durationMinutes || 3,
        hapalan: "",
      });
      setShowInstructionsME(true);
      setShowQuestions(false);
    }
  }}
>
  Skip
</button>

      </div>
    </div>
  );
}

if (showInstructionsME && currentSubtest) {
  const instructions = parseDescription(currentSubtest.description);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Instruksi Subtest {currentSubtest.name}</h1>
      </div>
      <div className={styles.mainContent}>
        <p>{instructions}</p>
        <button
          className={styles.btn}
          onClick={() => {
            setShowInstructionsME(false);
            handleStartSubtest(); // lanjut ke soal ME
          }}
        >
          Mulai Soal
        </button>
      </div>
    </div>
  );
}


if (showQuestions && currentSubtest) {
  const currentQuestion = questions[currentIndex];
  let instructions = "";
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
        {instructions && <p>{instructions}</p>}
        <div style={{ flex: 3, display: "flex", flexDirection: "column", gap: "20px" }}>
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

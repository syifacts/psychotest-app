"use client";
import { useEffect, useState } from "react";

type Question = {
  id: number;
  text: string;
  category: string;
};

export default function HollandQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showQuestions, setShowQuestions] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<{ [id: number]: string }>({});

  useEffect(() => {
    if (showQuestions) {
      fetch("/api/holland")
        .then((res) => res.json())
        .then(setQuestions);
    }
  }, [showQuestions]);

  // Homepage
  if (!showQuestions) {
    return (
      <div style={{ maxWidth: 700, margin: "40px auto", padding: "0 16px" }}>
        <h1 style={{ textAlign: "center", color: "#1a237e", fontWeight: 700, fontSize: "2rem" }}>
          Tes Holland (RIASEC)
        </h1>
        <p style={{ textAlign: "center", marginBottom: 32 }}>
          Tes ini bertujuan untuk mengukur minat dan kecenderungan karir berdasarkan 6 tipe utama: Realistic, Investigative, Artistic, Social, Enterprising, dan Conventional.
        </p>
        <div style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
          padding: 32,
          marginBottom: 32,
          textAlign: "center"
        }}>
          <div style={{ marginBottom: 12 }}>
            <span role="img" aria-label="money">💰</span> <b>Harga:</b> Gratis
          </div>
          <div style={{ marginBottom: 24 }}>
            <span role="img" aria-label="clock">⏳</span> <b>Durasi:</b> 30 menit
          </div>
          <button
            style={{
              background: "#1565c0",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 32px",
              fontWeight: 600,
              fontSize: "1rem",
              cursor: "pointer"
            }}
            onClick={() => setShowQuestions(true)}
          >
            Mulai Tes Holland
          </button>
        </div>
        <button style={{
          background: "#e3eafc",
          color: "#1a237e",
          border: "none",
          borderRadius: 8,
          padding: "8px 24px",
          fontWeight: 500,
          marginBottom: 24,
          cursor: "pointer"
        }}>
          ← Kembali
        </button>
      </div>
    );
  }

  // Tampilan soal satu per satu dengan progress bar dan card
  const q = questions[current];
  const total = questions.length;
  const progress = total ? Math.round(((current + 1) / total) * 100) : 0;

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: "0 16px" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{
          height: 8,
          background: "#e3eafc",
          borderRadius: 4,
          overflow: "hidden"
        }}>
          <div style={{
            width: `${progress}%`,
            height: "100%",
            background: "#1565c0",
            transition: "width 0.3s"
          }} />
        </div>
        <div style={{ textAlign: "right", fontSize: 14, color: "#1565c0", marginTop: 4 }}>
          {current + 1} / {total}
        </div>
      </div>
      {q && (
        <div style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
          padding: 32,
          marginBottom: 24,
          textAlign: "center",
          animation: "fadeIn 0.4s"
        }}>
          <div style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: 12 }}>
            {q.text}
          </div>
          {q.category && (
            <div style={{
              display: "inline-block",
              background: "#e3eafc",
              color: "#1565c0",
              borderRadius: 8,
              padding: "2px 12px",
              fontSize: 13,
              marginBottom: 16
            }}>
              {q.category}
            </div>
          )}
          <div style={{ marginTop: 16 }}>
            <button
              style={{
                background: answers[q.id] === "ya" ? "#1565c0" : "#e3eafc",
                color: answers[q.id] === "ya" ? "#fff" : "#1565c0",
                border: "none",
                borderRadius: 8,
                padding: "10px 32px",
                fontWeight: 600,
                fontSize: "1rem",
                marginRight: 12,
                cursor: "pointer"
              }}
              onClick={() => setAnswers({ ...answers, [q.id]: "ya" })}
            >
              Ya
            </button>
            <button
              style={{
                background: answers[q.id] === "tidak" ? "#1565c0" : "#e3eafc",
                color: answers[q.id] === "tidak" ? "#fff" : "#1565c0",
                border: "none",
                borderRadius: 8,
                padding: "10px 32px",
                fontWeight: 600,
                fontSize: "1rem",
                cursor: "pointer"
              }}
              onClick={() => setAnswers({ ...answers, [q.id]: "tidak" })}
            >
              Tidak
            </button>
          </div>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          disabled={current === 0}
          style={{
            background: "#e3eafc",
            color: "#1565c0",
            border: "none",
            borderRadius: 8,
            padding: "8px 24px",
            fontWeight: 500,
            cursor: current === 0 ? "not-allowed" : "pointer"
          }}
          onClick={() => setCurrent(current - 1)}
        >
          ← Sebelumnya
        </button>
        <button
          disabled={current === total - 1}
          style={{
            background: "#1565c0",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 24px",
            fontWeight: 500,
            cursor: current === total - 1 ? "not-allowed" : "pointer"
          }}
          onClick={() => setCurrent(current + 1)}
        >
          Selanjutnya →
        </button>
      </div>
    </div>
  );
}
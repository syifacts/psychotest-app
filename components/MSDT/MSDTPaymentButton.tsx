"use client";

import React, { useState, useEffect } from "react";
import styles from "../../app/tes/msdt/msdt.module.css";

interface Props {
  hasAccess: boolean;
  setHasAccess: (val: boolean) => void;
  startAttempt: () => Promise<void>;
  testInfo: { id: number; duration: number | null; price?: number | null } | null;
  role: "USER" | "PERUSAHAAN" | "GUEST" | "SUPERADMIN";
}

interface User {
  id: number;
  name: string;
  email: string;
  role?: "USER" | "PERUSAHAAN" | "GUEST" | "SUPERADMIN";
}

const MSDTPaymentButton: React.FC<Props> = ({
  hasAccess,
  setHasAccess,
  startAttempt,
  testInfo,
  role,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const [tokenCompleted, setTokenCompleted] = useState(false);

  // ---------------------------
  // Ambil user
  // ---------------------------
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        if (res.ok && data.user) {
          setUser({
            id: data.user.id,
            name: data.user.fullName || "",
            email: data.user.email,
            role: data.user.role === "PERUSAHAAN" ? "PERUSAHAAN" : "USER",
          });
        }
      } catch (err) {
        console.error("Gagal fetch user:", err);
      } finally {
        setCheckingToken(false);
      }
    };
    fetchUser();
  }, []);

  // ---------------------------
  // Handle pembayaran
  // ---------------------------
  const handlePayment = async () => {
    if (!user || user.role === "GUEST") {
      alert("Silahkan login terlebih dahulu untuk membeli test!");
      return (window.location.href = "/login");
    }

    if (!testInfo?.id) return;

    setLoading(true);
    try {
      const payRes = await fetch("/api/payment/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          testTypeId: testInfo.id,
          quantity: user.role === "PERUSAHAAN" ? quantity : 1,
        }),
      });

      const payData = await payRes.json();
      if (!payRes.ok || !payData.success) {
        alert("❌ Pembayaran gagal!");
        return;
      }

      alert("✅ Pembayaran berhasil! Silakan klik 'Mulai Tes' untuk memulai.");
      setHasAccess(true);
    } catch (err) {
      console.error(err);
      alert("❌ Terjadi kesalahan saat pembayaran.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Render
  // ---------------------------
  if (checkingToken) {
    return <p>Memeriksa status tes...</p>;
  }

  // Superadmin: hanya lihat, tidak ada tombol sama sekali
  if (role === "SUPERADMIN") {
    return (
      <p style={{ fontWeight: 500, color: "#555" }}>
        Anda login sebagai Superadmin. Hanya bisa melihat status tes.
      </p>
    );
  }

  if (tokenCompleted) {
    return (
      <p style={{ color: "red", fontWeight: 500 }}>
        ✅ Tes sudah selesai, tidak bisa mengerjakan lagi.
      </p>
    );
  }

  if (user?.role === "GUEST" && hasAccess) {
    return (
      <div>
        <p>
          ✅ Sudah didaftarkan oleh perusahaan: <b>{user.name}</b>
        </p>
        <button className={styles.btn} onClick={startAttempt}>
          Mulai Tes
        </button>
      </div>
    );
  }

  if (hasAccess) {
    return (
      <div>
        <button className={styles.btn} onClick={startAttempt} disabled={!user}>
          Mulai Tes
        </button>
      </div>
    );
  }

  return (
    <div>
      {user?.role === "PERUSAHAAN" && (
        <div style={{ marginBottom: "12px" }}>
          <label
            style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}
          >
            Jumlah Kuantitas
          </label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className={styles.input}
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              width: "120px",
            }}
          />
        </div>
      )}

      <button
        className={styles.btn}
        onClick={handlePayment}
        disabled={!user || loading}
      >
        {user?.role === "PERUSAHAAN"
          ? "Beli Tes (dengan Kuantitas)"
          : "Bayar untuk Ikut Tes"}
      </button>
    </div>
  );
};

export default MSDTPaymentButton;

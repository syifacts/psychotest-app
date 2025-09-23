"use client";

import React, { useState, useEffect } from "react";
import styles from "../../app/tes/cpmi/cpmi.module.css";
import { useSearchParams } from "next/navigation";

interface Props {
  hasAccess: boolean;
  setHasAccess: (val: boolean) => void;
  startAttempt: () => Promise<void>;
  testInfo: { id: number; duration: number | null; price?: number | null } | null;
  role: "USER" | "PERUSAHAAN" | "GUEST";
}

interface User {
  id: number;
  name: string;
  email: string;
  role: "USER" | "PERUSAHAAN" | "GUEST";
}

const CPMIPaymentButton: React.FC<Props> = ({
  hasAccess,
  setHasAccess,
  startAttempt,
  testInfo,
  role,
}) => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [tokenCompleted, setTokenCompleted] = useState(false); // <-- state baru

  // ---------------------------
  // Ambil info user / token
  // ---------------------------
useEffect(() => {
  const fetchUser = async () => {
    try {
      if (token) {
        const resToken = await fetch(`/api/token/info?token=${token}`);
        const dataToken = await resToken.json();

        if (resToken.ok && dataToken) {
          setUser({
            id: dataToken.userId ?? 0,
            name: dataToken.companyName ?? "Guest",
            email: "",
            role: "GUEST",
          });

          // ✅ gunakan isCompleted ATAU used
          setTokenCompleted((dataToken.isCompleted ?? false) || (dataToken.used ?? false));


          setHasAccess(true);
          return;
        }
      }

      const resUser = await fetch("/api/auth/me", { credentials: "include" });
      const dataUser = await resUser.json();

      if (resUser.ok && dataUser.user) {
        setUser({
          id: dataUser.user.id,
          name: dataUser.user.fullName || "",
          email: dataUser.user.email,
          role: dataUser.user.role === "PERUSAHAAN" ? "PERUSAHAAN" : "USER",
        });
      }
    } catch (err) {
      console.error("Gagal fetch user/token info:", err);
    }
  };

  fetchUser();
}, [token, setHasAccess]);


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

  if (tokenCompleted) {
    return (
      <p style={{ color: "red", fontWeight: 500 }}>
        ✅ Tes sudah selesai, tidak bisa mengerjakan lagi.
      </p>
    );
  }

  // Guest via token
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

  // User / Perusahaan sudah bayar / punya akses
  if (hasAccess) {
    return (
      <div>
        <button className={styles.btn} onClick={startAttempt} disabled={!user}>
          Mulai Tes
        </button>
      </div>
    );
  }

  // Belum bayar, tampilkan tombol Bayar / Beli
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

export default CPMIPaymentButton;

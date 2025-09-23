"use client";

import React, { useState, useEffect } from "react";
import styles from "../../app/tes/msdt/msdt.module.css";

interface Props {
  hasAccess: boolean;
  setHasAccess: (val: boolean) => void;
  startAttempt: () => Promise<void>;
  testInfo: { id: number; duration: number | null; price?: number | null } | null;
  role: "USER" | "PERUSAHAAN";
}

interface User {
  id: number;
  name: string;
  email: string;
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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        if (res.ok) setUser(data.user);
      } catch (err) {
        console.error("Gagal fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  const handlePayment = async () => {
  // ❌ Cek dulu login/guest
  if (!user) {
    alert("Silahkan login terlebih dahulu untuk membeli test!");
    return window.location.href = "/login";
  }

  if ((user as any).role === "GUEST") {
    alert("Silahkan login terlebih dahulu untuk membeli test!");
    return window.location.href = "/login";
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
        quantity: role === "PERUSAHAAN" ? quantity : 1,
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


  // Tombol Mulai Tes jika sudah punya akses
  if (hasAccess) {
    return (
      <div>
        <button className={styles.btn} onClick={startAttempt} disabled={!user}>
          Mulai Tes
        </button>
      </div>
    );
  }

  // Tombol Bayar / Beli untuk role perusahaan
  return (
    <div>
      {role === "PERUSAHAAN" && (
        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>
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

      <button className={styles.btn} onClick={handlePayment} disabled={!user || loading}>
        {role === "PERUSAHAAN" ? "Beli Tes (dengan Kuantitas)" : "Bayar & Mulai Tes"}
      </button>
    </div>
  );
};

export default MSDTPaymentButton;

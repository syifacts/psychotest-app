"use client";

import React, { useState, useEffect } from "react";
import styles from "../../app/tes/cpmi/cpmi.module.css";

interface Props {
  hasAccess: boolean;
  setHasAccess: (val: boolean) => void;
  startAttempt: () => Promise<void>;
  testInfo: { id: number; duration: number | null } | null;
  role: "USER" | "PERUSAHAAN";
}

interface User {
  id: number;
  name: string;
  email: string;
}

const CPMIPaymentButton: React.FC<Props> = ({
  hasAccess,
  setHasAccess,
  startAttempt,
  testInfo,
  role,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [checkReason, setCheckReason] = useState("");


  useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      if (res.ok) setUser(data.user);

      if (data.user && testInfo) {
        const checkRes = await fetch(`/api/tes/check-access?userId=${data.user.id}&type=CPMI`);
        const checkData = await checkRes.json();

        if (checkData.access) {
          setAlreadyRegistered(true);
          setCheckReason(checkData.reason); // ✅ tambahkan ini
        }
      }
    } catch (err) {
      console.error("Gagal fetch user:", err);
    }
  };
  fetchUser();
}, [testInfo]);


  const handlePayment = async () => {
  if (!user?.id || !testInfo?.id) return;

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
setAlreadyRegistered(true);
setCheckReason(payData.reason || "Sudah bayar sendiri"); // ⬅️ ambil dari API

  } catch (err) {
    console.error(err);
    alert("❌ Terjadi kesalahan saat pembayaran.");
  } finally {
    setLoading(false);
  }
};

if (hasAccess || alreadyRegistered) {
  return (
    <div>
      {alreadyRegistered && (
        <p style={{ color: "green", marginBottom: "8px" }}>
          ✅ {checkReason}
        </p>
      )}
      <button className={styles.btn} onClick={startAttempt} disabled={!user}>
        Mulai Tes
      </button>
    </div>
  );
}


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
            style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "6px", width: "120px" }}
          />
        </div>
      )}

      <button className={styles.btn} onClick={handlePayment} disabled={!user || loading}>
        {role === "PERUSAHAAN" ? "Beli Tes (dengan Kuantitas)" : "Bayar untuk Ikut Tes"}
      </button>
    </div>
  );
};

export default CPMIPaymentButton;

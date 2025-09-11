"use client";

import React, { useState } from "react";
import styles from "../../app/tes/cpmi/cpmi.module.css";

interface Props {
  hasAccess: boolean;
  setHasAccess: (val: boolean) => void;
  startAttempt: () => Promise<void>;
  testInfo: { id: number; duration: number | null } | null;
  role: "USER" | "PERUSAHAAN";
}

const CPMIPaymentButton: React.FC<Props> = ({
  hasAccess,
  setHasAccess,
  startAttempt,
  testInfo,
  role,
}) => {
  const [quantity, setQuantity] = useState(1);

  const handlePayment = async () => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!savedUser.id || !testInfo?.id) return;

    const payRes = await fetch("/api/payment/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: savedUser.id,
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
  };

  if (hasAccess) {
    return (
      <button className={styles.btn} onClick={startAttempt}>
        Mulai Tes
      </button>
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
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              width: "120px",
            }}
          />
        </div>
      )}

      <button className={styles.btn} onClick={handlePayment}>
        {role === "PERUSAHAAN" ? "Beli Tes (dengan Kuantitas)" : "Bayar untuk Ikut Tes"}
      </button>
    </div>
  );
};

export default CPMIPaymentButton;

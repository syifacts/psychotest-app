"use client";

import React from "react";
import styles from "../../app/tes/cpmi/cpmi.module.css";

interface Props {
  hasAccess: boolean;
  setHasAccess: (val: boolean) => void;
  startAttempt: () => Promise<void>;
  testInfo: { id: number; duration: number | null } | null;
}

const CPMIPaymentButton: React.FC<Props> = ({ hasAccess, setHasAccess, startAttempt, testInfo }) => {
  const handlePayment = async () => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!savedUser.id || !testInfo?.id) return;

    const payRes = await fetch("/api/payment/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: savedUser.id,
        testTypeId: testInfo.id,
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

  return hasAccess ? (
    <button className={styles.btn} onClick={startAttempt}>
      Mulai Tes
    </button>
  ) : (
    <button className={styles.btn} onClick={handlePayment}>
      Bayar untuk Ikut Tes
    </button>
  );
};

export default CPMIPaymentButton;

"use client";
import React from "react";
import Link from "next/link";
import styles from "../../app/tes/ist/Ist.module.css";

interface Props {
  testInfo: { price: number | null; duration: number } | null;
  hasAccess: boolean;
  alreadyTaken: boolean;
  onFollowTest: () => void;
  onPayAndFollow: () => void;
}

const TestIntro: React.FC<Props> = ({
  testInfo,
  hasAccess,
  alreadyTaken,
  onFollowTest,
  onPayAndFollow,
}) => {
  return (
    <div className={styles.introContainer}>
      <h1 className={styles.title}>Tes IST (Intelligence Structure Test)</h1>
      <p className={styles.description}>
        Tes ini bertujuan untuk mengukur inteligensi berdasarkan 9 komponen utama.
      </p>

      <div className={styles.infoBox}>
        <p>
          <b>💰 Harga:</b>{" "}
          {testInfo?.price && testInfo.price > 0
            ? `Rp ${testInfo.price.toLocaleString("id-ID")}`
            : "Gratis"}
        </p>
        <p>
          <b>⏳ Durasi:</b> {testInfo?.duration ?? 60} menit
        </p>

        {alreadyTaken && (
          <p className="text-red-500 font-semibold mt-2">
            ⚠️ Anda sudah pernah mengikutinya
          </p>
        )}

        {!hasAccess ? (
          <button className={styles.btn} onClick={onPayAndFollow}>
            Bayar untuk Ikut Tes
          </button>
        ) : (
          <button className={styles.btn} onClick={onFollowTest}>
            Ikuti Tes
          </button>
        )}
      </div>

      <div className={styles.backWrapper}>
        <Link href="/dashboard">
          <button className={styles.backBtn}>← Kembali</button>
        </Link>
      </div>
    </div>
  );
};

export default TestIntro;

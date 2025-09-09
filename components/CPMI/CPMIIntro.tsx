"use client";

import React from "react";
import Link from "next/link";
import styles from "../../app/tes/cpmi/cpmi.module.css";
import CPMIPaymentButton from "./CPMIPaymentButton";

interface Props {
  testInfo: { id: number; duration: number | null } | null;
  hasAccess: boolean;
  setHasAccess: (val: boolean) => void;
  startAttempt: () => Promise<void>;
}

const CPMIIntro: React.FC<Props> = ({ testInfo, hasAccess, setHasAccess, startAttempt }) => {
  return (
    <div className={styles.introContainer}>
      {/* HEADER */}
      <div className={styles.header}>
        <h1 className={styles.title}>Tes CPMI (Calon Pekerja Migran Indonesia)</h1>
        <p className={styles.subtitle}>
          Tes ini dirancang untuk mengukur <b>tingkat konsentrasi</b>,{" "}
          <b>pengendalian diri</b>, dan <b>ketahanan kerja</b> sebagai syarat penting
          dalam kesiapan bekerja di luar negeri.
        </p>
      </div>

      {/* BENEFITS */}
      <div className={styles.benefitsBox}>
        <h2 className={styles.sectionTitle}>Mengapa Ikut Tes CPMI?</h2>
        <ul className={styles.benefitList}>
          <li>✅ Mendapat hasil tes yang <b>tervalidasi</b> dan <b>tersertifikasi dokter</b>.</li>
          <li>✅ Membantu memastikan kesiapan mental dan emosional dalam bekerja.</li>
          <li>✅ Menjadi salah satu syarat resmi untuk keberangkatan kerja ke luar negeri.</li>
          <li>✅ Hasil tes dapat digunakan sebagai bukti kemampuan di bidang konsentrasi & stabilitas kerja.</li>
        </ul>
      </div>

      {/* INSTRUCTIONS */}
      <div className={styles.instructions}>
        <h2 className={styles.sectionTitle}>Instruksi Tes</h2>
        <p>
          Perhatikan simbol yang ada untuk menentukan apakah sama atau berbeda.
          Pilih:
        </p>
        <ol>
          <li><b>A</b> jika simbol sama</li>
          <li><b>B</b> jika simbol berbeda</li>
          <li><b>C</b> jika tidak ada jawaban yang tepat</li>
        </ol>
        <p>
          Tes ini akan mengukur aspek:
        </p>
        <ul>
          <li>📌 Tingkat konsentrasi & kecermatan</li>
          <li>📌 Pengendalian diri & stabilitas emosi</li>
          <li>📌 Ketahanan kerja</li>
        </ul>
      </div>

      {/* INFO + BUTTON */}
      <div className={styles.infoBox}>
        <p><b>⏳ Durasi Tes:</b> {testInfo?.duration || 30} menit</p>
        <div className={styles.paymentWrapper}>
          <CPMIPaymentButton
            hasAccess={hasAccess}
            setHasAccess={setHasAccess}
            startAttempt={startAttempt}
            testInfo={testInfo}
          />
        </div>
      </div>

      {/* BACK BUTTON */}
      <div className={styles.backWrapper}>
        <Link href="/dashboard">
          <button className={styles.backBtn}>← Kembali ke Dashboard</button>
        </Link>
      </div>
    </div>
  );
};

export default CPMIIntro;

"use client";

import React from "react";
import Link from "next/link";
import styles from "../../app/tes/cpmi/cpmi.module.css";
import CPMIPaymentButton from "./CPMIPaymentButton";

interface Props {
   testInfo: { id: number; duration: number | null; price?: number | null } | null;
  hasAccess: boolean;
  setHasAccess: (val: boolean) => void;
  startAttempt: () => Promise<void>;
}

const CPMIIntro: React.FC<Props> = ({ testInfo, hasAccess, setHasAccess, startAttempt }) => {
  return (
    <div className={styles.pageWrapper}>
      {/* LEFT - Deskripsi */}
      <div className={styles.leftColumn}>
        <header className={styles.header}>
          <h1 className={styles.title}>Tes CPMI (Calon Pekerja Migran Indonesia)</h1>
          <p className={styles.subtitle}>
            Tes ini dirancang untuk mengukur <b>tingkat konsentrasi</b>,{" "}
            <b>pengendalian diri</b>, dan <b>ketahanan kerja</b> sebagai syarat penting
            dalam kesiapan bekerja di luar negeri.
          </p>
        </header>

        <section className={styles.benefitsBox}>
          <h2 className={styles.sectionTitle}>Mengapa Ikut Tes CPMI?</h2>
          <ul className={styles.benefitList}>
            <li>✅ Hasil tes <b>tervalidasi</b> & <b>tersertifikasi dokter</b></li>
            <li>✅ Membantu memastikan kesiapan mental & emosional</li>
            <li>✅ Salah satu syarat resmi keberangkatan kerja luar negeri</li>
            <li>✅ Bukti kemampuan konsentrasi & stabilitas kerja</li>
          </ul>
        </section>

        <section className={styles.instructions}>
          <h2 className={styles.sectionTitle}>Instruksi Tes</h2>
          <p className={styles.instructionsText}>
           Intruksi: Perhatikan simbol yang ada untuk menentukan apakah sama atau berbeda.
            Lingkari <b>A</b> jika simbol sama, <b>B</b> jika simbol berbeda, dan <b>C</b> jika tidak ada jawaban yang tepat.
          </p>
          <ul className={styles.keyPoints}>
            <li>📌 Tingkat konsentrasi & kecermatan</li>
            <li>📌 Pengendalian diri & stabilitas emosi</li>
            <li>📌 Ketahanan kerja</li>
          </ul>
        </section>
      </div>

      {/* RIGHT - Payment Box */}
<aside className={styles.rightColumn}>
  <div className={styles.paymentBox}>
    <img src="/cpmi.jpg" alt="Ilustrasi Tes CPMI" className={styles.illustration} />
    
    <p><b>⏳ Durasi Tes:</b> {testInfo?.duration || 30} menit</p>
    
    <div className={styles.extraInfo}>
  <p><b>💳 Biaya Tes:</b> Rp {testInfo?.price?.toLocaleString("id-ID") || "0"}</p>
      <p><b>📜 Hasil:</b> Tersedia setelah tes selesai</p>
    </div>

    <div className={styles.paymentWrapper}>
      <CPMIPaymentButton
        hasAccess={hasAccess}
        setHasAccess={setHasAccess}
        startAttempt={startAttempt}
        testInfo={testInfo}
      />
    </div>

    <div className={styles.benefitsMini}>
      <h3>✨ Keuntungan Ikut Tes:</h3>
      <ul>
        <li>Hasil resmi & tervalidasi</li>
        <li>Meningkatkan peluang kerja</li>
        <li>Bisa diakses secara online</li>
      </ul>
    </div>

    <div className={styles.supportBox}>
      <p>❓ Butuh bantuan? Hubungi <b>support@cpmi-test.com</b></p>
    </div>

    <div className={styles.backWrapper}>
      <Link href="/dashboard">
        <button className={styles.backBtn}>← Kembali ke Dashboard</button>
      </Link>
    </div>
  </div>
</aside>
</div>
  );
};

export default CPMIIntro;

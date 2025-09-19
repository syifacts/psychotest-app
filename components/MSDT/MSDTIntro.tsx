"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "../../app/tes/msdt/msdt.module.css";
import Navbar from "../layout/navbar";
import MSDTPaymentButton from "./MSDTPaymentButton";

interface MSDTIntroProps {
  testInfo: { id: number; duration: number | null; price?: number | null } | null;
  hasAccess: boolean;
  setHasAccess: (val: boolean) => void;
  startAttempt: () => Promise<void>;
  accessReason?: string;
  role: "USER" | "PERUSAHAAN";
}

const MSDTIntro: React.FC<MSDTIntroProps> = ({
  testInfo,
  hasAccess,
  setHasAccess,
  startAttempt,
  accessReason,
  role,
}) => {
  const showAccessBadge = accessReason && accessReason.length > 0;

  return (
    <>
      <Navbar />

      <div className={styles.pageWrapper}>
        {/* LEFT COLUMN */}
        <motion.div
          className={styles.leftColumn}
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <header className={styles.header}>
            <h1 className={styles.title}>Tes MSDT (Minnesota Supervisor Diagnostic Test)</h1>
            <p className={styles.subtitle}>
              Tes ini terdiri dari 64 soal, masing-masing dengan dua pilihan A atau B.
            </p>
          </header>

          <motion.div
            className={styles.card}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <h2 className={styles.sectionTitle}>Mengapa Ikut Tes MSDT?</h2>
            <ul className={styles.benefitList}>
              <li>✅ Menilai kemampuan pengambilan keputusan supervisor</li>
              <li>✅ Membantu pengembangan kepemimpinan</li>
              <li>✅ Memberikan insight terkait preferensi dan gaya kerja</li>
            </ul>
          </motion.div>

          <motion.section
            className={styles.instructions}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
          >
            <h2 className={styles.sectionTitle}>Instruksi Tes</h2>
            <p className={styles.instructionsText}>
              Silakan pilih salah satu dari dua pilihan (A atau B) untuk setiap soal.
            </p>
            <ul className={styles.keyPoints}>
              <li>📌 Jawab dengan cepat dan jujur</li>
              <li>📌 Tidak ada jawaban benar/salah</li>
              <li>📌 Durasi tes: {testInfo?.duration || 30} menit</li>
            </ul>
          </motion.section>
        </motion.div>

  {/* Right column di MSDTIntro */}
{/* RIGHT COLUMN */}
<motion.aside
  className={styles.rightColumn}
  initial={{ opacity: 0, x: 50 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8 }}
>
  <div className={styles.paymentBox}>
    {/* Ilustrasi Tes */}
    <motion.img
      src="/msdt.jpg"
      alt="Ilustrasi Tes MSDT"
      className={styles.illustration}
      whileHover={{ scale: 1.08, rotate: -3 }}
    />

    {/* Info Durasi */}
    <p><b>⏳ Durasi Tes:</b> {testInfo?.duration || 30} menit</p>

    {/* Biaya & Hasil */}
    <div className={styles.extraInfo}>
      <p><b>💳 Biaya Tes:</b> Rp {testInfo?.price?.toLocaleString("id-ID") || "0"}</p>
      <p><b>📜 Hasil:</b> Tersedia setelah tes selesai</p>
    </div>

    {/* Payment Button & Badge */}
    <div className={styles.paymentWrapper}>
      {accessReason && hasAccess && (
        <p className={styles.accessReasonBadge} style={{ marginBottom: "12px", color: "#555" }}>
          🏢 {accessReason}
        </p>
      )}

      <MSDTPaymentButton
        hasAccess={hasAccess}
        setHasAccess={setHasAccess}
        startAttempt={startAttempt}
        testInfo={testInfo}
        role={role}
      />
    </div>

    {/* Keuntungan Ikut Tes */}
    <div className={styles.benefitsMini}>
      <h3>✨ Keuntungan Ikut Tes:</h3>
      <ul>
        <li>Hasil resmi & tervalidasi</li>
        <li>Meningkatkan peluang kerja</li>
        <li>Bisa diakses secara online</li>
      </ul>
    </div>

    {/* Support */}
    <div className={styles.supportBox}>
      <p>❓ Butuh bantuan? Hubungi <b>support@msdt-test.com</b></p>
    </div>

    {/* Tombol Kembali */}
    <div className={styles.backWrapper}>
      <Link href="/dashboard">
        <button className={styles.backBtn}>← Kembali ke Dashboard</button>
      </Link>
    </div>
  </div>
</motion.aside>


      </div>
    </>
  );
};

export default MSDTIntro;

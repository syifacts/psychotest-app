"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "../../app/tes/cpmi/cpmi.module.css";
import CPMIPaymentButton from "./CPMIPaymentButton";
import Navbar from "../layout/navbar";

interface Props {
  testInfo: { id: number; duration: number | null; price?: number | null } | null;
  hasAccess: boolean;
  setHasAccess: (val: boolean) => void;
  startAttempt: () => Promise<void>;
  accessReason?: string;
   role: "USER" | "PERUSAHAAN" | "GUEST"; 
}

const CPMIIntro: React.FC<Props> = ({
  testInfo,
  hasAccess,
  setHasAccess,
  startAttempt,
  role,
  accessReason,
}) => {
  const isCompanyAccess = accessReason?.startsWith("Sudah didaftarkan oleh perusahaan");

  return (
    <>
      <Navbar />

      <div className={styles.pageWrapper}>
        {/* FLOATING DECORATIONS */}
        <div className={styles.floatingCircle}></div>
        <div className={styles.floatingSquare}></div>

        {/* LEFT COLUMN */}
        <motion.div
          className={styles.leftColumn}
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <header className={styles.header}>
            <h1 className={styles.title}>Tes CPMI (Calon Pekerja Migran Indonesia)</h1>
            <p className={styles.subtitle}>
              Tes ini dirancang untuk mengukur <b>tingkat konsentrasi</b>, <b>pengendalian diri</b>, dan <b>ketahanan kerja</b> sebagai syarat penting
              dalam kesiapan bekerja di luar negeri.
            </p>
          </header>

          <motion.section
            className={styles.benefitsBox}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <h2 className={styles.sectionTitle}>Mengapa Ikut Tes CPMI?</h2>
            <ul className={styles.benefitList}>
              <li>✅ Hasil tes <b>tervalidasi</b> & <b>tersertifikasi dokter</b></li>
              <li>✅ Membantu memastikan kesiapan mental & emosional</li>
              <li>✅ Salah satu syarat resmi keberangkatan kerja luar negeri</li>
              <li>✅ Bukti kemampuan konsentrasi & stabilitas kerja</li>
            </ul>
          </motion.section>

          <motion.section
            className={styles.instructions}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
          >
            <h2 className={styles.sectionTitle}>Instruksi Tes</h2>
            <p className={styles.instructionsText}>
              Terdapat 3 aspek yang diujikan, diantaranya:
            </p>
            <ul className={styles.keyPoints}>
              <li>📌 Tingkat konsentrasi & kecermatan</li>
              <li>📌 Pengendalian diri & stabilitas emosi</li>
              <li>📌 Ketahanan kerja</li>
            </ul>
          </motion.section>
        </motion.div>

        {/* RIGHT COLUMN */}
        <motion.aside
          className={styles.rightColumn}
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className={styles.paymentBox}>
            <motion.img
              src="/cpmi.jpg"
              alt="Ilustrasi Tes CPMI"
              className={styles.illustration}
              whileHover={{ scale: 1.08, rotate: -3 }}
            />

            <p><b>⏳ Durasi Tes:</b> {testInfo?.duration || 30} menit</p>
            <div className={styles.extraInfo}>
              <p><b>💳 Biaya Tes:</b> Rp {testInfo?.price?.toLocaleString("id-ID") || "0"}</p>
              <p><b>📜 Hasil:</b> Tersedia setelah tes selesai</p>
            </div>

            <div className={styles.paymentWrapper}>
              {/* Tampilkan badge perusahaan HANYA jika attempt belum selesai */}
              {isCompanyAccess && hasAccess && (
                <p className={styles.accessReasonBadge} style={{ marginBottom: "12px", color: "#555" }}>
                  🏢 {accessReason}
                </p>
              )}

              {/* CPMIPaymentButton akan otomatis menyesuaikan tombol jika hasAccess = false */}
              <CPMIPaymentButton
                hasAccess={hasAccess}
                setHasAccess={setHasAccess}
                startAttempt={startAttempt}
                testInfo={testInfo}
                role={role}
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
        </motion.aside>
      </div>
    </>
  );
};

export default CPMIIntro;

"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react"; // <- pastikan ini ada
import { motion } from "framer-motion";
import styles from "../../app/tes/cpmi/cpmi.module.css";
import CPMIPaymentButton from "./CPMIPaymentButton";
import Navbar from "../layout/navbar";

interface Props {
   testInfo: {
    id: number;
    duration: number | null;
    price?: number | null;
    judul?: string;
    deskripsijudul?: string;
    juduldesk1?: string;
    desk1?: string;
    juduldesk2?: string;
    desk2?: string;
    judulbenefit?: string;
    pointbenefit?: string;
    img?: string;
    cp?: string;
  } | null;
  hasAccess: boolean;
  setHasAccess: (val: boolean) => void;
  startAttempt: () => Promise<void>;
  accessReason?: string;
   role: "USER" | "PERUSAHAAN" | "GUEST" | "SUPERADMIN"; 
}

const CPMIIntro: React.FC<Props> = ({
  testInfo,
  hasAccess,
  setHasAccess,
  startAttempt,
  role,
  accessReason,
}) => {
const [currentRole, setCurrentRole] = useState<"USER" | "PERUSAHAAN" | "SUPERADMIN" | "GUEST">("GUEST");
  const isCompanyAccess = accessReason?.startsWith("Sudah didaftarkan oleh perusahaan");

  useEffect(() => {
  // misal ambil dari API /auth/me
  fetch("/api/auth/me", { credentials: "include" })
    .then(res => res.json())
    .then(data => {
      if (data.user?.role) setCurrentRole(data.user.role);
    });
}, []);
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
  {testInfo?.judul && (
    <h1 className={styles.title}>{testInfo.judul}</h1>
  )}
  {testInfo?.deskripsijudul && (
    <p
      className={styles.subtitle}
      dangerouslySetInnerHTML={{ __html: testInfo.deskripsijudul }}
    />
  )}
</header>


         <motion.section
  className={styles.benefitsBox}
  whileHover={{ scale: 1.02 }}
  transition={{ type: "spring", stiffness: 200 }}
>
  {testInfo?.juduldesk1 && <h2 className={styles.sectionTitle}>{testInfo.juduldesk1}</h2>}
  {testInfo?.desk1 && (
    <ul className={styles.benefitList}>
      {testInfo.desk1.split("\n").map((line, idx) => (
        <li key={idx} dangerouslySetInnerHTML={{ __html: line }} />
      ))}
    </ul>
  )}
</motion.section>


        <motion.section
  className={styles.instructions}
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.9 }}
>
  {testInfo?.juduldesk2 && (
    <h2 className={styles.sectionTitle}>{testInfo.juduldesk2}</h2>
  )}
  {testInfo?.desk2 && (
    <ul className={styles.keyPoints}>
      {testInfo.desk2.split("\n").map((line, idx) => (
        <li key={idx} dangerouslySetInnerHTML={{ __html: line }} />
      ))}
    </ul>
  )}
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
  role={currentRole}
              />
            </div>

<div className={styles.benefitsMini}>
  {testInfo?.judulbenefit && <h3>{testInfo.judulbenefit}</h3>}
  {testInfo?.pointbenefit && (
    <div>
      {testInfo.pointbenefit.split("\n").map((line, idx) => (
        <p
          key={idx}
          className={styles.benefitLine}
          dangerouslySetInnerHTML={{ __html: line }}
        />
      ))}
    </div>
  )}
</div>


            <div className={styles.supportBox}>
  {testInfo?.cp && (
    <div dangerouslySetInnerHTML={{ __html: testInfo.cp }} />
  )}
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

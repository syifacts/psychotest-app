"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "../../app/tes/msdt/msdt.module.css";

interface Props {
  testInfo: { price: number | null; duration: number } | null;
  hasAccess: boolean;
  alreadyTaken: boolean;
  checkReason?: string;
  role?: "USER" | "PERUSAHAAN";
  quantity: number;
  setQuantity: (q: number) => void;
  onFollowTest: () => void;
  onPayAndFollow: () => void;
}

const ISTIntro: React.FC<Props> = ({
  testInfo,
  hasAccess,
  alreadyTaken,
  checkReason,
  role = "USER",
  quantity,
  setQuantity,
  onFollowTest,
  onPayAndFollow,
}) => {
  return (
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
          <h1 className={styles.title}>Tes IST (Intelligence Structure Test)</h1>
          <p className={styles.subtitle}>
            Tes ini bertujuan untuk mengukur inteligensi berdasarkan 9 komponen utama.
          </p>
        </header>

        <motion.div
          className={styles.card}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <h2 className={styles.sectionTitle}>Mengapa Ikut Tes IST?</h2>
          <ul className={styles.benefitList}>
            <li>✅ Menilai aspek kognitif utama</li>
            <li>✅ Memberikan profil inteligensi</li>
            <li>✅ Bisa digunakan untuk pengembangan diri/pekerjaan</li>
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
          <ul className={styles.keyPoints}>
            <li>📌 Jawab dengan cepat dan jujur</li>
            <li>📌 Tidak ada jawaban benar/salah</li>
            <li>📌 Durasi tes: {testInfo?.duration || 60} menit</li>
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
            src="/ist.jpeg"
            alt="Ilustrasi Tes IST"
            className={styles.illustration}
            whileHover={{ scale: 1.08, rotate: -3 }}
          />

          <p><b>⏳ Durasi Tes:</b> {testInfo?.duration || 60} menit</p>
          <div className={styles.extraInfo}>
            <p><b>💳 Biaya Tes:</b> {testInfo?.price ? `Rp ${testInfo.price.toLocaleString("id-ID")}` : "Gratis"}</p>
            <p><b>📜 Hasil:</b> Tersedia setelah tes selesai</p>
          </div>

          <div className={styles.paymentWrapper}>
            {checkReason && hasAccess && (
              <p className={styles.accessReasonBadge}>🏢 {checkReason}</p>
            )}

            {!hasAccess ? (
              <div>
                {role === "PERUSAHAAN" && (
                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>
                      Jumlah Karyawan
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className={styles.input}
                      style={{ padding: "8px", borderRadius: "6px", width: "120px", border: "1px solid #ccc" }}
                    />
                  </div>
                )}
                <button className={styles.btn} onClick={onPayAndFollow}>
                  {role === "PERUSAHAAN" ? "Beli Tes untuk Karyawan" : "Bayar untuk Ikut Tes"}
                </button>
              </div>
            ) : (
              <button className={styles.btn} onClick={onFollowTest}>Ikuti Tes</button>
            )}
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
            <p>❓ Butuh bantuan? Hubungi <b>support@ist-test.com</b></p>
          </div>

          <div className={styles.backWrapper}>
            <Link href="/dashboard">
              <button className={styles.backBtn}>← Kembali</button>
            </Link>
          </div>
        </div>
      </motion.aside>
    </div>
  );
};

export default ISTIntro;

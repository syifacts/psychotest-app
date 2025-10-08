"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, Variants, cubicBezier } from "framer-motion";
import Navbar from "../layout/navbar";
import ISTPaymentButton from "./ISTPaymentButton";

interface Props {
  testInfo: {
    id: number;
    name: string;
    duration: number | null;
    price?: number | null;
    img?: string;
  } | null;
  hasAccess: boolean;
  alreadyTaken: boolean;
  checkReason?: string;
  role?: "USER" | "PERUSAHAAN" | "GUEST" | "SUPERADMIN";
  quantity: number;
  setQuantity: (q: number) => void;
  onFollowTest: () => void;
  onPayAndFollow: () => void;
}

const ISTIntro: React.FC<Props> = ({
  testInfo,
  hasAccess,
  checkReason,
  onFollowTest,
}) => {
  const [currentRole, setCurrentRole] = useState<
    "USER" | "PERUSAHAAN" | "SUPERADMIN" | "GUEST"
  >("GUEST");

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.role) setCurrentRole(data.user.role);
      });
  }, []);

  // ====== Animations ======
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: cubicBezier(0.22, 1, 0.36, 1) },
    },
  };

  const floatingVariants: Variants = {
    animate: {
      y: [0, -20, 0],
      transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 overflow-hidden">
        {/* ===== Decorative Blobs ===== */}
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-pink-400 to-purple-500 opacity-20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 0],
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute bottom-10 right-20 w-80 h-80 bg-gradient-to-br from-green-400 to-blue-400 opacity-15 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, -180, 0],
            x: [0, -30, 0],
            y: [0, 15, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* ===== Content ===== */}
        <div className="relative z-10 px-6 md:px-16 py-16 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-20"
          >
            <motion.h1
              className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-blue-600 to-blue-800 bg-clip-text text-transparent mb-6 leading-tight"
            >
              Tes IST (Intelligence Structure Test)
            </motion.h1>
            <motion.p
              className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
            >
              Tes ini bertujuan untuk mengukur inteligensi berdasarkan 9 komponen utama untuk menilai aspek kognitif seseorang.
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid lg:grid-cols-2 gap-12 items-start"
          >
            {/* LEFT INFO */}
            <motion.div variants={itemVariants} className="space-y-8">
              <motion.section
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl rounded-2xl p-8 border border-indigo-100 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Mengapa Ikut Tes IST?</h2>
                  <ul className="space-y-3 text-gray-700">
                    <li>✅ Menilai aspek kognitif utama</li>
                    <li>✅ Memberikan profil inteligensi</li>
                    <li>✅ Berguna untuk pengembangan diri dan karier</li>
                  </ul>
                </div>
              </motion.section>

              <motion.section
                whileHover={{ scale: 1.02, y: -5 }}
                className="group bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl rounded-2xl p-8 border border-cyan-100 relative overflow-hidden"
              >
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Instruksi Tes</h2>
                  <ul className="space-y-2 text-gray-700">
                    <li>📌 Jawab dengan cepat dan jujur</li>
                    <li>📌 Tidak ada jawaban benar atau salah</li>
                    <li>📌 Durasi tes: {testInfo?.duration || 60} menit</li>
                  </ul>
                </div>
              </motion.section>
            </motion.div>

            {/* RIGHT INFO */}
            <motion.aside variants={itemVariants} className="space-y-8">
              <motion.div
                variants={floatingVariants}
                animate="animate"
                className="bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl p-8 border border-gray-100 relative overflow-hidden"
              >
                <motion.div
                  className="relative rounded-2xl overflow-hidden shadow-xl mb-6"
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img
                    src={testInfo?.img || "/ist.jpeg"}
                    alt="Ilustrasi Tes IST"
                    className="w-full h-64 object-cover"
                  />
                </motion.div>

                {checkReason && hasAccess && (
                  <p className="text-sm bg-blue-50 text-blue-700 px-4 py-3 rounded-xl mb-6 border border-blue-200 flex items-center gap-2">
                    🏢 {checkReason}
                  </p>
                )}

                <div className="flex justify-center">
                  <ISTPaymentButton
                    hasAccess={hasAccess}
                    setHasAccess={() => {}}
  startAttempt={async () => onFollowTest()} // 🔥 dibungkus async
                    testInfo={testInfo}
                    role={currentRole}
                  />
                </div>
              </motion.div>

              {/* Info Cards */}
              <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl p-5 text-center text-white shadow-lg">
                  <p className="text-xs mb-1">Durasi</p>
                  <p className="text-2xl font-bold">{testInfo?.duration || 60}</p>
                  <p className="text-xs">menit</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-5 text-center text-white shadow-lg">
                  <p className="text-xs mb-1">Biaya</p>
                  <p className="text-lg font-bold">
                    Rp {testInfo?.price?.toLocaleString("id-ID") || "0"}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-5 text-center text-white shadow-lg">
                  <p className="text-xs mb-1">Hasil</p>
                  <p className="text-sm font-bold">Setelah tes selesai</p>
                </div>
              </motion.div>

              {/* Contact & Back */}
              <motion.div variants={itemVariants}>
                <p className="text-sm bg-gradient-to-r from-blue-500 to-blue-700 text-white px-5 py-4 rounded-2xl text-center shadow-lg">
                  ❓ Butuh bantuan? Hubungi <b>support@ist-test.com</b>
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Link href="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.03, x: -3 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white px-6 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-2xl flex items-center justify-center gap-2"
                  >
                    ← Kembali ke Dashboard
                  </motion.button>
                </Link>
              </motion.div>
            </motion.aside>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ISTIntro;

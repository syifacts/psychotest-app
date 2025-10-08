"use client"

import Link from "next/link"
import type React from "react"
import { useState, useEffect } from "react"
import { motion, Variants, cubicBezier } from "framer-motion"
import CPMIPaymentButton from "./MSDTPaymentButton"
import Navbar from "../layout/navbar"

interface Props {
  testInfo: {
    name: string;
    id: number
    duration: number | null
    price?: number | null
    judul?: string
    deskripsijudul?: string
    juduldesk1?: string
    desk1?: string
    juduldesk2?: string
    desk2?: string
    judulbenefit?: string
    pointbenefit?: string
    img?: string
    cp?: string
  } | null
  hasAccess: boolean
  setHasAccess: (val: boolean) => void
  startAttempt: () => Promise<void>
  accessReason?: string
  role: "USER" | "PERUSAHAAN" | "GUEST" | "SUPERADMIN"
}

const MSDTIntro: React.FC<Props> = ({ testInfo, hasAccess, setHasAccess, startAttempt, role, accessReason }) => {
  const [currentRole, setCurrentRole] = useState<"USER" | "PERUSAHAAN" | "SUPERADMIN" | "GUEST">("GUEST")

  const isCompanyAccess = accessReason?.startsWith("Sudah didaftarkan oleh perusahaan")

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.role) setCurrentRole(data.user.role)
      })
  }, [])

   const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: cubicBezier(0.22, 1, 0.36, 1) },
    },
  }

  const floatingVariants: Variants = {
    animate: {
      y: [0, -20, 0],
      transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
    },
  }
  return (
    <>
      <Navbar />

      <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 overflow-hidden">
         {/* Blob dekoratif tambahan */}
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

  {/* Blob lain yang sudah ada */}
  <motion.div
    className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-indigo-300 to-purple-300 rounded-full opacity-20 blur-3xl"
    animate={{
      scale: [1, 1.2, 1],
      rotate: [0, 90, 0],
    }}
    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
  />
  {/* Blob kiri bawah */}
<motion.div
  className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-br from-teal-400 to-blue-400 opacity-20 rounded-full blur-3xl"
  animate={{
    scale: [1, 1.15, 1],
    rotate: [0, 180, 0],
    x: [0, -20, 0],
    y: [0, 10, 0],
  }}
  transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
/>

        <motion.div
          className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-indigo-300 to-purple-300 rounded-full opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
        <motion.div
          className="absolute top-1/4 -right-20 w-80 h-80 bg-gradient-to-br from-cyan-300 to-blue-300 rounded-full opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
          }}
          transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full opacity-15 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />

        <div className="relative z-10 px-6 md:px-16 py-16 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-20"
          >
            {testInfo?.judul && (
              <motion.h1
    className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-blue-600 to-blue-800 bg-clip-text text-transparent mb-6 leading-tight"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {testInfo.judul}
              </motion.h1>
            )}
            {testInfo?.deskripsijudul && (
              <motion.div
                className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
                dangerouslySetInnerHTML={{ __html: testInfo.deskripsijudul }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              />
            )}
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid lg:grid-cols-2 gap-12 items-start"
          >
            {/* LEFT INFO */}
            
            <motion.div variants={itemVariants} className="space-y-8">
              {testInfo?.juduldesk1 && (
                <motion.section
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="group bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl rounded-2xl p-8 border border-indigo-100 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800">{testInfo.juduldesk1}</h2>
                    </div>
                   {testInfo.desk1 && (
  <motion.ul
    className="space-y-3 text-gray-700"
    initial="hidden"
    animate="visible"
    variants={{
      hidden: {},
      visible: {
        transition: { staggerChildren: 0.15 },
      },
    }}
    dangerouslySetInnerHTML={{ __html: testInfo.desk1 }}
  />
)}

                  </div>
                </motion.section>
              )}

              {testInfo?.juduldesk2 && (
                <motion.section
                  variants={containerVariants}
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="group bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl rounded-2xl p-8 border border-cyan-100 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800">{testInfo.juduldesk2}</h2>
                    </div>
                {testInfo.desk2 && (
  <motion.ul
    className="space-y-3 text-gray-700 list-none pl-0"
    initial="hidden"
    animate="visible"
    variants={{
      hidden: {},
      visible: {
        transition: { staggerChildren: 0.15 },
      },
    }}
    dangerouslySetInnerHTML={{ __html: testInfo.desk2 }}
  />
)}

                  </div>
                </motion.section>
              )}
                 {testInfo?.judulbenefit && (
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg rounded-2xl p-6 border border-amber-200"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-bold text-lg text-gray-800">{testInfo.judulbenefit}</h3>
                  </div>
                  <div className="space-y-2 text-gray-700">
                 {testInfo.pointbenefit && (
  <motion.div
    className="space-y-2 text-gray-700"
    initial="hidden"
    animate="visible"
    variants={{
      hidden: {},
      visible: {
        transition: { staggerChildren: 0.1 },
      },
    }}
    dangerouslySetInnerHTML={{
      __html: testInfo.pointbenefit
        .replace(/<li>/g, '<p>')   // ganti <li> jadi <p>
        .replace(/<\/li>/g, '</p>') // ganti </li> jadi </p>
        .replace(/<ul>/g, '')       // hapus <ul>
        .replace(/<\/ul>/g, '')     // hapus </ul>
    }}
  />
)}


                  </div>
                </motion.div>
              )}

            </motion.div>

            <motion.aside variants={itemVariants} className="space-y-8">
              {/* CARD UTAMA */}
              <motion.div
                variants={floatingVariants}
                animate="animate"
                className="bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl p-8 border border-gray-100 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-500 opacity-10 rounded-bl-full" />

                <motion.div
                  className="relative rounded-2xl overflow-hidden shadow-xl mb-6"
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img
                    src={testInfo?.img || "/cpmi.jpg"}
                    alt="Ilustrasi Tes CPMI"
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </motion.div>

                {isCompanyAccess && hasAccess && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-4 py-3 rounded-xl mb-6 border border-blue-200 flex items-center gap-2"
                  >
                    <span className="text-xl">🏢</span>
                    <span>{accessReason}</span>
                  </motion.p>
                )}
<div className="flex justify-center mt-6">

                <CPMIPaymentButton
                  hasAccess={hasAccess}
                  setHasAccess={setHasAccess}
                  startAttempt={startAttempt}
                  testInfo={testInfo}
                  role={currentRole}
                />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg hover:shadow-xl rounded-2xl p-5 text-center text-white relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                  <div className="relative z-10">
                    <svg
                      className="w-8 h-8 mx-auto mb-2 opacity-90"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-xs opacity-90 mb-1">Durasi</p>
                    <p className="text-2xl font-bold">{testInfo?.duration || 30}</p>
                    <p className="text-xs opacity-90">menit</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg hover:shadow-xl rounded-2xl p-5 text-center text-white relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                  <div className="relative z-10">
                    <svg
                      className="w-8 h-8 mx-auto mb-2 opacity-90"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-xs opacity-90 mb-1">Biaya</p>
                    <p className="text-lg font-bold">Rp {testInfo?.price?.toLocaleString("id-ID") || "0"}</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg hover:shadow-xl rounded-2xl p-5 text-center text-white relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                  <div className="relative z-10">
                    <svg
                      className="w-8 h-8 mx-auto mb-2 opacity-90"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-xs opacity-90 mb-1">Hasil</p>
                    <p className="text-sm font-bold">Setelah</p>
                    <p className="text-xs opacity-90">tes selesai</p>
                  </div>
                </motion.div>
              </motion.div>

           
              {/* CONTACT */}
{testInfo?.cp && (
  <motion.div
    variants={itemVariants}
    className="
      text-sm 
      text-white 
      bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 
      rounded-2xl 
      p-5 
      border border-transparent 
      shadow-lg 
      hover:shadow-2xl 
      transition-all 
      duration-300
    "
    dangerouslySetInnerHTML={{ __html: testInfo.cp }}
  />
)}


             <motion.div variants={itemVariants}>
  <Link href="/dashboard">
    <motion.button
      whileHover={{ scale: 1.03, x: -3 }}
      whileTap={{ scale: 0.97 }}
      className="
        w-full 
        bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 
        hover:from-indigo-500 hover:to-purple-700 
        text-white 
        px-6 py-4 
        rounded-2xl 
        font-semibold 
        shadow-lg 
        hover:shadow-2xl 
        flex items-center justify-center gap-2 
        transition-all duration-300
      "
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      Kembali ke Dashboard
    </motion.button>
  </Link>
</motion.div>

            </motion.aside>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default MSDTIntro

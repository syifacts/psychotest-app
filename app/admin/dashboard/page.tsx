"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/navbar";
import DashboardSummary from "@/components/admin/DashboardSummary";
import UserGrowthChart from "@/components/admin/UserGrowthChart";
import TestDistributionChart from "@/components/admin/TestDistributionChart";
import UserTable from "@/components/admin/UserTable";
import AttemptTable from "@/components/admin/Attempt";
import { motion } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";



interface User {
  id: number;
  fullName: string;
  email: string;
  role: "USER" | "PSIKOLOG" | "PERUSAHAAN" | "SUPERADMIN";
  companyName?: string;
  createdAt: string;
passwordDisplay: string; // <-- WAJIB

}

export default function AdminPage() {
  const [userCount, setUserCount] = useState(0);
  const [psikologCount, setPsikologCount] = useState(0);
  const [companyCount, setCompanyCount] = useState(0);
  const [testTypeCount, setTestTypeCount] = useState(0);

  const [userGrowthData, setUserGrowthData] = useState<{ month: string; newUsers: number }[]>([]);
  const [testDistributionData, setTestDistributionData] = useState<{ name: string; count: number }[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Summary counts
    fetch("/api/user/count")
      .then((res) => res.json())
      .then((data) => {
        setUserCount(data.userCount);
        setPsikologCount(data.psikologCount);
        setCompanyCount(data.companyCount);
      })
      .catch(console.error);

    fetch("/api/testtypes")
      .then((res) => res.json())
      .then((data) => setTestTypeCount(data.length))
      .catch(console.error);

    // User growth (chart)
    fetch("/api/user/growth")
      .then((res) => res.json())
      .then(setUserGrowthData)
      .catch(console.error);

    // Test distribution (chart)
    fetch("/api/tes/distribution")
      .then((res) => res.json())
      .then(setTestDistributionData)
      .catch(console.error);

    // Fetch all users
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch(console.error);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

        {/* Animasi background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-3xl"
          animate={{ x: [0, 100, -50, 0], y: [0, 50, -100, 0] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        />
      </div>

      <div className="relative container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
<motion.h1
  className="text-5xl font-extrabold tracking-tight mb-10 mt-10 text-center 
             bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
             bg-clip-text text-transparent animate-gradient"
  initial={{ opacity: 0, y: -30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
>
  Dashboard Admin
</motion.h1>
<motion.div
      className="flex justify-center items-center gap-6 mb-8 relative"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.5 }}
    >
      {/* Bintang Kiri */}
      <motion.div
        className="relative animate-pulse"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
      >
        <Sparkles
          className="w-10 h-10 drop-shadow-[0_0_12px_rgba(255,215,0,0.9)]"
          style={{ color: "#FFD700" }}
        />
      </motion.div>

      {/* Panah Tengah */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      >
        <ChevronDown className="w-10 h-10 text-indigo-500" />
      </motion.div>

      {/* Bintang Kanan */}
      <motion.div
        className="relative animate-pulse"
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
      >
        <Sparkles
          className="w-10 h-10 drop-shadow-[0_0_12px_rgba(255,215,0,0.9)]"
          style={{ color: "#FFD700" }}
        />
      </motion.div>
    </motion.div>


        {/* Summary Cards */}
        <DashboardSummary
          userCount={userCount}
          psikologCount={psikologCount}
          companyCount={companyCount}
          testTypeCount={testTypeCount}
        />

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">User Growth</h2>
            <UserGrowthChart data={userGrowthData} />
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Test Distribution</h2>
            <TestDistributionChart data={testDistributionData} type="bar" />
          </div>
        </div>

        {/* User Table */}
        <div className="mt-10 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Daftar User</h2>
          <UserTable users={users} />
        </div>
        {/* Attempt Table */}
<div className="mt-10 bg-white p-4 rounded-lg shadow">
  <h2 className="text-lg font-semibold mb-4">Riwayat Tes (Attempt)</h2>
  <AttemptTable />
</div>
      </div>
    </div>
  );
}

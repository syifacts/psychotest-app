"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/navbar";
import DashboardSummary from "@/components/admin/DashboardSummary";
import UserGrowthChart from "@/components/admin/UserGrowthChart";
import TestDistributionChart from "@/components/admin/TestDistributionChart";
import UserTable from "@/components/admin/UserTable";

interface User {
  id: number;
  fullName: string;
  email: string;
  role: "USER" | "PSIKOLOG" | "PERUSAHAAN" | "SUPERADMIN";
  companyName?: string;
  createdAt: string;
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

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-6">
          Dashboard Admin
        </h1>

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
      </div>
    </div>
  );
}

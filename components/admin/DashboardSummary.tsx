"use client";

import React, { useEffect, useState } from "react";
import SummaryCard from "./SummaryCard";
import { User, Building, ClipboardList, Activity } from "lucide-react";

interface DashboardSummaryProps {
  userCount: number;
  psikologCount: number;
  companyCount: number;
  testTypeCount: number;
}

export default function DashboardSummary({
  userCount,
  psikologCount,
  companyCount,
  testTypeCount,
}: DashboardSummaryProps) {
  const [testsToday, setTestsToday] = useState(0);

  useEffect(() => {
    fetch("/api/attempts/today") 
      .then((res) => res.json())
      .then((data) => setTestsToday(data.count))
      .catch(console.error);
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
      <SummaryCard
        icon={<User size={24} className="text-blue-600" />}
        label="Jumlah User"
        value={userCount}
        bgColor="bg-blue-100"
      />
      <SummaryCard
        icon={<Building size={24} className="text-green-600" />}
        label="Jumlah Perusahaan"
        value={companyCount}
        bgColor="bg-green-100"
      />
      <SummaryCard
        icon={<User size={24} className="text-purple-600" />}
        label="Jumlah Psikolog"
        value={psikologCount}
        bgColor="bg-purple-100"
      />
      <SummaryCard
        icon={<ClipboardList size={24} className="text-yellow-600" />}
        label="Jumlah Jenis Test"
        value={testTypeCount}
        bgColor="bg-yellow-100"
      />
      <SummaryCard
        icon={<Activity size={24} className="text-red-600" />}
        label="Tes Hari Ini"
        value={testsToday}
        bgColor="bg-red-100"
      />
    </div>
  );
}

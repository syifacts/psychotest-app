"use client";

import React from "react";

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  bgColor?: string;
  iconColor?: string;
}

export default function SummaryCard({
  icon,
  label,
  value,
  bgColor = "bg-gray-100",
  iconColor = "text-gray-600",
}: SummaryCardProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6 flex items-center gap-4 hover:shadow-lg transition">
      <div className={`p-3 rounded-full ${bgColor}`}>{icon}</div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

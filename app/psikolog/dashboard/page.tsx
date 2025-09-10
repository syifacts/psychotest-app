"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "@/components/layout/navbar";

interface Report {
  id: number;
  user: { fullName: string };
  testType: { name: string };
  attempt: { startedAt: string };
  validated: boolean;
}

export default function DashboardPsikolog() {
  const [reports, setReports] = useState<Report[]>([]);
  const router = useRouter();

  useEffect(() => {
    axios.get("/api/reports/pending").then((res) => setReports(res.data));
  }, []);

  const handleView = (id: number) => {
    router.push(`/psikolog/report/${id}`);
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard Psikolog</h1>

        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">User</th>
              <th className="p-2 border">Tes</th>
              <th className="p-2 border">Tanggal</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="text-center">
                <td className="p-2 border">{report.user.fullName}</td>
                <td className="p-2 border">{report.testType.name}</td>
                <td className="p-2 border">{new Date(report.attempt.startedAt).toLocaleDateString()}</td>
                <td className="p-2 border">{report.validated ? "Sudah Validasi" : "Belum Validasi"}</td>
                <td className="p-2 border">
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => handleView(report.id)}
                  >
                    TTD & Validasi
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

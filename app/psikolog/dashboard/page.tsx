"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "@/components/layout/navbar";

interface Report {
  id: number;
  User: { fullName: string };
  TestType: { name: string };
  Attempt: { id: number; startedAt: string };
  validated: boolean;
}

export default function DashboardPsikolog() {
  const [reports, setReports] = useState<Report[]>([]);
  const [tab, setTab] = useState<"pending" | "history">("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const router = useRouter();

  // Ambil userId dari localStorage
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      setUserId(parsed.id);
    } else {
      console.error("User belum login");
    }
  }, []);

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const url =
          tab === "pending"
            ? "/api/reports/pending"
            : "/api/reports/history";
        const res = await axios.get(url);
        setReports(res.data);
      } catch (err) {
        console.error("Error fetching reports:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [tab]);

  const handlePreviewPDF = (report: Report) => {
    const attemptId = report.Attempt?.id;
    if (!attemptId) return;
    window.open(`/psikolog/report/${attemptId}`, "_blank");
  };

  const handleValidasi = async (reportId: number) => {
    if (!userId) {
      console.error("User belum login");
      return;
    }

    try {
      await axios.post(
        `/api/reports/validate`,
        { reportId },
        { headers: { "x-user-id": userId } }
      );

      // Update state lokal
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId ? { ...r, validated: true } : r
        )
      );
    } catch (err) {
      console.error("Error validating report:", err);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard Psikolog</h1>

        {/* Tabs */}
        <div className="mb-4">
          <button
            className={`px-4 py-2 rounded mr-2 ${
              tab === "pending" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setTab("pending")}
          >
            Pending
          </button>
          <button
            className={`px-4 py-2 rounded ${
              tab === "history" ? "bg-green-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setTab("history")}
          >
            History
          </button>
        </div>

        {isLoading ? (
          <p>Memuat data...</p>
        ) : (
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100 text-center">
                <th className="p-2 border">User</th>
                <th className="p-2 border">Tes</th>
                <th className="p-2 border">Tanggal</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Hasil Test</th>
                <th className="p-2 border">Validasi</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="text-center">
                  <td className="p-2 border">{report.User?.fullName || "—"}</td>
                  <td className="p-2 border">{report.TestType?.name || "—"}</td>
                  <td className="p-2 border">
                    {report.Attempt?.startedAt
                      ? new Date(report.Attempt.startedAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="p-2 border">
                    {report.validated ? "Sudah Validasi" : "Belum Validasi"}
                  </td>
                  <td className="p-2 border">
                    <button
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      onClick={() => handlePreviewPDF(report)}
                      disabled={!report.Attempt?.id}
                    >
                      Preview PDF
                    </button>
                  </td>
                  <td className="p-2 border">
                    {!report.validated && report.Attempt?.id ? (
                      <button
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => handleValidasi(report.id)}
                      >
                        Validasi
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 border text-center text-gray-500">
                    Tidak ada laporan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

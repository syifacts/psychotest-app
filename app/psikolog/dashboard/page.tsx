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

  // Ambil user dari server via cookie
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (data.user) {
          setUserId(data.user.id);
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        router.push("/login");
      }
    };

    fetchUser();
  }, [router]);

  // Fetch reports ketika tab atau userId berubah
  useEffect(() => {
    if (!userId) return;

    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const url = tab === "pending" ? "/api/reports/pending" : "/api/reports/history";
        // Tidak perlu x-user-id jika backend bisa ambil dari token
        const res = await axios.get(url, { withCredentials: true });
        setReports(res.data);
      } catch (err) {
        console.error("Error fetching reports:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [tab, userId]);

  const handlePreviewPDF = (report: Report) => {
    const attemptId = report.Attempt?.id;
    if (!attemptId) return;
    window.open(`/psikolog/report/${attemptId}`, "_blank");
  };

  const handleValidasi = async (reportId: number) => {
    if (!userId) return;

    try {
      await axios.post(
        `/api/reports/validate`,
        { reportId },
        { withCredentials: true }
      );

      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, validated: true } : r))
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
                {tab === "pending" && <th className="p-2 border">Hasil Test</th>}
                {tab === "pending" && <th className="p-2 border">Validasi</th>}
              </tr>
            </thead>
            <tbody>
              {reports.length > 0 ? (
                reports.map((report) => (
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

                    {tab === "pending" && (
                      <>
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
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={tab === "pending" ? 6 : 4}
                    className="p-4 border text-center text-gray-500"
                  >
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

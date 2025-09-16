"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "@/components/layout/navbar";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

interface Report {
  id: number;
  User: { fullName: string };
  TestType: { name: string };
  Attempt: { id: number; startedAt: string };
  Company?: { fullName: string } | null;
  validated: boolean;
  validatedAt?: string;
}

interface Company {
  id: number;
  fullName: string;
  role: "USER" | "PERUSAHAAN";
}

interface TestType {
  id: number;
  name: string;
}

export default function ValidasiPsikolog() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [tab, setTab] = useState<"pending" | "history">("pending");

  const [filterTestType, setFilterTestType] = useState<string>("all");
  const [filterCompany, setFilterCompany] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");

  const [companies, setCompanies] = useState<Company[]>([]);
  const [testTypes, setTestTypes] = useState<TestType[]>([]);

  const router = useRouter();

  // Ambil data user login
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) router.push("/login");
        else {
          const data = await res.json();
          if (data.user) setUserId(data.user.id);
          else router.push("/login");
        }
      } catch {
        router.push("/login");
      }
    };
    fetchUser();
  }, [router]);

  // Ambil list perusahaan & test types
  useEffect(() => {
    axios.get("/api/companies", { withCredentials: true }).then((res) => setCompanies(res.data));
    axios.get("/api/testtypes", { withCredentials: true }).then((res) => setTestTypes(res.data));
  }, []);

  // Fetch laporan sesuai tab + filter
  useEffect(() => {
    if (!userId) return;

    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const status = tab === "pending" ? "pending" : "selesai";
        const endpoint = "/api/reports/validate"; // gunakan endpoint validate untuk konsisten filter company/self

       const res = await axios.get("/api/reports/validate", {
  params: {
    testTypeId: filterTestType !== "all" ? filterTestType : undefined,
    companyId: filterCompany !== "all" ? filterCompany : undefined,
    status,
    validatedAt: tab === "history" && filterDate ? filterDate : undefined,
  },
  withCredentials: true,
});

        setReports(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [tab, userId, filterTestType, filterCompany, filterDate]);

  const handlePreviewPDF = (report: Report) => {
    if (!report.Attempt?.id) return;
    window.open(`/psikolog/report/${report.Attempt.id}`, "_blank");
  };

  const handleValidasi = async (reportId: number) => {
    if (!userId) return;
    try {
      await axios.post("/api/reports/validate", { reportId }, { withCredentials: true });
      setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, validated: true } : r)));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Validasi oleh Psikolog</h1>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          <button
            className={`px-4 py-2 rounded-lg font-medium transition ${
              tab === "pending" ? "bg-blue-600 text-white shadow" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setTab("pending")}
          >
            Pending
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition ${
              tab === "history" ? "bg-green-600 text-white shadow" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setTab("history")}
          >
            History
          </button>
        </div>

        {/* Filter tanggal untuk history */}
        {tab === "history" && (
          <div className="mb-4">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="p-2 border rounded-md"
            />
          </div>
        )}

        {/* Table */}
        <div className="bg-white p-6 rounded-xl shadow overflow-x-auto">
          {isLoading ? (
            <p className="text-center text-gray-500 italic">Memuat data...</p>
          ) : (
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-50 to-indigo-100 text-gray-700">
                  <th className="p-4 font-semibold text-left">User</th>
                  <th className="p-4 font-semibold text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span>Jenis Tes</span>
                      <Select value={filterTestType} onValueChange={setFilterTestType}>
                        <SelectTrigger className="w-5 h-5 p-0 bg-transparent border-none shadow-none hover:bg-gray-200 rounded-full" />
                        <SelectContent className="max-h-48 overflow-y-auto">
                          <SelectItem value="all">Semua Tes</SelectItem>
                          {testTypes.map((t) => (
                            <SelectItem key={t.id} value={t.id.toString()}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </th>
                  <th className="p-4 font-semibold text-center">Tanggal Tes</th>
                  <th className="p-4 font-semibold text-center">
                    <th className="p-4 font-semibold text-center">
<th className="p-4 font-semibold text-center">
  <div className="flex items-center justify-center gap-2">
    <span>Perusahaan</span>
    <Select value={filterCompany} onValueChange={setFilterCompany}>
      <SelectTrigger className="w-5 h-5 p-0 bg-transparent border-none shadow-none hover:bg-gray-200 rounded-full" />
      <SelectContent className="max-h-48 overflow-y-auto">
        <SelectItem value="all">Semua</SelectItem>
        {companies
          .filter((c) => c.role === "PERUSAHAAN")
          .map((c) => (
            <SelectItem key={c.id} value={c.id.toString()}>
              {c.fullName}
            </SelectItem>
          ))}
        <SelectItem value="self">Sendiri (User)</SelectItem>
      </SelectContent>
    </Select>
  </div>
</th>

</th>

                  </th>
                  {tab === "history" && <th className="p-4 font-semibold text-center">Tanggal Pemeriksaan</th>}
                  <th className="p-4 font-semibold text-center">Status</th>
                  <th className="p-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {reports.length > 0 ? (
                  reports.map((report, idx) => (
                    <tr
                      key={report.id}
                      className={`transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-indigo-50`}
                    >
                      <td className="p-4 text-gray-700 font-medium">{report.User?.fullName || "—"}</td>
                      <td className="p-4 text-gray-600 text-center">{report.TestType?.name || "—"}</td>
                      <td className="p-4 text-gray-600 text-center">
                        {report.Attempt?.startedAt ? new Date(report.Attempt.startedAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="p-4 text-gray-600 text-center">
                        {report.Company?.fullName || <span className="italic text-gray-400">Sendiri</span>}
                      </td>
                      {tab === "history" && (
                        <td className="p-4 text-gray-600 text-center">
                          {report.validatedAt ? new Date(report.validatedAt).toLocaleDateString() : "—"}
                        </td>
                      )}
                      <td className="p-4 text-center">
                        {report.validated ? (
                          <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                            ✅ Selesai
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">
                            ⏳ Pending
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center space-x-2">
                        {report.Attempt?.id && (
                          <button
                            className="px-3 py-1 text-xs font-medium text-white bg-indigo-500 rounded-lg shadow-sm hover:bg-indigo-600 transition"
                            onClick={() => handlePreviewPDF(report)}
                          >
                            Preview
                          </button>
                        )}
                        {tab === "pending" && !report.validated && (
                          <button
                            className="px-3 py-1 text-xs font-medium text-white bg-green-500 rounded-lg shadow-sm hover:bg-green-600 transition"
                            onClick={() => handleValidasi(report.id)}
                          >
                            Validasi
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={tab === "history" ? 7 : 6} className="p-6 text-center text-gray-500 italic">
                      Tidak ada laporan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}

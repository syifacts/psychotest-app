"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "@/components/layout/navbar";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { motion } from "framer-motion";
import { ClipboardCheck, Clock, FileSearch } from "lucide-react";



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
  const [startDate, setStartDate] = useState<string>("");
const [endDate, setEndDate] = useState<string>("");

  // 🔹 Search + pagination
  const [searchUser, setSearchUser] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

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
        const res = await axios.get("/api/reports/validate", {
          params: {
            testTypeId: filterTestType !== "all" ? filterTestType : undefined,
            companyId: filterCompany !== "all" ? filterCompany : undefined,
            status,
            validatedAt: tab === "history" && filterDate ? filterDate : undefined,
            search: searchUser || undefined,
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
  }, [tab, userId, filterTestType, filterCompany, filterDate, searchUser]);

// Filter laporan berdasarkan search + tanggal
const filteredReports = reports.filter((r) => {
  const userMatch = r.User.fullName.toLowerCase().includes(searchUser.toLowerCase());
  let dateMatch = true;
  if (startDate) dateMatch = new Date(r.Attempt?.startedAt || 0) >= new Date(startDate);
  if (endDate) dateMatch = dateMatch && new Date(r.Attempt?.startedAt || 0) <= new Date(endDate);
  return userMatch && dateMatch;
});

  const totalPages = Math.ceil(filteredReports.length / rowsPerPage);
  const paginatedReports = filteredReports.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchUser, filterDate, filterTestType, filterCompany]);

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
        <main className="relative min-h-screen bg-gray-50 overflow-hidden">
      {/* 🔮 GLOBAL PAGE BLOBS */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-overlay filter blur-3xl opacity-40 animate-blob" />
        <div className="absolute top-40 right-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-overlay filter blur-3xl opacity-40 animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-pink-300 rounded-full mix-blend-overlay filter blur-3xl opacity-40 animate-blob animation-delay-4000" />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-0">
  {/* Kanan atas */}
  <div className="absolute top-10 right-[-60px] w-[400px] h-[400px] bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" />

  {/* Kiri atas */}
  {/* <div className="absolute -top-10 -left-40 w-[380px] h-[380px] bg-gradient-to-br from-blue-300 via-indigo-300 to-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-45 animate-blob animation-delay-2000" /> */}

  {/* Kanan bawah */}
  <div className="absolute bottom-[-100px] right-[-100px] w-[420px] h-[420px] bg-gradient-to-br from-purple-300 via-pink-300 to-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-45 animate-blob animation-delay-3000" />

  {/* Kiri bawah */}
  <div className="absolute bottom-[-120px] left-[-100px] w-[420px] h-[420px] bg-gradient-to-br from-blue-200 via-cyan-200 to-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000" />

  {/* Tengah bawah */}
  <div className="absolute bottom-[-150px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-1000" />
</div>

      <Navbar />
      {/* ✨ Page Container */}
      <div className="p-6 max-w-7xl mx-auto">
        {/* 🧭 Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-10"
        >
          <h1
            className="text-4xl sm:text-5xl font-extrabold mb-4 mt-6 bg-clip-text text-transparent 
            bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600"
          >
            Validasi oleh Psikolog
          </h1>
          <p className="text-gray-600 text-lg">
            Kelola hasil tes dan lakukan validasi dengan mudah 🧠
          </p>
        </motion.div>
       {/* 🧩 Tabs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center gap-4 mb-10"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-sm ${
              tab === "pending"
                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setTab("pending")}
          >
            <Clock size={18} /> Pending
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-sm ${
              tab === "history"
                ? "bg-green-600 text-white shadow-md shadow-green-200"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setTab("history")}
          >
            <ClipboardCheck size={18} /> History
          </motion.button>
        </motion.div>

       

        {/* 🔹 Global Filters */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-wrap gap-4 items-center">
  <div className="relative flex-1 min-w-[250px]">
    <FileSearch
      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      size={20}
    />
    <input
      type="text"
      placeholder="Cari nama user..."
      value={searchUser}
      onChange={(e) => setSearchUser(e.target.value)}
      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
    />
  </div>
           {/* Filter tanggal */}
<input
  type="date"
  value={startDate}
  onChange={(e) => setStartDate(e.target.value)}
  className="p-2 border rounded-md"
/>
<input
  type="date"
  value={endDate}
  onChange={(e) => setEndDate(e.target.value)}
  className="p-2 border rounded-md"
/>


        </div>

        {/* Table */}
        <div className="bg-white p-6 rounded-xl shadow overflow-x-auto">
          {isLoading ? (
            <p className="text-center text-gray-500 italic">Memuat data...</p>
          ) : (
            <>
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
              <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </th>
    <th className="p-4 font-semibold text-center">Tanggal Tes</th>
    <th className="p-4 font-semibold text-center">
      <div className="flex items-center justify-center gap-2">
        <span>Perusahaan</span>
        <Select value={filterCompany} onValueChange={setFilterCompany}>
          <SelectTrigger className="w-5 h-5 p-0 bg-transparent border-none shadow-none hover:bg-gray-200 rounded-full" />
          <SelectContent className="max-h-48 overflow-y-auto">
            <SelectItem value="all">Semua</SelectItem>
            {companies.filter((c) => c.role === "PERUSAHAAN").map((c) => (
              <SelectItem key={c.id} value={c.id.toString()}>{c.fullName}</SelectItem>
            ))}
            <SelectItem value="self">Sendiri (User)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </th>
    {tab === "history" && <th className="p-4 font-semibold text-center">Tanggal Pemeriksaan</th>}
    <th className="p-4 font-semibold text-center">Status</th>
    {/* Kolom Report Hasil hanya tampil di tab pending */}
    {tab === "pending" && <th className="p-4 font-semibold text-center">Report Hasil</th>}
    <th className="p-4 font-semibold text-center">{tab === "pending" ? "Validasi" : "Edit Validasi"}</th>
  </tr>
</thead>

<tbody>
  {paginatedReports.length > 0 ? (
    paginatedReports.map((report, idx) => (
      <tr key={report.id} className={`transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-indigo-50`}>
        <td className="p-4 text-gray-700 font-medium">{report.User?.fullName || "—"}</td>
        <td className="p-4 text-gray-600 text-center">{report.TestType?.name || "—"}</td>
        <td className="p-4 text-gray-600 text-center">{report.Attempt?.startedAt ? new Date(report.Attempt.startedAt).toLocaleDateString() : "—"}</td>
        <td className="p-4 text-gray-600 text-center">{report.Company?.fullName || <span className="italic text-gray-400">Sendiri</span>}</td>
        {tab === "history" && <td className="p-4 text-gray-600 text-center">{report.validatedAt ? new Date(report.validatedAt).toLocaleDateString() : "—"}</td>}
        <td className="p-4 text-center">
          {report.validated ? (
            <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">✅ Selesai</span>
          ) : (
            <span className="px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">⏳ Pending</span>
          )}
        </td>

        {/* Kolom Report Hasil hanya di pending */}
        {tab === "pending" && (
          <td className="p-4 text-center">
            {report.Attempt?.id ? (
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 rounded-lg shadow hover:bg-indigo-600 transition"
                onClick={() => handlePreviewPDF(report)}
              >
                TTD Report
              </button>
            ) : (
              <span className="italic text-gray-400">—</span>
            )}
          </td>
        )}

        {/* Kolom Validasi / Edit Validasi */}
<td className="p-4 text-center">
  {tab === "pending" && !report.validated ? (
    <button
      className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg shadow hover:bg-green-600 transition"
      onClick={() => handleValidasi(report.id)}
    >
      Validasi
    </button>
  ) : tab === "history" ? (
    <button
      className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-lg shadow hover:bg-yellow-600 transition"
      onClick={() => window.open(`/psikolog/report/${report.Attempt.id}`, "_blank")}
    >
      Edit Validasi
    </button>
  ) : null}
</td>

      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={tab === "history" ? 7 : 8} className="p-6 text-center text-gray-500 italic">Tidak ada laporan</td>
    </tr>
  )}
</tbody>


              </table>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between mt-4">
                <div>
                  <label className="mr-2 text-gray-700">Tampilkan:</label>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="p-1 border rounded-md"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded-md disabled:opacity-50"
                  >
                    ← Prev
                  </button>
                  <span className="text-gray-700">
                    Hal {currentPage} dari {totalPages || 1}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded-md disabled:opacity-50"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

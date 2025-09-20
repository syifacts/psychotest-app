"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "@/components/layout/navbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Report {
  id: number;
  User: { fullName: string };
  TestType: { name: string };
  Attempt: { id: number; startedAt: string };
  Company?: { fullName: string } | null;
  validated?: boolean;
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

export default function DashboardKeseluruhan() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testTypes, setTestTypes] = useState<TestType[]>([]);

  const [todayStatsByTest, setTodayStatsByTest] = useState<any[]>([]);
  const [todayStatsBySource, setTodayStatsBySource] = useState<any[]>([]);

  // Filters
  const [filterTestType, setFilterTestType] = useState<string>("all");
  const [filterCompany, setFilterCompany] = useState<string>("all");
  const [searchUser, setSearchUser] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [overallStatsBySource, setOverallStatsBySource] = useState<any[]>([]);


  const [companies, setCompanies] = useState<Company[]>([]);
  const router = useRouter();

  // 🔹 Cek user login
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) {
          router.push("/login");
          return;
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        router.push("/login");
      }
    };
    fetchUser();
  }, [router]);

  // 🔹 Ambil daftar perusahaan
  useEffect(() => {
    axios
      .get("/api/companies", { withCredentials: true })
      .then((res) => setCompanies(res.data))
      .catch((err) => console.error(err));
  }, []);

  // 🔹 Fetch laporan
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get("/api/reports/all", {
          params: {
            testTypeId: filterTestType || undefined,
            companyId: filterCompany || undefined,
            search: searchUser || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            status: statusFilter !== "all" ? statusFilter : undefined,
          },
          withCredentials: true,
        });
        setReports(res.data);
        // Statistik keseluruhan per sumber
const groupedOverallBySource: Record<string, number> = {};
res.data.forEach((r: Report) => {
  const source = r.Company?.fullName || "Sendiri";
  groupedOverallBySource[source] = (groupedOverallBySource[source] || 0) + 1;
});
setOverallStatsBySource(
  Object.entries(groupedOverallBySource).map(([name, value]) => ({
    name,
    value,
  }))
);


        // Statistik untuk hari ini
        const today = new Date().toLocaleDateString();
        const todayReports = res.data.filter((r: Report) => {
          if (!r.Attempt?.startedAt) return false;
          return new Date(r.Attempt.startedAt).toLocaleDateString() === today;
        });

        // === Per jenis tes ===
        const groupedByTest: Record<string, number> = {};
        todayReports.forEach((r: Report) => {
          const testName = r.TestType?.name || "Unknown";
          groupedByTest[testName] = (groupedByTest[testName] || 0) + 1;
        });
        setTodayStatsByTest(
          Object.entries(groupedByTest).map(([name, value]) => ({
            name,
            value,
          }))
        );

        // === Per sumber (perusahaan/sendiri) ===
        const groupedBySource: Record<string, number> = {};
        todayReports.forEach((r: Report) => {
          const source = r.Company?.fullName || "Sendiri";
          groupedBySource[source] = (groupedBySource[source] || 0) + 1;
        });
        setTodayStatsBySource(
          Object.entries(groupedBySource).map(([name, value]) => ({
            name,
            value,
          }))
        );
      } catch (err) {
        console.error("Error fetching reports:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, [filterTestType, filterCompany, searchUser, startDate, endDate, statusFilter]);

  useEffect(() => {
    axios
      .get("/api/testtypes", { withCredentials: true })
      .then((res) => setTestTypes(res.data))
      .catch((err) => console.error(err));
  }, []);

  // 🔹 Hitung pending validasi
  const pendingCount = reports.filter((r) => !r.validated).length;

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>

        {/* 🔹 Summary Cards (2x2 Grid) */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
  <div className="bg-white p-6 rounded-xl shadow text-center">
    <h2 className="text-gray-500 text-sm">Total Tes Hari Ini</h2>
    <p className="text-3xl font-bold text-indigo-600">
      {todayStatsByTest.reduce((acc, item) => acc + item.value, 0)}
    </p>
  </div>

  <div className="bg-white p-6 rounded-xl shadow text-center">
    <h2 className="text-gray-500 text-sm">Dari Perusahaan</h2>
    <p className="text-3xl font-bold text-indigo-600">
      {todayStatsBySource.find((s) => s.name !== "Sendiri")?.value || 0}
    </p>
  </div>

  <div className="bg-white p-6 rounded-xl shadow text-center">
    <h2 className="text-gray-500 text-sm">Dari User Sendiri</h2>
    <p className="text-3xl font-bold text-indigo-600">
      {todayStatsBySource.find((s) => s.name === "Sendiri")?.value || 0}
    </p>
  </div>

  {/* 🔹 Card baru */}
  <div className="bg-white p-6 rounded-xl shadow text-center">
    <h2 className="text-gray-500 text-sm">Total Tes Keseluruhan</h2>
    <p className="text-3xl font-bold text-indigo-600">{reports.length}</p>
  </div>
  
    <div className="bg-white p-6 rounded-xl shadow text-center">
    <h2 className="text-gray-500 text-sm">Pending Validasi</h2>
    <p className="text-3xl font-bold text-red-600">{pendingCount}</p>
  </div>
</div>

{/* 🔹 Chart Section (2 kolom grid) */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
  {/* Chart 1: Statistik Keseluruhan (Per Jenis Tes) */}
  <div className="bg-white p-6 rounded-xl shadow">
    <h2 className="font-semibold mb-4 text-center text-gray-700">
      Statistik Keseluruhan (Per Jenis Tes)
    </h2>
    {reports.length > 0 ? (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={testTypes.map((tt) => ({
            name: tt.name,
            value: reports.filter((r) => r.TestType?.name === tt.name).length,
          }))}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#10B981" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    ) : (
      <p className="text-center text-gray-400">Belum ada data</p>
    )}
  </div>

  {/* Chart 2: Total Tes Keseluruhan (Perusahaan vs Sendiri) */}
  <div className="bg-white p-6 rounded-xl shadow">
    <h2 className="font-semibold mb-4 text-center text-gray-700">
      Total Tes Keseluruhan
    </h2>
    {overallStatsBySource.length > 0 ? (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={overallStatsBySource}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#6366F1" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    ) : (
      <p className="text-center text-gray-400">Belum ada data</p>
    )}
  </div>
</div>



        {/* 🔹 Global Filters */}
        <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Cari nama user..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            className="p-2 border rounded-md flex-1"
          />
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

        {/* 🔹 Table with column filters */}
        <div className="bg-white p-6 rounded-xl shadow overflow-x-auto">
          {isLoading ? (
            <p className="text-center text-gray-500">Memuat data...</p>
          ) : (
          <table className="min-w-full border-collapse text-sm">
  <thead>
    <tr className="bg-gradient-to-r from-indigo-50 to-indigo-100 text-gray-700">
      <th className="p-4 font-semibold text-left">User</th>
      <th className="p-4 font-semibold text-center">
        <div className="flex items-center justify-center gap-2">
          <span>Jenis Tes</span>
          <Select value={filterTestType} onValueChange={setFilterTestType}>
            <SelectTrigger className="w-5 h-5 p-0 bg-transparent border-none shadow-none hover:bg-gray-200 rounded-full">
              <span className="material-icons text-sm"></span>
            </SelectTrigger>
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
        <div className="flex items-center justify-center gap-2">
          <span>Perusahaan</span>
          <Select value={filterCompany} onValueChange={setFilterCompany}>
            <SelectTrigger className="w-5 h-5 p-0 bg-transparent border-none shadow-none hover:bg-gray-200 rounded-full">
              <span className="material-icons text-sm"></span>
            </SelectTrigger>
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
      <th className="p-4 font-semibold text-center">
        <div className="flex items-center justify-center gap-2">
          <span>Status</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-5 h-5 p-0 bg-transparent border-none shadow-none hover:bg-gray-200 rounded-full">
              <span className="material-icons text-sm"></span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="selesai">Selesai</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </th>
    </tr>
  </thead>
  <tbody>
    {reports.length > 0 ? (
      reports.map((report, idx) => (
        <tr
          key={report.id}
          className={`transition-colors ${
            idx % 2 === 0 ? "bg-white" : "bg-gray-50"
          } hover:bg-indigo-50`}
        >
          <td className="p-4 text-gray-700 font-medium">
            {report.User?.fullName || "—"}
          </td>
          <td className="p-4 text-gray-600">{report.TestType?.name || "—"}</td>
          <td className="p-4 text-gray-600">
            {report.Attempt?.startedAt
              ? new Date(report.Attempt.startedAt).toLocaleDateString()
              : "—"}
          </td>
          <td className="p-4 text-gray-600">
            {report.Company?.fullName || (
              <span className="italic text-gray-400">Sendiri</span>
            )}
          </td>
          <td className="p-4">
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
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan={5} className="p-6 text-center text-gray-500 italic">
          Tidak ada data
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

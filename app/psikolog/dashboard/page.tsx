"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import { Brain, Heart, Activity, UserCircle } from "lucide-react";
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

import { Users, Building, User, FileText, Clock, Search } from "lucide-react";
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
  TestType: { id: number; name: string };
  Attempt: { id: number; startedAt: string };
  Company?: { fullName: string } | null;
  validated?: boolean;
   validatedBy?: { fullName: string } | null;
   result: string;
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
  const [filterPsychologist, setFilterPsychologist] = useState<string>("all");



  const [companies, setCompanies] = useState<Company[]>([]);
  const router = useRouter();
   const [psychologistName, setPsychologistName] = useState<string>("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.fullName) setPsychologistName(data.user.fullName);
      });
  }, []);

// Tambahkan state untuk pagination
const [currentPage, setCurrentPage] = useState<number>(1);
const [rowsPerPage, setRowsPerPage] = useState<number>(10);
// Filter berdasarkan nama user
const filteredReports = reports
  .filter((r) =>
    searchUser
      ? r.User.fullName.toLowerCase().includes(searchUser.toLowerCase())
      : true
  )
  .filter((r) =>
    filterTestType === "all"
      ? true
      : r.TestType?.name === filterTestType
  )
  .filter((r) =>
    filterCompany === "all"
      ? true
      : filterCompany === "self"
      ? !r.Company
      : r.Company?.fullName === filterCompany
  )
  .filter((r) =>
    statusFilter === "all"
      ? true
      : statusFilter === "pending"
      ? !r.validated
      : r.validated
  )
  .filter((r) =>
    filterPsychologist === "all"
      ? true
      : r.validatedBy?.fullName === filterPsychologist
  );

  const filteredTestTypes = Array.from(
  new Set(
    reports
      .filter((r) =>
        filterCompany === "all"
          ? true
          : filterCompany === "self"
          ? !r.Company
              : r.Company?.fullName === filterCompany
      )
      .filter((r) =>
        statusFilter === "all"
          ? true
          : statusFilter === "pending"
          ? !r.validated
          : r.validated
      )
      .map((r) => r.TestType?.name)
      .filter(Boolean) as string[]
  )
);
const filteredCompanies = Array.from(
  new Set(
    reports
      .filter((r) =>
        filterTestType === "all" ? true : r.TestType?.id.toString() === filterTestType
      )
      .filter((r) =>
        statusFilter === "all"
          ? true
          : statusFilter === "pending"
          ? !r.validated
          : r.validated
      )
      .map((r) => r.Company?.fullName || "self") // pakai "self" untuk user sendiri
  )
);

// const filteredStatus = Array.from(
//   new Set(
//     reports
//       .filter((r) =>
//         filterTestType === "all"
//           ? true
//           : r.TestType?.id.toString() === filterTestType
//       )
//       .filter((r) =>
//         filterCompany === "all"
//           ? true
//           : filterCompany === "self"
//           ? !r.Company
//               : r.Company?.fullName === filterCompany
//       )
//       .map((r) => (r.validated ? "selesai" : "pending"))
//   )
// );


// Hitung total halaman dari filtered data
const totalPages = Math.ceil(filteredReports.length / rowsPerPage);

// Data yang ditampilkan di tabel saat ini
const paginatedReports = filteredReports.slice(
  (currentPage - 1) * rowsPerPage,
  currentPage * rowsPerPage
);
useEffect(() => {
  setCurrentPage(1);
}, [searchUser]);
const psychologists = Array.from(
  new Map(
    reports
      .filter((r) => r.validatedBy) // pastikan tidak null
      .map((r) => [r.validatedBy!.fullName, r.validatedBy!]) // pakai "!" karena sudah difilter
  ).values()
);


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
    <main className="relative min-h-screen bg-gray-50 overflow-hidden">
      {/* 🔮 GLOBAL PAGE BLOBS (background seluruh halaman) */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-40 right-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>
      {/* 🌈 BLOBS LATAR PUTIH UTAMA */}
<div className="pointer-events-none absolute inset-0 -z-0">
  {/* Kanan atas */}
  {/* <div className="absolute top-10 right-[-60px] w-[400px] h-[400px] bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" /> */}

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

      <div className="p-6 max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-8 shadow-md mb-10">
      {/* 🔮 Blob Background */}
      <motion.div
        className="absolute -top-10 -left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"
        animate={{ x: [0, 30, -30, 0], y: [0, 20, -20, 0] }}
        transition={{ duration: 9, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-0 right-0 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"
        animate={{ x: [0, -20, 20, 0], y: [0, -10, 10, 0] }}
        transition={{ duration: 11, repeat: Infinity }}
      />

      {/* 🧭 Header Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 text-center"
      >
        <h1
          className="text-4xl sm:text-5xl font-extrabold mb-4 mt-6 bg-clip-text text-transparent
          bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600
          animate-gradient-text hover:animate-gradient-hover transition-all duration-1000"
        >
          Dashboard Psikolog
          {psychologistName && (
            <span
              className="ml-2 bg-clip-text text-transparent
              bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-700
              animate-gradient-text hover:animate-gradient-hover transition-all duration-1000"
            >
              - {psychologistName}
            </span>
          )}
        </h1>

        <p className="text-gray-600 mt-2">
          Selamat datang kembali,{" "}
          <span className="font-semibold text-indigo-700">
            {psychologistName || "Psikolog"}
          </span>
          ! 🧠
        </p>

        {/* Ikon Section */}
        <div className="flex justify-center gap-6 mt-6 text-indigo-600">
          {[Brain, Heart, Activity, UserCircle].map((Icon, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.25, rotate: i % 2 === 0 ? 10 : -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Icon size={30} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>

{/* 🔹 Summary Cards (2x2 Grid) */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
  {/* Total Tes Hari Ini */}
  <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4 hover:shadow-lg transition">
    <div className="p-3 rounded-full bg-indigo-100">
      <Users className="w-6 h-6 text-indigo-600" />
    </div>
    <div>
      <p className="text-gray-500 text-sm">Total Tes Hari Ini</p>
      <p className="text-2xl font-bold text-indigo-600">
        {todayStatsByTest.reduce((acc, item) => acc + item.value, 0)}
      </p>
    </div>
  </div>

  {/* Dari Perusahaan */}
  <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4 hover:shadow-lg transition">
    <div className="p-3 rounded-full bg-green-100">
      <Building className="w-6 h-6 text-green-600" />
    </div>
    <div>
      <p className="text-gray-500 text-sm">Dari Perusahaan</p>
      <p className="text-2xl font-bold text-green-600">
        {todayStatsBySource.find((s) => s.name !== "Sendiri")?.value || 0}
      </p>
    </div>
  </div>

  {/* Dari User Sendiri */}
  <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4 hover:shadow-lg transition">
    <div className="p-3 rounded-full bg-blue-100">
      <User className="w-6 h-6 text-blue-600" />
    </div>
    <div>
      <p className="text-gray-500 text-sm">Dari User Sendiri</p>
      <p className="text-2xl font-bold text-blue-600">
        {todayStatsBySource.find((s) => s.name === "Sendiri")?.value || 0}
      </p>
    </div>
  </div>

  {/* Total Tes Keseluruhan */}
  <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4 hover:shadow-lg transition">
    <div className="p-3 rounded-full bg-purple-100">
      <FileText className="w-6 h-6 text-purple-600" />
    </div>
    <div>
      <p className="text-gray-500 text-sm">Total Tes Keseluruhan</p>
      <p className="text-2xl font-bold text-purple-600">{reports.length}</p>
    </div>
  </div>

  {/* Pending Validasi */}
  <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4 hover:shadow-lg transition">
    <div className="p-3 rounded-full bg-red-100">
      <Clock className="w-6 h-6 text-red-600" />
    </div>
    <div>
      <p className="text-gray-500 text-sm">Pending Validasi</p>
      <p className="text-2xl font-bold text-red-600">{pendingCount}</p>
    </div>
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
<div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-wrap gap-4 items-center">
  {/* Search bar */}
  <div className="relative flex-1 min-w-[250px]">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
    <input
      type="text"
      placeholder="Cari nama user..."
      value={searchUser}
      onChange={(e) => setSearchUser(e.target.value)}
      className="pl-10 pr-3 py-2 border rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>
          <div className="flex items-center gap-2">
  <span className="text-sm text-gray-600 font-medium">Tanggal Tes:</span>
  <input
    type="date"
    value={startDate}
    onChange={(e) => setStartDate(e.target.value)}
    className="p-2 border rounded-md text-sm"
  />
  <span className="text-gray-500">-</span>
  <input
    type="date"
    value={endDate}
    onChange={(e) => setEndDate(e.target.value)}
    className="p-2 border rounded-md text-sm"
  />
</div>
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
                  {filteredTestTypes.map((name) => (

                <SelectItem key={name} value={name}>
        {name}
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
  {filteredCompanies.map((name) => (
    <SelectItem key={name} value={name === "self" ? "self" : name}>
      {name === "self" ? "Sendiri (User)" : name}
    </SelectItem>
  ))}
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
<th className="p-4 font-semibold text-center">
  <div className="flex items-center justify-center gap-2">
    <span>Psikolog</span>
    <Select value={filterPsychologist} onValueChange={setFilterPsychologist}>
      <SelectTrigger className="w-5 h-5 p-0 bg-transparent border-none shadow-none hover:bg-gray-200 rounded-full">
        <span className="material-icons text-sm"></span>
      </SelectTrigger>
      <SelectContent className="max-h-48 overflow-y-auto">
        <SelectItem value="all">Semua Psikolog</SelectItem>
        {psychologists.map((p, idx) => (
          <SelectItem key={idx} value={p.fullName}>
            {p.fullName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
</th>

<th className="p-4 font-semibold text-center">Report</th>

    </tr>
  </thead>
 <tbody>
  {paginatedReports.length > 0 ? (
    paginatedReports.map((report, idx) => (
      <tr key={report.id} className={`transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-indigo-50`}>
        <td className="p-4 text-gray-700 font-medium">{report.User?.fullName || "—"}</td>
        <td className="p-4 text-gray-600">{report.TestType?.name || "—"}</td>
        <td className="p-4 text-gray-600">{report.Attempt?.startedAt ? new Date(report.Attempt.startedAt).toLocaleDateString() : "—"}</td>
        <td className="p-4 text-gray-600">{report.Company?.fullName || <span className="italic text-gray-400">Sendiri</span>}</td>
        <td className="p-4">
          {report.validated ? (
            <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">✅ Selesai</span>
          ) : (
            <span className="px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">⏳ Pending</span>
          )}
        </td>
        <td className="p-4 text-gray-700 text-center">
  {report.validatedBy?.fullName || <span className="italic text-gray-400">—</span>}
</td>
<td className="p-4 text-gray-700 text-center">
  {report.validated && report.result ? (
    <a
      href={report.result}
      target="_blank"
      className="text-indigo-600 hover:underline"
    >
      Lihat Report
    </a>
  ) : (
    <span className="italic text-gray-400">Belum Divalidasi</span>
  )}
</td>


      </tr>
    ))
  ) : (
    
    <tr>
      <td colSpan={5} className="p-6 text-center text-gray-500 italic">Tidak ada data</td>
    </tr>
  )}
</tbody>

</table>


          )}
          <div className="flex items-center justify-between mt-4">
  {/* Pilihan jumlah baris per halaman */}
  <div>
    <label className="mr-2 text-gray-700">Tampilkan:</label>
    <select
      value={rowsPerPage}
      onChange={(e) => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage(1); // reset ke halaman 1
      }}
      className="p-1 border rounded-md"
    >
      <option value={10}>10</option>
      <option value={20}>20</option>
      <option value={30}>30</option>
    </select>
  </div>

  {/* Navigasi halaman */}
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

        </div>
      </div>
    </main>
  );
}

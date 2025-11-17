"use client";

import { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"



import Navbar from "@/components/layout/navbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart, Pie, Cell
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users, CheckCircle, XCircle, Search, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";

interface User {
  id: number;
  fullName: string;
  email: string;
   token?: string;
}
interface TestType {
  id: number;
  name: string;
}
interface PackageTest {
  id: number;
  testType: TestType;
}
interface Package {
  id: string;
  name: string;
  description?: string;
  tests: PackageTest[];
}
interface PackagePurchase {
  id: number;
  package: Package;
  quantity: number;
  userPackages: User[];
}
interface Payment {
  id: number;
  TestType: TestType;
  amount: number;
  quantity: number;
  userPackages?: User[];
  remainingQuota?: number; // 🔥 tambahin

}

export default function CompanyDashboard() {
    const { toast, dismiss, toasts } = useToast(); // ✅ hook dipanggil di level atas component

  const [packagePurchases, setPackagePurchases] = useState<PackagePurchase[]>([]);
  const [singlePayments, setSinglePayments] = useState<Payment[]>([]);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<number | null>(null);
  const [selectedTest, setSelectedTest] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [assignTarget, setAssignTarget] = useState<"PACKAGE" | "TEST">("PACKAGE");
  const [filterType, setFilterType] = useState<"ALL" | "PACKAGE" | "TEST">("ALL");
  const [filterName, setFilterName] = useState<string>("all");
const [statusFilter, setStatusFilter] = useState<string>("all");
  const [testTypes, setTestTypes] = useState<TestType[]>([]);
  const [testId, setTestId] = useState<string>("");
const [open, setOpen] = useState(false);
const [newName, setNewName] = useState("");
const [newEmail, setNewEmail] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [search, setSearch] = useState("");

  const [startDateFilter, setStartDateFilter] = useState<string>(""); // format yyyy-mm-dd
const [endDateFilter, setEndDateFilter] = useState<string>("");
const [openDateFilter, setOpenDateFilter] = useState(false);

const [usersPerPage, setUsersPerPage] = useState(10);
const [allRegisteredUsers, setAllRegisteredUsers] = useState<User[]>([]);
const [verifyingUsers, setVerifyingUsers] = useState(0);



// const [showTypeFilter, setShowTypeFilter] = useState(false);
// const [showNameFilter, setShowNameFilter] = useState(false);
// const [showStatusFilter, setShowStatusFilter] = useState(false);



  // Statistik
  const [reports, setReports] = useState<any[]>([]);
  const [generatedUserId, setGeneratedUserId] = useState("");
const [generatedTestId, setGeneratedTestId] = useState("");


// useEffect(() => {
//   const generateIds = async () => {
//     if (!companyId) return;

//     let testTypeName = "";
//     if (assignTarget === "TEST") {
//       const testObj = singlePayments.find(p => p.id === selectedTest);
//       testTypeName = testObj?.TestType?.name ?? "";
//     }

//     try {
//       const res = await fetch(
//         `/api/company/generate-ids?companyId=${companyId}&testTypeName=${testTypeName}`
//       );
//       if (!res.ok) throw new Error("Gagal generate ID");
//       const { userId, testId } = await res.json();
//       setGeneratedUserId(userId);
//       setGeneratedTestId(testId ?? "");
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // hanya generate kalau ada paket/test yang dipilih
//   if ((assignTarget === "PACKAGE" && selectedPurchase) || 
//       (assignTarget === "TEST" && selectedTest)) {
//     generateIds();
//   }
// }, [companyId, selectedPurchase, selectedTest, assignTarget, singlePayments]);

// Fungsi generate random ID


useEffect(() => {
  const generateIds = async () => {
    if (!companyId || !selectedTest) return;

    // cari nama test berdasarkan selectedTest
    const testObj = singlePayments.find(p => p.id === selectedTest);
    const testTypeName = testObj?.TestType?.name ?? "";

    try {
      const res = await fetch(
        `/api/company/generate-ids?companyId=${companyId}&testTypeName=${testTypeName}`
      );
      if (!res.ok) throw new Error("Gagal generate ID");

      const { userId, testId } = await res.json();
      setGeneratedUserId(userId);
      setGeneratedTestId(testId ?? "");
    } catch (err) {
      console.error(err);
    }
  };

  // generate hanya jika test dipilih
  if (selectedTest) {
    generateIds();
  }
}, [companyId, selectedTest, singlePayments]);

const generateId = (prefix: string) => {
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `${prefix}-${date}-${rand}`;
};
const handleGenerate = async () => {
  if (!companyId) return;
  try {
    const res = await fetch(
      `/api/company/generate-ids?companyId=${companyId}&testTypeName=${assignTarget === "TEST" ? "CPMI" : ""}`
    );
    if (!res.ok) throw new Error("Gagal generate ID");
    const { userId, testId } = await res.json();
    setGeneratedUserId(userId);
    if (testId) setGeneratedTestId(testId);
  } catch (err) {
    console.error(err);
  }
};

const generateIdsManual = async (paymentId: number) => {
  if (!companyId) return;

  const testObj = singlePayments.find(p => p.id === paymentId);
  const testTypeName = testObj?.TestType?.name ?? "";

  try {
    const res = await fetch(
      `/api/company/generate-ids?companyId=${companyId}&testTypeName=${testTypeName}`
    );

    const { userId, testId } = await res.json();
    setGeneratedUserId(userId);
    setGeneratedTestId(testId ?? "");
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  if (!companyId) return;

  const fetchVerifyingUsers = async () => {
    try {
      const res = await fetch(`/api/reports/verifying?companyId=${companyId}`);
      if (!res.ok) throw new Error("Gagal ambil data");
      const data = await res.json();
      setVerifyingUsers(data.count ?? 0);
    } catch (err) {
      console.error(err);
    }
  };

  fetchVerifyingUsers();
}, [companyId]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const USERS_PER_PAGE = 10;

  const fetchCompanyId = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error("Tidak bisa ambil info user");
      const data = await res.json();
      if (data.user?.role === "PERUSAHAAN") setCompanyId(data.user.id);
      else alert("Hanya perusahaan yang bisa akses dashboard ini");
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDashboard = async () => {
    if (!companyId) return;
    try {
      const res = await fetch(`/api/company/purchase?companyId=${companyId}`);
      if (!res.ok) throw new Error("Gagal fetch dashboard");
      const data = await res.json();
      setPackagePurchases(data?.packagePurchases ?? []);
      setSinglePayments(data?.singlePayments ?? []);

      // 🔹 fetch reports untuk statistik
      const repRes = await fetch(`/api/reports/all?companyId=${companyId}`);
      if (repRes.ok) {
        const repData = await repRes.json();
        setReports(repData ?? []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCompanyId();
  }, []);
  useEffect(() => {
    fetchDashboard();
  }, [companyId]);

const handleAddUser = async () => {
  if (!companyId) return;

  // pastikan user sudah pilih test
  if (!selectedTest) {
    alert("Pilih test dulu");
    return;
  }

  try {
    // 1️⃣ Minta ID dari BE (userId & testId)
    const selectedTestObj = singlePayments.find(p => p.id === selectedTest);
    const testName = selectedTestObj?.TestType?.name ?? "";

    const idRes = await fetch(
      `/api/company/generate-ids?companyId=${companyId}&testTypeName=${testName}`
    );

    if (!idRes.ok) throw new Error("Gagal generate ID");
    const { userId, testId } = await idRes.json();

    // 2️⃣ Daftarkan user ke test satuan
    const res = await fetch("/api/company/register-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,                 // dari generate-ids
        paymentId: selectedTest, // ⬅️ selalu kirim ini
        testCustomId: testId ?? null,
        companyId,              // dipakai backend untuk create user baru
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Gagal mendaftarkan user");
      return;
    }

    toast({
      title: "✅ User berhasil didaftarkan!",
      description: `Token: ${data.token ?? "-"}`,
    });

    fetchDashboard();
  } catch (err) {
    console.error(err);
    alert("Terjadi kesalahan saat mendaftarkan user");
  }
};



const handleRemoveUser = (
    userId: number,
    type: "Paket" | "Test Satuan",
    targetId: number
  ) => {
    // toast konfirmasi
    toast({
  title: "⚠️ Konfirmasi penghapusan",
  description: "Apakah kamu yakin ingin menghapus user ini?",
  duration: 10000,
  variant: "warning",
    position: "center", // ⚡ ini buat muncul di tengah layar

      action: (
        <div className="flex gap-2 mt-2">
          <button
            className="bg-gray-200 text-gray-800 px-3 py-1 rounded"
            onClick={() => {
              const lastToast = toasts[toasts.length - 1];
              if (lastToast) dismiss(lastToast.id);
              toast({ title: "❌ Penghapusan dibatalkan", duration: 3000 });
            }}
          >
            Batal
          </button>
          <button
            className="bg-red-600 text-white px-3 py-1 rounded"
            onClick={async () => {
              const lastToast = toasts[toasts.length - 1];
              if (lastToast) dismiss(lastToast.id);

              try {
                const res = await fetch("/api/company/remove-user", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ userId, type, targetId }),
                });
                const data = await res.json();

                if (!res.ok) {
                  toast({
                    title: "⚠️ Gagal menghapus user",
                    description: data.error || "Terjadi kesalahan",
                    duration: 5000,
                  });
                  return;
                }

                toast({
                  title: "✅ User berhasil dihapus",
                  description: `User dengan ID ${userId} telah dihapus`,
                  duration: 5000,
                });

                fetchDashboard();
              } catch (err) {
                console.error(err);
                toast({
                  title: "⚠️ Terjadi kesalahan",
                  description: "Tidak bisa menghapus user saat ini",
                  duration: 5000,
                });
              }
            }}
          >
            Hapus
          </button>
        </div>
      ),
    });
  };
  useEffect(() => {
  const fetchTestTypes = async () => {
    try {
      const res = await fetch("/api/testtypes"); // endpoint semua test types
      if (!res.ok) throw new Error("Gagal ambil jenis tes");
      const data = await res.json();
      setTestTypes(data ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  fetchTestTypes();
}, []);


  // Gabungkan semua user untuk table
// Gabungkan semua user untuk table
const allUsers = [
  
  // === Paket ===
  ...(packagePurchases ?? []).flatMap((p) =>
    (p.userPackages ?? []).map((u) => {
      const attempt = reports.find(
        (r) =>
          r.User?.id === u.id &&
          r.TestType?.id === p.package?.tests[0]?.testType?.id
      );

      let status: string;
      if (!attempt) status = "Belum Tes";
      else if (attempt.validated) status = "Selesai";
      else if (attempt.Attempt?.startedAt) status = "Sedang diverifikasi psikolog";
      else status = "Belum divalidasi";

      return {
        ...u,
        type: "Paket" as const,
        targetId: p.id,
        name: p.package?.name ?? "",
        fullName: u.fullName ?? "",
        email: u.email ?? "",
        status,
        startedAt: attempt?.Attempt?.startedAt ?? null,
       token: (u as any).tokens?.[0]?.token ?? undefined,
        result: attempt ?? null,
      };
    })
  ),

  // === Test Satuan ===
  ...(singlePayments ?? []).flatMap((p) =>
    (p.userPackages ?? []).map((u) => {
      const attempt = reports.find(
        (r) =>
          r.User?.id === u.id &&
          r.TestType?.id === p.TestType?.id
      );

      let status: string;
      if (!attempt) status = "Belum Tes";
      else if (attempt.validated) status = "Selesai";
      else if (attempt.Attempt?.startedAt) status = "Sedang diverifikasi psikolog";
      else status = "Belum divalidasi";

      return {
        ...u,
        type: "Test Satuan" as const,
        targetId: p.id,
        name: p.TestType?.name ?? "",
        fullName: u.fullName ?? "",
        email: u.email ?? "",
        status,
        startedAt: attempt?.Attempt?.startedAt ?? null,
     token: (u as any).tokens?.[0]?.token ?? undefined,
        result: attempt ?? null,
      };
    })
  ),

  // // === Test Satuan ===
  // ...(singlePayments ?? []).flatMap((p) =>
  //   (p.userPackages ?? []).map((u) => {
  //     const attempt = reports.find(
  //       (r) =>
  //         r.User?.id === u.id &&
  //         r.TestType?.id === p.TestType?.id
  //     );

  //     // Tentukan status
  //     let status: string;
  //     if (!attempt) status = "Belum Tes";
  //     else if (attempt.validated) status = "Selesai";
  //     else if (attempt.Attempt?.startedAt) status = "Sedang diverifikasi psikolog";
  //     else status = "Belum divalidasi";

  //     return {
  //       ...u,
  //       type: "Test Satuan" as const,
  //       targetId: p.id,
  //       name: p.TestType?.name ?? "",
  //       fullName: u.fullName ?? "",
  //       email: u.email ?? "",
  //       status,
  //       startedAt: attempt?.Attempt?.startedAt ?? null,
  //       token: attempt?.token ?? undefined,
  //       result: attempt ?? null, // ✅ sertakan hasil
  //     };
  //   })
  // ),
];

const testStats = testTypes.map((t) => {
  const count = allUsers.filter(
    (u) =>
      u.name === t.name &&
      (u.status === "Selesai" || u.status === "Sedang diverifikasi psikolog")
  ).length;

  return {
    testName: t.name,
    count,
  };
});
const mergePayment = (existingPayments: Payment[], newPayment: Payment) => {
  // cek apakah payment untuk TestType ini sudah ada
  const existing = existingPayments.find(
    (p) => p.TestType.id === newPayment.TestType.id
  );

  if (existing) {
    // jika ada, jumlahkan quantity dan tetap gunakan userPackages lama
    const used = existing.userPackages?.length ?? 0;
    const total = existing.quantity + newPayment.quantity;

    return existingPayments.map((p) =>
      p.TestType.id === newPayment.TestType.id
        ? {
            ...p,
            quantity: total,
            remainingQuota: total - used,
          }
        : p
    );
  } else {
    // jika belum ada, tambahkan baru
    return [
      ...existingPayments,
      {
        ...newPayment,
        remainingQuota: newPayment.quantity - (newPayment.userPackages?.length ?? 0),
      },
    ];
  }
};
// Merge semua singlePayments agar jenis tes sama digabung
const mergedSinglePayments = singlePayments.reduce((acc, payment) => {
  return mergePayment(acc, payment);
}, [] as Payment[]);

  // Statistik user
// Statistik user berdasarkan allUsers
const totalUsers = allUsers.length;
const testedUsers = allUsers.filter(u => u.status === "Selesai").length;
const notTestedUsers = allUsers.filter(u => u.status === "Belum Tes").length;

// === FILTER USERS ===
const filteredUsers = allUsers.filter((u) => {
  const matchType =
    filterType === "ALL" ||
    (filterType === "PACKAGE" && u.type === "Paket") ||
    (filterType === "TEST" && u.type === "Test Satuan");

  const matchName = filterName === "all" || u.name === filterName;
  const matchStatus = statusFilter === "all" || u.status === statusFilter;
    // 🔹 Tambahkan search filter
  const matchSearch =
    !search ||
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase());

  let matchDate = true;
  if (u.startedAt) {
    const started = new Date(u.startedAt).setHours(0,0,0,0);
    if (startDateFilter) {
      matchDate = matchDate && (started >= new Date(startDateFilter).getTime());
    }
    if (endDateFilter) {
      matchDate = matchDate && (started <= new Date(endDateFilter).getTime());
    }
  } else {
    // jika user belum tes, tampilkan hanya jika tidak ada filter tanggal
    matchDate = !startDateFilter && !endDateFilter;
  }

  return matchType && matchName && matchStatus && matchDate && matchSearch;
});

// === PAGINATION ===
const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
const paginatedUsers = filteredUsers.slice(
  (currentPage - 1) * USERS_PER_PAGE,
  currentPage * USERS_PER_PAGE
);
const stats = [
  { name: "Total Karyawan", value: totalUsers, icon: <Users className="w-6 h-6" />, color: "#6366F1" },
  { name: "Sudah Tes", value: testedUsers, icon: <CheckCircle className="w-6 h-6" />, color: "#10B981" },
  { name: "Belum Tes", value: notTestedUsers, icon: <XCircle className="w-6 h-6" />, color: "#EF4444" },
  { name: "Sedang Diverifikasi", value: verifyingUsers, icon: <Clock className="w-6 h-6" />, color: "#F59E0B" },
];
const [companyName, setCompanyName] = useState<string>("");

useEffect(() => {
  fetch("/api/auth/me")
    .then(res => res.json())
    .then(data => {
      if (data.user?.fullName) setCompanyName(data.user.fullName);
    });
}, []);


  return (
    <div>
      <Navbar />
<div className="container mx-auto py-8 px-4">
  <div className="text-center mb-12">
    {/* Judul utama */}
    <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 mt-10 bg-clip-text text-transparent
      bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600
      animate-gradient-text hover:animate-gradient-hover transition-all duration-1000">
      Dashboard Perusahaan
      {companyName && (
        <span className="ml-2 bg-clip-text text-transparent
          bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700
          animate-gradient-text hover:animate-gradient-hover transition-all duration-1000">
          - {companyName}
        </span>
      )}
    </h1>
{/* Pesan selamat datang */}
<p
  className="text-gray-500 sm:text-lg mt-4 flex items-center justify-center gap-2 
  animate-fade-in transition-all duration-700"
>
  <span className="text-indigo-600 text-2xl animate-pulse">🏢</span>
  <span>
    Selamat datang kembali {" "}
    <span className="font-semibold text-indigo-700">
      {companyName || "Anda"}
    </span>
   
  </span>
</p>
    {/* Subjudul */}
    <p className="text-gray-400 sm:text-lg mt-2">
      Pantau semua karyawan dan progress test perusahaan Anda secara real-time
    </p>

    {/* Garis bawah animatif */}
    <div className="mt-4 w-32 h-1 mx-auto rounded-full shadow-lg
      bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600
      animate-pulse hover:scale-105 transition-all duration-500"></div>

    {/* Ikon kecil animatif */}
    <div className="mt-6 flex justify-center gap-4">
      <Users className="w-6 h-6 text-blue-700 animate-bounce" />
      <CheckCircle className="w-6 h-6 text-blue-600 animate-bounce delay-75" />
      <XCircle className="w-6 h-6 text-blue-500 animate-bounce delay-150" />
      <Clock className="w-6 h-6 text-blue-400 animate-bounce delay-200" />
    </div>
  </div>


<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
  {stats.map((stat, idx) => {
    const percentage = totalUsers ? ((stat.value / totalUsers) * 100).toFixed(0) : 0;
    const data = [
      { name: stat.name, value: stat.value },
      { name: "Remaining", value: totalUsers - stat.value },
    ];
    const COLORS = [stat.color, "#E5E7EB"]; // second color = gray bg

    // Soft background colors
const softBg: Record<string, string> = {
  // "#6366F1": "bg-indigo-50",
  // "#10B981": "bg-green-50",
  // "#EF4444": "bg-red-50",
  // "#F59E0B": "bg-yellow-50",
   "#6366F1": "bg-indigo-500", // biru
      "#10B981": "bg-green-500",  // hijau
      "#EF4444": "bg-red-500",    // merah
      "#F59E0B": "bg-yellow-500", // kuning
};

const iconColor: Record<string, string> = {
  "#6366F1": "text-indigo-700",
  "#10B981": "text-green-700",
  "#EF4444": "text-red-700",
  "#F59E0B": "text-yellow-700",
};

    return (
    <div
  key={idx}
  className={`${softBg[stat.color]} rounded-xl shadow-md p-4 flex flex-col items-center hover:scale-105 transform transition`}
>
  <div className="mb-2 text-white">{stat.icon}</div>
  <h3 className="text-white text-sm">{stat.name}</h3>
  <p className="text-2xl font-bold mt-1 text-white">{stat.value}</p>
  <div className="w-24 h-24 mt-2">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          innerRadius={35}
          outerRadius={45}
          startAngle={90}
          endAngle={-270}
        >
          {data.map((entry, i) => (
            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => [`${value}`, "User"]} />
      </PieChart>
    </ResponsiveContainer>
  </div>
  <p className="text-sm text-gray-100 mt-1">{percentage}% dari total</p>
</div>

    );
  })}
</div>




   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 items-stretch">

  {/* Kiri: Chart */}
  <div className="bg-white p-6 rounded-2xl shadow-md h-full flex flex-col">
    <h2 className="text-xl font-bold mb-4 text-indigo-700 text-center">Test yang Sudah Dikerjakan</h2>
    {testStats.length > 0 ? (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={testStats} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="testName" tick={{ fill: "#4b5563" }} />
          <YAxis allowDecimals={false} tick={{ fill: "#4b5563" }} />
          <Tooltip />
          <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    ) : (
      <p className="text-center text-gray-500 mt-12">Belum ada data tes</p>
    )}
  </div>


  {/* Kanan: Paket/Test Card Grid */}
  <div className="bg-indigo-50 rounded-2xl shadow-md p-6 h-full flex flex-col overflow-y-auto">
    <h2 className="text-xl font-bold text-indigo-700 mb-4 text-center">Test yang Sudah Dibeli</h2>

    {/* Grid Card */}
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 w-full">
   {[...packagePurchases, ...mergedSinglePayments].map((p, idx) => {
  const remaining =
    "remainingQuota" in p
      ? p.remainingQuota ?? p.quantity
      : p.quantity - (p.userPackages?.length ?? 0);

  const isEmpty = remaining <= 0;

  const pieData = [
    { name: "Used", value: p.quantity - remaining },
    { name: "Remaining", value: remaining },
  ];
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl shadow-sm p-4 flex flex-row items-center justify-between w-full transition hover:shadow-lg hover:scale-105 transform"
          >
            {/* Circle Radial Progress */}
            <div className="w-20 h-20 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    innerRadius={20}
                    outerRadius={30}
                  >
                    <Cell fill={isEmpty ? "#F87171" : "#4f46e5"} />
                    <Cell fill="#E5E7EB" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Info Card */}
            <div className="flex flex-col flex-1 ml-4">
              <h3 className="text-indigo-700 font-semibold truncate">
                {"package" in p ? p.package?.name : p.TestType?.name}
              </h3>
              {"package" in p && p.package?.description && (
                <p className="text-xs text-gray-500 truncate">{p.package.description}</p>
              )}
              <p className={`mt-2 text-sm font-medium ${isEmpty ? "text-red-700" : "text-green-700"}`}>
                {remaining} / {p.quantity} tersisa
              </p>
              {"amount" in p && (
                <p className="mt-1 text-sm text-yellow-700 font-medium">
                  Rp {p.amount.toLocaleString("id-ID")}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
</div>


<Dialog open={openDialog} onOpenChange={setOpenDialog}>
  <DialogContent className="max-w-lg">
    <DialogHeader>
      <DialogTitle>Daftarkan Karyawan</DialogTitle>
    </DialogHeader>

<div className="space-y-4">

  {/* Pilih Test Satuan */}
  <div>
    <label className="block text-sm font-medium mb-1">Pilih Test</label>

    <select
      value={selectedTest ?? ""}
      onChange={(e) => setSelectedTest(parseInt(e.target.value))}
      className="w-full border rounded-lg p-2"
    >
      <option value="">-- Pilih Test --</option>

      {mergedSinglePayments.map((p) => (
        <option key={p.id} value={p.id}>
          {p.TestType?.name} (Sisa {p.remainingQuota})
        </option>
      ))}
    </select>
  </div>

  {/* User ID Auto */}
  <div>
    <label className="block text-sm font-medium mb-1">User ID (Auto)</label>
    <input
      type="text"
      value={generatedUserId}
      readOnly
      className="w-full border rounded-lg p-2 bg-gray-100"
    />
  </div>

  {/* Test ID Auto */}
  <div>
    <label className="block text-sm font-medium mb-1">Test ID (Auto)</label>
    <input
      type="text"
      value={generatedTestId}
      readOnly
      className="w-full border rounded-lg p-2 bg-gray-100"
    />
  </div>

</div>

    <DialogFooter>
<Button
  onClick={async () => {
    if (!companyId) return alert("Company ID tidak ditemukan");

    try {
      const idRes = await fetch(
        `/api/company/generate-ids?companyId=${companyId}&testTypeId=${selectedTest ?? ""}`
      );
      if (!idRes.ok) throw new Error("Gagal generate ID");

      const { userId, testId } = await idRes.json();
      setGeneratedUserId(userId);
      setGeneratedTestId(testId ?? "");

      const res = await fetch("/api/company/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          // packagePurchaseId: assignTarget === "PACKAGE" ? selectedPurchase : null,
          // paymentId: assignTarget === "TEST" ? selectedTest : null,
          paymentId: selectedTest,  
          testCustomId: testId ?? null,
          companyId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setOpenDialog(false); // ⚡ tutup modal dulu
        toast({
          title: "⚠️ Gagal mendaftarkan user",
          description: data.error || "Terjadi kesalahan",
          duration: 5000,
          variant: "error",
          position: "center", // muncul di atas modal
        });
        return;
      }

      setOpenDialog(false); // tutup modal
      toast({
        title: "✅ User berhasil didaftarkan!",
        description: `Token: ${data.token ?? "-"}`,
        duration: 5000,
        variant: "success",
        position: "top", // muncul di atas layar
      });

      fetchDashboard();
    } catch (err: any) {
      console.error(err);
      setOpenDialog(false); // tutup modal
      toast({
        title: "⚠️ Terjadi kesalahan",
        description: err.message || "Tidak bisa mendaftarkan user",
        duration: 5000,
        variant: "error",
        position: "center",
      });
    }
  }}
  // disabled={
  //   (assignTarget === "PACKAGE" && !selectedPurchase) ||
  //   (assignTarget === "TEST" && !selectedTest)
  // }
   disabled={!selectedTest}
  className="bg-indigo-600 text-white hover:bg-indigo-700"
>
  Tambahkan
</Button>


    </DialogFooter>
  </DialogContent>
</Dialog>


{/* Daftarkan User */}
{/* <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
  <h2 className="text-xl font-bold mb-6 text-indigo-700 text-center md:text-left">
    Daftarkan User
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
    {/* Pilih Tipe Pendaftaran 
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-600 mb-1">
        Tipe Pendaftaran
      </label>
<select
  value={assignTarget}
  onChange={(e) => {
    setAssignTarget(e.target.value as "PACKAGE" | "TEST");
    // reset testId saat ganti tipe
    if (e.target.value === "TEST") setGeneratedTestId("");
  }}
  className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
>
  <option value="PACKAGE">Paket</option>
  <option value="TEST">Test Satuan</option>
</select>

    </div>
*/}
    {/* Pilih Paket / Test */}
    
    {/*<div className="flex flex-col">
      <label className="text-sm font-medium text-gray-600 mb-1">
        {assignTarget === "PACKAGE" ? "Pilih Paket" : "Pilih Test"}
      </label>
      {assignTarget === "PACKAGE" ? (
        <select
          value={selectedPurchase ?? ""}
          onChange={(e) => setSelectedPurchase(parseInt(e.target.value))}
          className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">-- Pilih Paket --</option>
          {packagePurchases.map((p) => (
            <option key={p.id} value={p.id}>
              {p.package?.name} (Sisa{" "}
              {p.quantity - (p.userPackages?.length ?? 0)})
            </option>
          ))}
        </select>
      ) : (
        <select
          value={selectedTest ?? ""}
          onChange={(e) => setSelectedTest(parseInt(e.target.value))}
          className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">-- Pilih Test --</option>
          {singlePayments.map((p) => (
            <option key={p.id} value={p.id}>
              {p.TestType?.name} (Sisa{" "}
              {p.remainingQuota ??
                (p.quantity - (p.userPackages?.length ?? 0))})
            </option>
          ))}
        </select>
      )}
    </div> */}

    {/* User ID (Auto) */}
    {/*<div className="flex flex-col">
      <label className="text-sm font-medium text-gray-600 mb-1">
        User ID (Auto)
      </label>
      <input
        type="text"
        value={generatedUserId}
        readOnly
        className="border border-gray-300 rounded-lg p-2 bg-gray-100 cursor-not-allowed"
      />
    </div> */}

    {/* Test ID (Auto, hanya jika pilih TEST) */}
    {/*{assignTarget === "TEST" && (
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-600 mb-1">
          Test ID (Auto)
        </label>
        <input
          type="text"
          value={generatedTestId}
          readOnly
          className="border border-gray-300 rounded-lg p-2 bg-gray-100 cursor-not-allowed"
        />
      </div>
    )}
<button
  onClick={async () => {
    if (!companyId) return;

    try {
      // 1️⃣ Generate ID resmi dari BE
      const idRes = await fetch(
        `/api/company/generate-ids?companyId=${companyId}&testTypeId=${selectedTest ?? ""}`
      );
      if (!idRes.ok) throw new Error("Gagal generate ID");

const { userId, testId } = await idRes.json();
setGeneratedUserId(userId);
setGeneratedTestId(testId ?? "");

      // 2️⃣ Daftarkan user
      const res = await fetch("/api/company/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          packagePurchaseId: assignTarget === "PACKAGE" ? selectedPurchase : null,
          paymentId: assignTarget === "TEST" ? selectedTest : null,
          testCustomId: testId ?? null,
          companyId,
        }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.error);

      alert(`✅ User berhasil didaftarkan!\nToken: ${data.token ?? "-"}`);
      fetchDashboard();
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mendaftarkan user");
    }
  }}
  className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
  disabled={
    (assignTarget === "PACKAGE" && !selectedPurchase) ||
    (assignTarget === "TEST" && !selectedTest)
  }
>
  Tambahkan User
</button>


  </div>
</div>*/}



{/* Table + Column Filters */}
<div className="bg-white p-6 rounded-xl shadow overflow-x-auto">
  
{/* Header Section */}
<div className="mb-4">
  {/* Judul di atas */}
  <h2 className="text-xl font-bold text-gray-700 mb-3">
    Manajemen Karyawan
  </h2>

  {/* Baris kedua: search + filter + button */}
<div className="flex items-center justify-between gap-4">
  {/* Search di kiri - full width */}
  <div className="flex-1 relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
    <input
      type="text"
      placeholder="Cari karyawan..."
      value={search}
      onChange={(e) => {
        setSearch(e.target.value);
        setCurrentPage(1);
      }}
      className="w-full pl-9 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
    />
  </div>

  {/* Kanan: filter tanggal + button */}
  <div className="flex items-center gap-3">
    {/* Filter Tanggal Tes */}
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-600">Tanggal Tes:</span>
      <input
        type="date"
        value={startDateFilter}
        onChange={(e) => { setStartDateFilter(e.target.value); setCurrentPage(1); }}
        className="p-2 border rounded-md text-sm"
      />
      <span className="text-gray-500">s/d</span>
      <input
        type="date"
        value={endDateFilter}
        onChange={(e) => { setEndDateFilter(e.target.value); setCurrentPage(1); }}
        className="p-2 border rounded-md text-sm"
      />
    </div>

    {/* Button di kanan */}
    <Button
      onClick={() => setOpenDialog(true)}
      className="bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2"
    >
      <UserPlus className="w-5 h-5" />
      Daftarkan Karyawan
    </Button>
  </div>
</div>
</div>
  <table className="min-w-full border-collapse text-sm">
    <thead>
      <tr className="bg-gradient-to-r from-indigo-50 to-indigo-100 text-gray-700">
        <th className="p-4 font-semibold text-left">Nama</th>
        <th className="p-4 font-semibold text-left">Email</th>

        {/* Tipe Pendaftaran */}
        <th className="p-4 font-semibold text-center">
          <div className="flex items-center justify-center gap-2">
            <span>Tipe Pendaftaran</span>
<Select
  onValueChange={(value) => {
    setSelectedTest(Number(value)); // tetap update state

    // ⬅ langsung generate baru setiap user pilih test
    generateIdsManual(Number(value));
  }}
>

              <SelectTrigger className="w-5 h-5 p-0 bg-transparent border-none shadow-none hover:bg-gray-200 rounded-full">
                <span className="material-icons text-sm"></span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua</SelectItem>
                <SelectItem value="PACKAGE">Paket</SelectItem>
                <SelectItem value="TEST">Test Satuan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </th>

        {/* Nama Paket/Test */}
<th className="p-4 font-semibold text-center">
  <div className="flex items-center justify-center gap-2">
    <span>Jenis Tes</span>
    <Select
  value={filterName}
  onValueChange={(v) => { setFilterName(v); setCurrentPage(1); }}
>
  <SelectTrigger className="w-5 h-5 p-0 bg-transparent border-none shadow-none hover:bg-gray-200 rounded-full">
    <span className="material-icons text-sm"></span>
  </SelectTrigger>
  <SelectContent className="max-h-48 overflow-y-auto">
    <SelectItem value="all">Semua Tes</SelectItem>
    {testTypes.map((t) => (
      <SelectItem key={t.id} value={t.name}>
        {t.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

  </div>
</th>
 <th className="p-4 font-semibold text-center">URL</th>


        {/* Status */}
        <th className="p-4 font-semibold text-center">
          <div className="flex items-center justify-center gap-2">
            <span>Status</span>
            <Select
              value={statusFilter}
              onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
            >
            <SelectTrigger className="w-5 h-5 p-0 bg-transparent border-none shadow-none hover:bg-gray-200 rounded-full">
  <span className="material-icons text-sm"></span>
</SelectTrigger>
<SelectContent>
  <SelectItem value="all">Semua</SelectItem>
  <SelectItem value="Selesai">Selesai</SelectItem>
  <SelectItem value="Belum Tes">Belum Tes</SelectItem>
  <SelectItem value="Sedang diverifikasi psikolog">Sedang Diverifikasi Psikolog</SelectItem>
  <SelectItem value="Belum divalidasi">Belum Divalidasi</SelectItem>
</SelectContent>

            </Select>
          </div>
        </th>

{/* Tanggal Mulai Tes */}
<th className="p-4 font-semibold text-center">
  Tanggal Tes
</th>

<th className="p-4 font-semibold text-center">Hasil</th>



        <th className="p-4 font-semibold text-center">Aksi</th>
      </tr>
    </thead>

   <tbody>
  {paginatedUsers.length > 0 ? (
    paginatedUsers.map((u) => {
           // console.log("🚀 u:", u); // ← letakkan di sini

      // Tentukan status baru
      let displayStatus = u.status; // langsung pakai status dari mapping allUsers

      return (
        <tr
         // key={`${u.type}-${u.id}-${u.name}`}
           key={`${u.type}-${u.id}-${u.targetId}`} 
          className={`transition-colors hover:bg-indigo-50 ${
            paginatedUsers.indexOf(u) % 2 === 0 ? "bg-white" : "bg-gray-50"
          }`}
        >
          <td className="p-4 text-gray-700 font-medium">{u.fullName}</td>
          <td className="p-4 text-gray-600">{u.email}</td>
          <td className="p-4 text-gray-600 text-center">{u.type}</td>
          <td className="p-4 text-gray-600 text-center">{u.name}</td>
          
          {/* URL */}
          <td className="p-4 text-center">
            {u.token ? (
              <a
                href={`http://localhost:3000/tes/cpmi?token=${u.token}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline text-sm"
              >
                Link Tes
              </a>
            ) : "-"}
          </td>

          {/* Status */}
          <td className="p-4 text-center">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
              displayStatus === "Belum Tes"
                ? "text-yellow-700 bg-yellow-100"
                : displayStatus === "Belum divalidasi"
                ? "text-gray-700 bg-gray-100"
                : displayStatus === "Sedang diverifikasi psikolog"
                ? "text-orange-700 bg-orange-100"
                : "text-green-700 bg-green-100"
            }`}>
              {displayStatus}
            </span>
          </td>

          {/* Tanggal Mulai Tes */}
          <td className="p-4 text-center">
            {u.startedAt ? new Date(u.startedAt).toLocaleDateString("id-ID") : "-"}
          </td>

      {/* Hasil */}
<td className="p-4 text-center">
  {u.result && u.result.validated ? (
  <a
    href={`/tes/hasil/${u.result.Attempt.id}`}
    target="_blank"
    rel="noopener noreferrer"
    className="text-indigo-600 hover:underline text-sm"
  >
    Lihat Hasil
  </a>
) : (
  "-"
)}

</td>


          {/* Aksi */}
          <td className="p-4 text-center">
            <button
              onClick={() => handleRemoveUser(u.id, u.type, u.targetId)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
            >
              Hapus
            </button>
          </td>
        </tr>
      );
    })
  ) : (
    <tr>
      <td colSpan={9} className="p-6 text-center text-gray-500 italic">
        Tidak ada user sesuai filter
      </td>
    </tr>
  )}
</tbody>

  </table>
  <div className="flex items-center justify-between mt-4">
  {/* Pilih jumlah item per halaman */}
  <div className="flex items-center gap-2">
    <span className="text-sm text-gray-600">Tampilkan:</span>
    <select
      value={usersPerPage}
      onChange={(e) => {
        setUsersPerPage(parseInt(e.target.value));
        setCurrentPage(1); // reset ke halaman pertama
      }}
      className="border rounded px-2 py-1 text-sm"
    >
      <option value={10}>10</option>
      <option value={20}>20</option>
      <option value={30}>30</option>
    </select>
  </div>

  {/* Navigasi halaman */}
  <div className="flex items-center gap-2">
    <button
      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
      className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
    >
      Previous
    </button>
    <span className="text-sm text-gray-600">
      Halaman {currentPage} dari {totalPages}
    </span>
    <button
      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages}
      className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
    >
      Next
    </button>
  </div>
</div>

</div>


 

   </div>
   <Toaster />

   </div>
     

  );
}

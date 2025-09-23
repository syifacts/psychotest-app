"use client";

import { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";

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
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

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




// const [showTypeFilter, setShowTypeFilter] = useState(false);
// const [showNameFilter, setShowNameFilter] = useState(false);
// const [showStatusFilter, setShowStatusFilter] = useState(false);



  // Statistik
  const [reports, setReports] = useState<any[]>([]);
  const [generatedUserId, setGeneratedUserId] = useState("");
const [generatedTestId, setGeneratedTestId] = useState("");


useEffect(() => {
  const generateIds = async () => {
    if (!companyId) return;

    let testTypeName = "";
    if (assignTarget === "TEST") {
      const testObj = singlePayments.find(p => p.id === selectedTest);
      testTypeName = testObj?.TestType?.name ?? "";
    }

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

  // hanya generate kalau ada paket/test yang dipilih
  if ((assignTarget === "PACKAGE" && selectedPurchase) || 
      (assignTarget === "TEST" && selectedTest)) {
    generateIds();
  }
}, [companyId, selectedPurchase, selectedTest, assignTarget, singlePayments]);

// Fungsi generate random ID
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

  try {
    // 1️⃣ Minta ID dari BE
const selectedTestObj = singlePayments.find(p => p.id === selectedTest);
const testName = selectedTestObj?.TestType?.name ?? "";
const idRes = await fetch(
  `/api/company/generate-ids?companyId=${companyId}&testTypeName=${testName}`
);

    if (!idRes.ok) throw new Error("Gagal generate ID");
    const { userId, testId } = await idRes.json();

    // 2️⃣ Daftarkan user ke package / test
    const res = await fetch("/api/company/register-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId, // 🔥 pake userId dari BE, bukan email
        packagePurchaseId: assignTarget === "PACKAGE" ? selectedPurchase : null,
        paymentId: assignTarget === "TEST" ? selectedTest : null,
        testCustomId: testId ?? null, // kalau test satuan
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
};


  const handleRemoveUser = async (
    userId: number,
    type: "Paket" | "Test Satuan",
    targetId: number
  ) => {
    if (!confirm("Yakin ingin menghapus user ini?")) return;
    try {
      const res = await fetch("/api/company/remove-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type, targetId }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error);
      alert("User berhasil dihapus");
      fetchDashboard();
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menghapus user");
    }
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
      // Cek laporan yang sesuai paket & user
      const attempt = reports.find(
        (r) =>
          r.User?.id === u.id &&
          r.TestType?.id === p.package?.tests[0]?.testType?.id
      );

      // Tentukan status
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
        token: attempt?.token ?? undefined,
        result: attempt ?? null, // ✅ sertakan hasil
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

      // Tentukan status
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
        token: attempt?.token ?? undefined,
        result: attempt ?? null, // ✅ sertakan hasil
      };
    })
  ),
];

const testStats = testTypes.map((t) => {
  const count = allUsers.filter(
    (u) => u.name === t.name && u.status === "Sudah Tes"
  ).length;
  return {
    testName: t.name,
    count,
  };
});

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
<h1 className="text-3xl font-bold mb-8 text-center text-gray-800 mt-15 mb-20">
  Dashboard Perusahaan {companyName && <span className="text-indigo-600">- {companyName}</span>}
</h1>


{/* Statistik Dashboard */}
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
  <div className="bg-white rounded-xl shadow-md p-6 text-center flex flex-col items-center justify-center">
    <h3 className="text-gray-500 text-sm mb-2">Total User Terdaftar</h3>
    <p className="text-3xl font-bold text-indigo-600">{totalUsers}</p>
  </div>
  <div className="bg-white rounded-xl shadow-md p-6 text-center flex flex-col items-center justify-center">
    <h3 className="text-gray-500 text-sm mb-2">User yang Sudah Tes</h3>
    <p className="text-3xl font-bold text-green-600">{testedUsers}</p>
  </div>
  <div className="bg-white rounded-xl shadow-md p-6 text-center flex flex-col items-center justify-center">
    <h3 className="text-gray-500 text-sm mb-2">User Belum Tes</h3>
    <p className="text-3xl font-bold text-red-500">{notTestedUsers}</p>
  </div>
</div>

   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 items-stretch">

      {/* Kolom Kiri: Chart */}
<div className="bg-white p-6 rounded-xl shadow h-full flex flex-col">

    <h2 className="text-xl font-bold mb-4 text-indigo-700 text-center">Test yang Sudah Dikerjakan</h2>
    {testStats.length > 0 ? (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={testStats} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="testName" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#4f46e5" />
        </BarChart>
      </ResponsiveContainer>
    ) : (
      <p className="text-center text-gray-500">Belum ada data tes</p>
    )}
  </div>
<div className="bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col">

  {/* Judul Card Section */}
  <h2 className="text-xl font-bold text-indigo-700 mb-4 text-center">
    Test yang Sudah Dibeli
  </h2>

  {/* Grid Cards */}
  <div className="h-[400px] overflow-y-auto">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...packagePurchases, ...singlePayments].map((p) => {
        const remaining =
          "remainingQuota" in p
            ? p.remainingQuota ?? p.quantity
            : p.quantity - (p.userPackages?.length ?? 0);
        const isEmpty = remaining <= 0;

        return (
          <div
            key={p.id}
            className={`rounded-2xl shadow-md p-4 ${
              isEmpty ? "bg-red-50" : "bg-white"
            }`}
          >
            <h3 className="text-lg font-bold text-indigo-700">
              {"package" in p ? p.package?.name : p.TestType?.name}
            </h3>

            {"package" in p && p.package?.description && (
              <p className="text-xs text-gray-500">{p.package.description}</p>
            )}

            <div className="flex flex-wrap gap-1 mt-2 text-sm">
              <span className="px-2 py-1 bg-gray-100 rounded">
                Jumlah: {p.quantity}
              </span>

              <span
                className={`px-2 py-1 rounded ${
                  isEmpty
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                Sisa: {remaining}
              </span>

              {"amount" in p && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                  Harga: Rp {p.amount.toLocaleString("id-ID")}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
</div>

</div>

<Dialog open={openDialog} onOpenChange={setOpenDialog}>
  <DialogContent className="max-w-lg">
    <DialogHeader>
      <DialogTitle>Daftarkan Karyawan</DialogTitle>
    </DialogHeader>

    <div className="space-y-4">
      {/* Tipe Pendaftaran */}
      <div>
        <label className="block text-sm font-medium mb-1">Tipe Pendaftaran</label>
        <select
          value={assignTarget}
          onChange={(e) => setAssignTarget(e.target.value as "PACKAGE" | "TEST")}
          className="w-full border rounded-lg p-2"
        >
          <option value="PACKAGE">Paket</option>
          <option value="TEST">Test Satuan</option>
        </select>
      </div>

      {/* Pilih Paket / Test */}
      <div>
        <label className="block text-sm font-medium mb-1">
          {assignTarget === "PACKAGE" ? "Pilih Paket" : "Pilih Test"}
        </label>
        {assignTarget === "PACKAGE" ? (
          <select
            value={selectedPurchase ?? ""}
            onChange={(e) => setSelectedPurchase(parseInt(e.target.value))}
            className="w-full border rounded-lg p-2"
          >
            <option value="">-- Pilih Paket --</option>
            {packagePurchases.map((p) => (
              <option key={p.id} value={p.id}>
                {p.package?.name} (Sisa {p.quantity - (p.userPackages?.length ?? 0)})
              </option>
            ))}
          </select>
        ) : (
          <select
            value={selectedTest ?? ""}
            onChange={(e) => setSelectedTest(parseInt(e.target.value))}
            className="w-full border rounded-lg p-2"
          >
            <option value="">-- Pilih Test --</option>
            {singlePayments.map((p) => (
              <option key={p.id} value={p.id}>
                {p.TestType?.name} (Sisa {p.remainingQuota ?? (p.quantity - (p.userPackages?.length ?? 0))})
              </option>
            ))}
          </select>
        )}
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

      {/* Test ID Auto jika Test Satuan */}
      {assignTarget === "TEST" && (
        <div>
          <label className="block text-sm font-medium mb-1">Test ID (Auto)</label>
          <input
            type="text"
            value={generatedTestId}
            readOnly
            className="w-full border rounded-lg p-2 bg-gray-100"
          />
        </div>
      )}
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
      setOpenDialog(false); // tutup dialog setelah sukses
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mendaftarkan user");
    }
  }}
  disabled={
    (assignTarget === "PACKAGE" && !selectedPurchase) ||
    (assignTarget === "TEST" && !selectedTest)
  }
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

  {/* Baris kedua: search + button */}
  <div className="flex items-center justify-between gap-4">
    {/* Search di kiri */}
    <div className="flex-1">
      <input
        type="text"
        placeholder="Cari karyawan..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
        className="w-full max-w-lg px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
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
              value={filterType}
              onValueChange={(v) => { setFilterType(v as "ALL" | "PACKAGE" | "TEST"); setCurrentPage(1); }}
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
  <div className="flex items-center justify-center gap-2">
    <span>Tanggal Tes</span>
    <Select
      value={`${startDateFilter}|${endDateFilter}`}
      onValueChange={(v) => {
        if (v === "reset") {
          setStartDateFilter("");
          setEndDateFilter("");
        } else {
          const [start, end] = v.split("|");
          setStartDateFilter(start);
          setEndDateFilter(end);
        }
        setCurrentPage(1);
      }}
    >
      <SelectTrigger className="w-5 h-5 p-0 bg-transparent border-none shadow-none hover:bg-gray-200 rounded-full">
        <span className="material-icons text-sm"></span>
      </SelectTrigger>
      <SelectContent className="p-2">
        <div className="flex flex-col gap-1">
          <input
            type="date"
            value={startDateFilter}
            onChange={(e) => setStartDateFilter(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
            placeholder="Mulai tanggal"
          />
          <input
            type="date"
            value={endDateFilter}
            onChange={(e) => setEndDateFilter(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
            placeholder="Sampai tanggal"
          />
          <button
            onClick={() => {
              setStartDateFilter("");
              setEndDateFilter("");
              setCurrentPage(1);
            }}
            className="mt-1 text-xs text-indigo-600 hover:underline"
          >
            Hapus Filter
          </button>
        </div>
      </SelectContent>
    </Select>
  </div>
</th>
<th className="p-4 font-semibold text-center">Hasil</th>



        <th className="p-4 font-semibold text-center">Aksi</th>
      </tr>
    </thead>

   <tbody>
  {paginatedUsers.length > 0 ? (
    paginatedUsers.map((u) => {
      // Tentukan status baru
      let displayStatus = u.status; // langsung pakai status dari mapping allUsers

      return (
        <tr
          key={`${u.type}-${u.id}-${u.name}`}
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
            {u.result ? (
              <a
                  href={`/tes/hasil/${u.result.Attempt.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline text-sm"
              >
                Lihat Hasil
              </a>
            ) : "-"}
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
   </div>
     

  );
}

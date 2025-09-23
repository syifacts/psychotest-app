"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/navbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: number;
  fullName: string;
  email: string;
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
  const USERS_PER_PAGE = 5;

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
const allUsers = [
  ...(packagePurchases ?? []).flatMap((p) =>
    (p.userPackages ?? []).map((u) => {
      // Cek laporan yang sesuai paket & user
      const attempt = reports.find(
        (r) =>
          r.User?.id === u.id &&
          r.TestType?.id === p.package?.tests[0]?.testType?.id // ambil id test pertama di paket
      );
      return {
        ...u,
        type: "Paket" as const,
        targetId: p.id,
        name: p.package?.name ?? "",
        fullName: u.fullName ?? "",
        email: u.email ?? "",
        status: attempt?.Attempt?.startedAt ? "Sudah Tes" : "Belum Tes",
        startedAt: attempt?.Attempt?.startedAt ?? null,
      };
    })
  ),
  ...(singlePayments ?? []).flatMap((p) =>
    (p.userPackages ?? []).map((u) => {
      const attempt = reports.find(
        (r) =>
          r.User?.id === u.id &&
          r.TestType?.id === p.TestType?.id
      );
      return {
        ...u,
        type: "Test Satuan" as const,
        targetId: p.id,
        name: p.TestType?.name ?? "",
        fullName: u.fullName ?? "",
        email: u.email ?? "",
        status: attempt?.Attempt?.startedAt ? "Sudah Tes" : "Belum Tes",
        startedAt: attempt?.Attempt?.startedAt ?? null,
      };
    })
  ),
];


  // Statistik user
// Statistik user berdasarkan allUsers
const totalUsers = allUsers.length;
const testedUsers = allUsers.filter(u => u.status === "Sudah Tes").length;
const notTestedUsers = allUsers.filter(u => u.status === "Belum Tes").length;


  // Pagination
  const totalPages = Math.max(1, Math.ceil(allUsers.length / USERS_PER_PAGE));
  const paginatedUsers = allUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  return (
    <div>
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Dashboard Perusahaan
        </h1>

        {/* Statistik Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h3 className="text-gray-600 text-sm">Total User Terdaftar</h3>
            <p className="text-2xl font-bold text-indigo-700">{totalUsers}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h3 className="text-gray-600 text-sm">User yang Sudah Tes</h3>
            <p className="text-2xl font-bold text-green-600">{testedUsers}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h3 className="text-gray-600 text-sm">User Belum Tes</h3>
            <p className="text-2xl font-bold text-red-500">{notTestedUsers}</p>
          </div>
        </div>
{/* Paket & Test Cards */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
  {/* Paket yang Dibeli */}
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <h2 className="text-xl font-bold mb-4 text-indigo-700">Paket yang Dibeli</h2>
    {packagePurchases.length === 0 ? (
      <p className="text-gray-500">Belum ada paket yang dibeli.</p>
    ) : (
      <ul className="space-y-4">
        {packagePurchases.map((p) => (
          <li
            key={p.id}
            className="flex flex-col md:flex-row md:items-center justify-between border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
          >
            <div className="mb-2 md:mb-0">
              <h3 className="font-semibold text-gray-800 text-lg">{p.package?.name}</h3>
              {p.package?.description && (
                <p className="text-sm text-gray-500">{p.package.description}</p>
              )}
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <span className="text-sm text-gray-600">Jumlah awal: {p.quantity}</span>
              <span className="text-sm font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                Sisa {p.quantity - (p.userPackages?.length ?? 0)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>

  {/* Test Satuan */}
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <h2 className="text-xl font-bold mb-4 text-indigo-700">Test Satuan Dibeli</h2>
    {singlePayments.length === 0 ? (
      <p className="text-gray-500">Belum ada test satuan yang dibeli.</p>
    ) : (
      <ul className="space-y-4">
        {singlePayments.map((p) => (
          <li
            key={p.id}
            className="flex flex-col md:flex-row md:items-center justify-between border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
          >
            <div className="mb-2 md:mb-0">
              <h3 className="font-semibold text-gray-800 text-lg">{p.TestType?.name}</h3>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <span className="text-sm text-gray-600">Jumlah awal: {p.quantity}</span>
              <span className="text-sm font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                Sisa {p.remainingQuota ?? (p.quantity - (p.userPackages?.length ?? 0))}
              </span>
              <span className="text-sm text-gray-600">
                Harga: Rp {p.amount.toLocaleString("id-ID")}
              </span>
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
</div>


{/* Daftarkan User */}
<div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
  <h2 className="text-xl font-bold mb-6 text-indigo-700 text-center md:text-left">
    Daftarkan User
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
    {/* Pilih Tipe Pendaftaran */}
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

    {/* Pilih Paket / Test */}
    <div className="flex flex-col">
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
    </div>

    {/* User ID (Auto) */}
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-600 mb-1">
        User ID (Auto)
      </label>
      <input
        type="text"
        value={generatedUserId}
        readOnly
        className="border border-gray-300 rounded-lg p-2 bg-gray-100 cursor-not-allowed"
      />
    </div>

    {/* Test ID (Auto, hanya jika pilih TEST) */}
    {assignTarget === "TEST" && (
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
</div>



{/* Table + Column Filters */}
<div className="bg-white p-6 rounded-xl shadow overflow-x-auto">
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
                <SelectItem value="Sudah Tes">Sudah Tes</SelectItem>
                <SelectItem value="Belum Tes">Belum Tes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </th>

        <th className="p-4 font-semibold text-center">Tanggal Mulai Tes</th>
        <th className="p-4 font-semibold text-center">Aksi</th>
      </tr>
    </thead>

    <tbody>
      {paginatedUsers.length > 0 ? (
        paginatedUsers.map((u) => (
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
            <td className="p-4 text-center">
              {u.status === "Sudah Tes" ? (
                <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                  ✅ Sudah Tes
                </span>
              ) : (
                <span className="px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">
                  ⏳ Belum Tes
                </span>
              )}
            </td>
            <td className="p-4 text-center">
              {u.startedAt ? new Date(u.startedAt).toLocaleString("id-ID") : "-"}
            </td>
            <td className="p-4 text-center">
              <button
                onClick={() => handleRemoveUser(u.id, u.type, u.targetId)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
              >
                Hapus
              </button>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={7} className="p-6 text-center text-gray-500 italic">
            Tidak ada user sesuai filter
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>


 

   </div>
   </div>
     

  );
}

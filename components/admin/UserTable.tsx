"use client";

import React, { useState } from "react";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Search, UserCog, Building } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useToastConfirm } from "@/components/ui/use-toast-confirm";
import { Toaster } from "@/components/ui/toaster"



interface User {
  id: number;
  fullName: string;
  email: string;
  role: "USER" | "PSIKOLOG" | "PERUSAHAAN" | "SUPERADMIN";
  companyName?: string;
  createdAt: string;
passwordDisplay: string; // <-- WAJIB
}

interface UserTableProps {
  users: User[];
//  onAddUser?: (user: Partial<User> & { role: "PSIKOLOG" | "PERUSAHAAN" }) => void;
  onAddUser?: (user: User) => void;
  onRemoveUser?: (id: number) => void;
}

export default function UserTable({ users, onAddUser, onRemoveUser }: UserTableProps) {
  const [filterRole, setFilterRole] = useState<"ALL" | "USER" | "PSIKOLOG" | "PERUSAHAAN">("ALL");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  // 🔹 State filter baru
const [filterCompany, setFilterCompany] = useState("all");
const [filterDate, setFilterDate] = useState("all");
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");
const [testTypes, setTestTypes] = useState<any[]>([]);
const { toast } = useToast();
const { confirm } = useToastConfirm();


React.useEffect(() => {
  const fetchTestTypes = async () => {
    try {
      const res = await fetch("/api/testtypes"); // pastikan API ini tersedia
      const data = await res.json();
      setTestTypes(data);
    } catch (error) {
      console.error("Gagal mengambil test types:", error);
    }
  };

  fetchTestTypes();
}, []);


  // Modal state
  // const [showModal, setShowModal] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
const [open, setOpen] = useState(false);

  const [modalRole, setModalRole] = useState<"PSIKOLOG" | "PERUSAHAAN">("PSIKOLOG");
  const [formData, setFormData] = useState<any>({});
  const [generatedPassword, setGeneratedPassword] = useState("");
const [notifMessage, setNotifMessage] = useState("");
const [showNotif, setShowNotif] = useState(false);


const filteredUsers = users.filter((u) => {
  const matchRole = filterRole === "ALL" || u.role === filterRole;
  const matchName = u.fullName.toLowerCase().includes(search.toLowerCase());
  const matchCompany = filterCompany === "all" || (u.companyName || "-") === filterCompany;


  
  // 🔹 Filter tanggal (range)
  let matchDate = true;
  if (startDate || endDate) {
    const userDate = new Date(u.createdAt);
    if (startDate && userDate < new Date(startDate)) matchDate = false;
    if (endDate && userDate > new Date(endDate)) matchDate = false;
  }

  return matchRole && matchName && matchCompany && matchDate;
});

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

const handleOpenModal = async (role: "PSIKOLOG" | "PERUSAHAAN") => {
  setModalRole(role);
  setFormData({});
  setGeneratedPassword("");

  try {
    const customIdPrefix = role === "PSIKOLOG" ? "PSI100-" : "CP100-";
    const countRes = await fetch(`/api/admin/users/count?role=${role}`);
    const countData = await countRes.json();
    const number = (countData.count + 1).toString().padStart(3, "0");
    const password = customIdPrefix + number;
    setGeneratedPassword(password);  // <-- update state dulu
   // setShowModal(true);              // <-- baru tampilkan modal
   setOpen(true);
  } catch (err) {
    console.error("Gagal generate password:", err);
    setGeneratedPassword("");
  //  setShowModal(true);              // tetap buka modal walau gagal
  setOpen(true);
  }
};

React.useEffect(() => {
  if (modalRole === "PERUSAHAAN" && testTypes.length > 0) {
    const cpmi = testTypes.find((t) => t.name.toUpperCase() === "CPMI");
    if (cpmi) {
      setFormData((prev: any) => ({
        ...prev,
        testTypeId: cpmi.id.toString(),
      }));
    }
  }
}, [testTypes, modalRole]);


// Di handleSubmit, generate password sebelum POST
const handleSubmit = async () => {
  try {
    const payload: any = { role: modalRole, ...formData, password: generatedPassword };
 if (modalRole === "PERUSAHAAN") {
  payload.address = formData.address || "";
  payload.customPrice = formData.customPrice ? parseInt(formData.customPrice) : null;
  payload.discountNominal = formData.discountNominal ? parseInt(formData.discountNominal) : null;
  payload.testTypeId = formData.testTypeId ? parseInt(formData.testTypeId) : null;
  payload.discountNote = formData.discountNote || "";
}

    if (modalRole === "PSIKOLOG") {
      payload.lembagalayanan = formData.lembagalayanan || "";
      payload.phone = formData.phone || "";
       payload.strNumber = formData.strNumber || "";
  payload.sippNumber = formData.sippNumber || "";
    } else if (modalRole === "PERUSAHAAN") {
      payload.address = formData.address || "";
    }

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal menambahkan user");

    onAddUser?.({
  ...data.user,
  passwordDisplay: data.password,
});

   // setShowModal(false);
   setOpen(true)
    setFormData({});
    setGeneratedPassword("");
    setNotifMessage("User berhasil ditambahkan!");
setShowNotif(true);
setTimeout(() => setShowNotif(false), 3000);
  } catch (err: any) {
    alert(err.message);
  }
};

const handleDelete = async (id: number) => {
  confirm("Apakah yakin ingin menghapus user ini?", async () => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus user");

      onRemoveUser?.(id);

      toast({
        title: "Berhasil",
        description: "User berhasil dihapus!",
        variant: "success",
        duration: 1500,
      });

    } catch (err: any) {
      toast({
        title: "Gagal",
        description: err.message,
        variant: "error",
        duration: 2000,
      });
    }
  });
};

  return (
    <div className="overflow-x-auto">
        {showNotif && (
  <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 transition">
    {notifMessage}
  </div>
)}

 {/* Top Controls */}
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
  {/* Search (full width di kiri) */}
  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
    <input
      type="text"
      placeholder="Cari nama..."
      value={search}
      onChange={(e) => {
        setSearch(e.target.value);
        setCurrentPage(1);
      }}
      className="border rounded pl-9 pr-3 py-2 text-sm w-full"
    />
  </div>

  {/* Bagian kanan: Filter tanggal + Rows per page + Tombol */}
  <div className="flex flex-wrap items-center gap-3">
    {/* Filter tanggal daftar */}
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 whitespace-nowrap">Tanggal Daftar:</span>
      <input
        type="date"
        value={startDate}
        onChange={(e) => {
          setStartDate(e.target.value);
          setCurrentPage(1);
        }}
        className="border rounded px-2 py-1 text-sm"
      />
      <span className="text-gray-500">-</span>
      <input
        type="date"
        value={endDate}
        onChange={(e) => {
          setEndDate(e.target.value);
          setCurrentPage(1);
        }}
        className="border rounded px-2 py-1 text-sm"
      />
    </div>

    {/* Rows per page */}
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Rows:</span>
      <Select
        value={itemsPerPage.toString()}
        onValueChange={(v) => {
          setItemsPerPage(parseInt(v));
          setCurrentPage(1);
        }}
      >
        <SelectTrigger className="w-20 h-8 p-0 border rounded text-sm">
          {itemsPerPage}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="20">20</SelectItem>
          <SelectItem value="30">30</SelectItem>
        </SelectContent>
      </Select>
    </div>

   {/* Tombol Tambah */}
<div className="flex gap-3">
  <button
    onClick={() => handleOpenModal("PSIKOLOG")}
    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
  >
    <UserCog className="w-5 h-5" />
    Tambah Psikolog
  </button>

  <button
    onClick={() => handleOpenModal("PERUSAHAAN")}
    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
  >
    <Building className="w-5 h-5" />
    Tambah Perusahaan
  </button>
</div>
  </div>
</div>

{/* Table */}
<div className="overflow-x-auto rounded-lg shadow">
  <table className="min-w-full border border-gray-300 text-base">
<thead>
  <tr className="bg-gradient-to-r from-indigo-200 to-indigo-300 text-gray-700">
    <th className="p-3 font-semibold text-left">Nama</th>
    <th className="p-3 font-semibold text-left">Email</th>
      <th className="p-3 font-semibold text-left">Password</th>
    <th className="p-3 font-semibold text-center">
      <div className="flex items-center justify-center gap-2">
        <span>Role</span>
        <Select value={filterRole} onValueChange={(v) => setFilterRole(v as any)}>
          <SelectTrigger className="w-5 h-5 p-0 bg-transparent border-none shadow-none hover:bg-gray-200 rounded-full" />
          <SelectContent>
            <SelectItem value="ALL">Semua</SelectItem>
            <SelectItem value="USER">User</SelectItem>
            <SelectItem value="PSIKOLOG">Psikolog</SelectItem>
            <SelectItem value="PERUSAHAAN">Perusahaan</SelectItem>
            <SelectItem value="SUPERADMIN">Superadmin</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </th>

    <th className="p-3 font-semibold text-center">
      <div className="flex items-center justify-center gap-2">
        <span>Perusahaan</span>
        <Select value={filterCompany} onValueChange={setFilterCompany}>
          <SelectTrigger className="w-5 h-5 p-0 bg-transparent border-none shadow-none hover:bg-gray-200 rounded-full" />
          <SelectContent className="max-h-48 overflow-y-auto">
            <SelectItem value="all">Semua</SelectItem>
            {[...new Set(users.map((u) => u.companyName || "-"))].map((name, idx) => (
              <SelectItem key={idx} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </th>

<th className="p-3 font-semibold text-center">
  <span>Tanggal Daftar</span>
</th>

    <th className="p-3 font-semibold text-center">Aksi</th>
  </tr>
</thead>


    <tbody>
      {paginatedUsers.length > 0 ? (
        paginatedUsers.map((u, i) => (
          <tr
            key={u.id}
            className={`transition-colors hover:bg-indigo-50 ${
              i % 2 === 0 ? "bg-white" : "bg-gray-50"
            }`}
          >
            <td className="p-3 border-b border-gray-200 text-gray-700">{u.fullName}</td>
            <td className="p-3 border-b border-gray-200 text-gray-600">{u.email}</td>
            {/* <td className="p-3 border-b border-gray-200 text-gray-700 font-mono">
  <span className="blur-sm hover:blur-none cursor-pointer transition">
    {u.passwordDisplay ?? "-"}
  </span>
</td> */}
<td className="p-3 border-b border-gray-200 text-gray-700">
  {u.passwordDisplay && u.passwordDisplay !== "-" 
    ? u.passwordDisplay 
    : "HASHED"}
</td>


            <td className="p-3 border-b border-gray-200 text-center font-medium">
              <span
                className={`px-2 py-1 rounded text-xs ${
                  u.role === "PSIKOLOG"
                    ? "bg-purple-100 text-purple-700"
                    : u.role === "PERUSAHAAN"
                    ? "bg-green-100 text-green-700"
                    : u.role === "SUPERADMIN"
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {u.role}
              </span>
            </td>
            <td className="p-3 border-b border-gray-200 text-gray-600">
              {u.companyName || "-"}
            </td>
            <td className="p-3 border-b border-gray-200 text-center">
              {new Date(u.createdAt).toLocaleDateString("id-ID")}
            </td>
            <td className="p-3 border-b border-gray-200 text-center">
              <button
                onClick={() => handleDelete(u.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm"
              >
                Hapus
              </button>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td
            colSpan={6}
            className="p-6 text-center text-gray-500 italic border-b border-gray-200"
          >
            Tidak ada user sesuai filter
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end gap-2 mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-3 py-1">
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="max-w-lg">
    <DialogHeader>
      <DialogTitle>
        Tambah {modalRole === "PSIKOLOG" ? "Psikolog" : "Perusahaan"}
      </DialogTitle>
    </DialogHeader>

    {/* Form Fields */}
    <div className="flex flex-col gap-3">
      {modalRole === "PSIKOLOG" ? (
        <>
          <input
            type="text"
            placeholder="Nama Lengkap"
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={formData.fullName || ""}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
          <input
            type="text"
            placeholder="Lembaga Layanan"
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={formData.lembagalayanan || ""}
            onChange={(e) => setFormData({ ...formData, lembagalayanan: e.target.value })}
          />
          <input
            type="text"
            placeholder="Email"
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={formData.email || ""}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          {generatedPassword && (
            <input
              type="text"
              placeholder="Password"
              className="border rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-600"
              value={generatedPassword}
              readOnly
            />
          )}

          <input
            type="text"
            placeholder="No. Telp"
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={formData.phone || ""}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

              {/* Tambahan STR/SIK dan SIPP/SIPPK */}
    <input
      type="text"
      placeholder="Nomor STR/SIK"
      className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
      value={formData.strNumber || ""}
      onChange={(e) => setFormData({ ...formData, strNumber: e.target.value })}
    />
    <input
      type="text"
      placeholder="Nomor SIPP/SIPPK"
      className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
      value={formData.sippNumber || ""}
      onChange={(e) => setFormData({ ...formData, sippNumber: e.target.value })}
    />
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Nama Perusahaan"
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            value={formData.fullName || ""}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
          <input
            type="text"
            placeholder="Alamat"
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            value={formData.address || ""}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <input
            type="text"
            placeholder="Email"
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            value={formData.email || ""}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
<input
  type="number"
  placeholder="Harga Khusus (opsional)"
  className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
  value={formData.customPrice || ""}
  onChange={(e) => setFormData({ ...formData, customPrice: e.target.value })}
/>
<input
  type="number"
  placeholder="Potongan (%) (opsional)"
  className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
  value={formData.discountNominal || ""}
  onChange={(e) =>
    setFormData({ ...formData, discountNominal: e.target.value })
  }
/>

 <label>Jenis Tes</label>
      <select
  value={formData.testTypeId || ""}
  onChange={(e) => setFormData({ ...formData, testTypeId: e.target.value })}
>
  <option value="">Pilih Jenis Tes</option>
  {testTypes.map((test: any) => (
    <option key={test.id} value={test.id}>
      {test.name}
    </option>
  ))}
</select>

{/* <input
  type="text"
  placeholder="Catatan Diskon (opsional)"
  className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
  value={formData.discountNote || ""}
  onChange={(e) => setFormData({ ...formData, discountNote: e.target.value })}
/> */}
          {generatedPassword && (
            <input
              type="text"
              placeholder="Password"
              className="border rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-600"
              value={generatedPassword}
              readOnly
            />
          )}
        </>
      )}
    </div>

    <DialogFooter>
  {/* Cara 1: manual close */}
  {/* <Button
    variant="outline"
    onClick={() => setOpenDialog(false)}
  >
    Batal
  </Button> */}

  {/* Cara 2: otomatis close pakai DialogClose */}
  <DialogClose asChild>
    <Button variant="outline">Batal</Button>
  </DialogClose>

  <Button
    onClick={handleSubmit}
    className="bg-blue-600 text-white hover:bg-blue-700"
  >
    Simpan
  </Button>
</DialogFooter>

  </DialogContent>
</Dialog>

  <Toaster />
    </div>
  );
}

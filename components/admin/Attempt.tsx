"use client";

import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface Attempt {
  id: number;
  User: { fullName: string; email: string };
  Company?: { fullName: string };
  TestType: { name: string };
  startedAt: string | null;
  finishedAt: string | null;
}

export default function AttemptTable() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 State untuk filter
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterCompany, setFilterCompany] = useState("Semua");
  const [filterTestType, setFilterTestType] = useState("Semua");

  // 🔹 State pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const res = await fetch("/api/admin/attempts");
        const data = await res.json();
        setAttempts(data.attempts || []);
      } catch (err) {
        console.error("Gagal fetch attempts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttempts();
  }, []);

  if (loading) return <p>Loading...</p>;

  // 🔹 Ambil list unik perusahaan & jenis tes
  const companyOptions = ["Semua", ...new Set(attempts.map((a) => a.Company?.fullName || "Sendiri"))];
  const testTypeOptions = ["Semua", ...new Set(attempts.map((a) => a.TestType.name))];

  // 🔹 Filtering data
  const filteredAttempts = attempts.filter((a) => {
    const matchName = a.User.fullName.toLowerCase().includes(search.toLowerCase());

    const matchCompany =
      filterCompany === "Semua" ||
      (a.Company?.fullName || "Sendiri") === filterCompany;

    const matchTestType =
      filterTestType === "Semua" || a.TestType.name === filterTestType;

    // filter tanggal
    let matchDate = true;
    if (startDate || endDate) {
      const attemptDate = a.startedAt ? new Date(a.startedAt) : null;
      if (attemptDate) {
        if (startDate && attemptDate < new Date(startDate)) matchDate = false;
        if (endDate && attemptDate > new Date(endDate)) matchDate = false;
      }
    }

    return matchName && matchCompany && matchTestType && matchDate;
  });

  // 🔹 Pagination
  const paginatedAttempts = filteredAttempts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredAttempts.length / itemsPerPage);

  return (
    <div className="overflow-x-auto">
      {/* 🔍 Search + Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        {/* Search */}
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

        {/* Filter */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter tanggal */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Tanggal Tes:</span>
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

          {/* Filter perusahaan */}
       
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
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full border border-gray-300 text-sm">
        <thead>
  <tr className="bg-gradient-to-r from-indigo-200 to-indigo-300 text-gray-700">
    <th className="p-3 text-left font-semibold">ID Attempt</th>
    <th className="p-3 text-left font-semibold">Nama</th>
    <th className="p-3 text-left font-semibold">Email</th>

    {/* Perusahaan + filter dropdown */}
    <th className="p-3 font-semibold text-center">
      <div className="flex items-center justify-center gap-2">
        <span>Perusahaan</span>
        <Select value={filterCompany} onValueChange={setFilterCompany}>
          <SelectTrigger className="w-5 h-5 p-0 bg-transparent border-none shadow-none hover:bg-gray-200 rounded-full" />
          <SelectContent className="max-h-48 overflow-y-auto">
            {/* <SelectItem value="semua">Semua</SelectItem> */}
            {companyOptions.map((c, i) => (
              <SelectItem key={i} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </th>

   {/* Tanggal Tes (tanpa filter) */}
<th className="p-3 font-semibold text-center">
  <span>Tanggal Tes</span>
</th>


    {/* Jenis Tes + filter dropdown */}
    <th className="p-3 font-semibold text-center">
      <div className="flex items-center justify-center gap-2">
        <span>Jenis Tes</span>
        <Select value={filterTestType} onValueChange={setFilterTestType}>
          <SelectTrigger className="w-5 h-5 p-0 bg-transparent border-none shadow-none hover:bg-gray-200 rounded-full" />
          <SelectContent>
            {/* <SelectItem value="semua">Semua</SelectItem> */}
            {testTypeOptions.map((t, i) => (
              <SelectItem key={i} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </th>
  </tr>
</thead>

          <tbody>
            {paginatedAttempts.length > 0 ? (
              paginatedAttempts.map((a, i) => (
                <tr
                  key={a.id}
                  className={`transition-colors hover:bg-indigo-50 ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="p-3 border-b">{a.id}</td>
                  <td className="p-3 border-b">{a.User.fullName}</td>
                  <td className="p-3 border-b">{a.User.email}</td>
                  <td className="p-3 border-b">
                    {a.Company?.fullName || "Sendiri"}
                  </td>
                  <td className="p-3 border-b text-center">
                    {a.startedAt
                      ? new Date(a.startedAt).toLocaleDateString("id-ID")
                      : "-"}
                  </td>
                  <td className="p-3 border-b">{a.TestType.name}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-gray-500 italic border-b"
                >
                  Tidak ada attempt
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
    </div>
  );
}

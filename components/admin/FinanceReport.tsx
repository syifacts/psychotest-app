"use client";

import { useEffect, useState } from "react";
import { Download, Search, Wallet, Calendar, TrendingUp, BarChart3 } from "lucide-react";
import * as XLSX from "xlsx-js-style";
import FinancePromoForm from "@/components/admin/FinancePromo";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster"
import { useToastConfirm } from "@/components/ui/use-toast-confirm";


import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface PaymentRow {
  id: number;
  fullName: string;
  originalPrice: number; // harga asli dari TestType
  customPrice?: number; // dari CompanyPricing
  discountNominal?: number; // dari CompanyPricing
  priceDiscount?: number; // dari TestType
  percentDiscount?: number; // dari TestType
  priceAfterDiscount: number; // harga setelah diskon (dari Payment.amount / quantity)
  quantity: number;
  total: number; // dari Payment.amount
  method?: string;
  paidAt?: string;
  paymentUrl?: string;
  status: string;
  testName: string;
  psychologist: string;
}

export default function FinanceReportPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentRow[]>([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const { toast } = useToast();
  const { confirm } = useToastConfirm();


  // const updateStatus = async (id: number, status: string) => {
  // const res = await fetch(`/api/payment/${id}/status`, {
  //   method: "PUT",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ status }),
  // });

  // if (!res.ok) {
  //   alert("Gagal update status");
  //   return;
  // }

  
  // update state tanpa reload
//   setPayments((prev) =>
//     prev.map((p) => (p.id === id ? { ...p, status } : p))
//   );
// };
const updateStatus = async (id: number, status: string) => {
  const res = await fetch(`/api/payment/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    toast({
      title: "Gagal update status",
      description: `Status pembayaran #${id} gagal diupdate.`,
      variant: "error",
      duration: 4000,
    });
    return;
  }

  setPayments((prev) =>
    prev.map((p) => (p.id === id ? { ...p, status } : p)),
  );

  // pesan berbeda sesuai status baru
  const desc =
    status === "REFUND"
      ? `Pembayaran #${id} berhasil diubah menjadi REFUND.`
      : status === "SUCCESS"
      ? `Refund untuk pembayaran #${id} dibatalkan (kembali ke SUCCESS).`
      : `Status pembayaran #${id} diupdate menjadi ${status}.`;

  toast({
    title: "Status berhasil diupdate",
    description: desc,
    variant: "success",
    duration: 4000,
  });
};


  useEffect(() => {
    fetch("/api/payment")
      .then((res) => res.json())
      .then((data) => {
const mapped = data
  // hanya ambil pembayaran valid (punya URL pembayaran)
  .filter((p: any) => p.amount > 0 && p.paymentUrl && p.paymentUrl !== "-")
  .map((p: any) => {

  const isCompanyPurchase = !!p.companyId;
  const paidDate = p.paidAt ? new Date(p.paidAt) : null;

  const originalPrice = p.TestType?.price || 0;
  const totalPaid = p.amount;
  const quantity = p.quantity || 1;
  const priceAfterDiscount = Math.round(totalPaid / quantity);

  // Nilai dasar
  let customPrice: number | undefined = undefined;
  let discountNominal = 0;
  let percentDiscount = 0;

  if (isCompanyPurchase) {
    const cp = p.CompanyPricing;
    customPrice = cp?.customPrice ?? undefined;

    if (customPrice) {
      discountNominal = originalPrice - priceAfterDiscount;
      percentDiscount = Math.round((discountNominal / originalPrice) * 100);
    } else {
      discountNominal = originalPrice - priceAfterDiscount;
      percentDiscount = Math.round((discountNominal / originalPrice) * 100);
    }
  } else {
    discountNominal = originalPrice - priceAfterDiscount;
    percentDiscount = Math.round((discountNominal / originalPrice) * 100);
  }

  // ⚙️ Jika tidak ada diskon (harga sama)
  const hasDiscount = originalPrice !== priceAfterDiscount;

  return {
    id: p.id,
    fullName: isCompanyPurchase
      ? p.company?.fullName ?? "-"
      : p.User?.fullName ?? "-",
    originalPrice,
    customPrice,
    discountNominal: hasDiscount ? discountNominal : 0,
    priceDiscount: hasDiscount ? priceAfterDiscount : 0,
    percentDiscount: hasDiscount ? percentDiscount : 0,
    priceAfterDiscount: hasDiscount ? priceAfterDiscount : 0,
    quantity,
    total: totalPaid,
    method: p.method,
    paidAt: paidDate
      ? `${String(paidDate.getDate()).padStart(2, "0")}/${String(
          paidDate.getMonth() + 1
        ).padStart(2, "0")}/${paidDate.getFullYear()}`
      : "-",
    paymentUrl: p.paymentUrl ?? "-",
    status: p.status || "pending",
    testName: p.TestType?.name ?? "-",
psychologist: p.attempts?.[0]?.results?.[0]?.ValidatedBy?.fullName ?? "-",

  };
});



        setPayments(mapped);
        setFilteredPayments(mapped);
      });
  }, []);

  // Filter & search
useEffect(() => {
  let temp = [...payments];

  if (search) {
    const s = search.toLowerCase();
    temp = temp.filter((p) =>
      (p.fullName ?? "-").toLowerCase().includes(s)
    );
  }

  if (startDate) {
    temp = temp.filter((p) => {
      if (!p.paidAt) return false;
      const [d, m, y] = p.paidAt.split("/");
      const paidDate = new Date(`${y}-${m}-${d}`);
      return paidDate >= new Date(startDate);
    });
  }

  if (endDate) {
    temp = temp.filter((p) => {
      if (!p.paidAt) return false;
      const [d, m, y] = p.paidAt.split("/");
      const paidDate = new Date(`${y}-${m}-${d}`);
      return paidDate <= new Date(endDate);
    });
  }

  if (statusFilter) {
    temp = temp.filter((p) => p.status === statusFilter);
  }

  setFilteredPayments(temp);
  setCurrentPage(1);
}, [search, startDate, endDate, payments, statusFilter]);


  // Fungsi bantu tanggal
  const getDateFromString = (dateStr?: string) => {
    if (!dateStr || dateStr === "-") return null;
    const [d, m, y] = dateStr.split("/");
    return new Date(`${y}-${m}-${d}`);
  };

  // Hitung statistik
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const dailyMap: Record<string, number> = {};
  filteredPayments.forEach((p) => {
    const date = getDateFromString(p.paidAt);
    if (!date) return;
    const key = `${String(date.getDate()).padStart(2, "0")}/${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    dailyMap[key] = (dailyMap[key] || 0) + p.total;
  });

  const dailyData = Object.entries(dailyMap).map(([date, total]) => ({
    date,
    total,
  }));

  const dailyRevenue = filteredPayments
    .filter((p) => {
      const date = getDateFromString(p.paidAt);
      return (
        date &&
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    })
    .reduce((sum, p) => sum + p.total, 0);

  const weeklyRevenue = filteredPayments
    .filter((p) => {
      const date = getDateFromString(p.paidAt);
      return date && date >= startOfWeek && date <= today;
    })
    .reduce((sum, p) => sum + p.total, 0);

  const monthlyRevenue = filteredPayments
    .filter((p) => {
      const date = getDateFromString(p.paidAt);
      return (
        date &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    })
    .reduce((sum, p) => sum + p.total, 0);

  const totalRevenue = filteredPayments.reduce(
    (sum, p) => sum + (p.total ?? 0),
    0
  );

const exportExcel = () => {
  const formattedData = filteredPayments.map((item) => ({
    ID: item.id,
    User: item.fullName,
    "Nama Test": item.testName,
    "Harga Asli": item.originalPrice,
    "Custom Price": item.customPrice ?? 0,
    "Diskon Nominal": item.discountNominal ?? 0,
    "Persen Diskon": item.percentDiscount ?? 0,
    "Harga Setelah Diskon": item.priceAfterDiscount ?? 0,
    Quantity: item.quantity,
    Total: item.total,
    Method: item.method || "-",
    "Paid At": item.paidAt || "-",
    "Payment URL": item.paymentUrl || "-",
    Status: item.status,
  }));

  const ws = XLSX.utils.json_to_sheet(formattedData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Payments");

  // Jumlah baris data (tidak termasuk header)
  const lastRow = formattedData.length + 1;
const totalFormula = `=SUM(J2:I${lastRow})`; // ✅ hitung dari kolom I

XLSX.utils.sheet_add_aoa(
  ws,
  [
    [
      "TOTAL KESELURUHAN:", // Label di kolom A
      "", "", "", "", "", "", "", // A–H akan di-merge
      { f: totalFormula }, // Kolom I tempat formula SUM
    ],
  ],
  { origin: `A${lastRow + 1}` }
);

  // Merge kolom A–I untuk label
 if (!ws["!merges"]) ws["!merges"] = [];
ws["!merges"].push({
  s: { r: lastRow, c: 0 }, // A
  e: { r: lastRow, c: 7 }, // H
});

// Gabungkan kolom I–M untuk hasil total
ws["!merges"].push({
  s: { r: lastRow, c: 8 }, // I
  e: { r: lastRow, c: 13 }, // M
});

  // Atur lebar kolom
  ws["!cols"] = Array(14).fill({ wch: 18 });

  // Format header
  for (let c = 0; c < 14; c++) {
    const cell = ws[String.fromCharCode(65 + c) + 1];
    if (cell) {
      cell.s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4F81BD" } },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }
  }

  // Baris isi bergantian warna
  for (let r = 2; r <= lastRow; r++) {
    const fillColor = r % 2 === 0 ? "FFFFFF" : "F7FBFF";
    for (let c = 0; c < 14; c++) {
      const cell = ws[String.fromCharCode(65 + c) + r];
      if (cell) {
        cell.s = {
          fill: { fgColor: { rgb: fillColor } },
          alignment: { horizontal: "left", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "E0E0E0" } },
            left: { style: "thin", color: { rgb: "E0E0E0" } },
            bottom: { style: "thin", color: { rgb: "E0E0E0" } },
            right: { style: "thin", color: { rgb: "E0E0E0" } },
          },
        };
      }
    }
  }

  // Style baris total (tanpa border)
  const totalLabelCell = ws[`A${lastRow + 1}`];
const totalValueCell = ws[`I${lastRow + 1}`];

if (totalLabelCell) {
  totalLabelCell.s = {
    font: { bold: true, color: { rgb: "000000" } },
    fill: { fgColor: { rgb: "E7E6E6" } },
    alignment: { horizontal: "center", vertical: "center" },
  };
}

if (totalValueCell) {
  totalValueCell.s = {
    font: { bold: true, color: { rgb: "000000" } },
    fill: { fgColor: { rgb: "E7E6E6" } },
    alignment: { horizontal: "left", vertical: "center" },
    numFmt: '"Rp"#,##0',
  };
}

  // Format kolom Total agar pakai format Rp
  for (let i = 2; i <= lastRow; i++) {
    const cell = ws[`J${i}`];
    if (cell && typeof cell.v === "number") {
      cell.z = '"Rp"#,##0';
    }
  }

  let fileName = "laporan_keuangan";
  if (startDate && endDate) fileName += `_${startDate}_sd_${endDate}`;
  else if (startDate) fileName += `_mulai_${startDate}`;
  else if (endDate) fileName += `_sampai_${endDate}`;
  fileName += ".xlsx";

  XLSX.writeFile(wb, fileName);
};



  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / rowsPerPage);
  const displayedPayments = filteredPayments.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="p-6 space-y-6">
      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            title: "Pemasukan Hari Ini",
            value: dailyRevenue,
            color: "bg-blue-500",
            icon: <Calendar className="text-white" size={26} />,
          },
          {
            title: "Pemasukan Minggu Ini",
            value: weeklyRevenue,
            color: "bg-green-500",
            icon: <TrendingUp className="text-white" size={26} />,
          },
          {
            title: "Pemasukan Bulan Ini",
            value: monthlyRevenue,
            color: "bg-purple-500",
            icon: <BarChart3 className="text-white" size={26} />,
          },
          {
            title: "Total Pemasukan",
            value: totalRevenue,
            color: "bg-orange-500",
            icon: <Wallet className="text-white" size={26} />,
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 p-4 rounded-xl shadow-md text-white ${stat.color}`}
          >
            <div className="p-3 bg-white/20 rounded-full">{stat.icon}</div>
            <div>
              <h2 className="text-sm font-medium">{stat.title}</h2>
              <p className="text-xl font-semibold mt-1">
                Rp {stat.value.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Grafik Tren & Perbandingan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border rounded-xl shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4 text-blue-700">
            Tren Pemasukan Harian (Bulan Ini)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString()}`} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border rounded-xl shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4 text-blue-700">
            Perbandingan Pemasukan
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={[
                { name: "Hari Ini", total: dailyRevenue },
                { name: "Minggu Ini", total: weeklyRevenue },
                { name: "Bulan Ini", total: monthlyRevenue },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString()}`} />
              <Bar dataKey="total" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter/Search */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari user atau perusahaan..."
            className="pl-10 pr-3 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <input
            type="date"
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

{/* Status Filter (Dropdown) */}
  <select
    className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
  >
    <option value="">Semua Status</option>
    <option value="SUCCESS">SUCCESS</option>
    <option value="FAILED">FAILED</option>
    <option value="PENDING">PENDING</option>
    <option value="REFUND">REFUND</option>
  </select>
        <select
          className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
          value={rowsPerPage}
          onChange={(e) => setRowsPerPage(Number(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
        </select>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-blue-100 text-blue-700 uppercase text-sm font-semibold">
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">User</th>
              <th className="border px-4 py-2">Nama Test</th>
              <th className="border px-4 py-2">Harga Asli</th>
              <th className="border px-4 py-2">Custom Price</th>
              <th className="border px-4 py-2">Diskon Nominal</th>
             {/* <th className="border px-4 py-2">Harga Diskon</th> */}
              <th className="border px-4 py-2">Persen Diskon</th>
              <th className="border px-4 py-2">Harga Setelah Diskon</th>
              <th className="border px-4 py-2">Qty</th>
              <th className="border px-4 py-2">Total</th>
              <th className="border px-4 py-2">Method</th>
              <th className="border px-4 py-2">Paid At</th>
              <th className="border px-4 py-2">Payment URL</th>
<th className="border px-4 py-2">Status</th>
{/* <th className="border px-4 py-2">Psikolog</th> */}
 <th className="p-2 border">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {displayedPayments.map((p) => (
              <tr key={p.id} className="hover:bg-blue-50 transition">
                <td className="border px-4 py-2">{p.id}</td>
                <td className="border px-4 py-2">{p.fullName}</td>
                <td className="border px-4 py-2">{p.testName}</td>
                <td className="border px-4 py-2">Rp {p.originalPrice.toLocaleString()}</td>
                <td className="border px-4 py-2">
                  {p.customPrice ? `Rp ${p.customPrice.toLocaleString()}` : "-"}
                </td>
                <td className="border px-4 py-2">
                  {p.discountNominal ? `Rp ${p.discountNominal.toLocaleString()}` : "-"}
                </td>
            {/*    <td className="border px-4 py-2 font-semibold text-green-600">
  {p.priceAfterDiscount && p.priceAfterDiscount !== 0
    ? `Rp ${p.priceAfterDiscount.toLocaleString()}`
    : "-"}
</td> */}
                <td className="border px-4 py-2">
                  {p.percentDiscount ? `${p.percentDiscount}%` : "-"}
                </td>
                <td className="border px-4 py-2 font-semibold text-green-600">
                  Rp {p.priceAfterDiscount.toLocaleString()}
                </td>
                <td className="border px-4 py-2">{p.quantity}</td>
                <td className="border px-4 py-2 font-semibold text-blue-700">
                  Rp {p.total.toLocaleString()}
                </td>
                <td className="border px-4 py-2">{p.method}</td>
                <td className="border px-4 py-2">{p.paidAt}</td>
                <td className="border px-4 py-2">
                  {p.paymentUrl !== "-" ? (
                    <a
                      href={p.paymentUrl}
                      target="_blank"
                      className="text-blue-600 underline"
                    >
                      Link
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="border px-4 py-2">
  <span
    className={`px-2 py-1 rounded text-xs font-semibold ${
      p.status === "SUCCESS"
        ? "bg-green-100 text-green-700"
        : p.status === "FAILED"
        ? "bg-red-100 text-red-700"
        : p.status === "REFUND"
        ? "bg-purple-100 text-purple-700"
        : "bg-yellow-100 text-yellow-700"
    }`}
  >
    {p.status}
  </span>


  {/* tombol ubah */}
  {/* <button
    className="ml-2 text-blue-600 hover:underline text-xs"
    onClick={() => updateStatus(p.id, "REFUND")}
  >
    Refund
  </button> */}
</td>
  {/* <td className="border px-4 py-2">{p.psychologist}</td> */}
<td className="p-2 border text-center">
{p.status === "SUCCESS" && (
  <button
    className="px-3 py-1 text-xs rounded bg-yellow-200 
               text-yellow-800 hover:bg-yellow-300 border border-yellow-400"
    onClick={() => {
      confirm(
        `Yakin ingin REFUND pembayaran #${p.id}?`,
        () => {
          updateStatus(p.id, "REFUND");
        }
      );
    }}
  >
    Refund
  </button>
)}


 {p.status === "REFUND" && (
  <button
    className="px-3 py-1 text-xs rounded bg-red-200 
               text-red-800 hover:bg-red-300 border border-red-400 ml-1"
    onClick={() => {
      confirm(
        `Batalkan REFUND untuk pembayaran #${p.id}?`,
        () => {
          updateStatus(p.id, "SUCCESS");
        }
      );
    }}
  >
    Batalkan Refund
  </button>
)}


  {p.status !== "SUCCESS" && p.status !== "REFUND" && (
    <span className="text-gray-400 text-xs">-</span>
  )}
</td>



              </tr>
            ))}
            {displayedPayments.length === 0 && (
              <tr>
                <td colSpan={14} className="text-center p-6 text-gray-400 italic">
                  Belum ada pembayaran
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination + Tombol Export */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-6">
        <button
          onClick={exportExcel}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg transition"
        >
          <Download size={18} /> Export Excel
        </button>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 border rounded-lg bg-blue-100 text-blue-700 disabled:opacity-50"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span className="px-3 py-1 border rounded-lg bg-blue-50 text-blue-700">
              {currentPage} / {totalPages}
            </span>
            <button
              className="px-3 py-1 border rounded-lg bg-blue-100 text-blue-700 disabled:opacity-50"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

  <Toaster />
      {/* Promo Form 
      <FinancePromoForm /> */}
    </div>
  );
}
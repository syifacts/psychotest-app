"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Gift, Ban, Plus, Trash2, Pencil } from "lucide-react";

export default function FinancePromoPage() {
  const [promos, setPromos] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);

  // form states
  const [promoType, setPromoType] = useState("NOMINAL");
  const [promoValue, setPromoValue] = useState("");
  const [minPurchase, setMinPurchase] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [promoCode, setPromoCode] = useState("");

  // 🧾 ambil data promo
  const fetchPromos = async () => {
    try {
      const res = await fetch("/api/promo");
      const data = await res.json();
      setPromos(data);
    } catch (err) {
      console.error("Gagal memuat promo:", err);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  // 🔠 generate kode
  const generatePromo = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `PROMO${randomNum}`;
  };

  // 🟢 tambah / update promo
  const handleSavePromo = async () => {
    if (!promoValue) {
      alert("Isi nilai promo terlebih dahulu");
      return;
    }

    const body = {
      name: `Promo ${promoType}`,
      code: promoCode || generatePromo(),
      type: promoType,
      value: Number(promoValue),
      minPurchase: minPurchase ? Number(minPurchase) : null,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      validFrom: validFrom || null,
      validUntil: validUntil || null,
  isActive: true, // ✅ ubah ini
    };

    try {
const res = await fetch("/api/promo", {
  method: editingPromo ? "PATCH" : "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id: editingPromo?.id, ...body }),
});


      if (!res.ok) throw new Error("Gagal menyimpan promo");
      alert(editingPromo ? "Promo berhasil diperbarui!" : "Promo berhasil dibuat!");
      setOpenDialog(false);
      fetchPromos();
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan promo");
    }
  };

  const resetForm = () => {
    setEditingPromo(null);
    setPromoType("NOMINAL");
    setPromoValue("");
    setMinPurchase("");
    setMaxDiscount("");
    setValidFrom("");
    setValidUntil("");
    setPromoCode("");
  };

  // ✏️ edit promo
  const handleEdit = (promo: any) => {
    setEditingPromo(promo);
    setPromoType(promo.type);
    setPromoValue(promo.value);
    setMinPurchase(promo.minPurchase || "");
    setMaxDiscount(promo.maxDiscount || "");
    setValidFrom(promo.validFrom?.split("T")[0] || "");
    setValidUntil(promo.validUntil?.split("T")[0] || "");
    setPromoCode(promo.code);
    setOpenDialog(true);
  };

  // ❌ nonaktifkan promo
  const handleDeactivate = async (id: number) => {
    if (!confirm("Nonaktifkan promo ini?")) return;
    try {
      const res = await fetch(`/api/promo/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ isActive: false }), // ✅ ubah ini juga
      });
      if (!res.ok) throw new Error("Gagal nonaktifkan promo");
      fetchPromos();
    } catch (err) {
      console.error(err);
      alert("Gagal menonaktifkan promo");
    }
  };

  // 🗑️ hapus promo
 const handleDelete = async (id: number) => {
  if (!confirm("Yakin ingin menghapus promo ini?")) return;

  try {
    const res = await fetch("/api/promo", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (!res.ok) throw new Error("Gagal menghapus promo");
    alert("Promo berhasil dihapus");
    fetchPromos();
  } catch (err) {
    console.error(err);
    alert("Terjadi kesalahan saat menghapus promo");
  }
};

  return (
    <div className="mt-10">
      {/* 🧾 Tabel Promo Aktif */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-indigo-700 flex items-center gap-2">
          💎 Daftar Promo Aktif
        </h3>
        <button
          onClick={() => {
            resetForm();
            setOpenDialog(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white px-5 py-2 rounded-xl shadow-md transition-all duration-300 font-medium hover:shadow-lg"
        >
          <Plus size={18} /> Tambah Promo Baru
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl shadow-md border border-indigo-100">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-800 font-semibold">
            <tr>
              <th className="px-4 py-3 border-b border-indigo-200">Kode</th>
              <th className="px-4 py-3 border-b border-indigo-200">Tipe</th>
              <th className="px-4 py-3 border-b border-indigo-200">Nilai</th>
              <th className="px-4 py-3 border-b border-indigo-200">Tanggal Mulai</th>
              <th className="px-4 py-3 border-b border-indigo-200">Tanggal Berakhir</th>
              <th className="px-4 py-3 border-b border-indigo-200">Status</th>
              <th className="px-4 py-3 border-b border-indigo-200">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {promos.length > 0 ? (
              promos.map((promo) => (
                <tr
                  key={promo.id}
                  className="text-center hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                >
                  <td className="px-4 py-3 border-b border-indigo-100 font-medium text-indigo-700">{promo.code}</td>
                  <td className="px-4 py-3 border-b border-indigo-100">
                    {promo.type === "PERCENT" ? "Persentase" : "Nominal"}
                  </td>
                  <td className="px-4 py-3 border-b border-indigo-100 text-blue-700 font-medium">
                    {promo.type === "PERCENT" ? `${promo.value}%` : `Rp ${promo.value.toLocaleString()}`}
                  </td>
                  <td className="px-4 py-3 border-b border-indigo-100 text-gray-600">
                    {promo.validFrom
                      ? new Date(promo.validFrom).toLocaleDateString("id-ID")
                      : "-"}
                  </td>
                  <td className="px-4 py-3 border-b border-indigo-100 text-gray-600">
                    {promo.validUntil
                      ? new Date(promo.validUntil).toLocaleDateString("id-ID")
                      : "∞"}
                  </td>
                  <td className="px-4 py-3 border-b border-indigo-100">
                  {(() => {
  const now = new Date();
  const start = promo.validFrom ? new Date(promo.validFrom) : null;
  const end = promo.validUntil ? new Date(promo.validUntil) : null;

  const isActive =
    (!start || start <= now) && (!end || end >= now);

  return isActive ? (
    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
      Aktif
    </span>
  ) : (
    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
      Nonaktif
    </span>
  );
})()}

                  </td>
                  <td className="px-4 py-3 border-b border-indigo-100 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(promo)}
                        className="flex items-center gap-1 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white text-xs px-3 py-1.5 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      {promo.active && (
                        <button
                          onClick={() => handleDeactivate(promo.id)}
                          className="flex items-center gap-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-xs px-3 py-1.5 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                          <Ban size={14} /> Nonaktifkan
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(promo.id)}
                        className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white text-xs px-3 py-1.5 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        <Trash2 size={14} /> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-400 italic">
                  Belum ada promo aktif
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 💜 Dialog Tambah / Edit Promo */}
      {openDialog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl shadow-2xl w-full max-w-3xl p-8"
            initial={{ scale: 0.8, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-2xl font-bold text-indigo-700 flex items-center gap-2">
                <Gift size={24} className="text-blue-500" />
                {editingPromo ? "Edit Promo" : "Tambah Promo Baru"}
              </h3>
              <button
                onClick={() => setOpenDialog(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 bg-white/70 p-6 rounded-xl shadow-inner border border-indigo-100">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">Tipe Promo</label>
                <select
                  className="border border-indigo-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                  value={promoType}
                  onChange={(e) => setPromoType(e.target.value)}
                >
                  <option value="NOMINAL">Nominal</option>
                  <option value="PERCENT">Persentase</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">Nilai Promo</label>
                <input
                  type="number"
                  placeholder="Contoh: 50000 / 10"
                  className="border border-indigo-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                  value={promoValue}
                  onChange={(e) => setPromoValue(e.target.value)}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">Minimal Pembelian</label>
                <input
                  type="number"
                  placeholder="Opsional"
                  className="border border-indigo-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                  value={minPurchase}
                  onChange={(e) => setMinPurchase(e.target.value)}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">Maksimal Diskon</label>
                <input
                  type="number"
                  placeholder="Opsional"
                  className="border border-indigo-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value)}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  className="border border-indigo-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">Tanggal Berakhir</label>
                <input
                  type="date"
                  className="border border-indigo-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setOpenDialog(false)}
                className="px-6 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-600 font-medium transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleSavePromo}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <Gift size={18} /> {editingPromo ? "Simpan Perubahan" : "Simpan Promo"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

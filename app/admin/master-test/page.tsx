"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/navbar";
import { Pencil, Search } from "lucide-react"; // icon dari lucide-react

interface TestType {
  id: number;
  name: string;
  desc?: string;
  judul?: string;
  deskripsijudul?: string;
  juduldesk1?: string;
  desk1?: string;
  juduldesk2?: string;
  desk2?: string;
  judulbenefit?: string;
  pointbenefit?: string;
  price?: number;
  duration?: string;
}

export default function MasterTestPage() {
  const [tests, setTests] = useState<TestType[]>([]);
  const [selected, setSelected] = useState<TestType | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/testtypes")
      .then((res) => res.json())
      .then(setTests);
  }, []);

  const openEdit = async (test: TestType) => {
    const res = await fetch(`/api/testtypes/${test.id}`);
    if (res.ok) {
      const data = await res.json();
      setSelected(data);
    } else {
      setSelected(test);
    }
  };

  const closeEdit = () => setSelected(null);

  const handleSave = async () => {
    if (!selected) return;
    setLoading(true);
    const res = await fetch(`/api/testtypes/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selected),
    });
    if (res.ok) {
      const updated = await res.json();
      setTests((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
      closeEdit();
    }
    setLoading(false);
  };

  // Filter tests berdasarkan search query
  const filteredTests = tests.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">Master Data Test</h1>

        {/* Search Bar */}
        <div className="mb-4 relative w-full md:w-1/2">
          <Search className="absolute top-2.5 left-2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cari test..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-blue-100 text-blue-700 uppercase text-sm font-semibold">
              <tr>
                <th className="border px-4 py-2 text-left">ID</th>
                <th className="border px-4 py-2 text-left">Nama Test</th>
                <th className="border px-4 py-2 text-left">Deskripsi</th>
                <th className="border px-4 py-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTests.map((test, idx) => (
                <tr
                  key={test.id}
                  className={`hover:bg-blue-50 ${idx % 2 === 0 ? "bg-gray-50" : ""}`}
                >
                  <td className="border px-4 py-2">{test.id}</td>
                  <td className="border px-4 py-2 font-medium">{test.name}</td>
                  <td className="border px-4 py-2 text-gray-600">{test.desc}</td>
                  <td className="border px-4 py-2 text-center">
                    <button
                      className="flex items-center gap-1 justify-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-lg shadow transition"
                      onClick={() => openEdit(test)}
                    >
                      <Pencil size={16} />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTests.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center p-6 text-gray-400 italic">
                    Tidak ada test
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

   {/* Modal */}
{selected && (
  <div className="fixed inset-0 z-50 flex justify-center items-start bg-gray-100 bg-opacity-30 pt-20 overflow-auto">
    <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl p-6 relative">
      <h2 className="text-2xl font-bold mb-6 text-blue-600 flex items-center gap-2">
        <Pencil size={20} /> Edit {selected.name}
      </h2>

      {/* Sections */}
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">

        {/* Info Umum */}
        <div className="p-4 border rounded-xl shadow-sm bg-blue-50">
          <h3 className="font-semibold text-lg mb-3 text-blue-700">Info Umum</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="font-medium mb-1">Judul</label>
              <input
                className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                value={selected.judul || ""}
                onChange={(e) =>
                  setSelected({ ...selected, judul: e.target.value })
                }
                placeholder="Masukkan judul test"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-medium mb-1">Deskripsi</label>
              <textarea
                className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
                value={selected.desc || ""}
                onChange={(e) =>
                  setSelected({ ...selected, desc: e.target.value })
                }
                placeholder="Masukkan deskripsi singkat"
              />
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="font-medium mb-1">Deskripsi Judul</label>
              <textarea
                className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
                value={selected.deskripsijudul || ""}
                onChange={(e) =>
                  setSelected({ ...selected, deskripsijudul: e.target.value })
                }
                placeholder="Deskripsi detail judul"
              />
            </div>
          </div>
        </div>

        {/* Desk Section */}
        <div className="p-4 border rounded-xl shadow-sm bg-green-50">
          <h3 className="font-semibold text-lg mb-3 text-green-700">Desk</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="font-medium mb-1">Judul Desk 1</label>
              <input
                className="border rounded px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
                value={selected.juduldesk1 || ""}
                onChange={(e) =>
                  setSelected({ ...selected, juduldesk1: e.target.value })
                }
                placeholder="Judul Desk 1"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-medium mb-1">Desk 1</label>
              <textarea
                className="border rounded px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none resize-none"
                value={selected.desk1 || ""}
                onChange={(e) =>
                  setSelected({ ...selected, desk1: e.target.value })
                }
                placeholder="Deskripsi Desk 1"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-medium mb-1">Judul Desk 2</label>
              <input
                className="border rounded px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
                value={selected.juduldesk2 || ""}
                onChange={(e) =>
                  setSelected({ ...selected, juduldesk2: e.target.value })
                }
                placeholder="Judul Desk 2"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-medium mb-1">Desk 2</label>
              <textarea
                className="border rounded px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none resize-none"
                value={selected.desk2 || ""}
                onChange={(e) =>
                  setSelected({ ...selected, desk2: e.target.value })
                }
                placeholder="Deskripsi Desk 2"
              />
            </div>
          </div>
        </div>

        {/* Benefit Section */}
        <div className="p-4 border rounded-xl shadow-sm bg-yellow-50">
          <h3 className="font-semibold text-lg mb-3 text-yellow-700">Benefit</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="font-medium mb-1">Judul Benefit</label>
              <input
                className="border rounded px-3 py-2 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                value={selected.judulbenefit || ""}
                onChange={(e) =>
                  setSelected({ ...selected, judulbenefit: e.target.value })
                }
                placeholder="Judul benefit"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-medium mb-1">Point Benefit</label>
              <textarea
                className="border rounded px-3 py-2 focus:ring-2 focus:ring-yellow-400 focus:outline-none resize-none"
                value={selected.pointbenefit || ""}
                onChange={(e) =>
                  setSelected({ ...selected, pointbenefit: e.target.value })
                }
                placeholder="Rincian point benefit"
              />
            </div>
          </div>
        </div>

        {/* Price & Duration Section */}
        <div className="p-4 border rounded-xl shadow-sm bg-purple-50">
          <h3 className="font-semibold text-lg mb-3 text-purple-700">Price & Duration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="font-medium mb-1">Duration (menit)</label>
              <input
                type="number"
                className="border rounded px-3 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                value={selected.duration || ""}
                onChange={(e) =>
                  setSelected({ ...selected, duration: e.target.value })
                }
                placeholder="Durasi test"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-medium mb-1">Price</label>
              <input
                type="number"
                className="border rounded px-3 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                value={selected.price || ""}
                onChange={(e) =>
                  setSelected({ ...selected, price: Number(e.target.value) })
                }
                placeholder="Harga test"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
          onClick={closeEdit}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  </div>
)}

      </div>
    </>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";

const daftarTes = [
  "Tes IST",
  "Tes Kraepelin",
  "Tes Wartegg",
  "Tes Pauli",
  "Tes MBTI",
  "Tes DISC",
  "Tes Big Five",
  "Tes EQ",
];

interface TestItem {
  name: string;
  price: number;
}

export default function AdminPage() {
  // Awalnya semua harga 0
  const [tests, setTests] = useState<TestItem[]>(
    daftarTes.map((t) => ({ name: t, price: 0 }))
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);

  const startEdit = (index: number, currentPrice: number) => {
    setEditingIndex(index);
    setNewPrice(currentPrice);
  };

  const savePrice = (index: number) => {
    const updated = [...tests];
    updated[index].price = newPrice;
    setTests(updated);
    setEditingIndex(null);
  };
const slugify = (name: string) =>
  name.replace(/^Tes\s+/i, "").trim().toLowerCase();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Kelola Tes (Admin)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tests.map((test, idx) => (
          <div
            key={idx}
            className="p-4 border rounded-lg shadow bg-white flex flex-col justify-between"
          >
            <h3 className="text-lg font-semibold">{test.name}</h3>
            <p className="text-gray-600">
              Harga:{" "}
              {editingIndex === idx ? (
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="border px-2 py-1 rounded w-24"
                />
              ) : (
                `Rp ${test.price.toLocaleString()}`
              )}
            </p>

            {editingIndex === idx ? (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => savePrice(idx)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Simpan
                </button>
                <button
                  onClick={() => setEditingIndex(null)}
                  className="bg-gray-400 text-white px-3 py-1 rounded"
                >
                  Batal
                </button>
              </div>
            ) : (
              <div className="flex gap-2 mt-3">
                <Link href={`/tes/${slugify(test.name)}`}>
  <button className="bg-blue-600 text-white px-3 py-1 rounded">
    Ikuti Tes
  </button>
</Link>

                <button
                  onClick={() => startEdit(idx, test.price)}
                  className="bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Edit Harga
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

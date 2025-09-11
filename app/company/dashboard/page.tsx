'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/navbar';

interface Package {
  id: number;
  name: string;
  description?: string;
  price: number;
  purchases: User[];
  quota: number; // 🟢 sisa stok tes
}

interface User {
  id: number;
  fullName: string;
  email: string;
}

export default function CompanyDashboard() {
  const [packages, setPackages] = useState<Package[]>([
    { id: 1, name: 'Paket A', description: 'Paket tes IST & Pauli', price: 500000, purchases: [], quota: 5 },
    { id: 2, name: 'Paket B', description: 'Paket tes CPMI', price: 300000, purchases: [], quota: 3 },
  ]);

  const [users, setUsers] = useState<User[]>([
    { id: 1, fullName: 'Budi Santoso', email: 'budi@example.com' },
    { id: 2, fullName: 'Siti Aminah', email: 'siti@example.com' },
    { id: 3, fullName: 'Agus Saputra', email: 'agus@example.com' },
  ]);

  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  const handleAddUser = () => {
    if (!selectedPackage || !selectedUser) {
      return alert('Pilih paket dan user terlebih dahulu');
    }

    const pkgIndex = packages.findIndex(p => p.id === selectedPackage);
    const user = users.find(u => u.id === selectedUser);
    if (pkgIndex === -1 || !user) return;

    const pkg = packages[pkgIndex];

    if (pkg.quota <= 0) {
      return alert('Kuota habis! Silakan beli lagi.');
    }

    if (pkg.purchases.some(u => u.id === user.id)) {
      return alert('User sudah terdaftar di paket ini');
    }

    // 🟢 tambahkan user & kurangi quota
    const updatedPkg = {
      ...pkg,
      purchases: [...pkg.purchases, user],
      quota: pkg.quota - 1,
    };

    const updatedPackages = [...packages];
    updatedPackages[pkgIndex] = updatedPkg;

    setPackages(updatedPackages);
    alert(`User ${user.fullName} berhasil ditambahkan ke ${pkg.name}. Sisa kuota: ${updatedPkg.quota}`);
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard Perusahaan</h1>

        {/* Paket yang dibeli */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Paket yang Dibeli</h2>
          <ul>
            {packages.map(pkg => (
              <li key={pkg.id} className="border p-3 mb-2 rounded">
                <h3 className="font-bold">{pkg.name}</h3>
                <p>{pkg.description}</p>
                <p className="text-sm text-gray-600">Harga: Rp {pkg.price}</p>
                <p className="text-sm text-green-600 font-semibold">Sisa Kuota: {pkg.quota}</p>

                {pkg.purchases.length > 0 && (
                  <div className="mt-2">
                    <strong>Users Terdaftar:</strong>
                    <ul className="ml-4">
                      {pkg.purchases.map(u => (
                        <li key={u.id}>{u.fullName} ({u.email})</li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Daftarkan User ke Paket */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Daftarkan User ke Paket</h2>
          <div className="flex gap-3 mb-2 flex-wrap">
            <select
              value={selectedPackage || ''}
              onChange={e => setSelectedPackage(parseInt(e.target.value))}
              className="border p-2 rounded"
            >
              <option value="">Pilih Paket</option>
              {packages.map(pkg => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} (Sisa {pkg.quota})
                </option>
              ))}
            </select>

            <select
              value={selectedUser || ''}
              onChange={e => setSelectedUser(parseInt(e.target.value))}
              className="border p-2 rounded"
            >
              <option value="">Pilih User</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
              ))}
            </select>

            <button
              onClick={handleAddUser}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
              disabled={
                !selectedPackage || packages.find(p => p.id === selectedPackage)?.quota === 0
              }
            >
              Tambahkan
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

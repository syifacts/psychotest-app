'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/navbar';

interface User { id: number; fullName: string; email: string; }
interface TestType { id: number; name: string; }
interface PackageTest { id: number; testType: TestType; }
interface Package { id: string; name: string; description?: string; tests: PackageTest[]; }
interface PackagePurchase { id: number; package: Package; quantity: number; userPackages: User[]; }
interface Payment { id: number; TestType: TestType; amount: number; quantity: number; }

export default function CompanyDashboard() {
  const [packagePurchases, setPackagePurchases] = useState<PackagePurchase[]>([]);
  const [singlePayments, setSinglePayments] = useState<Payment[]>([]);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<number | null>(null);
  const [selectedTest, setSelectedTest] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [assignTarget, setAssignTarget] = useState<'PACKAGE' | 'TEST'>('PACKAGE');

  const fetchCompanyId = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) throw new Error('Tidak bisa ambil info user');
      const data = await res.json();
      if (data.user?.role === 'PERUSAHAAN') setCompanyId(data.user.id);
      else alert('Hanya perusahaan yang bisa akses dashboard ini');
    } catch (err) { console.error(err); }
  };

  const fetchDashboard = async () => {
    if (!companyId) return;
    const res = await fetch(`/api/company/purchase?companyId=${companyId}`);
    if (!res.ok) return console.error('Gagal fetch dashboard');
    const data = await res.json();
    setPackagePurchases(data.packagePurchases);
    setSinglePayments(data.singlePayments);
  };

  useEffect(() => { fetchCompanyId(); }, []);
  useEffect(() => { fetchDashboard(); }, [companyId]);

  const handleAddUser = async () => {
    if (!userEmail) return alert('Masukkan email user');

    let url = '';
    let body: any = { email: userEmail };

    if (assignTarget === 'PACKAGE') {
      if (!selectedPurchase) return alert('Pilih paket');
      url = '/api/company/register-user';
      body.packagePurchaseId = selectedPurchase;
    } else {
      if (!selectedTest) return alert('Pilih test satuan');
      url = '/api/company/register-user';
      body.paymentId = selectedTest;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error);

    alert('User berhasil ditambahkan');
    setUserEmail("");
    fetchDashboard();
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
            {packagePurchases.map(p => (
              <li key={p.id} className="border p-3 mb-2 rounded">
                <h3 className="font-bold">{p.package.name}</h3>
                <p>{p.package.description}</p>
                <p className="text-sm text-gray-600">
                  Tes: {p.package.tests.map(t => t.testType.name).join(', ')}
                </p>
                <p className="text-sm text-green-600 font-semibold">
                  Sisa Kuota: {p.quantity - p.userPackages.length}
                </p>
                {p.userPackages.length > 0 && (
                  <div className="mt-2">
                    <strong>Users Terdaftar:</strong>
                    <ul className="ml-4">
                      {p.userPackages.map(u => (
                        <li key={u.id}>{u.fullName} ({u.email})</li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Test Satuan */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Test Satuan Dibeli</h2>
          <ul>
            {singlePayments.map(p => (
              <li key={p.id} className="border p-3 mb-2 rounded">
                <h3>{p.TestType.name}</h3>
                <p>Jumlah: {p.quantity}</p>
                <p>Harga: Rp {p.amount}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Daftarkan User */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Daftarkan User</h2>
          <div className="flex gap-3 mb-2 flex-wrap">
            <select
              value={assignTarget}
              onChange={e => setAssignTarget(e.target.value as 'PACKAGE' | 'TEST')}
              className="border p-2 rounded"
            >
              <option value="PACKAGE">Paket</option>
              <option value="TEST">Test Satuan</option>
            </select>

            {assignTarget === 'PACKAGE' && (
              <select
                value={selectedPurchase || ''}
                onChange={e => setSelectedPurchase(parseInt(e.target.value))}
                className="border p-2 rounded"
              >
                <option value="">Pilih Paket</option>
                {packagePurchases.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.package.name} (Sisa {p.quantity - p.userPackages.length})
                  </option>
                ))}
              </select>
            )}

            {assignTarget === 'TEST' && (
              <select
                value={selectedTest || ''}
                onChange={e => setSelectedTest(parseInt(e.target.value))}
                className="border p-2 rounded"
              >
                <option value="">Pilih Test Satuan</option>
                {singlePayments.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.TestType.name} (Qty {p.quantity})
                  </option>
                ))}
              </select>
            )}

            <input
              type="email"
              placeholder="Masukkan email user"
              value={userEmail}
              onChange={e => setUserEmail(e.target.value)}
              className="border p-2 rounded"
            />

            <button
              onClick={handleAddUser}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
              disabled={!userEmail || (assignTarget === 'PACKAGE' && !selectedPurchase) || (assignTarget === 'TEST' && !selectedTest)}
            >
              Tambahkan
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

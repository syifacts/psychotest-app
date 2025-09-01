'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: number;
  email: string;
  fullName: string;
  role?: string;
  birthDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TokenPayload {
  id: number;
  email: string;
  fullName: string; 
  iat: number;
  exp: number;
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Cek localStorage dulu
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      return;
    }

    // Jika localStorage kosong, ambil dari token
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const currentTime = Math.floor(Date.now() / 1000);

      if (decoded.exp < currentTime) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      // Set user dari token
      setUser({ id: decoded.id, email: decoded.email, fullName: decoded.fullName });
    } catch (err) {
      console.error('Token decode error:', err);
      localStorage.removeItem('token');
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // hapus data user juga
    setUser(null);
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex flex-col items-center justify-center flex-grow py-24 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Akun Saya</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <p className="mt-1 text-gray-900">{user.fullName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-900">{user.email}</p>
            </div>

            {user.birthDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
                <p className="mt-1 text-gray-900">{new Date(user.birthDate).toLocaleDateString()}</p>
              </div>
            )}
          </div>

          <div className="mt-8">
            <button
              onClick={handleLogout}
              className="w-full flex justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

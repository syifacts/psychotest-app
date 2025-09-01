'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  id: number;
  email: string;
  fullName: string; 
  iat: number;
  exp: number;
}

export default function AccountPage() {
  const [user, setUser] = useState<TokenPayload | null>(null);
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

 useEffect(() => {
  if (user) {
    const fetchTestHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const res = await fetch(`/api/user/${user.id}/attempts`);
        if (!res.ok) throw new Error("Gagal mengambil riwayat tes");

        const data = await res.json();
        // Map data supaya sesuai dengan struktur yang kamu gunakan di tabel
        const mappedHistory = data.attempts.map((item: any) => ({
          id: item.id,
          testType: { name: item.TestType?.name || "Unknown Test" },
          completedAt: item.finishedAt || item.startedAt,
          isCompleted: item.isCompleted,
        }));
        setTestHistory(mappedHistory);
      } catch (err) {
        console.error(err);
        setTestHistory([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchTestHistory();
  }
}, [user]);


  const handleLogout = () => {
  // Hapus JWT dari localStorage
  localStorage.removeItem('token');

  // Reset state user
  setUser(null);

  // Redirect ke login
  router.push('/login');
};


if (!user) {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <p className="text-lg font-medium text-gray-700">Loading profil...</p>
    </div>
  );
}

return (
  <main className="min-h-screen bg-gray-50 py-10">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>

      {/* Bagian Profil Utama */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 flex items-center space-x-6">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 flex items-center justify-center bg-gray-200">
          <img
            src={user.profileImage || "https://fonts.gstatic.com/s/i/materialicons/person/v12/24px.svg"}
            alt="Profile"
            className={`w-full h-full object-cover ${!user.profileImage ? 'p-2' : ''}`}
          />
        </div>

  {/* Info Nama dan Role */}
        <div className="flex-grow">
          <h2 className="text-xl font-semibold text-gray-900">{user.fullName || 'Nama Pengguna'}</h2>
          <p className="text-sm text-gray-600">{user.role || 'User'}</p>
        </div>
  
  {/* TOMBOL EDIT (SEKARANG DI LUAR) */}
        <div>
          <button 
              onClick={() => setIsEditing(true)} 
              className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
            <span>Edit profile</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.187 1.187 3.712 3.712 1.187-1.187a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" />
              <path d="M5.25 5.25a3 3 0 003 3h.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H8.25a3 3 0 00-3 3z" />
            </svg>
          </button>
        </div>
      </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-900">{user.email}</p>
            </div>
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
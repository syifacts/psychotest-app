'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import EditProfile from '@/components/account/editprofile';

interface User {
  id: number;
  email: string;
  fullName: string;
  role?: string;
  birthDate?: string;
  createdAt?: string;
  updatedAt?: string;
  profileImage?: string; 
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
  const [testHistory, setTestHistory] = useState<any[]>([]); // <-- TAMBAHKAN INI
  const [isLoadingHistory, setIsLoadingHistory] = useState(true); // <-- Tambahkan state loading
  const [isEditing, setIsEditing] = useState(false);
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
 // <-- Dependency: useEffect ini berjalan saat 'user' berubah

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // hapus data user juga
    setUser(null);
    router.push('/login');
  };

   const handleSaveSuccess = (updatedUser: User) => {
    // Gabungkan data lama dengan data baru
    const newUserState = { ...user, ...updatedUser };
    setUser(newUserState as User); // Update state lokal
    localStorage.setItem('user', JSON.stringify(newUserState)); // Update localStorage
    setIsEditing(false); // Tutup modal
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

      {/* Bagian Informasi Pribadi */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <label className="block text-gray-500">Full Name</label>
            <p className="font-medium text-gray-800">{user.fullName || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-gray-500">Date of Birth</label>
            <p className="font-medium text-gray-800">
              {user.birthDate ? new Date(user.birthDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
            </p>
          </div>
          <div>
            <label className="block text-gray-500">Email Address</label>
            <p className="font-medium text-gray-800">{user.email || 'N/A'}</p>
          </div>
          {/* <div>
            <label className="block text-gray-500">Phone Number</label>
            <p className="font-medium text-gray-800">{user.phone || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-gray-500">User Role</label>
            <p className="font-medium text-gray-800">{user.role || 'User'}</p>
          </div> */}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Tes</h3>
        <div className="overflow-x-auto">
          {isLoadingHistory ? (
            <p className="text-center text-gray-500 py-4">Memuat riwayat...</p>
          ) : testHistory.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Nama Tes
                  </th>
                  <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Pengerjaan
                  </th>
                  <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testHistory.map((historyItem) => (
                  <tr key={historyItem.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {historyItem.testType.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(historyItem.completedAt).toLocaleDateString('id-ID', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Selesai
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
  <a
    href={`/tes/hasil/${historyItem.id}`} 
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-600 hover:text-blue-900"
  >
    Lihat Hasil
  </a>
</td>

                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-500 py-4">
              Anda belum pernah mengerjakan tes apapun.
            </p>
          )}
        </div>
      </div>
      
      {/* Tombol Logout (Jika Anda ingin menyertakannya) */}
      <div className="mt-8 text-center">
        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
        >
          Logout
        </button>
      </div>

      {isEditing && (
        <EditProfile
          user={user}
          onClose={() => setIsEditing(false)}
          onSave={handleSaveSuccess}
        />
      )}
    </div>
  </main>
);
}
'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';

export default function CompanyLogin() {
  const [userId, setUserId] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/company-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, token }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Login gagal');

      window.location.href = `/tes/cpmi/${data.attemptId}`;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white p-4 sm:p-6 overflow-hidden">
      {/* Floating Background Circles */}
      {/* Floating Background Circles */}
<div className="absolute top-10 -left-20 w-80 h-80 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-40 rounded-full mix-blend-multiply filter blur-2xl animate-blob"></div>
<div className="absolute bottom-20 -right-20 w-80 h-80 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-40 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-2000"></div>
<div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-gradient-to-r from-indigo-400 to-purple-500 opacity-40 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-4000"></div>


      {/* Card */}
      <div className="relative flex flex-col lg:flex-row w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[650px] transform transition duration-500 hover:scale-[1.01] hover:shadow-3xl z-10">
        
        {/* Form */}
        <div className="flex-[1_1_55%] flex flex-col justify-center p-10 sm:p-16 lg:p-20 relative z-10">
          <div className="w-full max-w-md mx-auto animate-fadeInUp">
            
            {/* Logo di kiri atas */}
            <div className="absolute top-6 left-6 w-16 h-16">
              <Image
                src="/logoklinik.png"
                alt="Logo Klinik"
                fill
                className="object-contain"
              />
            </div>

            <h2 className="text-3xl font-bold text-center text-[#01449D] mt-12">
              Login Karyawan
            </h2>
            <p className="mt-2 text-gray-600 text-center">
              Masukkan User ID dan Token yang diberikan perusahaan Anda
            </p>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-md border border-red-400 bg-red-50 p-3 text-center">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Masukkan User ID"
                  required
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4DA8F1] sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Token / ID Test
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Masukkan ID Test"
                  required
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A1C4FD] sm:text-sm"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-md bg-gradient-to-r from-[#01449D] to-[#4DA8F1] px-4 py-3 text-sm font-semibold text-white shadow-md hover:shadow-xl hover:from-[#01397A] hover:to-[#398BD6] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 transition transform hover:-translate-y-1"
                >
                  {loading ? 'Memproses...' : 'Masuk'}
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Lupa token? Hubungi HR perusahaan Anda.
            </p>
          </div>
        </div>

        {/* Ilustrasi */}
        <div className="flex-[1_1_45%] hidden lg:flex items-center justify-center relative">
          <Image
            src="/animasilogin3.jpg"
            alt="Ilustrasi Login"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
}

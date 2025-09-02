'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // 🔹 Cek login saat mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      // Redirect langsung ke dashboard jika sudah login
      const parsedUser = JSON.parse(user);
      if (parsedUser.role === 'SUPERADMIN') {
        router.replace('/admin');
      } else {
        router.replace('/');
      }
    }
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Gagal melakukan login.');
        setIsLoading(false);
        return;
      }

      // Simpan token JWT di localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      // Simpan data user di localStorage agar bisa ditampilkan di halaman akun
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      setSuccess('Login berhasil! Mengarahkan ke dashboard...');
      setIsLoading(false);

      // Redirect otomatis ke dashboard
      setTimeout(() => router.push('/dashboard'), 2000);

    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan saat menghubungi server');
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />

      {success && (
        <div className="w-full flex justify-center mt-4 absolute top-32 z-20">
          <div className="flex items-center bg-green-100 text-green-800 text-sm font-medium px-4 py-3 rounded-lg shadow-md" role="alert">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p>{success}</p>
          </div>
        </div>
      )}

      <div className="flex flex-grow items-center justify-center p-4 sm:p-6 py-24">
        <div className="relative flex flex-col lg:flex-row w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden min-h-[600px]">
          {/* Form Login */}
          <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-16">
            <div className="w-full max-w-md mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 text-center">
                Selamat Datang Kembali
              </h2>
              <p className="mt-2 text-gray-600 text-center">
                Silakan masuk untuk melanjutkan ke akun Anda.
              </p>

              <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-md border border-red-400 bg-red-50 p-3 text-center">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Alamat Email
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="text-sm">
                      <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                        Lupa password?
                      </a>
                    </div>
                  </div>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="flex w-full justify-center rounded-md border border-transparent bg-[#0070f3] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Memproses...' : 'Login'}
                  </button>
                </div>
              </form>

              <p className="mt-6 text-center text-sm text-gray-600">
                Belum punya akun?{' '}
                <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  Daftar di sini
                </Link>
              </p>
            </div>
          </div>

          {/* Ilustrasi */}
          <div className="flex-1 hidden lg:flex items-center justify-center p-8 sm:p-18 lg:p-16 relative">
            <Image
              src="/psikoteslogin.png"
              alt="Ilustrasi Login"
              layout="fill"
              objectFit="cover"
              className="z-10"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
// app/register/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log({ name, email, password });
  };

  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="grid flex-grow lg:grid-cols-2">
        
        {/* Kolom Kiri: Form Registrasi */}
        <div className="flex flex-col justify-center items-center lg:items-end lg:pr-12 px-4 py-12 sm:px-6">
          <div className="w-full max-w-sm lg:max-w-md">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 text-center">Buat Akun Anda</h2>
              <p className="mt-2 text-gray-600 text-center">
                Daftarkan akun untuk memulai eksplorasi potensi diri.
              </p>
            </div>

            <div className="mt-8">
              {/* Form */}
              <div className="mt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* ... (semua input form di sini) ... */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                    <div className="mt-1">
                      <input id="name" name="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"/>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Alamat Email</label>
                    <div className="mt-1">
                      <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"/>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <div className="mt-1">
                      <input id="password" name="password" type="password" autoComplete="current-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"/>
                    </div>
                  </div>
                   <div className="flex items-center">
                    <input id="terms-and-privacy" name="terms-and-privacy" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                    <label htmlFor="terms-and-privacy" className="ml-2 block text-sm text-gray-900">
                      Saya setuju dengan Syarat dan Kebijakan Privasi
                    </label>
                  </div>
                  <div>
                    <button type="submit" className="flex w-full justify-center rounded-md border border-transparent bg-[#0070f3] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400" disabled={isLoading}>
                      {isLoading ? 'Mendaftarkan...' : 'Daftar'}
                    </button>
                  </div>
                </form>
                <p className="mt-6 text-center text-sm text-gray-600">
                  Sudah punya akun?{' '}
                  <Link href="/login" className="font-medium text-blue-600 bold underline hover:text-blue-500">
                    Masuk di sini
                  </Link> 
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Panel Biru Dekoratif */}
        <div className="relative hidden lg:flex flex-col items-center lg:items-start justify-center lg:pl-12 p-12 text-white">
            <div className="relative w-full h-auto mb-8 max-w-2xl"> 
              <Image
                src="/psikotes.png"
                alt="Ilustrasi Psikotes"
                layout="responsive"
                width={500}
                height={500}
                objectFit="contain"
              />
            </div>
            {/* <div className="rounded-lg bg-white/10 p-8 backdrop-blur-sm text-center max-w-md">
               <h2 className="text-4xl font-bold">Temukan Potensi Diri Anda.</h2>
               <p className="mt-4 text-lg text-blue-100">
                 Akses psikotes online untuk memahami aneka potensi tersembunyi. Cocok untuk persiapan karier, pendidikan, atau pengembangan diri.
               </p>
            </div> */}
        </div>
      </div>
    </main>
  );
}
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
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [education, setEducation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const termsCheckbox = document.getElementById('terms-and-privacy') as HTMLInputElement;
    if (!termsCheckbox.checked) {
      setError("Anda harus menyetujui Syarat dan Kebijakan Privasi");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: name,
          email,
          password,
          birthDate,
          gender,
          education,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Terjadi kesalahan saat registrasi");
        setIsLoading(false);
        return;
      }

      setSuccess("Registrasi berhasil! Silakan login.");
      setIsLoading(false);

      setName('');
      setEmail('');
      setPassword('');
      setBirthDate('');
      setGender('');
      setEducation('');
      termsCheckbox.checked = false;

      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat menghubungi server");
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      {success && (
        <div className="w-full flex justify-center mt-4 absolute top-32 z-20">
          <div
            className="flex items-center bg-green-100 text-green-800 text-sm font-medium px-4 py-3 rounded-lg shadow-md"
            role="alert"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p>{success}</p>
          </div>
        </div>
      )}

      <div className="grid flex-grow lg:grid-cols-2">
        {/* Kolom Kiri: Form Registrasi */}
        <div className="flex flex-col justify-center items-center lg:items-end lg:pr-12 px-4 py-12 sm:px-6">
          <div className="w-full max-w-sm lg:max-w-md">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 text-center">
                Buat Akun Anda
              </h2>
              <p className="mt-2 text-gray-600 text-center">
                Daftarkan akun untuk memulai eksplorasi potensi diri.
              </p>
            </div>

            <div className="mt-8">
              <div className="mt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nama */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nama Lengkap
                    </label>
                    <div className="mt-1">
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
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

                  {/* Password */}
                  <div className="space-y-1">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Password
                    </label>
                    <div className="mt-1">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Tanggal Lahir */}
                  <div>
                    <label
                      htmlFor="birthDate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Tanggal Lahir
                    </label>
                    <div className="mt-1">
                      <input
                        id="birthDate"
                        name="birthDate"
                        type="date"
                        required
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Jenis Kelamin */}
                  <div>
                    <label
                      htmlFor="gender"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Jenis Kelamin
                    </label>
                    <div className="mt-1">
                      <select
                        id="gender"
                        name="gender"
                        required
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="">-- Pilih Jenis Kelamin --</option>
                        <option value="LAKI_LAKI">Laki-laki</option>
                        <option value="PEREMPUAN">Perempuan</option>
                      </select>
                    </div>
                  </div>

                  {/* Pendidikan */}
                  <div>
                    <label
                      htmlFor="education"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Pendidikan Terakhir
                    </label>
                    <div className="mt-1">
                      <select
                        id="education"
                        name="education"
                        required
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="">-- Pilih Pendidikan --</option>
                        <option value="SMA/SMK">SMA/SMK</option>
                        <option value="Diploma">Diploma</option>
                        <option value="Sarjana">Sarjana (S1)</option>
                        <option value="Magister">Magister (S2)</option>
                        <option value="Doktor">Doktor (S3)</option>
                      </select>
                    </div>
                  </div>

                  {/* Info box */}
                  <div className="flex items-start mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-800 text-sm rounded-md">
                    <svg
                      className="w-5 h-5 flex-shrink-0 mr-2 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm-9-4a1 1 0 112 0v2a1 1 0 11-2 0V6zm1 4a1 1 0 00-.993.883L10 11v2a1 1 0 001.993.117L12 13v-2a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Masukkan data Anda untuk mengikuti tes psikologi. Semua
                    informasi yang Anda berikan akan dijaga kerahasiaannya.
                  </div>

                  {/* Checkbox */}
                  <div className="flex items-center">
                    <input
                      id="terms-and-privacy"
                      name="terms-and-privacy"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="terms-and-privacy"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Saya setuju dengan Syarat dan Kebijakan Privasi
                    </label>
                  </div>

                  {/* Error */}
                  {error && (
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                  )}

                  {/* Submit */}
                  <div>
                    <button
                      type="submit"
                      className="flex w-full justify-center rounded-md border border-transparent bg-[#0070f3] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Mendaftarkan...' : 'Daftar'}
                    </button>
                  </div>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                  Sudah punya akun?{' '}
                  <Link
                    href="/login"
                    className="font-medium text-blue-600 underline hover:text-blue-500"
                  >
                    Masuk di sini
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Panel Dekoratif */}
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
        </div>
      </div>

      <Footer />
    </main>
  );
}

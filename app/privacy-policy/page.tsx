"use client";

import { ShieldCheck, Lock, Database } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="relative min-h-screen bg-slate-50 py-16 px-6 overflow-hidden">
      
      {/* 🌌 Blob Background */}
      <div className="absolute top-10 -left-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-[float_12s_ease-in-out_infinite]" />
      <div className="absolute bottom-10 -right-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-[float_15s_ease-in-out_infinite_alternate]" />

      <div className="max-w-4xl mx-auto relative z-10">

        {/* 🔹 Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Kebijakan Privasi
          </h1>
          <p className="text-gray-500">
            Kami berkomitmen menjaga keamanan dan kerahasiaan data Anda
          </p>
        </div>

        {/* 🔹 Card */}
        <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 space-y-8 border border-gray-100 animate-fadeUp">

          {/* Intro */}
          <div className="flex items-start gap-4 group">
            <ShieldCheck className="w-7 h-7 text-indigo-600 mt-1 transition group-hover:scale-110" />
            <p className="text-gray-700 leading-relaxed">
              Kami menghargai privasi pengguna dan berkomitmen untuk melindungi data
              pribadi Anda.
            </p>
          </div>

          {/* Section 1 */}
          <div className="flex items-start gap-4 group">
            <Database className="w-7 h-7 text-blue-600 mt-1 transition group-hover:scale-110" />
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">
                1. Data yang Dikumpulkan
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Kami dapat mengumpulkan data seperti nama, email, serta hasil tes psikologi
                yang dilakukan melalui sistem.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="flex items-start gap-4 group">
            <Lock className="w-7 h-7 text-purple-600 mt-1 transition group-hover:scale-110" />
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">
                2. Penggunaan Data
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Data digunakan untuk keperluan pengolahan hasil tes, peningkatan layanan,
                dan administrasi sistem.
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              3. Keamanan Data
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Kami menjaga keamanan data pengguna dengan sistem yang dirancang untuk
              mencegah akses tidak sah.
            </p>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              4. Kerahasiaan
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Data hasil tes bersifat rahasia dan tidak akan dibagikan kepada pihak ketiga
              tanpa persetujuan pengguna.
            </p>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              5. Perubahan Kebijakan
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Kebijakan ini dapat diperbarui sewaktu-waktu tanpa pemberitahuan sebelumnya.
            </p>
          </div>
        </div>

        {/* Footer kecil */}
        <div className="text-center mt-10 text-sm text-gray-400 animate-fadeIn">
          © {new Date().getFullYear()} Psychotest Website
        </div>
      </div>

      {/* 🎬 Animations */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease forwards;
        }

        .animate-fadeUp {
          animation: fadeUp 1s ease forwards;
        }
      `}</style>
    </div>
  );
}
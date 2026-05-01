"use client";

import { Building2, Target, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-slate-50 py-16 px-6 overflow-hidden">
      
      {/* 🌌 Blob Background (halus, bukan ganggu) */}
      <div className="absolute top-20 -left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-[float_12s_ease-in-out_infinite]" />
      <div className="absolute bottom-20 -right-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-[float_15s_ease-in-out_infinite_alternate]" />

      <div className="max-w-4xl mx-auto relative z-10">

        {/* 🔹 Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Tentang Kami
          </h1>
          <p className="text-gray-500">
            Mengenal lebih dekat layanan Psychotest Website
          </p>
        </div>

        {/* 🔹 Card */}
        <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 space-y-6 border border-gray-100 transition hover:shadow-2xl animate-fadeUp">

          {/* 🧠 Deskripsi */}
          <div className="flex items-start gap-4 group">
            <Building2 className="w-7 h-7 text-indigo-600 mt-1 transition group-hover:scale-110" />
            <p className="text-gray-700 leading-relaxed">
              <strong>Psychotest Website</strong> merupakan aplikasi berbasis web
              yang digunakan untuk melakukan tes psikologi secara digital. Sistem ini
              dirancang untuk membantu proses evaluasi psikologis secara lebih efisien,
              cepat, dan terstruktur.
            </p>
          </div>

          {/* 🏥 Implementasi */}
          <div className="flex items-start gap-4 group">
            <ShieldCheck className="w-7 h-7 text-blue-600 mt-1 transition group-hover:scale-110" />
            <p className="text-gray-700 leading-relaxed">
              Aplikasi ini dikembangkan sebagai bagian dari penelitian akademik dan
              diimplementasikan pada{" "}
              <span className="font-semibold text-gray-900">
                Klinik Yuliarpan Medika
              </span>{" "}
              yang berada di bawah naungan PT. Sudami Jaya Medika.
            </p>
          </div>

          {/* 🎯 Tujuan */}
          <div className="flex items-start gap-4 group">
            <Target className="w-7 h-7 text-purple-600 mt-1 transition group-hover:scale-110" />
            <p className="text-gray-700 leading-relaxed">
              Tujuan utama dari sistem ini adalah untuk mempermudah pengelolaan data tes,
              meningkatkan akurasi hasil, serta memberikan kemudahan bagi pengguna dalam
              mengakses layanan psikotes secara online.
            </p>
          </div>
        </div>

        {/* 🔹 Footer kecil */}
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
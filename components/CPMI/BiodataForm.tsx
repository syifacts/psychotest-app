"use client";

import React, { useState, useEffect } from "react";

interface TokenData {
  userId: number;
  customId?: string;
}

interface Props {
  onSaved?: () => void;
}

const genders = ["Laki-laki", "Perempuan"] as const;

const BiodataForm: React.FC<Props> = ({ onSaved }) => {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<(typeof genders)[number] | "">("");
  const [tujuan, setTujuan] = useState("");
  const [education, setEducation] = useState("");

  const [isInitializing, setIsInitializing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBiodata = async () => {
      setIsInitializing(true);
      const params = new URLSearchParams(window.location.search);
      const tokenValue = params.get("token");

      try {
        if (tokenValue) {
          const res = await fetch(`/api/token/info?token=${tokenValue}`);
          const data = await res.json();

          const newTokenData: TokenData = {
            userId: data.userId || 0,
            customId: data.customId || undefined,
          };
          setTokenData(newTokenData);

          if (newTokenData.userId && newTokenData.userId > 0) {
            const userRes = await fetch(`/api/user/${newTokenData.userId}`);
            const userData = await userRes.json();

            if (userData.user) {
              setFullName(userData.user.fullName ?? "");
              setBirthDate(userData.user.birthDate?.split("T")[0] ?? "");
              setGender(
                userData.user.gender === "LAKI_LAKI"
                  ? "Laki-laki"
                  : userData.user.gender === "PEREMPUAN"
                    ? "Perempuan"
                    : "",
              );
              setTujuan(userData.user.tujuan ?? "");
              setEducation(userData.user.education ?? "");
            }
          }
        } else {
          const meRes = await fetch("/api/auth/me");
          if (meRes.ok) {
            const meData = await meRes.json();
            const userId = meData.user?.id || 0;

            setTokenData({ userId });

            if (userId > 0) {
              const userRes = await fetch(`/api/user/${userId}`);
              const userData = await userRes.json();

              if (userData.user) {
                setFullName(userData.user.fullName ?? "");
                setBirthDate(userData.user.birthDate?.split("T")[0] ?? "");

                const genderMap: Record<string, (typeof genders)[number]> = {
                  LAKI_LAKI: "Laki-laki",
                  PEREMPUAN: "Perempuan",
                  L: "Laki-laki",
                  P: "Perempuan",
                };
                setGender(genderMap[userData.user.gender] ?? "");
                setTujuan(userData.user.tujuan ?? "");
                setEducation(userData.user.education ?? "");
              }
            }
          }
        }
      } catch (err) {
        console.error("Gagal fetch data:", err);
      } finally {
        setIsInitializing(false);
      }
    };

    fetchBiodata();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !birthDate || !gender || !education || !tujuan) {
      alert("Harap lengkapi semua field yang wajib diisi!");
      return;
    }

    if (!tokenData) {
      alert("Token tidak valid!");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/user/update-biodata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: tokenData.userId > 0 ? tokenData.userId : undefined,
          customId: tokenData.userId === 0 ? tokenData.customId : undefined,
          fullName,
          birthDate,
          gender,
          tujuan,
          education,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan biodata");

      if (onSaved) onSaved();
    } catch (err: any) {
      alert("❌ " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mb-4"></div>
          <p className="text-gray-600 font-medium animate-pulse">
            Menyiapkan form biodata...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4">
      <div className="max-w-xl w-full bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl p-8 md:p-10 border border-blue-100 relative overflow-hidden">
        {/* Dekorasi Pojok */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-500 opacity-10 rounded-br-full" />

        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-indigo-100">
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Verifikasi Biodata
          </h2>
          <p className="text-sm text-gray-500 mt-1 text-center">
            Pastikan data Anda sudah benar sebelum memulai tes CPMI
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {/* KOLOM USER ID DI-HIDDEN (Gak ditampilin ke user) */}
          <input type="hidden" value={tokenData?.customId ?? ""} />

          <div>
            <label className="block mb-1.5 text-sm font-semibold text-gray-700">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white/50"
              placeholder="Masukkan nama lengkap"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-semibold text-gray-700">
              Tanggal Lahir
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white/50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block mb-1.5 text-sm font-semibold text-gray-700">
                Jenis Kelamin
              </label>
              <select
                value={gender}
                onChange={(e) =>
                  setGender(e.target.value as (typeof genders)[number])
                }
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white/50"
              >
                <option value="" disabled>
                  Pilih Jenis Kelamin
                </option>
                {genders.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-semibold text-gray-700">
                Pendidikan Terakhir
              </label>
              <select
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white/50"
              >
                <option value="" disabled>
                  Pilih Pendidikan
                </option>
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA/SMK">SMA/SMK</option>
                <option value="Diploma">Diploma</option>
                <option value="Sarjana">Sarjana (S1)</option>
                <option value="Magister">Magister (S2)</option>
                <option value="Doktor">Doktor (S3)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-semibold text-gray-700">
              Tujuan
            </label>
            <input
              type="text"
              value={tujuan}
              onChange={(e) => setTujuan(e.target.value)}
              placeholder="Contoh: Bekerja di Korea"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white/50"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex justify-center items-center gap-2 ${
                isSubmitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/30"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Menyimpan Data...</span>
                </>
              ) : (
                "Lanjut ke Instruksi Tes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BiodataForm;

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
  const [gender, setGender] = useState<typeof genders[number] | "">("");
  const [tujuan, setTujuan] = useState("");
  const [loading, setLoading] = useState(false);
  const [education, setEducation] = useState("");


  // Ambil token dari URL dan fetch data token / user
 useEffect(() => {
  const fetchBiodata = async () => {
    const params = new URLSearchParams(window.location.search);
    const tokenValue = params.get("token");

    if (tokenValue) {
      // === Skenario token (tetap seperti sebelumnya) ===
      fetch(`/api/token/info?token=${tokenValue}`)
        .then((res) => res.json())
        .then(async (data) => {
          const newTokenData: TokenData = {
            userId: data.userId || 0,
            customId: data.customId || undefined,
          };
          setTokenData(newTokenData);

          if (newTokenData.userId && newTokenData.userId > 0) {
            try {
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
                    : ""
                );
                setTujuan(userData.user.tujuan ?? "");
                 setEducation(userData.user.education ?? "");
              }
            } catch (err) {
              console.error("Gagal fetch data user:", err);
            }
          }
        });
    } else {
      // === Skenario user login sendiri ===
      try {
        const meRes = await fetch("/api/auth/me"); // endpoint login
        if (meRes.ok) {
          const meData = await meRes.json();
          const userId = meData.user?.id || 0;

          setTokenData({ userId });

          // Ambil data user
          if (userId > 0) {
            const userRes = await fetch(`/api/user/${userId}`);
            const userData = await userRes.json();

            if (userData.user) {
              setFullName(userData.user.fullName ?? "");
              setBirthDate(userData.user.birthDate?.split("T")[0] ?? "");
              const genderMap: Record<string, typeof genders[number]> = {
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
      } catch (err) {
        console.error("Gagal fetch data user login:", err);
      }
    }
  };

  fetchBiodata();
}, []);

if (loading) return <p>Memuat data...</p>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !birthDate || !gender || !tujuan) {
      alert("Harap lengkapi semua field!");
      return;
    }

    if (!tokenData) {
      alert("Token tidak valid!");
      return;
    }

    setLoading(true);
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

      //alert(`✅ Biodata berhasil disimpan! Usia: ${data.usia} tahun`);
      alert(`✅ Biodata berhasil disimpan!`);
      if (onSaved) onSaved();
    } catch (err: any) {
      alert("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
  onSubmit={handleSubmit}
  className="mt-15 max-w-lg mx-auto bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-blue-100"
>
  {/* Judul Form */}
  <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
    📝 Isi Biodata Diri
  </h2>

  {/* User ID */}
  <div className="mb-5">
    <label className="block mb-2 font-semibold text-gray-700">
      User ID / Custom ID
    </label>
    <input
      type="text"
      value={tokenData?.customId ?? ""}
      disabled
      className="w-full p-3 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
    />
  </div>

  {/* Nama */}
  <div className="mb-5">
    <label className="block mb-2 font-semibold text-gray-700">
      Nama Lengkap
    </label>
    <input
      type="text"
      value={fullName}
      onChange={(e) => setFullName(e.target.value)}
      placeholder="Masukkan nama lengkap"
      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all"
    />
  </div>

  {/* Tanggal Lahir */}
  <div className="mb-5">
    <label className="block mb-2 font-semibold text-gray-700">
      Tanggal Lahir
    </label>
    <input
      type="date"
      value={birthDate}
      onChange={(e) => setBirthDate(e.target.value)}
      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all"
    />
  </div>

  {/* Jenis Kelamin */}
  <div className="mb-5">
    <label className="block mb-2 font-semibold text-gray-700">
      Jenis Kelamin
    </label>
    <select
      value={gender}
      onChange={(e) => setGender(e.target.value as typeof genders[number])}
      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all bg-white"
    >
      <option value="">Pilih</option>
      {genders.map((g) => (
        <option key={g} value={g}>
          {g}
        </option>
      ))}
    </select>
  </div>

  {/* Pendidikan */}
  <div className="mb-5">
    <label className="block mb-2 font-semibold text-gray-700">Pendidikan</label>
    <select
      value={education}
      onChange={(e) => setEducation(e.target.value)}
      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all bg-white"
    >
      <option value="">-- Pilih Pendidikan --</option>
          <option value="SD">SD</option>
    <option value="SMP">SMP</option>
      <option value="SMA/SMK">SMA/SMK</option>
      <option value="Diploma">Diploma</option>
      <option value="Sarjana">Sarjana (S1)</option>
      <option value="Magister">Magister (S2)</option>
      <option value="Doktor">Doktor (S3)</option>
    </select>
  </div>

  {/* Tujuan */}
  <div className="mb-6">
    <label className="block mb-2 font-semibold text-gray-700">
      Tujuan
    </label>
    <input
      type="text"
      value={tujuan}
      onChange={(e) => setTujuan(e.target.value)}
      placeholder="Contoh: Bekerja di Korea"
      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all"
    />
  </div>

  {/* Tombol Simpan */}
  <button
    type="submit"
    disabled={loading}
    className={`w-full py-3 rounded-lg font-semibold text-white transition-all shadow-md ${
      loading
        ? "bg-blue-400 cursor-not-allowed"
        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] hover:shadow-lg"
    }`}
  >
    {loading ? "Menyimpan..." : "💾 Simpan Biodata"}
  </button>
</form>

  );
};

export default BiodataForm;

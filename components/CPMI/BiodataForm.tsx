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

      alert(`✅ Biodata berhasil disimpan! Usia: ${data.usia} tahun`);
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
      className="max-w-lg mx-auto p-6 border rounded-lg shadow-md"
    >
      <h2 className="text-xl font-bold mb-4">Isi Biodata</h2>

      <label className="block mb-2 font-semibold">User ID / Custom ID</label>
      <input
        type="text"
        value={tokenData?.customId ?? ""}
        disabled
        className="w-full p-2 mb-4 border rounded bg-gray-100"
      />

      <label className="block mb-2 font-semibold">Nama Lengkap</label>
      <input
        type="text"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />

      <label className="block mb-2 font-semibold">Tanggal Lahir</label>
      <input
        type="date"
        value={birthDate}
        onChange={(e) => setBirthDate(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />

      <label className="block mb-2 font-semibold">Jenis Kelamin</label>
      <select
        value={gender}
        onChange={(e) => setGender(e.target.value as typeof genders[number])}
        className="w-full p-2 mb-4 border rounded"
      >
        <option value="">Pilih</option>
        {genders.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>
<label className="block mb-2 font-semibold">Pendidikan</label>
<select
  value={education}
  onChange={(e) => setEducation(e.target.value)}
  className="w-full p-2 mb-4 border rounded"
>
  <option value="">-- Pilih Pendidikan --</option>
  <option value="SMA/SMK">SMA/SMK</option>
  <option value="Diploma">Diploma</option>
  <option value="Sarjana">Sarjana (S1)</option>
  <option value="Magister">Magister (S2)</option>
  <option value="Doktor">Doktor (S3)</option>
</select>


      <label className="block mb-2 font-semibold">Melamar Untuk</label>
      <input
        type="text"
        value={tujuan}
        onChange={(e) => setTujuan(e.target.value)}
        placeholder="Masukkan posisi yang dilamar"
        className="w-full p-2 mb-4 border rounded"
      />

      <button
        type="submit"
        className={`w-full p-2 rounded bg-blue-600 text-white font-semibold ${
          loading ? "opacity-50" : ""
        }`}
        disabled={loading}
      >
        {loading ? "Menyimpan..." : "Simpan Biodata"}
      </button>
    </form>
  );
};

export default BiodataForm;

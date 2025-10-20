'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster"


const formatDateForInput = (dateString?: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

interface User {
   id: number;
  email: string;
  fullName: string;
  role?: string;
  birthDate?: string;
  createdAt?: string;
  updatedAt?: string;
  profileImage?: string; 
  ttdUrl?: string;
  lembagalayanan?:string;
  strNumber?: number;
  sippNumber?: number;
  phone?: number;
  address?: number;
  education?: string;
}

interface EditProfileProps {
  user: User;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

export default function EditProfile({ user, onClose, onSave }: EditProfileProps) {
const [formData, setFormData] = useState({
  fullName: user.fullName || '',
  email: user.email || '',
  birthDate: formatDateForInput(user.birthDate),
  education: user.education ?? '',
  lembagalayanan: user.lembagalayanan ?? '',
  strNumber: user.strNumber ?? '',
  sippNumber: user.sippNumber ?? '',
  phone: user.phone ?? '',
  address: user.address ?? '',
});


  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.profileImage || null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [role, setRole] = useState(user.role || "USER");
  const { toast } = useToast();



  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const validateBeforeSubmit = () => {
    if (!formData.fullName.trim()) return setError('Nama tidak boleh kosong.'), false;
    if (!formData.email.trim()) return setError('Email tidak boleh kosong.'), false;

    const wantsChangePassword = currentPassword || newPassword || confirmNewPassword;
    if (wantsChangePassword) {
      if (!currentPassword) return setError('Masukkan password lama.'), false;
      if (newPassword.length < 10) return setError('Password baru minimal 10 karakter.'), false;
      if (newPassword !== confirmNewPassword) return setError('Konfirmasi password tidak cocok.'), false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBeforeSubmit()) return;

    setIsSaving(true);
    const dataToSubmit = new FormData();
Object.entries(formData).forEach(([key, value]) => {
  dataToSubmit.append(key, value != null ? String(value) : "");
});
    if (selectedFile) dataToSubmit.append('profileImage', selectedFile);
    if (currentPassword && newPassword) {
      dataToSubmit.append('currentPassword', currentPassword);
      dataToSubmit.append('newPassword', newPassword);
    }

    try {
  const res = await fetch(`/api/user/${user.id}`, { method: 'PUT', body: dataToSubmit });
  if (!res.ok) throw new Error(await res.text());
  const payload = await res.json();
  onSave(payload.data || payload);

  toast({
    title: "Berhasil!",
    description: "Profil berhasil disimpan.",
    position: "center",
    variant: "success",
    duration: 3000,
  });

  onClose(); // opsional: tutup modal setelah simpan
} catch (err: any) {
  setError(err.message || 'Terjadi kesalahan.');
  toast({
    title: "Gagal!",
    description: err.message || "Profil gagal disimpan.",
      position: "center",
    variant: "error",
    duration: 3000,
  });
} finally {
  setIsSaving(false);
}

  };

useEffect(() => {
  if (user) {
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      birthDate: formatDateForInput(user.birthDate),
      education: user.education ?? '',
      lembagalayanan: user.lembagalayanan ?? '',
      strNumber: user.strNumber ?? '',
      sippNumber: user.sippNumber ?? '',
      phone: user.phone ?? '',
      address: user.address ?? '',
    });
  }
}, [user]);

  // 🔹 Generate avatar otomatis jika belum ada foto
  const avatarUrl =
    previewUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      formData.fullName || 'User'
    )}&background=1D4ED8&color=fff&size=128&bold=true`;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-3xl flex flex-col md:flex-row"
        >
          {/* Left side - Photo */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-500 to-blue-700 flex flex-col items-center justify-center p-8 text-white md:w-1/3 relative"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              {/* <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 bg-white text-blue-600 rounded-full p-2 shadow-md hover:bg-blue-100 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" /> */}
            </motion.div>
            <h2 className="mt-4 text-xl font-semibold text-center">{formData.fullName || 'User Name'}</h2>
            <p className="text-sm opacity-80">{formData.email}</p>
          </motion.div>

          {/* Right side - Form */}
          <div className="p-8 md:w-2/3">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Edit Profil</h2>
       <form onSubmit={handleSubmit} className="space-y-8">
  {/* ==========================
      GRID LAYOUT DENGAN DIVIDER
     ========================== */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
    {/* Divider vertical hanya muncul di desktop */}
    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200"></div>

    {/* Kolom kiri */}
    <div className="space-y-6">
      {/* Nama Lengkap */}
      <motion.div whileHover={{ scale: 1.01 }}>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
        <input
          name="fullName"
          value={formData.fullName}
          onChange={handleTextChange}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg 
          focus:ring-2 focus:ring-blue-500 outline-none transition"
        />
      </motion.div>

      {/* Email */}
      <motion.div whileHover={{ scale: 1.01 }}>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleTextChange}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg 
          focus:ring-2 focus:ring-blue-500 outline-none transition"
        />
      </motion.div>

      {/* Kondisi User */}
      {role === "USER" && (
        <>
          <motion.div whileHover={{ scale: 1.01 }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleTextChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg 
              focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </motion.div>

          <motion.div whileHover={{ scale: 1.01 }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pendidikan Terakhir</label>
            <select
              name="education"
              value={formData.education}
              onChange={handleTextChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg 
              focus:ring-2 focus:ring-blue-500 outline-none transition"
            >
              <option value="">-- Pilih --</option>
              <option value="SMA/SMK">SMA/SMK</option>
              <option value="Diploma">Diploma</option>
              <option value="Sarjana">Sarjana (S1)</option>
              <option value="Magister">Magister (S2)</option>
              <option value="Doktor">Doktor (S3)</option>
            </select>
          </motion.div>
        </>
      )}

      {/* Kondisi PSIKOLOG */}
      {role === "PSIKOLOG" && (
        <>
          <motion.div whileHover={{ scale: 1.01 }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Fasyankes/Lembaga Layanan Psikologi
            </label>
            <input
              name="lembagalayanan"
              value={formData.lembagalayanan || ""}
              onChange={handleTextChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg 
              focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </motion.div>

          <motion.div whileHover={{ scale: 1.01 }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor STR/SIK</label>
            <input
              name="strNumber"
              value={formData.strNumber || ""}
              onChange={handleTextChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg 
              focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.01 }}>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nomor SIPP/SIPPK</label>
        <input
          name="sippNumber"
          value={formData.sippNumber || ""}
          onChange={handleTextChange}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
        />
      </motion.div>
        </>
      )}

      {/* Kondisi PERUSAHAAN */}
      {role === "PERUSAHAAN" && (
        <>
          <motion.div whileHover={{ scale: 1.01 }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
            <input
              name="address"
              value={formData.address || ""}
              onChange={handleTextChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg 
              focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </motion.div>

          <motion.div whileHover={{ scale: 1.01 }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
            <input
              name="phone"
              value={formData.phone || ""}
              onChange={handleTextChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg 
              focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </motion.div>
        </>
      )}
    </div>

    {/* Kolom kanan */}
    <div className="space-y-6">
     {/* Ubah Password Section */}
<div className="pt-4">
  <div className="flex justify-between items-center mb-3">
    <h3 className="text-sm font-semibold text-gray-700">Ubah Password</h3>
    <button
      type="button"
      onClick={() => setShowPasswords((s) => !s)}
      className="text-xs text-blue-600 underline"
    >
      {showPasswords ? 'Sembunyikan' : 'Tampilkan'}
    </button>
  </div>

  <div className="space-y-3">
    <input
      type={showPasswords ? 'text' : 'password'}
      placeholder="Password Lama"
      value={currentPassword}
      onChange={(e) => setCurrentPassword(e.target.value)}
      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
    />
    <input
      type={showPasswords ? 'text' : 'password'}
      placeholder="Password Baru"
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
    />
    <input
      type={showPasswords ? 'text' : 'password'}
      placeholder="Konfirmasi Password Baru"
      value={confirmNewPassword}
      onChange={(e) => setConfirmNewPassword(e.target.value)}
      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
    />
  </div>
</div>


{/* Error + Buttons */}
{error && <p className="text-center text-red-600 text-sm">{error}</p>}

<div className="flex justify-end gap-3 pt-3 border-t border-gray-100 mt-2">
  <button
    type="button"
    onClick={onClose}
    className="px-4 py-1.5 rounded-md font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 text-sm transition"
  >
    Batal
  </button>
  <motion.button
    whileTap={{ scale: 0.96 }}
    type="submit"
    disabled={isSaving}
    className="px-5 py-1.5 rounded-md font-semibold text-white bg-blue-600 hover:bg-blue-700 text-sm transition disabled:bg-blue-300"
  >
    {isSaving ? "Menyimpan..." : "Simpan"}
  </motion.button>
</div>

    </div>
  </div>
</form>
          <Toaster />

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

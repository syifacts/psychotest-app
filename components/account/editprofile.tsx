// components/account/editprofile.tsx

'use client';

import { useState, useRef } from 'react';

// Fungsi helper untuk memformat tanggal
const formatDateForInput = (dateString?: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
  } catch {
    return '';
  }
};

interface User {
  id: number;
  email: string;
  fullName: string;
  birthDate?: string;
  profileImage?: string;
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
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.profileImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    const dataToSubmit = new FormData();
    dataToSubmit.append('fullName', formData.fullName);
    dataToSubmit.append('email', formData.email);
    dataToSubmit.append('birthDate', formData.birthDate);
    if (selectedFile) {
      dataToSubmit.append('profileImage', selectedFile);
    }

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        body: dataToSubmit,
      });

      if (!response.ok) {
        throw new Error('Gagal menyimpan perubahan. Silakan coba lagi.');
      }

      const updatedUser = await response.json();
      onSave(updatedUser.data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img
                src={previewUrl || "https://fonts.gstatic.com/s/i/materialicons/person/v12/24px.svg"}
                alt="Profile Preview"
                className="w-28 h-28 rounded-full object-cover border-4 border-gray-100"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" /><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" /></svg>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-600 mb-1">Full Name</label>
              <input
                type="text" name="fullName" id="fullName" value={formData.fullName}
                onChange={handleTextChange}
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg"
                required
              />
            </div>
             <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
              <input
                type="email" name="email" id="email" value={formData.email}
                onChange={handleTextChange}
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg"
                required
              />
            </div>
            <div>
              <label htmlFor="birthDate" className="block text-sm font-semibold text-gray-600 mb-1">Date of Birth</label>
              <input
                type="date" name="birthDate" id="birthDate" value={formData.birthDate}
                onChange={handleTextChange}
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg"
              />
            </div>
          </div>

          {error && <p className="text-red-600 text-sm mt-4 text-center">{error}</p>}

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
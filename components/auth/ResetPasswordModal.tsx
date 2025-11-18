"use client";

import { useState } from "react";

export default function ResetPasswordModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Gagal reset password.");
      setLoading(false);
      return;
    }

    setMessage("Password berhasil direset! Silakan login.");
    setLoading(false);

    setTimeout(() => onClose(), 1500);
  };

  return (
    <div className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-50">

      {/* Dekorasi bulat-bulat */}
      <div className="absolute w-64 h-64 bg-blue-200 rounded-full opacity-40 top-10 left-16 blur-2xl"></div>
      <div className="absolute w-80 h-80 bg-purple-200 rounded-full opacity-40 bottom-10 right-16 blur-3xl"></div>

      <div className="relative bg-white p-6 rounded-xl shadow-2xl w-full max-w-md z-10 border border-gray-200">
        <h3 className="text-xl font-bold mb-3 text-gray-900">Reset Password</h3>

        {error && (
          <p className="text-red-600 text-sm mb-2">{error}</p>
        )}
        {message && (
          <p className="text-green-600 text-sm mb-2">{message}</p>
        )}

        <label className="block mb-2 text-sm font-medium">Email</label>
        <input
          type="email"
          className="w-full border px-3 py-2 rounded mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="block mb-2 text-sm font-medium">Password Baru</label>
        <input
          type="password"
          className="w-full border px-3 py-2 rounded mb-4"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Batal
          </button>

          <button
            onClick={handleReset}
            disabled={loading}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? "Memproses..." : "Reset Password"}
          </button>
        </div>
      </div>
    </div>
  );
}

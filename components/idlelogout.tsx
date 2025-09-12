"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function IdleLogout() {
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const logout = async () => {
      // 1. Hapus localStorage jika masih ada
      localStorage.removeItem("token");

      // 2. Panggil API logout untuk hapus cookie HttpOnly
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch (err) {
        console.error("Gagal logout:", err);
      }

      // 3. Redirect ke login
      router.push("/login");
    };

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(logout, 15 * 60 * 1000); // 15 menit
    };

    // reset timer saat ada aktivitas
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);

    resetTimer(); // start timer pertama kali

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      clearTimeout(timer);
    };
  }, [router]);

  return null;
}

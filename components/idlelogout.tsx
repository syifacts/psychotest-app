"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function IdleLogout() {
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const logout = () => {
      localStorage.removeItem("token"); // hapus token
      router.push("/login");            // redirect ke login
    };

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(logout, 15 * 60 * 1000); // 15 menit
    };

    // reset timer saat ada pergerakan
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);

    resetTimer(); // inisialisasi timer

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      clearTimeout(timer);
    };
  }, [router]);

  return null;
}

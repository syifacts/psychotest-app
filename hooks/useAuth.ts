"use client";

import { useState, useEffect } from "react";

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include", // ⬅️ kirim cookie
        });
        if (!res.ok) {
          setUser(null);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setUser(data.user || null);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, setUser };
}

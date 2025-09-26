"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [role, setRole] = useState<string>("GUEST");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include", // ⬅️ wajib biar cookie terkirim
        });
        if (!res.ok) {
          setRole("GUEST");
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (data.user) {
          setRole(data.user.role || "USER");
        } else {
          setRole("GUEST");
        }
      } catch (err) {
        setRole("GUEST");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogin = () => router.push("/login");
  const handleSignup = () => router.push("/register");

  const hideSearch = ["/","/login", "/register", "/account", "/admin/master-test", "/psikolog/validasi", "/company/dashboard", "/admin/dashboard"].includes(pathname);

  // Config menu per role
  const menuConfig: Record<string, { href: string; label: string }[]> = {
    GUEST: [
      { href: "/", label: "Beranda" },
      { href: "/dashboard", label: "Layanan Tes" },
    ],
    USER: [
      { href: "/", label: "Beranda" },
      { href: "/dashboard", label: "Layanan Tes" },
      { href: "/account", label: "Akun" },
    ],
    PSIKOLOG: [
      { href: "/psikolog/dashboard", label: "Dashboard" },
      { href: "/psikolog/validasi", label: "Validasi" },
      { href: "/account", label: "Akun" },
    ],
    SUPERADMIN: [
      //{ href: "/", label: "Beranda" },
      { href: "/admin/dashboard", label: "Dashboard" },
      { href: "/admin/tes", label: "Layanan Tes" },
      { href: "/admin/master-test", label: "Master Tes" },
      { href: "/account", label: "Akun" },
    ],
    PERUSAHAAN: [
      { href: "/", label: "Beranda" },
      { href: "/company/dashboard", label: "Dashboard" },
      { href: "/dashboard", label: "Layanan Tes" },
  //    { href: "/company/packages", label: "Bundle Paket" },
      { href: "/account", label: "Akun" },
    ],
  };

  const currentMenu = menuConfig[role] || menuConfig["GUEST"];

  return (
    <header className="header">
      <div className="left">
        <div className="logo">
          <Image src="/logoklinik.png" alt="Logo Klinik" width={80} height={40} />
          <h1>Klinik Yuliarpan Medika</h1>
        </div>
        {!hideSearch && role !== "PSIKOLOG" && (
          <div className="search">
  <input
  type="text"
  placeholder="Cari tes..."
  value={searchQuery}
  onChange={(e) => {
    setSearchQuery(e.target.value);
    // Push ke halaman saat ini, jangan hardcode /dashboard
    const query = e.target.value ? `?search=${encodeURIComponent(e.target.value)}` : "";
    router.push(`${pathname}${query}`);
  }}
/>

</div>

        )}
      </div>

      <div className="right">
        <nav className="nav-links">
          {!loading &&
            currentMenu?.map((item) => (
              <Link key={item.href} href={item.href} legacyBehavior>
                <a className={pathname === item.href ? "active" : ""}>{item.label}</a>
              </Link>
            ))}

          {role === "GUEST" && !loading && (
            <div className="auth">
              <button className="login" onClick={handleLogin}>
                Login
              </button>
              <button className="signup" onClick={handleSignup}>
                Sign Up
              </button>
            </div>
          )}
        </nav>
      </div>

      <style jsx>{`
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 40px;
          background: white;
          border-bottom: 1px solid #ddd;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          flex-wrap: wrap;
          gap: 10px;
          height: 90px;
        }

        .left {
          display: flex;
          align-items: center;
          gap: 20px;
          flex: 1;
        }

        .right {
          display: flex;
          align-items: center;
          gap: 50px;
          margin-right: 70px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo h1 {
          font-size: 17px;
          font-weight: bold;
          font-family: "Poppins", sans-serif;
        }

        .search input {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          width: 300px;
          max-width: 100%;
          margin-left: 40px;
        }

        .nav-links {
          display: flex;
          gap: 40px;
          align-items: center;
          font-size: 1rem;
        }

        .nav-links a {
          text-decoration: none;
          color: #333;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .nav-links a.active {
          color: #0070f3;
          font-weight: 600;
        }

        .auth {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .auth button {
          padding: 8px 16px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .login {
          background: #f1f1f1;
          color: #333;
        }

        .login:hover {
          background: #e0e0e0;
        }

        .signup {
          background: #0070f3;
          color: white;
        }

        .signup:hover {
          background: #005bb5;
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0, 91, 181, 0.3);
        }

        @media (max-width: 1024px) {
          .search input {
            width: 200px;
          }
        }

        @media (max-width: 640px) {
          .header {
            flex-direction: column;
            align-items: stretch;
          }

          .left,
          .right {
            justify-content: center;
            width: 100%;
          }

          .search input {
            width: 100%;
          }

          .nav-links {
            justify-content: center;
          }

          .auth {
            justify-content: center;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;

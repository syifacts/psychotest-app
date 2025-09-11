"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      setIsLoggedIn(true);
      setRole(JSON.parse(user).role);
    } else {
      setIsLoggedIn(false);
      setRole(null);
    }
  }, []);

  const handleLogin = () => router.push("/login");
  const handleSignup = () => router.push("/register");

  const hideSearch = ["/login", "/register", "/account"].includes(pathname);

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
      //{ href: "/", label: "Beranda" },
      { href: "/psikolog/dashboard", label: "List Tes" },
      { href: "/account", label: "Akun" },
    ],
    SUPERADMIN: [
      { href: "/", label: "Beranda" },
      { href: "/admin", label: "Dashboard Admin" },
      { href: "/account", label: "Akun" },
    ],
  };

  const currentMenu = isLoggedIn
    ? menuConfig[role ?? "USER"]
    : menuConfig["GUEST"];

  return (
    <>
      <header className="header">
        <div className="left">
          <div className="logo">
            <Image src="/logoklinik.png" alt="Logo Klinik" width={80} height={40} />
            <h1>Klinik Yuliarpan Medika</h1>
          </div>
          {!hideSearch && role !== "PSIKOLOG" && (
            <div className="search">
              <input type="text" placeholder="Cari tes..." />
            </div>
          )}
        </div>

        <div className="right">
          <nav className="nav-links">
            {currentMenu.map((item) => (
              <Link key={item.href} href={item.href} legacyBehavior>
                <a>{item.label}</a>
              </Link>
            ))}

            {!isLoggedIn && (
              <div className="auth">
                <button className="login" onClick={handleLogin}>Login</button>
                <button className="signup" onClick={handleSignup}>Sign Up</button>
              </div>
            )}
          </nav>
        </div>
      </header>
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
          height: 120px
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
          gap: 200px;
          margin-right:70px
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo h1 {
          font-size: 17px;
          font-weight: bold;
          font-family: 'Poppins', sans-serif;
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
          gap: 80px;
          align-items: center;
          font-size : 1.2rem
        }

        .nav-links a {
          text-decoration: none;
          color: #333;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .nav-links a:hover {
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

          .left, .right {
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
    </>
  );
};

export default Navbar;

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  return (
    <>
      <header className="header">
        <div className="left">
          <div className="logo">
            <Image src="/logoklinik.png" alt="Logo Klinik" width={80} height={40} />
            <h1>Klinik Yuliarpan Medika</h1>
          </div>
          <div className="search">
            <input type="text" placeholder="Cari tes..." />
          </div>
        </div>

        <div className="right">
          <nav className="nav-links">
            <Link href="/" legacyBehavior>
              <a>Beranda</a>
            </Link>
            <Link href="/dashboard" legacyBehavior>
              <a>Layanan Tes</a>
            </Link>
          </nav>

          <div className="auth">
            <Link href="/login">
              <button className="login">Login</button>
            </Link>
            <Link href="/register">
              <button className="signup">Sign Up</button>
            </Link>
          </div>
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

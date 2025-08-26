"use client";

import React from "react";
import Image from "next/image";

const Navbar = () => {
  return (
    <>
      <header className="header">
        <div className="logo">
          <Image src="/logoklinik.png" alt="Logo Klinik" width={80} height={40} />
          <h1>Klinik Yuliarpan Medika</h1>
        </div>

        <div className="search">
          <input type="text" placeholder="Cari tes..." />
        </div>

        <div className="auth">
          <button className="login">Login</button>
          <button className="signup">Sign Up</button>
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
          height:110px;
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
          width: 700px;
          max-width: 100%;
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
          background: #eee;
        }

        .login:hover {
          background: #ddd;
        }

        .signup {
          background: #0070f3;
          color: white;
        }

        .signup:hover {
          background: #005bb5;
        }

        @media (max-width: 1024px) {
          .search input {
            width: 300px;
          }
        }

        @media (max-width: 640px) {
          .header {
            flex-direction: column;
            align-items: stretch;
          }

          .search input {
            width: 100%;
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

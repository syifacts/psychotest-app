"use client";

import React from "react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#01449D] text-white py-16"> {/* Lebih tinggi */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-10">

        {/* Logo & Klinik Name */}
        <div className="flex items-center gap-4">
          <div className="w-40 h-40 relative"> 
            <Image
              src="/logoklinik.png" 
              alt="Logo Klinik"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-3xl font-bold">Klinik Yuliarpan Medika</span>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <div>
            <h4 className="font-semibold text-lg">Email</h4>
            <p>info@kliniksehat.com</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg">Telepon</h4>
            <p>+62 812 3456 7890</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg">Alamat</h4>
            <p>Jl. Sehat No.123, Jakarta</p>
          </div>
        </div>

      </div>

      {/* Bottom note */}
      <div className="mt-10 border-t border-blue-400 pt-6 text-center text-sm text-blue-100">
        &copy; {new Date().getFullYear()} Klinik Yuliarpan Medika. All rights reserved.
      </div>
    </footer>
  );
}

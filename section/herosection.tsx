"use client";

import React from "react";
import Image from "next/image";
import AnimatedOnScroll from "../components/ui/animatedonscroll";

export default function HeroSection() {
  return (
    <section className="relative w-full px-4 sm:px-6 pt-10 pb-20 overflow-visible bg-gradient-to-br from-blue-50 to-white">
      <div className="w-full relative">
        <AnimatedOnScroll delay={0.2} duration={0.8}>
          <div className="relative z-10 p-6 md:p-10 lg:p-12 flex flex-col lg:flex-row items-center lg:items-stretch gap-8">
            
            {/* Teks kiri */}
            <div className="flex-1 flex flex-col justify-center text-center lg:text-left lg:ml-20 gap-4">
              <AnimatedOnScroll delay={0.3} duration={0.8}>
                <h1 className="font-poppins text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  Temukan Potensi Dirimu!
                </h1>
              </AnimatedOnScroll>
              <AnimatedOnScroll delay={0.4} duration={0.8}>
                <p className="mt-1 md:mt-2 text-lg md:text-xl text-justify">
                  Akses psikotes online yang membantu kamu mengenal diri lebih dalam, mengeksplorasi minat, bakat, dan potensi tersembunyi. Cocok untuk persiapan karier, pendidikan, atau pengembangan diri.
                </p>
              </AnimatedOnScroll>
            </div>

            {/* Gambar kanan */}
            <div className="flex-1 flex justify-center lg:justify-end relative">
              
              {/* Floating Meriah */}
              {/* Layer besar di belakang */}
              <div className="absolute -top-16 -right-16 w-40 h-40 bg-blue-400/40 rounded-full animate-spin-slow"></div>
              <div className="absolute -bottom-12 left-16 w-36 h-36 bg-purple-400/30 rounded-full animate-bounce-slower"></div>
              <div className="absolute top-6 left-10 w-28 h-28 bg-yellow-300/50 rounded-full animate-scale-pulse"></div>
              <div className="absolute bottom-10 right-20 w-20 h-20 bg-pink-300/40 rounded-full animate-wave"></div>
              <div className="absolute top-1/2 -right-8 w-12 h-12 bg-green-300/50 rounded-full animate-fade-in-out"></div>

              {/* Floating mini shapes */}
              <div className="absolute top-0 left-1/2 w-3 h-3 bg-white rounded-full animate-bounce"></div>
              <div className="absolute bottom-2 right-1/3 w-4 h-4 bg-yellow-200 rounded-full animate-wave"></div>
              <div className="absolute -top-4 right-1/4 w-2 h-2 bg-purple-200 rounded-full animate-fade-in-out"></div>
              <div className="absolute bottom-6 left-1/3 w-2.5 h-2.5 bg-pink-200 rounded-full animate-bounce"></div>
<div className="relative flex justify-center items-center">
<Image
  src="/ilustrasi.png"
  alt="Hero Left"
  width={1200}
  height={800}
  className="object-contain w-[600px] h-auto mx-auto z-10 -translate-x-20"
  priority
/>


                {/* Glow besar di belakang gambar */}
                <div className="absolute inset-0 -translate-x-4 -translate-y-4 rounded-2xl bg-gradient-to-br from-blue-300/40 to-transparent blur-3xl z-0"></div>
              </div>
            </div>
          </div>
        </AnimatedOnScroll>
      </div>
    </section>
  );
}

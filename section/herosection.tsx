import React from "react";
import Image from "next/image";
import AnimatedOnScroll from "../components/ui/animatedonscroll";

export default function HeroSection() {
  return (
    <section className="relative w-full px-4 sm:px-6 pt-10 pb-5">
      <div className="w-full">
        <AnimatedOnScroll delay={0.2} duration={0.8}>
          <div
            className="relative z-10 bg-white rounded-xl p-6 md:p-10 lg:p-12 
                       flex flex-col lg:flex-row items-center lg:items-stretch gap-8
                       shadow-xl shadow-black/10 border-b-4 border-gray-300"
          >
            {/* Teks kiri */}
            <div className="flex-1 flex flex-col justify-center text-center lg:text-left lg:ml-20 gap-4">
              <AnimatedOnScroll delay={0.3} duration={0.8}>
                <h1 className="font-poppins text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  Temukan Potensi Dirimu!
                </h1>
              </AnimatedOnScroll>
              <AnimatedOnScroll delay={0.4} duration={0.8}>
            <p className="mt-1 md:mt-2 text-lg md:text-xl lg:text-1xl text-justify">
                  Akses psikotes online yang membantu kamu mengenal diri lebih dalam, mengeksplorasi minat, bakat, dan potensi tersembunyi. Cocok untuk persiapan karier, menentukan jalur pendidikan, atau pengembangan diri secara personal.
                </p>
              </AnimatedOnScroll>
            </div>

            {/* Gambar kanan */}
            <div className="flex-1 flex justify-center lg:justify-end">
              <Image
                src="/hero1.png"
                alt="Hero Right"
                width={400}
                height={300}
                className="object-contain max-h-[300px] w-auto rounded-xl lg:mr-5"
                priority
              />
            </div>
          </div>
        </AnimatedOnScroll>
      </div>
    </section>
  );
}

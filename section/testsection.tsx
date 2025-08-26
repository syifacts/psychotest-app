"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import AnimatedOnScroll from "../components/ui/animatedonscroll";

type Test = {
  id: number;
  title: string;
  description: string;
  image: string;
};

const tests: Test[] = [
  { id: 1, title: "Tes IST", description: "Ukur inteligensi umum dan kemampuan logika-matematika melalui IST.", image: "/ist.jpeg" },
  { id: 2, title: "Tes MBTI", description: "Kenali tipe kepribadian, preferensi, dan gaya berpikirmu melalui MBTI.", image: "/mbti.jpg" },
  { id: 3, title: "Tes TIU", description: "Ukur kemampuan verbal, numerik, dan figuratifmu melalui TIU.", image: "/tiu.jpg" },
  { id: 4, title: "EPPS", description: "Kenali motivasi dan preferensi psikologismu untuk karier yang tepat.", image: "/epps.png" },
  { id: 5, title: "MMPI", description: "Ukur aspek kepribadian dan kesehatan mental melalui MMPI.", image: "/mmpi.jpg" },
  { id: 6, title: "Tes Kraepelin", description: "Ukur ketahanan kerja, konsentrasi, dan kecepatan berpikir melalui Kraepelin.", image: "/kraepelin.jpg" },
  { id: 7, title: "Tes Holland", description: "Kenali minat dan tipe pekerjaan yang cocok melalui Tes Holland.", image: "/holland.jpg" },
  { id: 8, title: "Tes DISC", description: "Ukur gaya perilaku dan komunikasi melalui Tes DISC.", image: "/disc.jpg" },
];

export default function TestSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll horizontal
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let scrollAmount = 0;
    const maxScroll = container.scrollWidth - container.clientWidth;

    const interval = setInterval(() => {
      scrollAmount += 1;
      if (scrollAmount > maxScroll) scrollAmount = 0;
      container.scrollTo({ left: scrollAmount, behavior: "smooth" });
    }, 20);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full px-4 sm:px-6 py-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <AnimatedOnScroll delay={0.2} duration={0.8}>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center mb-4">
            Jenis Tes yang Tersedia
          </h2>
          <p className="text-gray-700 text-lg md:text-xl text-center mb-12">
            Pilih tes yang sesuai untuk mengukur potensi dan kemampuanmu
          </p>
        </AnimatedOnScroll>

        {/* Container scroll horizontal dengan semua tes */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 scroll-smooth hide-scrollbar"
        >
          {tests.map((test, idx) => (
            <AnimatedOnScroll key={test.id} delay={0.3 + idx * 0.1} duration={0.8}>
              <div className="flex-none w-64 bg-blue-50 rounded-2xl p-6 flex flex-col items-center text-center hover:scale-105 transition-transform shadow-md relative group">
                
                <div className="w-28 h-28 mb-4 relative rounded-full overflow-hidden shadow-lg ring-2 ring-blue-200 group-hover:ring-blue-400 transition-all duration-300">
                  <Image
                    src={test.image}
                    alt={test.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-200/40 to-transparent rounded-full pointer-events-none group-hover:opacity-80 transition-opacity duration-300"></div>
                </div>

                <h3 className="text-xl font-semibold mb-2">{test.title}</h3>
                <p className="text-gray-600">{test.description}</p>
              </div>
            </AnimatedOnScroll>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
          >
            Lihat Semua Tes
          </Link>
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}

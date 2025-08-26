"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import AnimatedOnScroll from "../components/ui/animatedonscroll"; // ✅ pakai file yang sudah ada

const features = [
  {
    icon: "/connection.png",
    title: "Tes Online Interaktif",
    desc: "Bisa dikerjakan kapan saja dan di mana saja.",
  },
  {
    icon: "/online-test.png",
    title: "Beragam Jenis Tes",
    desc: "IST, MBTI, DISC, Big Five, Wartegg, Pauli, dan lainnya.",
  },
  {
    icon: "/report.png",
    title: "Hasil Instan & Akurat",
    desc: "Laporan otomatis langsung muncul, divalidasi oleh profesional.",
  },
];

export default function AboutSection() {
  return (
    <section className="py-16 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto text-center">
        {/* Judul */}
        <AnimatedOnScroll delay={0.1}>
          <h2 className="font-poppins text-xl md:text-2xl lg:text-3xl font-bold leading-tight">
            🧠 Eksplorasi Bersama Kami
          </h2>
        </AnimatedOnScroll>

        {/* Paragraf */}
        <AnimatedOnScroll delay={0.2}>
          <p className="mt-6 md:mt-7 text-lg md:text-xl lg:text-1xl text-center max-w-2xl mx-auto mb-15">
            Temukan cara baru untuk memahami potensi diri melalui layanan psikotes
            modern yang mudah diakses dan dirancang untuk kebutuhanmu.
          </p>
        </AnimatedOnScroll>

        {/* Grid Card */}
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((item, i) => (
            <AnimatedOnScroll key={i} delay={0.3 + i * 0.2}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="font-poppins bg-white rounded-2xl shadow-md p-6 text-center flex flex-col items-center"
              >
                {/* Icon dengan animasi hover */}
                <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.3 }}>
                  <Image
                    src={item.icon}
                    alt={item.title}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-contain"
                  />
                </motion.div>

                <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                <p className="text-gray-600 mt-2">{item.desc}</p>
              </motion.div>
            </AnimatedOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

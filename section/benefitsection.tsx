import React from "react";
import Image from "next/image";
import AnimatedOnScroll from "../components/ui/animatedonscroll";

export default function BenefitSection() {
  return (
    <section className="relative w-full px-4 sm:px-6 py-20 bg-gradient-to-br from-blue-50 to-white overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-16 left-10 w-40 h-40 border-2 border-blue-300 rounded-full animate-pulse"></div>
        <div className="absolute top-44 right-24 w-28 h-28 border-2 border-purple-300 rounded-full animate-ping"></div>
        <div className="absolute bottom-24 left-16 w-20 h-20 border-2 border-green-300 rounded-full animate-pulse"></div>
        <div className="absolute bottom-40 right-12 w-32 h-32 border-2 border-orange-300 rounded-full animate-ping"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <AnimatedOnScroll delay={0.2} duration={0.8}>
          <div className="flex flex-col lg:flex-row items-center gap-20">

            {/* Teks kanan */}
            <div className="flex-1 flex flex-col gap-8 text-center lg:text-left">
              <AnimatedOnScroll delay={0.3} duration={0.8}>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-poppins text-gray-900 leading-tight">
                  Mengapa <span className="text-blue-600">Mengikuti Psikotes Online?</span>
                </h2>
              </AnimatedOnScroll>

              <AnimatedOnScroll delay={0.4} duration={0.8}>
                <p className="font-poppins text-lg md:text-xl text-gray-700 leading-relaxed max-w-xl">
                  Psikotes online ini dirancang untuk membantumu <span className="font-semibold text-blue-600">memahami diri</span>, memaksimalkan potensi, dan mempersiapkan masa depan dengan tepat.
                </p>
              </AnimatedOnScroll>

              <AnimatedOnScroll delay={0.5} duration={0.8}>
  <ul className="font-poppins flex flex-col gap-4 text-gray-800 font-medium text-xl md:text-1xl">
    <li>• Gali bakat dan minat unikmu</li>
    <li>• Kenali potensi tersembunyi</li>
    <li>• Rencanakan masa depanmu dengan tepat</li>
  </ul>
</AnimatedOnScroll>


              <AnimatedOnScroll delay={0.6} duration={0.8}>
                <button className="font-poppins mt-6 px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                  Mulai Psikotes Sekarang
                </button>
              </AnimatedOnScroll>
            </div>

            {/* Right Illustration with larger image + animated floating elements */}
            <div className="flex-1 relative overflow-visible">
              <AnimatedOnScroll delay={0.6} duration={0.8}>
                <div className="relative w-full max-w-3xl lg:max-w-none">
                  {/* Main Image */}
                  <div className="relative z-10 animate-bounce-slower lg:translate-x-1/4">
                    <Image
                      src="/animasi2.gif"
                      alt="Manfaat Psikotes"
                      width={1000}
                      height={800}
                      className="object-contain w-full rounded-2xl"
                      priority
                      unoptimized
                    />
                  </div>
                    <div className="absolute top-0 left-0 w-32 h-32 bg-blue-200/40 rounded-full animate-ping"></div>
                  {/* Floating elements: stars */}
                  <div className="absolute top-8 left-1/2 w-4 h-4 bg-yellow-300 rounded-full animate-pulse"></div>
                  <div className="absolute top-20 right-1/4 w-3 h-3 bg-white rounded-full animate-fade-in-out"></div>
                  <div className="absolute bottom-32 left-1/3 w-2 h-2 bg-yellow-200 rounded-full animate-scale-pulse"></div>

                  {/* Floating elements: polygon / triangle */}
                  <div className="absolute top-0 right-16 w-8 h-8 border-l-4 border-t-4 border-blue-400/50 rotate-45"></div>
                  <div className="absolute bottom-16 left-12 w-10 h-10 border-b-4 border-r-4 border-purple-400/40 rotate-12"></div>

                  {/* Floating elements: mini icons */}
                  <div className="absolute top-12 right-24 w-10 h-10">
                    <Image src="/light-bulb.png" alt="Ide" width={40} height={40} className="animate-bounce-slower"/>
                  </div>
                  <div className="absolute bottom-24 left-20 w-8 h-8">
                    <Image src="/search.png" alt="Check" width={32} height={32} className="animate-wave"/>
                  </div>

                  {/* Floating elements: curved lines / swoosh */}
                  <svg className="absolute top-0 right-0 w-48 h-48">
                    <path d="M0,40 C40,0 80,80 120,40" stroke="rgba(255, 100, 100, 0.3)" strokeWidth="3" fill="none" />
                  </svg>
                </div>
              </AnimatedOnScroll>
            </div>

          </div>
        </AnimatedOnScroll>
      </div>
    </section>
  );
}

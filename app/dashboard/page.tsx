'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AnimatedOnScroll from '@/components/ui/animatedonscroll';
import { useSearchParams } from "next/navigation";
import { LayoutGrid, Rows, Layout } from "lucide-react"; // ikon lucide-react
   import { motion } from "framer-motion";


interface TestType {
  id: number;
  name: string;
  desc: string;
  price: string | number;
  img: string;
  badge?: string;
}

const formatPrice = (price: string | number) => {
  if (typeof price === 'number') {
    return `Rp${price.toLocaleString('id-ID')}`;
  }
  return price;
};

export default function DashboardPage() {
  const [tests, setTests] = useState<TestType[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'grid' | 'masonry'>('grid');
  const [sortOption, setSortOption] = useState("Harga Terendah");

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";

  const filteredTests = tests
    .filter(t => t.name.toLowerCase().includes(searchQuery))
    .sort((a, b) => {
      if (a.id === 30) return -1;
      if (b.id === 30) return 1;

      const priceA = typeof a.price === "string" ? parseFloat(a.price.replace(/[^\d]/g, "")) : a.price;
      const priceB = typeof b.price === "string" ? parseFloat(b.price.replace(/[^\d]/g, "")) : b.price;

      if (sortOption === "Harga Terendah") return priceA - priceB;
      if (sortOption === "Harga Tertinggi") return priceB - priceA;
      if (sortOption === "Nama A-Z") return a.name.localeCompare(b.name);
      if (sortOption === "Nama Z-A") return b.name.localeCompare(a.name);

      return 0;
    });
    const quotes = [
  "Kenali dirimu, maka kamu akan tahu arah terbaik untuk berkembang.",
  "Setiap tes adalah langkah kecil menuju versi terbaik dirimu.",
  "Psikologi bukan tentang kelemahan, tapi tentang potensi."
];

const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];


  useEffect(() => {
    async function fetchTests() {
      try {
        const res = await fetch('/api/testtypes');
        const data: TestType[] = await res.json();
        setTests(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchTests();
  }, []);

  if (loading) return <p className="text-center mt-8">Loading...</p>;

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8">

{/* Header */}
<motion.div 
  className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
  initial={{ opacity: 0, y: -30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
>
  <div>
 <h1 className="text-4xl font-extrabold animate-gradient-text animate-gradient-hover">
  ✨ Daftar Tes Psikologi
</h1>

    <motion.p 
      className="text-gray-600 mt-2 text-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      Pilih tes sesuai kebutuhanmu untuk berkembang lebih baik
    </motion.p>

    <motion.span 
      className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-full"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
    >
      🎯 {tests.length} Tes tersedia
    </motion.span>

    <motion.blockquote 
      className="mt-4 italic text-blue-800 text-lg border-l-4 border-blue-400 pl-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8 }}
    >
      "{randomQuote}"
    </motion.blockquote>

    <motion.div 
      className="mt-4 flex flex-wrap gap-2"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
    >
      {[
        { text: "✅ Hasil Akurat", color: "bg-green-100 text-green-700" },
        { text: "🕒 Cepat", color: "bg-purple-100 text-purple-700" },
        { text: "👩‍⚕️ Psikolog Profesional", color: "bg-blue-100 text-blue-700" },
        { text: "🔒 Data Aman", color: "bg-pink-100 text-pink-700" }
      ].map((badge, i) => (
        <motion.span
          key={i}
          className={`px-3 py-1 rounded-full text-sm ${badge.color}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 + i * 0.15 }}
        >
          {badge.text}
        </motion.span>
      ))}
    </motion.div>
  </div>

  {/* Right section */}
  <motion.div 
    className="flex flex-col sm:flex-row gap-3 items-center"
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.6 }}
  >
    {/* Sort */}
    <select
      value={sortOption}
      onChange={(e) => setSortOption(e.target.value)}
      className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 shadow-sm"
    >
      <option>Harga Terendah</option>
      <option>Harga Tertinggi</option>
      <option>Nama A-Z</option>
      <option>Nama Z-A</option>
    </select>

    {/* Toggle view */}
    <div className="flex items-center gap-2">
      <button 
        onClick={() => setView('list')}
        className={`p-2 rounded-lg transition-colors duration-300 ${
          view==='list' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border'
        }`}
      >
        <Rows size={20}/>
      </button>
      <button 
        onClick={() => setView('grid')}
        className={`p-2 rounded-lg transition-colors duration-300 ${
          view==='grid' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border'
        }`}
      >
        <LayoutGrid size={20}/>
      </button>
      {/* <button 
        onClick={() => setView('masonry')}
        className={`p-2 rounded-lg transition-colors duration-300 ${
          view==='masonry' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border'
        }`}
      >
        <Layout size={20}/>
      </button> */}
    </div>
  </motion.div>
</motion.div>

        {/* Content */}
        {view === 'list' && (
          <div className="space-y-5">
            {filteredTests.map((test, index) => (
              <AnimatedOnScroll key={index} delay={0.05 * index} duration={0.6}>
                <Link href={`/tes/${test.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="flex bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden hover:scale-[1.01]"
                >
                  <div className="relative w-48 h-32 flex-shrink-0">
                    <Image src={test.img || "/fallback.jpg"} alt={test.name} fill className="object-cover"/>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <h3 className="text-lg font-bold text-gray-900">{test.name}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{test.desc}</p>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-blue-600 font-extrabold">{formatPrice(test.price)}</p>
                      <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold">Lihat Detail</span>
                    </div>
                  </div>
                </Link>
              </AnimatedOnScroll>
            ))}
          </div>
        )}

      {view === 'grid' && (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
    {filteredTests.map((test, index) => (
      <AnimatedOnScroll key={index} delay={0.05 * index} duration={0.6}>
        <Link
          href={`/tes/${test.name.toLowerCase().replace(/\s+/g, '-')}`}
          className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition flex flex-col hover:scale-[1.02]"
        >
          <div className="relative w-full h-48">
            <Image
              src={test.img || "/fallback.jpg"}
              alt={test.name}
              fill
              className="object-cover"
            />
            {/* Title on image */}
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
<h3 className="absolute bottom-3 left-3 text-xl font-bold text-white drop-shadow-md">
  {test.name}
</h3>

          </div>
          <div className="p-5 flex flex-col flex-1 justify-between">
            <p className="text-sm text-gray-600 mb-2 line-clamp-3">{test.desc}</p>
            <div className="mt-auto flex items-center justify-between">
              <p className="text-xl text-blue-600 font-extrabold">{formatPrice(test.price)}</p>
              <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold">Lihat Detail</span>
            </div>
          </div>
        </Link>
      </AnimatedOnScroll>
    ))}
  </div>
)}

        {/* {view === 'masonry' && (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredTests.map((test, index) => (
              <AnimatedOnScroll key={index} delay={0.05 * index} duration={0.6}>
                <Link href={`/tes/${test.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="block bg-white rounded-xl shadow-md hover:shadow-lg transition hover:scale-[1.01] break-inside-avoid"
                >
                  <div className="relative w-full h-48">
                    <Image src={test.img || "/fallback.jpg"} alt={test.name} fill className="object-cover rounded-t-xl"/>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900">{test.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{test.desc}</p>
                    <p className="mt-2 text-blue-600 font-extrabold">{formatPrice(test.price)}</p>
                  </div>
                </Link>
              </AnimatedOnScroll>
            ))}
          </div>
        )} */}
      </div>
    </main>
  );
}

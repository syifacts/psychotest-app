'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/layout/footer';
import AnimatedOnScroll from '@/components/ui/animatedonscroll';

interface TestType {
  name: string;
  desc: string;
  price: string | number;
  img: string;
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
    <main className="flex flex-col min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">
          Daftar Tes Psikologi
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {tests.map((test, index) => (
            <AnimatedOnScroll key={index} delay={0.1 * index} duration={0.8}>
              <Link 
                href={`/tes/${test.name.toLowerCase().replace(/\s+/g, '-')}`} 
                className="group flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
                <div className="relative w-full aspect-video">
                  <Image
                    src={test.img}
                    alt={`Thumbnail ${test.name}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="flex flex-col p-4 flex-grow">
                  <h3 className="text-md font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                    {test.name}
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    {test.desc}
                  </p>
                  
                  <div className="mt-auto pt-4">
                    <p className="text-lg font-bold text-gray-900">
                      {formatPrice(test.price)}
                    </p>
                  </div>
                </div>
              </Link>
            </AnimatedOnScroll>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}

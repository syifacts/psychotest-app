// app/dashboard/page.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

const psychologicalTests = [
  {
    name: 'Tes IST',
    description: 'Mengukur 9 kemampuan dasar dalam struktur kecerdasan.',
    price: 'Gratis',
    image: '/ist.jpeg',
    slug: 'ist',
  },
  {
    name: 'Tes EPPS',
    description: 'Mengungkap 15 kebutuhan dan motivasi personal.',
    price: 'Gratis',
    image: '/epps.png',
    slug: 'epps',
  },
  {
    name: 'Tes MMPI',
    description: 'Mengevaluasi profil kepribadian dan potensi psikopatologi.',
    price: 'Gratis',
    image: '/mmpi.jpg',
    slug: 'mmpi',
  },
  {
    name: 'Tes Kraepelin',
    description: 'Mengukur kecepatan, konsistensi, dan ketahanan kerja.',
    price: 'Gratis',
    image: '/kraepelin.jpg',
    slug: 'kraepelin',
  },
  {
    name: 'Tes 16PF',
    description: 'Memetakan 16 faktor utama dari kepribadian normal.',
    price: 'Gratis',
    image: '/16pf.jpg',
    slug: '16pf',
  },
  {
    name: 'Tes Army Alpha',
    description: 'Tes inteligensi verbal dan numerik format kelompok.',
    price: 'Gratis',
    image: '/armyalpha.jpg',
    slug: 'army-alpha',
  },
  {
    name: 'Tes Big Five',
    description: 'Mengukur 5 dimensi utama kepribadian (OCEAN).',
    price: 'Gratis',
    image: '/bigfive.jpg',
    slug: 'big-five',
  },
  {
    name: 'Tes Holland',
    description: 'Menentukan minat karir berdasarkan 6 tipe kepribadian.',
    price: 'Gratis',
    image: '/holland.jpg',
    slug: 'holland',
  },
  {
    name: 'Tes DISC',
    description: 'Menganalisis 4 tipe perilaku: Dominance, Influence, Steadiness, Conscientiousness.',
    price: 'Gratis',
    image: '/disc.jpg',
    slug: 'disc',
  },
  {
    name: 'Tes MBTI',
    description: 'Mengklasifikasikan kepribadian ke dalam 16 tipe berbeda.',
    price: 'Gratis',
    image: '/mbti.jpg',
    slug: 'mbti',
  },
  {
    name: 'Tes Wartegg',
    description: 'Mengungkap kepribadian melalui interpretasi 8 gambar.',
    price: 'Gratis',
    image: '/images/tes/wartegg.png',
    slug: 'wartegg',
  },
  {
    name: 'Tes Pauli',
    description: 'Mengukur daya tahan dan stabilitas performa kerja.',
    price: 'Gratis',
    image: '/images/tes/pauli.png',
    slug: 'pauli',
  },
  {
    name: 'Tes EQ',
    description: 'Mengukur tingkat kecerdasan emosional seseorang.',
    price: 'Gratis',
    image: '/images/tes/eq.png',
    slug: 'eq',
  },
];

const formatPrice = (price: string | number) => {
  if (typeof price === 'number') {
    return `Rp${price.toLocaleString('id-ID')}`;
  }
  return price;
};

export default function DashboardPage() {
  return (
    <main className="flex flex-col min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">
          Daftar Tes Psikologi
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {psychologicalTests.map((test, index) => (
            <Link 
              href={`/tes/${test.slug}`} 
              key={index} 
              className="group flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden"
            >
              <div className="relative w-full aspect-video">
                <Image
                  src={test.image}
                  alt={`Thumbnail ${test.name}`}
                  layout="fill"
                  objectFit="cover"
                  className="group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="flex flex-col p-4 flex-grow">
                <h3 className="text-md font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                  {test.name}
                </h3>
    
                <p className="text-xs text-gray-500 mt-1">
                  {test.description}
                </p>
                
                <div className="mt-auto pt-4">
                  <p className="text-lg font-bold text-gray-900">
                    {formatPrice(test.price)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
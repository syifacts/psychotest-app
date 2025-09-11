import AboutSection from '@/section/aboutsection';
import Navbar from '../components/layout/navbar';
import HeroSection from "../section/herosection";
import BenefitSection from '@/section/benefitsection';
import TestSection from '@/section/testsection';
//import Footer from '@/components/layout/footer';

export default function Page() {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <AboutSection />
      <BenefitSection />
      <TestSection />
     {/*  <Footer /> */}
      {/* Konten landing page lainnya */}
    </div>
  );
}

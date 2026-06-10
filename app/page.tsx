import AboutSection from '@/section/aboutsection';
import Navbar from '../components/layout/navbar';
import HeroSection from "../section/herosection";
import BenefitSection from '@/section/benefitsection';
import TestSection from '@/section/testsection';
import Footer from '@/components/layout/footer';
import FloatingVerifyButton from "@/components/common/FloatingVerifyButton";


export default function Page() {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <AboutSection />
      <BenefitSection />
      <TestSection />
      <FloatingVerifyButton />
       <Footer /> 
      {/* Konten landing page lainnya */}
    </div>
  );
}

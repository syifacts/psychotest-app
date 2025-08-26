import AboutSection from '@/section/aboutsection';
import Navbar from '../components/layout/navbar';
import HeroSection from "../section/herosection";

export default function Page() {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <AboutSection />
      {/* Konten landing page lainnya */}
    </div>
  );
}

import Navbar from '../../components/layout/navbar';
import Footer from '@/components/layout/footer';
import FloatingVerifyButton from "@/components/common/FloatingVerifyButton";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    // Jika children belum siap, jangan render layout penuh
  if (!children) {
    return null; // atau tampilkan skeleton di sini kalau mau
  }

  return (
    <div>
      <Navbar />
      <main>{children}</main> 
            <FloatingVerifyButton />
      <Footer />
    </div>
  );
}

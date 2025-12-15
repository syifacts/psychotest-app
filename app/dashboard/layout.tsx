import Navbar from '../../components/layout/navbar';
import Footer from '@/components/layout/footer';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    // Jika children belum siap, jangan render layout penuh
  if (!children) {
    return null; // atau tampilkan skeleton di sini kalau mau
  }

  return (
    <div>
      <Navbar />
      <main>{children}</main> 
      <Footer />
    </div>
  );
}

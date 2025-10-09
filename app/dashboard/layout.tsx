import Navbar from '../../components/layout/navbar';
import Footer from '@/components/layout/footer';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      <main>{children}</main> 
      <Footer />
    </div>
  );
}

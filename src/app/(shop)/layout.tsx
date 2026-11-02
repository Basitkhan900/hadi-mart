import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pb-24 md:pb-10">{children}</main>
      <Footer />
    </>
  );
}


import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CatalogProvider from "@/components/CatalogProvider";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Syncs the product catalog from the server API into the Zustand store.
          This ensures all devices (not just the dev machine) see products. */}
      <CatalogProvider />
      <Navbar />
      <main className="min-h-screen pb-24 md:pb-10">{children}</main>
      <Footer />
    </>
  );
}


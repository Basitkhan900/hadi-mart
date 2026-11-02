import type { Metadata } from "next";
import "./globals.css";
import CartDrawer from "@/components/CartDrawer";

export const metadata: Metadata = {
  title: { default: "Hadi Mart", template: "%s | Hadi Mart" },
  description: "Har Cheez, Aap Ke Darwaze Tak — Pakistan's favourite online store",
  keywords: ["shopping", "pakistan", "ecommerce", "fashion", "electronics", "hadi mart"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-paper text-ink">
        {children}
        <CartDrawer />
      </body>
    </html>
  );
}

import Link from "next/link";
import { Leaf, ShieldCheck, Truck, Heart } from "lucide-react";

export default function AboutPage() {
  const values = [
    {
      icon: <Leaf size={28} className="text-[#2A4434]" />,
      title: "Natural & Organic",
      desc: "We source only the finest natural and organic products to ensure quality you can trust.",
    },
    {
      icon: <ShieldCheck size={28} className="text-[#2A4434]" />,
      title: "Quality Assured",
      desc: "Every product on Hadi Mart goes through strict quality checks before reaching your door.",
    },
    {
      icon: <Truck size={28} className="text-[#2A4434]" />,
      title: "Fast Delivery",
      desc: "Same-day and next-day delivery available across major cities in Pakistan.",
    },
    {
      icon: <Heart size={28} className="text-[#2A4434]" />,
      title: "Customer First",
      desc: "Your satisfaction is our priority. Easy returns, friendly support — always.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F7F4EE] dark:bg-[#111916]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#2A4434] py-20 px-6 text-center">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <svg viewBox="0 0 800 300" className="w-full h-full" fill="none">
            <circle cx="100" cy="50" r="120" fill="#A4B896" />
            <circle cx="700" cy="250" r="150" fill="#A4B896" />
          </svg>
        </div>
        <div className="relative mx-auto max-w-2xl">
          <span className="text-5xl">🌿</span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            About Hadi Mart
          </h1>
          <p className="mt-4 text-lg text-[#C5D9BE] leading-relaxed">
            Your trusted one-stop marketplace for electronics, fashion, home décor, sports,
            beauty & more — delivered right to your doorstep across Pakistan.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-3xl bg-white dark:bg-[#1A2620] shadow-sm p-8 sm:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1E3926] dark:text-[#E2EFE7] mb-6">
            Our Story
          </h2>
          <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-base sm:text-lg mb-4">
            Hadi Mart was founded with a simple vision: to bring premium quality products from
            every category — electronics, beauty, home décor, sports gear, fashion & groceries —
            under one roof, at prices every Pakistani family can afford.
          </p>
          <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-base sm:text-lg">
            We believe shopping should be easy, trustworthy, and enjoyable. That&apos;s why we
            carefully curate every product, partner with verified sellers, and invest in a
            seamless delivery experience from Karachi to Lahore, Islamabad to Peshawar.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-[#1E3926] dark:text-[#E2EFE7] mb-10">
          Why Choose Hadi Mart?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v) => (
            <div
              key={v.title}
              className="rounded-2xl bg-white dark:bg-[#1A2620] shadow-sm p-6 flex flex-col items-center text-center gap-3 hover:shadow-md transition"
            >
              <div className="rounded-full bg-[#EAF0E7] dark:bg-[#253320] p-4">{v.icon}</div>
              <h3 className="font-bold text-[#1E3926] dark:text-[#E2EFE7]">{v.title}</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#9AB391] dark:bg-[#1F3324] py-12 text-center">
        <h2 className="text-2xl font-bold text-[#1E3926] dark:text-white mb-4">
          Ready to explore?
        </h2>
        <Link
          href="/shop"
          className="inline-block rounded-full bg-[#2A4434] text-white px-8 py-3 font-semibold text-sm hover:bg-[#1B3025] transition"
        >
          Shop Now →
        </Link>
      </section>
    </main>
  );
}


"use client";
import Link from "next/link";
import { Leaf, ShieldCheck, Truck, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
  const values = [
    {
      icon: <Leaf size={28} className="text-[#2A4434] dark:text-[#A4B896]" />,
      title: "Natural & Organic",
      desc: "We source only the finest natural and organic products to ensure quality you can trust.",
    },
    {
      icon: <ShieldCheck size={28} className="text-[#2A4434] dark:text-[#A4B896]" />,
      title: "Quality Assured",
      desc: "Every product on Hadi Mart goes through strict quality checks before reaching your door.",
    },
    {
      icon: <Truck size={28} className="text-[#2A4434] dark:text-[#A4B896]" />,
      title: "Fast Delivery",
      desc: "Same-day and next-day delivery available across major cities in Pakistan.",
    },
    {
      icon: <Heart size={28} className="text-[#2A4434] dark:text-[#A4B896]" />,
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
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="relative mx-auto max-w-2xl"
        >
          <motion.span
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="text-5xl inline-block"
          >
            🌿
          </motion.span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-serif">
            About Hadi Mart
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#C5D9BE] leading-relaxed">
            Your trusted one-stop marketplace for electronics, fashion, home décor, sports,
            beauty &amp; more — delivered right to your doorstep across Pakistan.
          </p>
        </motion.div>
      </section>

      {/* Our Story */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-white dark:bg-[#1A2620] shadow-sm p-8 sm:p-12 border border-stone-200/80 dark:border-stone-800"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1E3926] dark:text-[#E2EFE7] mb-6 font-serif">
            Our Story
          </h2>
          <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-base sm:text-lg mb-4">
            Hadi Mart was founded with a simple vision: to bring premium quality products from
            every category — electronics, beauty, home décor, sports gear, fashion &amp; groceries —
            under one roof, at prices every Pakistani family can afford.
          </p>
          <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-base sm:text-lg">
            We believe shopping should be easy, trustworthy, and enjoyable. That&apos;s why we
            carefully curate every product, partner with verified sellers, and invest in a
            seamless delivery experience from Karachi to Lahore, Islamabad to Peshawar.
          </p>
        </motion.div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-[#1E3926] dark:text-[#E2EFE7] mb-10 font-serif">
          Why Choose Hadi Mart?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="rounded-2xl bg-white dark:bg-[#1A2620] shadow-sm p-6 flex flex-col items-center text-center gap-3 border border-stone-200/80 dark:border-stone-800 hover:shadow-lg transition-shadow"
            >
              <div className="rounded-full bg-[#EAF0E7] dark:bg-[#253320] p-4">{v.icon}</div>
              <h3 className="font-bold text-[#1E3926] dark:text-[#E2EFE7]">{v.title}</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#9AB391] dark:bg-[#1F3324] py-14 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1E3926] dark:text-white mb-4 font-serif">
            Ready to explore?
          </h2>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
            <Link
              href="/shop"
              className="inline-block rounded-full bg-[#2A4434] text-white px-9 py-3.5 font-semibold text-sm hover:bg-[#1B3025] shadow-md transition"
            >
              Shop Now →
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}

"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { categories } from "@/lib/db";
import { useCatalog } from "@/lib/store";
import { Sparkles, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NewArrivalsPage() {
  const products = useCatalog((s) => s.products);
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [sort, setSort] = useState<"newest" | "popular" | "price-asc" | "price-desc">("newest");

  const newProducts = useMemo(() => {
    let list = [...products];
    if (selectedCat) {
      list = list.filter((p) => p.categoryId === selectedCat);
    }
    switch (sort) {
      case "newest":
        list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        break;
      case "popular":
        list.sort((a, b) => b.sold - a.sold);
        break;
      case "price-asc":
        list.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
        break;
      case "price-desc":
        list.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
        break;
    }
    return list;
  }, [products, selectedCat, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 space-y-8">
      {/* Breadcrumb & Top Bar */}
      <div className="flex items-center justify-between">
        <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 shadow-xs hover:bg-stone-50 dark:border-stone-800 dark:bg-[#152019] dark:text-stone-300 transition"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </motion.div>
        <span className="text-xs text-stone-500 font-medium">Just Landed in Store</span>
      </div>

      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="rounded-3xl border border-[#D5E1CD] bg-gradient-to-r from-[#EAF0E6] via-[#F4F8F1] to-[#E5ECE0] p-6 sm:p-10 text-stone-900 shadow-xs dark:border-stone-800 dark:from-[#152319] dark:to-[#1A2C20] dark:text-white"
      >
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#2A4434] px-3 py-1 text-xs font-bold text-white dark:bg-[#A4B896] dark:text-[#121915]">
            <Sparkles size={13} /> The Latest Drops
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-tight text-[#233B2E] dark:text-[#D4E7DC]">
            New Arrivals
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            Discover our freshest additions, newly uploaded luxury goods, and trending arrivals curated for you.
          </p>
        </div>
      </motion.div>

      {/* Category Filter & Sorting */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4 dark:border-stone-800">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCat("")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
              !selectedCat
                ? "bg-[#2A4434] text-white dark:bg-[#A4B896] dark:text-[#121915]"
                : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 dark:border-stone-800 dark:bg-[#141E18] dark:text-stone-300"
            }`}
          >
            All New Arrivals ({products.length})
          </button>
          {categories.map((c) => {
            const count = products.filter((p) => p.categoryId === c.id).length;
            if (count === 0) return null;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCat(c.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  selectedCat === c.id
                    ? "bg-[#2A4434] text-white dark:bg-[#A4B896] dark:text-[#121915]"
                    : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 dark:border-stone-800 dark:bg-[#141E18] dark:text-stone-300"
                }`}
              >
                <span>{c.icon}</span> {c.name} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-xs font-medium">
          <span className="text-stone-400">Sort By:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold outline-none dark:border-stone-700 dark:bg-[#141E18] dark:text-stone-200 cursor-pointer"
          >
            <option value="newest">Latest Uploaded</option>
            <option value="popular">Most Popular</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {newProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-stone-200 p-12 text-center text-stone-500 dark:border-stone-800 dark:bg-[#141E18]"
        >
          <Sparkles size={40} className="mx-auto mb-3 opacity-30 text-[#2A4434] dark:text-[#A4B896]" />
          <h3 className="font-bold text-base text-stone-800 dark:text-stone-200">Catalog is Empty</h3>
          <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
            Upload new products from the Admin Dashboard to have them appear here automatically.
          </p>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          <AnimatePresence>
            {newProducts.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

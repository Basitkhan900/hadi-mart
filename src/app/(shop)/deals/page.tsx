"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { categories } from "@/lib/db";
import { useCatalog } from "@/lib/store";
import { Zap, ArrowLeft, SlidersHorizontal, Sparkles } from "lucide-react";

function Countdown() {
  const [t, setT] = useState(5 * 3600 + 42 * 60 + 18);
  useEffect(() => {
    const i = setInterval(() => setT((x) => (x > 0 ? x - 1 : 0)), 1000);
    return () => clearInterval(i);
  }, []);
  const f = (n: number) => String(n).padStart(2, "0");
  const segments = [
    { label: "Hours", val: Math.floor(t / 3600) },
    { label: "Mins", val: Math.floor((t % 3600) / 60) },
    { label: "Secs", val: t % 60 },
  ];
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {segments.map((s, i) => (
        <span key={s.label} className="flex items-center gap-1.5 sm:gap-2">
          {i > 0 && <span className="font-bold text-[#EAD098]">:</span>}
          <span className="flex flex-col items-center">
            <span className="tabular-nums rounded-lg bg-[#2A4434] px-2.5 py-1 text-xs sm:text-sm font-bold text-white border border-[#EAD098]/30">
              {f(s.val)}
            </span>
            <span className="mt-0.5 text-[8px] sm:text-[9px] uppercase tracking-wider text-stone-300">
              {s.label}
            </span>
          </span>
        </span>
      ))}
    </div>
  );
}

export default function DealsPage() {
  const products = useCatalog((s) => s.products);
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [sort, setSort] = useState<"discount" | "price-asc" | "price-desc">("discount");

  const deals = useMemo(() => {
    let list = products.filter((p) => p.salePrice && p.salePrice < p.price);
    if (selectedCat) {
      list = list.filter((p) => p.categoryId === selectedCat);
    }
    switch (sort) {
      case "discount":
        list.sort((a, b) => {
          const discA = a.salePrice ? (a.price - a.salePrice) / a.price : 0;
          const discB = b.salePrice ? (b.price - b.salePrice) / b.price : 0;
          return discB - discA;
        });
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
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 shadow-xs hover:bg-stone-50 dark:border-stone-800 dark:bg-[#152019] dark:text-stone-300 transition"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>
        <span className="text-xs text-stone-500 font-medium">Limited Time Promotions</span>
      </div>

      {/* Banner */}
      <div className="rounded-3xl border border-[#D5E1CD] bg-gradient-to-r from-[#243528] via-[#2F4634] to-[#1E3022] p-6 sm:p-10 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#EAD098]/20 px-3 py-1 text-xs font-bold text-[#EAD098] border border-[#EAD098]/30">
              <Zap size={14} /> Exclusive Offers
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-tight text-[#EAD098]">
              Flash Deals &amp; Discounts
            </h1>
            <p className="text-xs sm:text-sm text-stone-200">
              Save big on premium curated essentials, lifestyle items, and seasonal favorites. While supplies last.
            </p>
          </div>

          <div className="rounded-2xl bg-black/30 backdrop-blur-xs p-4 sm:p-5 border border-white/10 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#EAD098]">Promotion Ends In</p>
            <Countdown />
          </div>
        </div>
      </div>

      {/* Filter & Sorting Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4 dark:border-stone-800">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCat("")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              !selectedCat
                ? "bg-[#2A4434] text-white dark:bg-[#A4B896] dark:text-[#121915]"
                : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 dark:border-stone-800 dark:bg-[#141E18] dark:text-stone-300"
            }`}
          >
            All Deals ({products.filter((p) => p.salePrice).length})
          </button>
          {categories.map((c) => {
            const count = products.filter((p) => p.salePrice && p.categoryId === c.id).length;
            if (count === 0) return null;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCat(c.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 ${
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
            <option value="discount">Biggest Discount %</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Deals Products Grid */}
      {deals.length === 0 ? (
        <div className="rounded-3xl border border-stone-200 p-12 text-center text-stone-500 dark:border-stone-800 dark:bg-[#141E18]">
          <Zap size={40} className="mx-auto mb-3 opacity-30 text-amber-500" />
          <h3 className="font-bold text-base text-stone-800 dark:text-stone-200">No Flash Deals at this Moment</h3>
          <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
            You can add sale prices to products from the Admin Dashboard, or explore our full catalog.
          </p>
          <Link
            href="/shop"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#2A4434] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#1C2F24] transition dark:bg-[#A4B896] dark:text-[#0f1a17]"
          >
            Explore Complete Shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {deals.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}


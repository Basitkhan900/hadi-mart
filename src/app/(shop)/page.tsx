"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { categories } from "@/lib/db";
import { useCatalog } from "@/lib/store";
import { ArrowRight, Sparkles, TrendingUp, Zap, ShieldCheck, Leaf, Truck, RotateCcw, Star, ChevronLeft, ChevronRight, MessageSquareQuote, Mail, Check, Crown } from "lucide-react";
import type { Review } from "@/lib/types";

// ─── Countdown timer ──────────────────────────────────────────────────────────
function Countdown() {
  const [t, setT] = useState(5 * 3600 + 42 * 60 + 18);
  useEffect(() => {
    const i = setInterval(() => setT((x) => (x > 0 ? x - 1 : 0)), 1000);
    return () => clearInterval(i);
  }, []);
  const f = (n: number) => String(n).padStart(2, "0");
  const segments = [
    { label: "Hours", val: Math.floor(t / 3600) },
    { label: "Mins",  val: Math.floor((t % 3600) / 60) },
    { label: "Secs",  val: t % 60 },
  ];
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 text-[#2A4434] dark:text-[#A4B896]">
      {segments.map((s, i) => (
        <span key={s.label} className="flex items-center gap-1.5 sm:gap-2">
          {i > 0 && <span className="font-bold text-[#6B8565]">:</span>}
          <span className="flex flex-col items-center">
            <span className="tabular-nums rounded-lg bg-[#2A4434] px-2.5 py-1 text-sm sm:text-base font-bold text-white dark:bg-[#A4B896] dark:text-[#121915]">
              {f(s.val)}
            </span>
            <span className="mt-0.5 text-[8px] sm:text-[9px] uppercase tracking-wider text-stone-500">{s.label}</span>
          </span>
        </span>
      ))}
    </div>
  );
}

// ─── Static Full-Width Hero Banner with Left Luxury Overlay ─────────────
function HeroBanner() {
  return (
    <section className="relative w-full overflow-hidden bg-[#243528] dark:bg-[#141E18]">
      {/* 100% Full-Width Edge-to-Edge Banner */}
      <div className="relative w-full aspect-[21/9] min-h-[320px] sm:min-h-[420px] md:min-h-[500px] lg:min-h-[580px] overflow-hidden">
        <img
          src="/Hero-banner.jfif"
          alt="The Luxury Collection - Hadi Mart"
          className="h-full w-full object-cover object-center select-none"
        />

        {/* Soft Left Vignette Gradient so text stands out with luxury clarity */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent pointer-events-none" />

        {/* Left Content Overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-6 sm:px-12 md:px-16 lg:px-20">
            <div className="max-w-lg space-y-3 sm:space-y-4 md:space-y-5 text-left">
              <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-[68px] font-normal tracking-[0.06em] uppercase text-[#EAD098] leading-[1.08] drop-shadow-md">
                THE LUXURY
                <span className="block">COLLECTION</span>
              </h1>

              <p className="text-sm sm:text-lg md:text-xl font-normal text-white/95 tracking-wide drop-shadow max-w-md">
                Curated premium lifestyle, fashion, &amp; decor.
              </p>

              <div className="pt-2 sm:pt-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center rounded-full border border-[#EAD098] bg-[#3B5441]/50 backdrop-blur-xs px-8 sm:px-10 py-2.5 sm:py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-[#EAD098] shadow-md transition-all duration-300 hover:bg-[#EAD098] hover:text-[#1E3022] hover:scale-105 active:scale-95"
                >
                  SHOP NOW
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Main Home Page ───────────────────────────────────────────────────────────
export default function HomePage() {
  const products = useCatalog((s) => s.products);
  const [activeTab, setActiveTab] = useState<"featured" | "bestsellers" | "new">("featured");

  // Approved Reviews for Home Page
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewPage, setReviewPage] = useState(1);
  const REVIEWS_PER_PAGE = 3;

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterError, setNewsletterError] = useState("");

  useEffect(() => {
    const fetchApprovedReviews = async () => {
      try {
        const res = await fetch("/api/reviews?status=approved");
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
      }
    };
    fetchApprovedReviews();
  }, []);

  const flashDeals = products.filter((p) => p.salePrice).slice(0, 4);

  const displayedProducts = [...products]
    .sort((a, b) => {
      if (activeTab === "bestsellers") return b.sold - a.sold;
      if (activeTab === "new") return +new Date(b.createdAt) - +new Date(a.createdAt);
      return b.rating - a.rating;
    })
    .slice(0, 8);

  return (
    <div className="space-y-14 sm:space-y-16 pb-20">
      {/* ─── Hero Banner (Full Width, No Carousel, No Hover Effect) ─── */}
      <HeroBanner />

      {/* ─── Trust Pillars ─── */}
      <section className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { icon: <Leaf className="text-[#3A5C45]" size={22} />, title: "100% Pure & Natural", desc: "Chemical-free organic curation" },
            { icon: <Truck className="text-[#3A5C45]" size={22} />, title: "Free Express Delivery", desc: "On all orders above Rs. 3,000" },
            { icon: <RotateCcw className="text-[#3A5C45]" size={22} />, title: "7-Day Easy Returns", desc: "Hassle-free money-back guarantee" },
            { icon: <ShieldCheck className="text-[#3A5C45]" size={22} />, title: "Cash on Delivery", desc: "Pay at doorstep nationwide" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3.5 rounded-2xl border border-stone-200/80 bg-white/80 p-4 sm:p-5 shadow-xs transition hover:shadow-md dark:border-stone-800 dark:bg-[#152019]"
            >
              <div className="p-2.5 rounded-xl bg-[#EAF0E6] dark:bg-[#1F3025] shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">{item.title}</h3>
                <p className="mt-0.5 text-[11px] sm:text-xs text-stone-500 dark:text-stone-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Shop by Category (Interactive Cards) ─── */}
      <section className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-6 flex items-end justify-between border-b border-stone-200 pb-3 dark:border-stone-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#5E7A5A]">Explore Collections</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#233B2E] dark:text-[#D4E7DC]">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#2A4434] hover:text-[#192b20] hover:underline dark:text-[#A4B896] dark:hover:text-white transition"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/shop?cat=${c.slug}`}
              className="group flex flex-col items-center rounded-2xl border border-stone-200 bg-white p-3 sm:p-4 text-center transition-all hover:border-[#8BA581] hover:shadow-md dark:border-stone-800 dark:bg-[#141E18]"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-800">
                <img
                  src={c.image}
                  alt={c.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
                />
                <span className="absolute bottom-2 right-2 rounded-full bg-white/90 p-1.5 text-base shadow-sm backdrop-blur dark:bg-stone-900/90">
                  {c.icon}
                </span>
              </div>
              <h3 className="mt-3 text-xs sm:text-sm font-bold text-stone-800 group-hover:text-[#2A4434] dark:text-stone-200 dark:group-hover:text-[#A4B896]">
                {c.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Luxury Curated Promo Banners Grid ─── */}
      <section className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-5 md:grid-cols-2">
          {/* Banner 1: Seasonal Living */}
          <div className="group relative overflow-hidden rounded-3xl border border-[#D5E1CD] bg-gradient-to-br from-[#243729] via-[#2F4634] to-[#1C2C20] p-8 sm:p-10 text-white shadow-md transition-all duration-300 hover:shadow-xl dark:border-stone-800">
            <div className="relative z-10 max-w-sm space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAD098]/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#EAD098] border border-[#EAD098]/30">
                <Sparkles size={12} /> Curated Living
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#EAD098] leading-tight">
                Modern Organic Home &amp; Decor
              </h3>
              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                Elevate your everyday spaces with handcrafted ceramics, natural accents, and timeless luxury textiles.
              </p>
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-full border border-[#EAD098] bg-[#EAD098]/10 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-[#EAD098] transition hover:bg-[#EAD098] hover:text-[#1E3022]"
                >
                  Shop Collection <ArrowRight size={13} />
                </Link>
              </div>
            </div>
            {/* Subtle decorative glow */}
            <div className="pointer-events-none absolute -right-12 -bottom-12 h-56 w-56 rounded-full bg-[#EAD098]/10 blur-3xl" />
          </div>

          {/* Banner 2: Special Privilege & Artisanal Drops */}
          <div className="group relative overflow-hidden rounded-3xl border border-[#D5E1CD] bg-gradient-to-br from-[#304533] via-[#3E5542] to-[#203124] p-8 sm:p-10 text-white shadow-md transition-all duration-300 hover:shadow-xl dark:border-stone-800">
            <div className="relative z-10 max-w-sm space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white border border-white/20">
                <Crown size={12} className="text-[#EAD098]" /> Privilege Offers
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Artisanal Wellness &amp; Essentials
              </h3>
              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                100% pure organic formulations and premium self-care essentials designed for wholesome rejuvenation.
              </p>
              <div className="pt-2">
                <Link
                  href="/deals"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-[#243729] shadow-md transition hover:bg-[#EAD098] hover:text-[#1E3022]"
                >
                  Explore Flash Deals <ArrowRight size={13} />
                </Link>
              </div>
            </div>
            {/* Subtle decorative glow */}
            <div className="pointer-events-none absolute -right-12 -bottom-12 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          </div>
        </div>
      </section>

      {/* ─── Flash Deals & Discounts ─── */}
      {flashDeals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="rounded-3xl border border-[#D5E1CD] bg-gradient-to-r from-[#F2F6ED] via-[#FAFBF8] to-[#EEF3EA] p-5 sm:p-8 dark:border-stone-800 dark:from-[#152219] dark:to-[#18281E]">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#D8E3D2] pb-4 dark:border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#2A4434] text-white">
                  <Zap size={18} />
                </div>
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-extrabold text-[#2A4434] dark:text-[#D4E7DC]">
                    Flash Deals &amp; Discounts
                  </h2>
                  <p className="text-xs text-stone-500">Limited quantity offers at special prices</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 hidden sm:inline">
                    Ends In:
                  </span>
                  <Countdown />
                </div>
                <Link
                  href="/shop?sale=1"
                  className="hidden md:flex items-center gap-1 rounded-full bg-white dark:bg-[#203025] px-3.5 py-1.5 text-xs font-bold text-[#2A4434] dark:text-[#A4B896] shadow-xs hover:bg-[#2A4434] hover:text-white transition"
                >
                  View all <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
              {flashDeals.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Trending at Hadi Mart ─── */}
      <section className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-3 dark:border-stone-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#5E7A5A]">Customer Favorites</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#233B2E] dark:text-[#D4E7DC]">
              Trending at Hadi Mart
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center rounded-full bg-[#E8EDE2] p-1 text-xs font-semibold dark:bg-[#1D2B22]">
            <button
              onClick={() => setActiveTab("featured")}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition ${
                activeTab === "featured"
                  ? "bg-white text-[#2B4736] shadow-xs dark:bg-[#2A4434] dark:text-white"
                  : "text-stone-600 hover:text-stone-900 dark:text-stone-400"
              }`}
            >
              <Sparkles size={13} /> Featured
            </button>
            <button
              onClick={() => setActiveTab("bestsellers")}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition ${
                activeTab === "bestsellers"
                  ? "bg-white text-[#2B4736] shadow-xs dark:bg-[#2A4434] dark:text-white"
                  : "text-stone-600 hover:text-stone-900 dark:text-stone-400"
              }`}
            >
              <TrendingUp size={13} /> Best Sellers
            </button>
            <button
              onClick={() => setActiveTab("new")}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition ${
                activeTab === "new"
                  ? "bg-white text-[#2B4736] shadow-xs dark:bg-[#2A4434] dark:text-white"
                  : "text-stone-600 hover:text-stone-900 dark:text-stone-400"
              }`}
            >
              New Arrivals
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
          {displayedProducts.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full border-2 border-[#2B4736] px-8 py-3 text-xs sm:text-sm font-bold text-[#2B4736] transition hover:bg-[#2B4736] hover:text-white dark:border-[#A4B896] dark:text-[#A4B896] dark:hover:bg-[#A4B896] dark:hover:text-[#121915]"
          >
            Explore Complete Catalog <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ─── Customer Reviews (Approved Only) with Pagination ─── */}
      {reviews.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="rounded-3xl border border-stone-200/80 bg-white/70 p-6 sm:p-10 shadow-xs dark:border-stone-800 dark:bg-[#141E18]">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-stone-200/80 pb-4 dark:border-stone-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#5E7A5A]">Customer Feedback</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#233B2E] dark:text-[#D4E7DC] mt-0.5">
                  What Our Verified Customers Say
                </h2>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                <span>{reviews.length} Verified Review{reviews.length > 1 ? "s" : ""}</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reviews
                .slice((reviewPage - 1) * REVIEWS_PER_PAGE, reviewPage * REVIEWS_PER_PAGE)
                .map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-col justify-between rounded-2xl border border-stone-200/70 bg-stone-50/50 p-5 dark:border-stone-800/80 dark:bg-[#18231C]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < r.rating ? "fill-amber-400 text-amber-400" : "text-stone-300 dark:text-stone-700"}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-stone-400">
                          {new Date(r.createdAt).toLocaleDateString("en-PK", { dateStyle: "medium" })}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed italic whitespace-pre-line mb-4">
                        &ldquo;{r.body}&rdquo;
                      </p>
                    </div>

                    <div className="border-t border-stone-200/60 dark:border-stone-800/60 pt-3 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">{r.author}</h4>
                        <p className="text-[11px] text-stone-400 truncate max-w-[180px]">{r.productName || "Verified Buyer"}</p>
                      </div>
                      <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[9px] font-bold text-emerald-800 dark:text-emerald-300">
                        Verified
                      </span>
                    </div>
                  </div>
                ))}
            </div>

            {/* Pagination Controls */}
            {Math.ceil(reviews.length / REVIEWS_PER_PAGE) > 1 && (
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200/80 pt-4 dark:border-stone-800">
                <button
                  type="button"
                  disabled={reviewPage === 1}
                  onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 rounded-full border border-stone-300 dark:border-stone-700 px-4 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 disabled:opacity-30 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                >
                  <ChevronLeft size={14} /> Previous
                </button>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: Math.ceil(reviews.length / REVIEWS_PER_PAGE) }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setReviewPage(i + 1)}
                      className={`h-7 w-7 rounded-full text-xs font-bold transition ${
                        reviewPage === i + 1
                          ? "bg-[#2A4434] text-white dark:bg-[#A4B896] dark:text-[#0f1a17]"
                          : "border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={reviewPage >= Math.ceil(reviews.length / REVIEWS_PER_PAGE)}
                  onClick={() => setReviewPage((p) => p + 1)}
                  className="inline-flex items-center gap-1 rounded-full border border-stone-300 dark:border-stone-700 px-4 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 disabled:opacity-30 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── VIP Newsletter Club Section ─── */}
      <section className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-[#D5E1CD] bg-gradient-to-r from-[#243528] via-[#2D4232] to-[#1E2E22] p-8 sm:p-12 text-center text-white shadow-lg dark:border-stone-800">
          <div className="relative z-10 mx-auto max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#EAD098]/20 px-3.5 py-1 text-xs font-bold text-[#EAD098] border border-[#EAD098]/30">
              <Mail size={14} /> The Hadi Mart Privilege Circle
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-[#EAD098] tracking-tight">
              Unlock Rs. 500 Off Your First Order
            </h2>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed max-w-lg mx-auto">
              Join our members club for private access to seasonal flash sales, preview latest new arrivals before public launch, and secret discount coupons.
            </p>

            {newsletterSubscribed ? (
              <div className="mx-auto max-w-md rounded-2xl border border-[#EAD098]/40 bg-[#EAD098]/20 p-4 text-xs font-semibold text-[#EAD098] flex items-center justify-center gap-2">
                <Check size={18} /> Welcome to the Circle! Check your inbox — your Rs. 500 voucher code is waiting.
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const email = newsletterEmail.trim();
                  if (!email) return;
                  setNewsletterLoading(true);
                  setNewsletterError("");
                  try {
                    const res = await fetch("/api/newsletter", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email }),
                    });
                    const data = await res.json();
                    if (res.ok) {
                      setNewsletterSubscribed(true);
                    } else {
                      setNewsletterError(data.error || "Something went wrong. Please try again.");
                    }
                  } catch {
                    setNewsletterError("Network error. Please check your connection and try again.");
                  } finally {
                    setNewsletterLoading(false);
                  }
                }}
                className="mx-auto flex max-w-md flex-col sm:flex-row items-center gap-2 pt-2"
              >
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="w-full rounded-full border border-white/20 bg-white/10 px-5 py-3 text-xs sm:text-sm text-white placeholder-stone-300 outline-none backdrop-blur-xs transition focus:border-[#EAD098] focus:bg-white/15"
                />
                <button
                  type="submit"
                  disabled={newsletterLoading}
                  className="w-full sm:w-auto shrink-0 rounded-full border border-[#EAD098] bg-[#EAD098] px-7 py-3 text-xs font-bold uppercase tracking-wider text-[#1E3022] shadow-md transition hover:bg-[#d6bc85] hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-70 disabled:cursor-wait"
                >
                  {newsletterLoading ? "Joining..." : "Join Club"}
                </button>
              </form>
            )}

            {newsletterError && (
              <p className="text-xs text-red-300 font-medium mt-1">{newsletterError}</p>
            )}

            <p className="text-[11px] text-stone-400">
              No spam, ever. Unsubscribe at any time with one click.
            </p>
          </div>

          {/* Decorative background watermarks */}
          <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-[#EAD098]/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        </div>
      </section>
    </div>
  );
}

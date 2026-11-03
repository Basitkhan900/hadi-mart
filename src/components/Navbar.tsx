"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search, ShoppingCart, User, Heart, Moon, Sun, Menu, X, ArrowRight, Shield } from "lucide-react";
import { useCart, useCatalog, useWishlist, useAuth } from "@/lib/store";
import { pkr } from "@/lib/types";

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const cart = useCart();
  const wish = useWishlist();
  const products = useCatalog((s) => s.products);
  const { isLoggedIn, name, avatar, role } = useAuth();
  const count = Object.values(cart.items).reduce((a, b) => a + b, 0);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const results = query.trim()
    ? products
        .filter((p) => `${p.name} ${p.brand} ${p.description}`.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-50 w-full shadow-xs">
      {/* ─── Top Tier (Exact Match to New Reference Image) ─── */}
      <div className="relative bg-[#F4F6F1] px-4 py-2.5 sm:py-3 border-b border-[#E0E6DA] transition-colors dark:bg-[#131C17] dark:border-[#223028]">
        {/* Subtle decorative watercolor leaves SVG background */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-24 opacity-25 overflow-hidden">
          <svg viewBox="0 0 100 100" fill="none" stroke="#3A5642" strokeWidth="2.5" className="h-full">
            <path d="M10,90 Q40,40 85,15 Q60,50 10,90 Z" fill="#6B8A71" fillOpacity="0.4" />
            <path d="M30,70 Q60,35 95,30 Q70,60 30,70 Z" fill="#8CA892" fillOpacity="0.3" />
          </svg>
        </div>
        <div className="pointer-events-none absolute right-0 top-0 h-full w-32 opacity-20 overflow-hidden hidden md:block">
          <svg viewBox="0 0 120 100" fill="none" stroke="#3A5642" strokeWidth="2" className="h-full ml-auto">
            <path d="M90,10 Q60,40 10,70 Q50,60 90,10 Z" fill="#6B8A71" fillOpacity="0.35" />
            <path d="M100,30 Q70,55 30,85 Q65,75 100,30 Z" fill="#8CA892" fillOpacity="0.25" />
          </svg>
        </div>

        <div className="mx-auto flex max-w-7xl w-full items-center justify-between gap-2 sm:gap-6">
          {/* Brand Logo with Botanical Leaves */}
          <Link href="/" className="group flex items-center gap-2 shrink-0">
            {/* Left Leaf branch illustration */}
            <span className="text-[#3F5E46] dark:text-[#A4B896] text-xl">🌿</span>
            <span className="font-serif text-2xl sm:text-3xl font-extrabold tracking-[0.12em] uppercase text-[#1E3926] dark:text-[#E2EFE7]">
              HADI MART
            </span>
          </Link>

          {/* Center/Right: Pill Search Input with Dark Green Action Button */}
          <div ref={searchContainerRef} className="relative hidden md:block flex-1 max-w-md lg:max-w-lg mx-auto">
            <div className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search for fresh groceries, wellness & more..."
                className="w-full rounded-full border border-stone-300 bg-white py-2 pl-4 pr-12 text-xs sm:text-sm text-stone-900 shadow-xs placeholder-stone-400 outline-none transition focus:border-[#2C4935] focus:ring-1 focus:ring-[#2C4935] dark:bg-[#18241D] dark:border-stone-700 dark:text-stone-100 dark:placeholder-stone-500"
              />
              <button
                type="button"
                onClick={() => setIsSearchFocused(true)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-full bg-[#1B3B26] text-white transition hover:bg-[#142C1D] dark:bg-[#34583F]"
                aria-label="Search"
              >
                <Search size={14} />
              </button>
            </div>

            {/* Live Instant Search Dropdown */}
            {isSearchFocused && query.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl bg-white shadow-2xl border border-stone-200 z-50 dark:bg-[#16221A] dark:border-stone-800">
                <div className="p-3 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center text-xs text-stone-500">
                  <span>Results for &quot;{query}&quot;</span>
                  <button onClick={() => setQuery("")} className="hover:text-stone-900">
                    Clear
                  </button>
                </div>
                {results.length > 0 ? (
                  <div className="divide-y divide-stone-100 dark:divide-stone-800 max-h-80 overflow-y-auto">
                    {results.map((p) => (
                      <Link
                        key={p.id}
                        href={`/product/${p.slug}`}
                        onClick={() => {
                          setIsSearchFocused(false);
                          setQuery("");
                        }}
                        className="flex items-center gap-3 p-3 transition hover:bg-stone-50 dark:hover:bg-[#1E2E23]"
                      >
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="h-11 w-9 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-100 truncate">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-stone-400">{p.brand}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs sm:text-sm font-bold text-[#1E3926] dark:text-[#A4B896]">
                            {pkr(p.salePrice ?? p.price)}
                          </p>
                          {p.salePrice && (
                            <p className="text-[10px] text-stone-400 line-through">
                              {pkr(p.price)}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-stone-500">
                    No products found matching &quot;{query}&quot;.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Links: Account & Cart with Badge */}
          <div className="flex items-center gap-2 sm:gap-6 text-xs sm:text-sm font-medium text-[#1E3926] dark:text-[#D8E6DB]">
            {/* Account */}
            <Link
              href={isLoggedIn ? "/account" : "/login"}
              className="flex items-center gap-1.5 transition-colors hover:text-[#5E7F55]"
            >
              {isLoggedIn && avatar ? (
                <img
                  src={avatar}
                  alt=""
                  className="h-5 w-5 rounded-full object-cover border border-[#2C4935]"
                />
              ) : (
                <User size={18} strokeWidth={1.8} />
              )}
              <span className="hidden sm:inline">{isLoggedIn ? (name ? name.split(" ")[0] : "Profile") : "Account"}</span>
            </Link>

            {/* Quick Admin Badge (Only visible when logged in as Store Admin) */}
            {isLoggedIn && role === "admin" && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[#1B3B26] dark:bg-[#A4B896] dark:text-[#0f1a17] text-white px-2.5 py-1 text-[11px] font-bold shadow-xs hover:bg-[#142C1D] transition"
                title="Go to Admin Dashboard"
              >
                <Shield size={12} />
                <span>Admin</span>
              </Link>
            )}

            {/* Cart with green circle badge */}
            <button
              onClick={() => cart.setOpen(true)}
              className="relative flex items-center gap-1.5 transition-colors hover:text-[#5E7F55]"
              aria-label="Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart size={19} strokeWidth={1.8} />
                <span className="absolute -top-1.5 -right-2 grid h-4 w-4 place-items-center rounded-full bg-[#355B3E] text-[10px] font-bold text-white dark:bg-[#7FA384] dark:text-black">
                  {count}
                </span>
              </div>
              <span className="hidden sm:inline">Cart</span>

            </button>

            {/* Wishlist Icon */}
            <Link
              href="/wishlist"
              className="relative hidden sm:flex items-center transition-colors hover:text-[#5E7F55]"
              aria-label="Wishlist"
            >
              <Heart size={18} strokeWidth={1.8} />
              {wish.ids.length > 0 && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#D97706]" />
              )}
            </Link>

            {/* Theme Toggle */}
            <button
              aria-label="Toggle theme"
              className="p-1 rounded-full text-[#3F5E46] hover:bg-[#E0E6DA] dark:text-[#A4B896] dark:hover:bg-[#223028] transition"
              onClick={() => document.documentElement.classList.toggle("dark")}
            >
              <Sun size={17} className="hidden dark:block" />
              <Moon size={17} className="dark:hidden" />
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="md:hidden flex items-center justify-center h-8 w-8 rounded-full bg-[#E0E6DA] dark:bg-[#223028] text-[#1E3926] dark:text-[#D4E7DC] hover:bg-[#9AB391] dark:hover:bg-[#2E4A38] transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile search bar visible on small devices */}
        <div className="mt-2.5 md:hidden">
          <div className="relative flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search groceries, wellness & more..."
              className="w-full rounded-full border border-stone-300 bg-white py-1.5 pl-3.5 pr-10 text-xs shadow-xs outline-none dark:bg-[#18241D] dark:border-stone-700 dark:text-stone-100"
            />
            <button
              type="button"
              className="absolute right-1 top-1/2 -translate-y-1/2 grid h-6 w-6 place-items-center rounded-full bg-[#1B3B26] text-white"
            >
              <Search size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Bottom Tier: Category Nav Bar (Desktop only) ─── */}
      <div className="hidden md:block bg-[#9AB391] px-4 py-2.5 text-[#132A1C] shadow-inner transition-colors dark:bg-[#1F3324] dark:text-[#E2EFE7]">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-6 lg:gap-9 text-xs sm:text-[13px] font-semibold tracking-wider">
          <Link href="/" className="uppercase transition hover:text-white">
            HOME
          </Link>
          <Link href="/about" className="capitalize transition hover:text-white">
            About Us
          </Link>
          <Link href="/shop" className="capitalize transition hover:text-white">
            Shop
          </Link>
          <Link href="/new-arrivals" className="uppercase font-bold tracking-widest text-[#243F2A] hover:text-white dark:text-[#C5DDCB]">
            NEW ARRIVALS
          </Link>
          <Link href="/deals" className="capitalize transition hover:text-white">
            Deals
          </Link>
          <Link href="/contact" className="capitalize transition hover:text-white">
            Contact Us
          </Link>
        </div>
      </div>

      {/* ─── Mobile Slide-Down Menu ─── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-[#F4F6F1] border-b border-[#D8DFD0] dark:bg-[#131C17] dark:border-[#223028]">
          {/* Nav Links */}
          <nav className="px-5 pt-4 pb-2 flex flex-col text-sm font-semibold text-[#1E3926] dark:text-[#D4E7DC]">
            {[
              { href: "/", label: "🏠 Home" },
              { href: "/about", label: "ℹ️ About Us" },
              { href: "/shop", label: "🛍️ Shop" },
              { href: "/new-arrivals", label: "✨ New Arrivals" },
              { href: "/deals", label: "🔥 Deals" },
              { href: "/contact", label: "📞 Contact Us" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 border-b border-[#E0E6DA] dark:border-[#223028] flex items-center justify-between group hover:text-[#5E7F55] transition-colors last:border-0"
              >
                <span>{label}</span>
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </nav>

          {/* Account & Wishlist */}
          <div className="px-5 py-3 bg-[#EEF2EB] dark:bg-[#0F1912] flex flex-col gap-2 text-xs text-[#1E3926] dark:text-[#D4E7DC]">
            <Link
              href="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 flex items-center justify-between font-semibold hover:text-[#5E7F55] transition-colors"
            >
              <span className="flex items-center gap-2">
                <Heart size={14} />
                My Wishlist
              </span>
              {wish.ids.length > 0 && (
                <span className="bg-[#D97706] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {wish.ids.length}
                </span>
              )}
            </Link>
            <Link
              href={isLoggedIn ? "/account" : "/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 flex items-center justify-between font-semibold hover:text-[#5E7F55] transition-colors"
            >
              <span className="flex items-center gap-2">
                <User size={14} />
                {isLoggedIn ? `Profile (${name})` : "Sign In / Register"}
              </span>
              <ArrowRight size={14} />
            </Link>
            {isLoggedIn && role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 flex items-center justify-between font-bold text-[#1B3B26] dark:text-[#A4B896] hover:underline"
              >
                <span className="flex items-center gap-2">
                  <Shield size={14} />
                  Admin Dashboard Panel
                </span>
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

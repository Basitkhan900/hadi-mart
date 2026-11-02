"use client";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import { categories } from "@/lib/db";
import { useCatalog } from "@/lib/store";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";

type SortKey = "popular" | "newest" | "price-asc" | "price-desc";

function ShopContent() {
  const params = useSearchParams();
  const catParam = params.get("cat") ?? "";
  const saleParam = params.get("sale") === "1";

  const products = useCatalog((s) => s.products);
  const [selectedCat, setSelectedCat] = useState(catParam);
  const [onSale, setOnSale] = useState(saleParam);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [sort, setSort] = useState<SortKey>("popular");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setSelectedCat(catParam);
  }, [catParam]);

  useEffect(() => {
    setOnSale(saleParam);
  }, [saleParam]);

  const filtered = useMemo(() => {
    let list = products;
    if (selectedCat) list = list.filter((p) => {
      const cat = categories.find((c) => c.id === p.categoryId);
      return cat?.slug === selectedCat;
    });
    if (onSale) list = list.filter((p) => !!p.salePrice);
    list = list.filter((p) => (p.salePrice ?? p.price) <= maxPrice);
    switch (sort) {
      case "popular":    list = [...list].sort((a, b) => b.sold - a.sold); break;
      case "newest":     list = [...list].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)); break;
      case "price-asc":  list = [...list].sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price)); break;
      case "price-desc": list = [...list].sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price)); break;
    }
    return list;
  }, [products, selectedCat, onSale, maxPrice, sort]);

  const activeCat = categories.find((c) => c.slug === selectedCat);
  const activeFiltersCount = [selectedCat, onSale, maxPrice < 50000].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-extrabold">
          {activeCat ? activeCat.name : onSale ? "Sale" : "All Products"}
        </h1>
        <p className="mt-1 text-ink/50">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters — desktop */}
        <aside className="hidden w-56 shrink-0 space-y-8 md:block">
          {/* Categories */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-ink/30">Category</p>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCat("")}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-ink/5 ${!selectedCat ? "bg-ink/5 font-semibold" : ""}`}
              >
                All Products
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCat(c.slug === selectedCat ? "" : c.slug)}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-ink/5 ${selectedCat === c.slug ? "bg-emerald/10 font-semibold text-emerald" : ""}`}
                >
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-ink/30">Max Price</p>
            <input
              type="range"
              min={500}
              max={50000}
              step={500}
              value={maxPrice}
              onChange={(e) => setMaxPrice(+e.target.value)}
              className="w-full accent-emerald"
            />
            <div className="mt-1 flex justify-between text-xs text-ink/50">
              <span>Rs. 500</span>
              <span>Rs. {maxPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Sale toggle */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-ink/30">Offers</p>
            <label className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 hover:bg-ink/5">
              <span className="text-sm">On Sale only</span>
              <div
                onClick={() => setOnSale((o) => !o)}
                className={`relative h-5 w-9 rounded-full transition ${onSale ? "bg-emerald" : "bg-ink/20"}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${onSale ? "translate-x-4" : "translate-x-0.5"}`} />
              </div>
            </label>
          </div>

          {/* Clear */}
          {activeFiltersCount > 0 && (
            <button
              onClick={() => { setSelectedCat(""); setOnSale(false); setMaxPrice(50000); }}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:underline"
            >
              <X size={14} /> Clear filters
            </button>
          )}
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="mb-6 flex items-center justify-between gap-4">
            {/* Mobile filter button */}
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm md:hidden"
            >
              <SlidersHorizontal size={15} />
              Filters
              {activeFiltersCount > 0 && (
                <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald text-[10px] text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="relative ml-auto">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="appearance-none rounded-full border bg-transparent py-2 pl-4 pr-9 text-sm outline-none transition hover:bg-ink/5"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/40" />
            </div>
          </div>

          {/* Active filter chips */}
          {activeFiltersCount > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {activeCat && (
                <span className="flex items-center gap-1.5 rounded-full bg-emerald/10 px-3 py-1 text-xs font-semibold text-emerald">
                  {activeCat.icon} {activeCat.name}
                  <button onClick={() => setSelectedCat("")}><X size={12} /></button>
                </span>
              )}
              {onSale && (
                <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  🔥 Sale
                  <button onClick={() => setOnSale(false)}><X size={12} /></button>
                </span>
              )}
              {maxPrice < 50000 && (
                <span className="flex items-center gap-1.5 rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold">
                  Up to Rs. {maxPrice.toLocaleString()}
                  <button onClick={() => setMaxPrice(50000)}><X size={12} /></button>
                </span>
              )}
            </div>
          )}

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <p className="text-4xl">🔍</p>
              <p className="font-display text-2xl font-bold">No products found</p>
              <p className="text-ink/50">Try adjusting your filters</p>
              <button
                onClick={() => { setSelectedCat(""); setOnSale(false); setMaxPrice(50000); }}
                className="btn-emerald"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowFilters(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-4xl bg-paper p-6 dark:bg-[#0a0f0d]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-extrabold">Filters</h3>
              <button onClick={() => setShowFilters(false)}><X size={20} /></button>
            </div>

            <div className="space-y-6">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-ink/30">Category</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedCat("")} className={`rounded-full px-4 py-2 text-sm border ${!selectedCat ? "bg-ink text-white border-ink" : ""}`}>All</button>
                  {categories.map((c) => (
                    <button key={c.id} onClick={() => setSelectedCat(c.slug === selectedCat ? "" : c.slug)}
                      className={`rounded-full px-4 py-2 text-sm border ${selectedCat === c.slug ? "bg-emerald text-white border-emerald" : ""}`}>
                      {c.icon} {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-ink/30">Max Price: Rs. {maxPrice.toLocaleString()}</p>
                <input type="range" min={500} max={50000} step={500} value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} className="w-full accent-emerald" />
              </div>

              <label className="flex cursor-pointer items-center justify-between">
                <span className="font-medium">On Sale only</span>
                <div onClick={() => setOnSale((o) => !o)} className={`relative h-6 w-11 rounded-full transition ${onSale ? "bg-emerald" : "bg-ink/20"}`}>
                  <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${onSale ? "translate-x-6" : "translate-x-1"}`} />
                </div>
              </label>

              <button onClick={() => setShowFilters(false)} className="btn-emerald w-full">
                Show {filtered.length} product{filtered.length !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-ink/50">Loading products…</div>}>
      <ShopContent />
    </Suspense>
  );
}


"use client";
import Link from "next/link";
import { useState } from "react";
import { Heart, Star, ShoppingBag, Check } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@/lib/types";
import { pkr } from "@/lib/types";
import { useCart, useWishlist } from "@/lib/store";

interface Props {
  p: Product;
  className?: string;
}

export default function ProductCard({ p, className = "" }: Props) {
  const [hover, setHover] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const add = useCart((s) => s.add);
  const { ids, toggle } = useWishlist();
  const liked = ids.includes(p.id);
  const discount = p.salePrice ? Math.round(((p.price - p.salePrice) / p.price) * 100) : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add(p.id);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <motion.div
      className={`group relative flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-2.5 sm:p-3 shadow-xs hover:border-[#8FA683] hover:shadow-xl dark:border-stone-800 dark:bg-[#152019] ${className}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      whileHover={{ y: -6, transition: { type: "spring", stiffness: 320, damping: 22 } }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div>
        {/* Product Image Frame */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#F6F5F0] dark:bg-stone-900">
          <Link href={`/product/${p.slug}`} className="block h-full w-full">
            <img
              src={p.images[hover ? 1 : 0]}
              alt={p.name}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
            />
          </Link>

          {/* Badges */}
          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1 z-10">
            {p.salePrice && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="rounded-full bg-[#B84232] px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-white shadow-xs"
              >
                -{discount}%
              </motion.span>
            )}
            {p.stock <= 5 && p.stock > 0 && (
              <span className="rounded-full bg-[#D97706] px-2 py-0.5 text-[10px] font-semibold text-white shadow-xs">
                Only {p.stock} left
              </span>
            )}
            {p.stock === 0 && (
              <span className="rounded-full bg-stone-700 px-2 py-0.5 text-[10px] font-semibold text-white shadow-xs">
                Sold Out
              </span>
            )}
          </div>

          {/* Wishlist Heart */}
          <motion.button
            type="button"
            aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle(p.id);
            }}
            className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow-xs backdrop-blur transition dark:bg-stone-900/90 z-10"
          >
            <Heart
              size={15}
              className={`transition-colors duration-200 ${liked ? "fill-rose-500 text-rose-500" : "text-stone-400 hover:text-stone-700 dark:text-stone-300"
                }`}
            />
          </motion.button>

          {/* Quick Add overlay button */}
          <motion.button
            type="button"
            disabled={p.stock === 0}
            onClick={handleQuickAdd}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            className={`absolute inset-x-2.5 bottom-2.5 flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-bold shadow-md transition-all duration-300 z-10
              ${justAdded ? "bg-[#2A4434] text-white" : "bg-white/95 text-[#2A4434] hover:bg-[#2A4434] hover:text-white dark:bg-[#1A261F] dark:text-[#A4B896] dark:hover:bg-[#A4B896] dark:hover:text-[#121915]"}
              ${hover ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}
              max-md:opacity-100 max-md:translate-y-0 max-md:pointer-events-auto
              disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {justAdded ? (
              <>
                <Check size={14} className="animate-bounce" /> Added
              </>
            ) : (
              <>
                <ShoppingBag size={13} /> {p.stock === 0 ? "Out of Stock" : "Quick Add"}
              </>
            )}
          </motion.button>
        </div>

        {/* Product Details */}
        <div className="mt-3 space-y-1">
          <p className="text-[11px] font-medium tracking-wide uppercase text-[#5F785A] dark:text-[#A4B896]">
            {p.brand}
          </p>
          <Link href={`/product/${p.slug}`} className="block">
            <h3 className="line-clamp-1 text-xs sm:text-sm font-semibold text-stone-900 group-hover:text-[#2A4434] dark:text-stone-100 dark:group-hover:text-[#A4B896] transition-colors">
              {p.name}
            </h3>
          </Link>
          <div className="flex items-center gap-1 pt-0.5">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={11}
                  className={i < Math.round(p.rating) ? "fill-[#D97706] text-[#D97706]" : "fill-stone-200 text-stone-200 dark:fill-stone-700"}
                />
              ))}
            </div>
            <span className="text-[10px] text-stone-400">({p.reviewCount})</span>
          </div>
        </div>
      </div>

      {/* Price tag */}
      <div className="mt-3 flex items-baseline justify-between border-t border-stone-100 pt-2 dark:border-stone-800">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs sm:text-sm font-bold text-[#2A4434] dark:text-[#D4E7DC]">
            {pkr(p.salePrice ?? p.price)}
          </span>
          {p.salePrice && (
            <span className="text-[11px] text-stone-400 line-through">
              {pkr(p.price)}
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium text-stone-400">{p.sold} sold</span>
      </div>
    </motion.div>
  );
}

"use client";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useCatalog, useWishlist } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";

export default function WishlistPage() {
  const { ids, toggle } = useWishlist();
  const products = useCatalog((s) => s.products);
  const wishItems = products.filter((p) => ids.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-4xl font-extrabold font-serif">Wishlist</h1>
          <p className="mt-1 text-ink/50">
            {wishItems.length} saved item{wishItems.length !== 1 ? "s" : ""}
          </p>
        </div>
        {wishItems.length > 0 && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/shop" className="btn-outline text-sm">
              Continue shopping
            </Link>
          </motion.div>
        )}
      </motion.div>

      {wishItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-5 py-24 text-center"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="grid h-24 w-24 place-items-center rounded-full bg-ink/5"
          >
            <Heart size={40} className="text-ink/20" />
          </motion.div>
          <p className="font-display text-2xl font-bold font-serif">Your wishlist is empty</p>
          <p className="max-w-xs text-ink/50 text-sm">
            Save items you love by tapping the heart on any product.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/shop" className="btn-emerald">
              <ShoppingBag size={18} /> Browse Products
            </Link>
          </motion.div>
        </motion.div>
      ) : (
        <>
          <motion.div
            layout
            className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
          >
            <AnimatePresence>
              {wishItems.map((p) => (
                <motion.div
                  layout
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.25 } }}
                  className="relative"
                >
                  <ProductCard p={p} />
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => toggle(p.id)}
                    className="absolute right-3 top-3 z-20 grid h-8 w-8 place-items-center rounded-full bg-red-50 text-red-500 shadow-sm transition hover:bg-red-100 cursor-pointer"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={14} />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-10 rounded-3xl border bg-white/60 p-6 dark:bg-white/5 border-stone-200/80 dark:border-stone-800"
          >
            <p className="text-sm text-ink/60">
              💡 Move items to your cart before they sell out!
            </p>
          </motion.div>
        </>
      )}
    </div>
  );
}

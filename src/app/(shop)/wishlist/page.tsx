"use client";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useCatalog, useWishlist } from "@/lib/store";

export default function WishlistPage() {
  const { ids, toggle } = useWishlist();
  const products = useCatalog((s) => s.products);
  const wishItems = products.filter((p) => ids.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-extrabold">Wishlist</h1>
          <p className="mt-1 text-ink/50">{wishItems.length} saved item{wishItems.length !== 1 ? "s" : ""}</p>
        </div>
        {wishItems.length > 0 && (
          <Link href="/shop" className="btn-outline text-sm">
            Continue shopping
          </Link>
        )}
      </div>

      {wishItems.length === 0 ? (
        <div className="flex flex-col items-center gap-5 py-24 text-center">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-ink/5">
            <Heart size={40} className="text-ink/20" />
          </div>
          <p className="font-display text-2xl font-bold">Your wishlist is empty</p>
          <p className="max-w-xs text-ink/50">Save items you love by tapping the heart on any product.</p>
          <Link href="/shop" className="btn-emerald">
            <ShoppingBag size={18} /> Browse Products
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {wishItems.map((p) => (
              <div key={p.id} className="relative">
                <ProductCard p={p} />
                <button
                  onClick={() => toggle(p.id)}
                  className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-red-50 text-red-500 shadow transition hover:bg-red-100"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-3xl border bg-white/60 p-6 dark:bg-white/5">
            <p className="text-sm text-ink/60">
              💡 Move items to your cart before they sell out!
            </p>
          </div>
        </>
      )}
    </div>
  );
}


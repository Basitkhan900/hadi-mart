"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X, ShoppingBag, Tag, Trash2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart, useCatalog } from "@/lib/store";
import { pkr } from "@/lib/types";

export default function CartDrawer() {
  const router = useRouter();
  const { items, open, setOpen, add, remove, setQty, coupon, applyCoupon, removeCoupon } = useCart();
  const products = useCatalog((s) => s.products);
  const [code, setCode] = useState("");
  const [couponErr, setCouponErr] = useState("");

  const lines = Object.entries(items)
    .map(([id, qty]) => ({ p: products.find((x) => x.id === id), qty }))
    .filter((l) => l.p);

  const sub = lines.reduce((a, l) => a + (l.p!.salePrice ?? l.p!.price) * l.qty, 0);
  const discount = coupon ? Math.round((sub * coupon.percent) / 100) : 0;
  const delivery = sub === 0 || sub >= 3000 ? 0 : 200;
  const total = sub - discount + delivery;

  const handleApplyCoupon = () => {
    if (applyCoupon(code)) {
      setCouponErr("");
      setCode("");
    } else {
      setCouponErr("Invalid or expired coupon code.");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[420px] flex-col bg-paper dark:bg-[#0f1a17]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} />
                <h2 className="font-display text-xl font-extrabold">Your Bag</h2>
                {lines.length > 0 && (
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald text-[10px] font-bold text-white">
                    {lines.reduce((a, l) => a + l.qty, 0)}
                  </span>
                )}
              </div>
              <button
                aria-label="Close cart"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 transition hover:bg-ink/10"
              >
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {lines.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                  <ShoppingBag size={48} className="text-ink/20" />
                  <p className="font-medium text-ink/50">Your bag is empty</p>
                  <Link
                    href="/shop"
                    onClick={() => setOpen(false)}
                    className="btn-emerald text-sm"
                  >
                    Browse products
                  </Link>
                </div>
              ) : (
                <div className="space-y-5">
                  {lines.map(({ p, qty }) => (
                    <div key={p!.id} className="flex gap-4">
                      <Link href={`/product/${p!.slug}`} onClick={() => setOpen(false)}>
                        <img
                          src={p!.images[0]}
                          alt={p!.name}
                          className="h-24 w-20 rounded-2xl object-cover"
                        />
                      </Link>
                      <div className="flex flex-1 flex-col justify-between py-1">
                        <div>
                          <p className="font-semibold leading-snug">{p!.name}</p>
                          <p className="text-xs text-ink/50">{p!.brand}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          {/* Qty controls */}
                          <div className="flex items-center gap-2 rounded-full border px-2 py-1">
                            <button
                              aria-label="Decrease"
                              onClick={() => remove(p!.id)}
                              className="grid h-6 w-6 place-items-center rounded-full transition hover:bg-ink/10"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-5 text-center text-sm font-semibold">{qty}</span>
                            <button
                              aria-label="Increase"
                              onClick={() => add(p!.id)}
                              disabled={qty >= p!.stock}
                              className="grid h-6 w-6 place-items-center rounded-full transition hover:bg-ink/10 disabled:opacity-30"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald">{pkr((p!.salePrice ?? p!.price) * qty)}</p>
                            {p!.salePrice && (
                              <p className="text-xs text-ink/30 line-through">{pkr(p!.price * qty)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Remove */}
                      <button
                        aria-label="Remove item"
                        onClick={() => setQty(p!.id, 0)}
                        className="self-start rounded-full p-1.5 text-ink/30 transition hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {lines.length > 0 && (
              <div className="border-t px-6 py-5 space-y-4">
                {/* Coupon */}
                {coupon ? (
                  <div className="flex items-center justify-between rounded-2xl bg-emerald/10 px-4 py-2.5">
                    <div className="flex items-center gap-2 text-sm text-emerald">
                      <Tag size={14} />
                      <span className="font-bold">{coupon.code}</span>
                      <span className="text-ink/50">({coupon.percent}% off)</span>
                    </div>
                    <button onClick={removeCoupon} className="text-ink/40 hover:text-red-500">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex gap-2">
                      <input
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                        placeholder="Coupon code (try HADI10)"
                        className="flex-1 rounded-2xl border bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-emerald"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="rounded-2xl border px-4 py-2.5 text-sm font-semibold transition hover:bg-ink/5"
                      >
                        Apply
                      </button>
                    </div>
                    {couponErr && <p className="text-xs text-red-500">{couponErr}</p>}
                  </div>
                )}

                {/* Totals */}
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-ink/60">Subtotal</dt>
                    <dd className="font-medium">{pkr(sub)}</dd>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald">
                      <dt>Coupon discount</dt>
                      <dd className="font-medium">-{pkr(discount)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-ink/60">Delivery</dt>
                    <dd className={`font-medium ${delivery === 0 ? "text-emerald" : ""}`}>
                      {delivery === 0 ? "Free 🎉" : pkr(delivery)}
                    </dd>
                  </div>
                  {sub > 0 && sub < 3000 && (
                    <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                      Add {pkr(3000 - sub)} more for free delivery!
                    </p>
                  )}
                  <div className="flex justify-between border-t pt-2 text-base font-bold">
                    <dt>Total</dt>
                    <dd className="text-emerald">{pkr(total)}</dd>
                  </div>
                </dl>

                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push("/checkout");
                  }}
                  className="btn-emerald w-full justify-center text-center cursor-pointer py-3.5"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => setOpen(false)}
                  className="w-full text-center text-sm text-ink/50 underline-offset-2 hover:underline"
                >
                  Continue shopping
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

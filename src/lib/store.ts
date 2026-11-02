"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { products as seedProducts } from "./db";
import type { Product, Coupon, Order, Address, Review } from "./types";
import { coupons } from "./db";

// ─── Cart ─────────────────────────────────────────────────────────────────────
interface CartStore {
  items: Record<string, number>;
  open: boolean;
  coupon?: Coupon;
  add: (id: string) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  setOpen: (o: boolean) => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  clear: () => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      items: {},
      open: false,
      add: (id) =>
        set((s) => ({ items: { ...s.items, [id]: (s.items[id] ?? 0) + 1 }, open: true })),
      remove: (id) =>
        set((s) => {
          const n = { ...s.items };
          if ((n[id] ?? 0) > 1) n[id]--;
          else delete n[id];
          return { items: n };
        }),
      setQty: (id, qty) =>
        set((s) => {
          const n = { ...s.items };
          if (qty <= 0) delete n[id];
          else n[id] = qty;
          return { items: n };
        }),
      setOpen: (open) => set({ open }),
      applyCoupon: (code) => {
        const c = coupons.find((c) => c.code === code.toUpperCase() && c.active);
        if (c) set({ coupon: c });
        return !!c;
      },
      removeCoupon: () => set({ coupon: undefined }),
      clear: () => set({ items: {}, coupon: undefined }),
    }),
    { name: "hm-cart", partialize: (s) => ({ items: s.items, coupon: s.coupon }) }
  )
);

// ─── Wishlist ─────────────────────────────────────────────────────────────────
interface WishlistStore {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({ ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id] })),
      has: (id) => get().ids.includes(id),
    }),
    { name: "hm-wishlist" }
  )
);

// ─── Catalog ──────────────────────────────────────────────────────────────────
interface CatalogStore {
  products: Product[];
  setProducts: (list: Product[]) => void;
  update: (id: string, patch: Partial<Product>) => void;
  remove: (id: string) => void;
  add: (p: Product) => void;
  clear: () => void;
}

export const useCatalog = create<CatalogStore>()(
  persist(
    (set) => ({
      products: [],
      setProducts: (products) => set({ products }),
      update: (id, patch) =>
        set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      remove: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
      add: (p) => set((s) => ({ products: [p, ...s.products] })),
      clear: () => set({ products: [] }),
    }),
    { name: "hm-catalog-clean" }
  )
);

// ─── Orders ───────────────────────────────────────────────────────────────────
interface OrderStore {
  orders: Order[];
  place: (order: Omit<Order, "id" | "createdAt">) => string;
}

let orderCounter = 2000;
export const useOrders = create<OrderStore>()(
  persist(
    (set) => ({
      orders: [],
      place: (order) => {
        const id = `HM-${++orderCounter}`;
        const newOrder: Order = { ...order, id, createdAt: new Date().toISOString() };
        set((s) => ({ orders: [newOrder, ...s.orders] }));
        return id;
      },
    }),
    { name: "hm-orders" }
  )
);

// ─── Reviews ─────────────────────────────────────────────────────────────────
interface ReviewStore {
  reviews: Review[];
  setReviews: (reviews: Review[]) => void;
  add: (r: Review) => void;
}

export const useReviews = create<ReviewStore>()(
  persist(
    (set) => ({
      reviews: [],
      setReviews: (reviews) => set({ reviews }),
      add: (r) => set((s) => ({ reviews: [r, ...s.reviews] })),
    }),
    { name: "hm-reviews-v2" }
  )
);

// ─── Auth (simple session store) ─────────────────────────────────────────────
interface AuthStore {
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  phone?: string;
  address?: string;
  city?: string;
  isLoggedIn: boolean;
  login: (name: string, email: string, avatar?: string, role?: string) => void;
  updateProfile: (data: Partial<{ name: string; email: string; avatar: string; phone: string; address: string; city: string; role: string }>) => void;
  logout: () => void;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      name: "",
      email: "",
      role: "customer",
      avatar: "",
      phone: "",
      address: "",
      city: "",
      isLoggedIn: false,
      login: (name, email, avatar, role = "customer") =>
        set((s) => ({
          name,
          email,
          role,
          avatar: avatar ?? s.avatar ?? "",
          isLoggedIn: true,
        })),
      updateProfile: (data) => set((s) => ({ ...s, ...data })),
      logout: () =>
        set({
          name: "",
          email: "",
          role: "customer",
          avatar: "",
          phone: "",
          address: "",
          city: "",
          isLoggedIn: false,
        }),
    }),
    { name: "hm-auth-v2" }
  )
);

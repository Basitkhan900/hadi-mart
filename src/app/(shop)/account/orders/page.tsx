"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Package, CheckCircle2, Truck, Clock, XCircle } from "lucide-react";
import { useOrders, useCatalog } from "../../../../lib/store";
import { orders as seedOrders } from "../../../../lib/db";
import { pkr, STATUS_COLORS, STATUS_LABELS } from "../../../../lib/types";
import type { Order, Product } from "../../../../lib/types";

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending:    <Clock size={16} />,
  processing: <Package size={16} />,
  shipped:    <Truck size={16} />,
  delivered:  <CheckCircle2 size={16} />,
  cancelled:  <XCircle size={16} />,
};

function OrderCard({ order, products }: { order: Order; products: Product[] }) {
  const firstItem = products.find((p) => p.id === order.items[0]?.productId);

  return (
    <div className="card group transition hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {firstItem && (
            <img
              src={firstItem.images[0]}
              alt=""
              className="h-16 w-14 rounded-2xl object-cover"
            />
          )}
          <div>
            <p className="font-display text-lg font-bold">{order.id}</p>
            <p className="text-sm text-ink/50">
              {new Date(order.createdAt).toLocaleDateString("en-PK", { dateStyle: "medium" })}
            </p>
            <p className="text-sm text-ink/50">
              {order.items.reduce((a, i) => a + i.qty, 0)} item(s) · {order.payment}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className={`badge ${STATUS_COLORS[order.status]} flex items-center gap-1.5`}>
            {STATUS_ICONS[order.status]}
            {STATUS_LABELS[order.status]}
          </span>
          <p className="font-bold text-emerald text-lg">{pkr(order.total)}</p>
        </div>
      </div>

      {/* Items */}
      <div className="mt-4 space-y-2 border-t pt-4">
        {order.items.map((item) => {
          const p = products.find((x) => x.id === item.productId);
          return (
            <div key={item.productId} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {p && <img src={p.images[0]} alt="" className="h-8 w-7 rounded-lg object-cover" />}
                <span className="text-ink/70">{p?.name ?? item.productId}</span>
                <span className="text-ink/40">×{item.qty}</span>
              </div>
              <span className="font-medium">{pkr(item.price * item.qty)}</span>
            </div>
          );
        })}
      </div>

      {/* Delivery address */}
      {order.address && (
        <div className="mt-3 rounded-xl bg-ink/5 px-4 py-2.5 text-xs text-ink/60">
          📍 {order.address.name} · {order.address.street}, {order.address.city}
        </div>
      )}
    </div>
  );
}

function OrdersContent() {
  const params = useSearchParams();
  const successId = params.get("success");
  const { orders: userOrders } = useOrders();
  const products = useCatalog((s) => s.products);

  // Merge user placed orders + seed orders
  const allOrders = [...userOrders, ...seedOrders].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      {/* Success banner */}
      {successId && (
        <div className="mb-8 flex items-center gap-4 rounded-3xl bg-emerald/10 p-5">
          <CheckCircle2 size={32} className="shrink-0 text-emerald" />
          <div>
            <p className="font-bold text-emerald">Order placed successfully!</p>
            <p className="text-sm text-ink/60">
              Your order <strong>{successId}</strong> has been confirmed. We'll deliver it soon!
            </p>
          </div>
        </div>
      )}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-extrabold">My Orders</h1>
          <p className="mt-1 text-ink/50">{allOrders.length} order{allOrders.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/shop" className="btn-outline text-sm">
          Shop More
        </Link>
      </div>

      {allOrders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <Package size={48} className="text-ink/20" />
          <p className="font-display text-2xl font-bold">No orders yet</p>
          <p className="text-ink/50">Your order history will appear here.</p>
          <Link href="/shop" className="btn-emerald">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {allOrders.map((order) => (
            <OrderCard key={order.id} order={order} products={products} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center">Loading orders…</div>}>
      <OrdersContent />
    </Suspense>
  );
}

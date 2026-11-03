"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronRight, CreditCard, Smartphone, Truck, Banknote, Lock, AlertCircle, Loader2 } from "lucide-react";
import { useCart, useCatalog, useOrders, useAuth } from "@/lib/store";
import { pkr, type Address } from "@/lib/types";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripePaymentForm from "@/components/StripePaymentForm";
import { motion, AnimatePresence } from "framer-motion";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const schema = z.object({
  name:    z.string().min(2, "Full name required"),
  phone:   z.string().min(10, "Valid phone number required"),
  street:  z.string().min(5, "Street address required"),
  city:    z.string().min(2, "City required"),
  email:   z.string().email("Valid email required").optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;
type PaymentMethod = "COD" | "JazzCash" | "Easypaisa" | "Card";

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "COD",      label: "Cash on Delivery", icon: <Truck size={20} />,       desc: "Pay when you receive" },
  { id: "JazzCash", label: "JazzCash",          icon: <Smartphone size={20} />, desc: "Pay via JazzCash app" },
  { id: "Easypaisa",label: "Easypaisa",         icon: <Smartphone size={20} />, desc: "Pay via Easypaisa app" },
  { id: "Card",     label: "Credit / Debit Card",icon: <CreditCard size={20} />,desc: "Visa, Mastercard" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { items, coupon, clear } = useCart();
  const products = useCatalog((s) => s.products);
  const { place } = useOrders();
  const { isLoggedIn, name: userName, email: userEmail } = useAuth();
  const [payment, setPayment] = useState<PaymentMethod>("COD");
  const [step, setStep] = useState<"details" | "payment" | "confirm">("details");
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Auth guard: redirect to login if not signed in ──────────────────────────
  useEffect(() => {
    if (mounted && !isLoggedIn) {
      router.replace("/login?redirect=/checkout");
    }
  }, [mounted, isLoggedIn, router]);

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const lines = Object.entries(items)
    .map(([id, qty]) => ({ p: products.find((x) => x.id === id), qty }))
    .filter((l) => l.p);

  const sub = lines.reduce((a, l) => a + (l.p!.salePrice ?? l.p!.price) * l.qty, 0);
  const discount = coupon ? Math.round((sub * coupon.percent) / 100) : 0;
  const delivery = sub >= 3000 ? 0 : 200;
  const total = sub - discount + delivery;

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2A4434] border-t-transparent" />
        <p className="font-display text-lg font-medium text-stone-600 dark:text-stone-300">Loading checkout...</p>
      </div>
    );
  }

  // Show a redirect screen while navigating to login
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-32 text-center px-4">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-[#EAF0E6] dark:bg-[#1F3025]">
          <Lock size={28} className="text-[#2A4434] dark:text-[#A4B896]" />
        </div>
        <div className="space-y-1">
          <h2 className="font-serif text-2xl font-bold text-stone-800 dark:text-stone-100">Sign in to Checkout</h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
            Please log in or create a free account to place your order securely.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/login?redirect=/checkout"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2A4434] px-8 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#1C2F24] dark:bg-[#A4B896] dark:text-[#0f1a17]"
          >
            Sign In
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 dark:border-stone-700 px-8 py-3 text-sm font-semibold text-stone-700 dark:text-stone-300 transition hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-32 text-center">
        <p className="font-display text-2xl font-bold">Your cart is empty</p>
        <Link href="/shop" className="btn-emerald">Browse products</Link>
      </div>
    );
  }

  const proceedToConfirm = async () => {
    if (payment === "Card") {
      setStripeLoading(true);
      setStripeError("");
      try {
        const res = await fetch("/api/stripe/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: total,
            currency: "pkr",
            customerEmail: userEmail || getValues("email"),
            orderMetadata: {
              customerName: getValues("name"),
              phone: getValues("phone"),
            },
          }),
        });

        const data = await res.json();
        if (res.ok && data.clientSecret) {
          setStripeClientSecret(data.clientSecret);
          setStep("confirm");
        } else {
          setStripeError(data.error || "Failed to initialize card payment.");
        }
      } catch (err: any) {
        setStripeError(err.message || "Network error initializing card payment.");
      } finally {
        setStripeLoading(false);
      }
    } else {
      setStep("confirm");
    }
  };

  const placeOrder = async (data: FormData, paymentIntentId?: string) => {
    const address: Address = { name: data.name, phone: data.phone, street: data.street, city: data.city };
    const orderPayload = {
      userId: userEmail || "guest",
      items: lines.map((l) => ({ productId: l.p!.id, qty: l.qty, price: l.p!.salePrice ?? l.p!.price })),
      total,
      status: "pending" as const,
      payment: paymentIntentId ? (`Card (Stripe: ${paymentIntentId})` as PaymentMethod) : payment,
      address,
    };

    // Save to server API
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
    } catch (e) {
      console.error("Error posting order to API:", e);
    }

    const id = place(orderPayload);
    clear();
    router.push(`/account/orders?success=${id}`);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <h1 className="mb-8 font-display text-4xl font-extrabold">Checkout</h1>

      {/* Steps indicator */}
      <div className="mb-10 flex items-center gap-2 text-sm">
        {[["details", "Address"], ["payment", "Payment"], ["confirm", "Review"]].map(([key, label], i) => {
          const stepIdx = step === "details" ? 0 : step === "payment" ? 1 : 2;
          const isCurrent = step === key;
          const isDone = i < stepIdx;
          return (
            <span key={key} className="flex items-center gap-2">
              {i > 0 && <ChevronRight size={14} className="text-ink/30" />}
              <span className={`flex items-center gap-1.5 font-semibold ${isCurrent ? "text-emerald" : isDone ? "text-ink/60" : "text-ink/30"}`}>
                <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${isCurrent ? "bg-emerald text-white" : isDone ? "bg-emerald/20 text-emerald" : "border"}`}>
                  {i + 1}
                </span>
                {label}
              </span>
            </span>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: form */}
        <div className="space-y-6 lg:col-span-2">
          <AnimatePresence mode="wait">
            {/* Step 1: Address */}
            {step === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25 }}
                className="card space-y-4"
              >
                <h2 className="font-display text-xl font-bold">Delivery Address</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">Full Name *</label>
                    <input {...register("name")} placeholder="Ahmed Ali" className="input" />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">Phone *</label>
                    <input {...register("phone")} placeholder="0300-1234567" className="input" />
                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">Email (optional)</label>
                  <input {...register("email")} type="email" placeholder="you@email.com" className="input" />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">Street Address *</label>
                  <input {...register("street")} placeholder="House No., Street, Block" className="input" />
                  {errors.street && <p className="mt-1 text-xs text-red-500">{errors.street.message}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">City *</label>
                  <input {...register("city")} placeholder="Lahore" className="input" />
                  {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
                </div>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit(() => setStep("payment"))}
                  className="btn-emerald w-full cursor-pointer"
                >
                  Continue to Payment
                </motion.button>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {step === "payment" && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25 }}
                className="card space-y-4"
              >
                <h2 className="font-display text-xl font-bold">Payment Method</h2>
                <div className="space-y-3">
                  {PAYMENT_OPTIONS.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition
                        ${payment === opt.id ? "border-emerald bg-emerald/5" : "hover:bg-ink/5"}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={opt.id}
                        checked={payment === opt.id}
                        onChange={() => setPayment(opt.id)}
                        className="sr-only"
                      />
                      <span className={`${payment === opt.id ? "text-emerald" : "text-ink/50"}`}>{opt.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold">{opt.label}</p>
                        <p className="text-xs text-ink/50">{opt.desc}</p>
                      </div>
                      {payment === opt.id && <Check size={18} className="text-emerald" />}
                    </label>
                  ))}
                </div>
                {stripeError && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{stripeError}</span>
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => setStep("details")} className="btn-outline flex-1 cursor-pointer">Back</button>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={proceedToConfirm}
                    disabled={stripeLoading}
                    className="btn-emerald flex-1 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {stripeLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Setting up Payment...
                      </>
                    ) : (
                      "Review Order"
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirm */}
            {step === "confirm" && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25 }}
                className="card space-y-5"
              >
                <h2 className="font-display text-xl font-bold">
                  {payment === "Card" ? "Pay & Complete Order" : "Review & Place Order"}
                </h2>

                {/* Address summary */}
                <div className="rounded-2xl bg-ink/5 p-4 text-sm">
                  <p className="font-semibold">Delivering to:</p>
                  <p className="mt-1 text-ink/60">{getValues("name")} · {getValues("phone")}</p>
                  <p className="text-ink/60">{getValues("street")}, {getValues("city")}</p>
                </div>

                {/* Payment summary */}
                <div className="rounded-2xl bg-ink/5 p-4 text-sm">
                  <p className="font-semibold">Payment Method:</p>
                  <p className="mt-1 text-ink/60">{PAYMENT_OPTIONS.find((o) => o.id === payment)?.label}</p>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {lines.map(({ p: prod, qty }) => (
                    <div key={prod!.id} className="flex items-center gap-3 text-sm">
                      <img src={prod!.images[0]} alt="" className="h-12 w-10 rounded-xl object-cover" />
                      <div className="flex-1">
                        <p className="font-medium">{prod!.name}</p>
                        <p className="text-ink/50">Qty: {qty}</p>
                      </div>
                      <p className="font-semibold">{pkr((prod!.salePrice ?? prod!.price) * qty)}</p>
                    </div>
                  ))}
                </div>

                {/* Card Payment Form via Stripe Elements */}
                {payment === "Card" && stripeClientSecret && stripePromise ? (
                  <div className="pt-2">
                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret: stripeClientSecret,
                        appearance: {
                          theme: "stripe",
                        },
                      }}
                    >
                      <StripePaymentForm
                        total={total}
                        onSuccess={(intentId) => placeOrder(getValues(), intentId)}
                        onCancel={() => setStep("payment")}
                      />
                    </Elements>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button onClick={() => setStep("payment")} className="btn-outline flex-1 cursor-pointer">Back</button>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmit((data) => placeOrder(data))}
                      className="btn-emerald flex-1 gap-2 cursor-pointer flex items-center justify-center"
                    >
                      <Banknote size={18} /> Place Order
                    </motion.button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: order summary */}
        <div>
          <div className="card sticky top-24 space-y-4">
            <h2 className="font-display text-xl font-bold">Order Summary</h2>
            <div className="space-y-3 divide-y">
              {lines.map(({ p: prod, qty }) => (
                <div key={prod!.id} className="flex items-center gap-3 pt-3 first:pt-0 text-sm">
                  <div className="relative">
                    <img src={prod!.images[0]} alt="" className="h-14 w-12 rounded-xl object-cover" />
                    <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] text-white">{qty}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{prod!.name}</p>
                    <p className="text-xs text-ink/50">{prod!.brand}</p>
                  </div>
                  <p className="font-semibold">{pkr((prod!.salePrice ?? prod!.price) * qty)}</p>
                </div>
              ))}
            </div>

            <dl className="space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-ink/60">Subtotal</dt><dd>{pkr(sub)}</dd></div>
              {discount > 0 && <div className="flex justify-between text-emerald"><dt>Coupon ({coupon?.code})</dt><dd>-{pkr(discount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-ink/60">Delivery</dt><dd className={delivery === 0 ? "text-emerald" : ""}>{delivery === 0 ? "Free" : pkr(delivery)}</dd></div>
              <div className="flex justify-between border-t pt-2 text-base font-bold"><dt>Total</dt><dd className="text-emerald">{pkr(total)}</dd></div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}


"use client";
import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Lock, AlertCircle, Loader2 } from "lucide-react";
import { pkr } from "@/lib/types";

interface Props {
  total: number;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
}

export default function StripePaymentForm({ total, onSuccess, onCancel }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "Payment failed. Please check your card.");
        setLoading(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onSuccess(paymentIntent.id);
      } else {
        setErrorMessage("Unexpected status: " + (paymentIntent?.status || "unknown"));
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide flex items-center gap-1.5">
            <Lock size={13} className="text-[#2A4434] dark:text-[#A4B896]" />
            Secure Card Payment (Stripe)
          </span>
          <span className="text-xs font-bold text-[#2A4434] dark:text-[#A4B896]">
            Total: {pkr(total)}
          </span>
        </div>

        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {errorMessage && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="btn-outline flex-1 py-3 text-sm font-semibold disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!stripe || !elements || loading}
          className="btn-emerald flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Processing Payment...
            </>
          ) : (
            `Pay ${pkr(total)} & Complete Order`
          )}
        </button>
      </div>
    </form>
  );
}


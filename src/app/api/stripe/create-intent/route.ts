import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export async function POST(req: Request) {
  try {
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Stripe secret key is not configured in .env.local" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-09-30.acacia" as any,
    });

    const body = await req.json();
    const { amount, currency = "pkr", customerEmail, orderMetadata } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    // Stripe expects amount in smallest currency unit (e.g. cents for USD, paisa for PKR)
    const amountInSmallestUnit = Math.round(Number(amount) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: currency.toLowerCase(),
      receipt_email: customerEmail || undefined,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: orderMetadata || {},
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    });
  } catch (err: any) {
    console.error("Stripe PaymentIntent error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create payment intent" },
      { status: 500 }
    );
  }
}


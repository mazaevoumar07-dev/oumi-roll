import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const { amount, orderId } = await request.json() as { amount: number; orderId: string };

    if (typeof amount !== "number" || amount < 0.5 || typeof orderId !== "string") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // euros → cents
      currency: "eur",
      automatic_payment_methods: { enabled: true },
      metadata: { orderId },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("[create-intent]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

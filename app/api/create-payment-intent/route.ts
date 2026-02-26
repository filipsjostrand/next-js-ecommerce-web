import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-01-28.clover",
});

interface CartItem {
  productId: string;
  quantity: number;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { items: CartItem[] };

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Hämta alla produkter från DB baserat på productIds
    const productIds = body.items.map((item) => item.productId);

    const products = await db.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    if (products.length === 0) {
      return NextResponse.json(
        { error: "Products not found" },
        { status: 404 }
      );
    }

    // Räkna ut totalsumman på servern
    let totalAmount = 0;

    for (const item of body.items) {
      const product = products.find((p) => p.id === item.productId);

      if (!product) {
        return NextResponse.json(
          { error: "Invalid product in cart" },
          { status: 400 }
        );
      }

      if (item.quantity <= 0) {
        return NextResponse.json(
          { error: "Invalid quantity" },
          { status: 400 }
        );
      }

      totalAmount += product.price * item.quantity;
    }

    if (totalAmount < 500) {
      return NextResponse.json(
        { error: "Amount too low (minimum 5 SEK)" },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: "sek",
      automatic_payment_methods: { enabled: true },
      metadata: {
        integration: "sportify-store",
        itemCount: body.items.length.toString(),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    console.error("Stripe create-payment-intent error:", error);

    return NextResponse.json(
      { error: "Could not initiate payment" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe"; // Säker instans från lib
import { db } from "@/lib/db";

interface CartItem {
  productId: string;
  quantity: number;
}

export async function POST(req: Request) {
  try {
    // 1. Kontrollera att stripe är tillgängligt (viktigt för build-steg)
    if (!stripe) {
      console.error("Stripe is not configured. Missing STRIPE_SECRET_KEY.");
      return NextResponse.json(
        { error: "Payment service unavailable" },
        { status: 500 }
      );
    }

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
      const product = products.find(
        (p) => p.id === item.productId
      );

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

    // Stripe kräver minst 500 öre (5 SEK)
    if (totalAmount < 500) {
      return NextResponse.json(
        { error: "Amount too low (minimum 5 SEK)" },
        { status: 400 }
      );
    }

    // 2. Skapa PaymentIntent med importerad stripe-instans
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
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

interface CheckoutItem {
  productId: string;
  quantity: number;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ?? null;

    const body = (await req.json()) as { items: CheckoutItem[] };

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    const productIds = body.items.map((item) => item.productId);

    const products = await db.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    if (products.length !== body.items.length) {
      return NextResponse.json(
        { error: "One or more products are invalid" },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const line_items = body.items.map((item) => {
      const product = products.find(
        (p: (typeof products)[number]) => p.id === item.productId
      );

      if (!product) {
        throw new Error("Invalid product in cart");
      }

      if (item.quantity <= 0) {
        throw new Error("Invalid quantity");
      }

      return {
        quantity: item.quantity,
        price_data: {
          currency: "sek",
          product_data: {
            name: product.name,
            images: product.imageUrl ? [product.imageUrl] : [],
            metadata: {
              productId: product.id,
            },
          },
          unit_amount: product.price,
        },
        metadata: {
          productId: product.id,
        },
      };
    });

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["SE"],
      },
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      metadata: {
        userId: userId ?? "guest",
        isGuest: userId ? "false" : "true",
      },
      customer_email: session?.user?.email || undefined,
    });

    return NextResponse.json({ url: stripeSession.url });

  } catch (error) {
    console.error("STRIPE_CHECKOUT_ERROR:", error);

    return NextResponse.json(
      { error: "Could not create checkout session" },
      { status: 500 }
    );
  }
}

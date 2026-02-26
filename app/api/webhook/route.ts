import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

type CheckoutSessionWithShipping = Stripe.Checkout.Session & {
  shipping_details?: {
    address?: Stripe.Address;
  };
};

export async function POST(req: Request) {
  const body = await req.text();
  const headerList = await headers();
  const sig = headerList.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return new Response("Webhook Error: Missing signature or secret", {
      status: 400,
    });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response("Webhook Error: " + errorMessage, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const expandedSession = (await stripe.checkout.sessions.retrieve(
      (event.data.object as Stripe.Checkout.Session).id,
      {
        expand: ["line_items.data.price.product", "shipping_details"],
      },
    )) as CheckoutSessionWithShipping;
  }

  return NextResponse.json({ received: true });
}

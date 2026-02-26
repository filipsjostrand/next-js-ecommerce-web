import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

// Utökad typ för att få shipping_details utan TS-fel
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
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error";
    return new Response(`Webhook Error: ${errorMessage}`, {
      status: 400,
    });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const expandedSession =
      (await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["line_items.data.price.product", "shipping_details"],
      })) as CheckoutSessionWithShipping;

    const userId = expandedSession.metadata?.userId || null;
    const customerEmail =
      expandedSession.customer_details?.email || "";
    const customerName =
      expandedSession.customer_details?.name || "";

    const addr =
      expandedSession.shipping_details?.address ||
      expandedSession.customer_details?.address;

    const addressString = addr
      ? `${addr.line1}${
          addr.line2 ? `, ${addr.line2}` : ""
        }, ${addr.postal_code} ${addr.city}`
      : "No address provided";

    try {
      await db.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1. Skapa order
        const order = await tx.order.create({
          data: {
            userId,
            customerEmail,
            customerName,
            address: addressString,
            total: expandedSession.amount_total || 0,
            status: "PAID",
          },
        });

        // 2. Orderrader
        const lineItems = expandedSession.line_items?.data;

        if (lineItems) {
          for (const item of lineItems) {
            const stripeProduct =
              item.price?.product as Stripe.Product;

            const productId =
              stripeProduct.metadata?.productId;

            if (productId) {
              await tx.orderItem.create({
                data: {
                  orderId: order.id,
                  productId,
                  quantity: item.quantity || 1,
                  price: item.price?.unit_amount || 0,
                },
              });

              // 3. Minska lagret
              await tx.product.update({
                where: { id: productId },
                data: {
                  stock: {
                    decrement: item.quantity || 1,
                  },
                },
              });
            }
          }
        }

        // 4. Töm kundvagnen om användaren var inloggad
        if (userId) {
          await tx.cartItem.deleteMany({
            where: { userId },
          });
        }
      });
    } catch (dbError) {
      console.error("DB ERROR:", dbError);
      return new Response("Database Error", { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
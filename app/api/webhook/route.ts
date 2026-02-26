import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.text();
  const headerList = await headers();
  const sig = headerList.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return new Response("Webhook Error: Missing signature or secret", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Hämta sessionen med rätt expansioner
    const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["line_items", "line_items.data.price.product", "shipping_details"],
    });

    const userId = expandedSession.metadata?.userId || null;
    const customerEmail = expandedSession.customer_details?.email || "";
    const customerName = expandedSession.customer_details?.name || "";

    const addr =
      expandedSession.shipping_details?.address ||
      expandedSession.customer_details?.address;

    const addressString = addr
      ? `${addr.line1}${addr.line2 ? `, ${addr.line2}` : ""}, ${addr.postal_code} ${addr.city}`
      : "No address provided";

    try {
      await db.$transaction(async (tx) => {
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

        const lineItems = expandedSession.line_items?.data;

        if (lineItems) {
          for (const item of lineItems) {
            const stripeProduct = item.price?.product as Stripe.Product;
            const productId = stripeProduct.metadata?.productId;

            if (productId) {
              await tx.orderItem.create({
                data: {
                  orderId: order.id,
                  productId,
                  quantity: item.quantity || 1,
                  price: item.price?.unit_amount || 0,
                },
              });

              await tx.product.update({
                where: { id: productId },
                data: {
                  stock: { decrement: item.quantity || 1 },
                },
              });
            }
          }
        }

        if (userId) {
          await tx.cartItem.deleteMany({ where: { userId } });
        }
      });
    } catch (dbError) {
      return new Response("Database Error", { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

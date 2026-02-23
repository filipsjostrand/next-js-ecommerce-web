import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  // 1. Hämta bodyn som råtext (Viktigt!)
  const body = await req.text();
  const headerList = await headers();
  const sig = headerList.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error("Webhook Error: Missing signature or secret");
    return new Response("Webhook Error: Missing signature or secret", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // 2. Verifiera att eventet faktiskt kommer från Stripe
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Webhook Signature Validation Failed: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // 3. Hantera betalningen
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Expandera sessionen för att få med line_items (produkterna)
    const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["line_items.data.price.product"],
    });

    const userId = expandedSession.metadata?.userId;
    const customerEmail = expandedSession.customer_details?.email || "";
    const customerName = expandedSession.customer_details?.name || "";
    const addr = expandedSession.shipping_details?.address || expandedSession.customer_details?.address;
    const addressString = addr ? `${addr.line1}, ${addr.postal_code} ${addr.city}` : "Ingen adress";

    try {
      await db.$transaction(async (tx) => {
        // Skapa ordern
        const order = await tx.order.create({
          data: {
            userId: userId || null,
            customerEmail,
            customerName,
            address: addressString,
            total: expandedSession.amount_total || 0,
            status: "PAID",
          },
        });

        // Loopa igenom produkterna och minska lagret
        const lineItems = expandedSession.line_items?.data;
        if (lineItems) {
          for (const item of lineItems) {
            const product = item.price?.product as Stripe.Product;
            const productId = product.metadata.productId;

            if (productId) {
              // Skapa order-rad
              await tx.orderItem.create({
                data: {
                  orderId: order.id,
                  productId: productId,
                  quantity: item.quantity || 1,
                  price: item.price?.unit_amount || 0,
                },
              });

              // Minska lagret i DB
              await tx.product.update({
                where: { id: productId },
                data: { stock: { decrement: item.quantity || 1 } },
              });
            }
          }
        }

        // Töm korgen om användaren var inloggad
        if (userId) {
          await tx.cartItem.deleteMany({ where: { userId } });
        }
      });
      console.log("✅ Order och lager uppdaterat!");
    } catch (dbError) {
      console.error("❌ Database Error:", dbError);
      return new Response("Database Error", { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
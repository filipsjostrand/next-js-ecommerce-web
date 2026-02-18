import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  // 1. Get the raw body for Stripe signature verification
  const body = await req.text();

  // 2. Get the signature (asynchronous in Next.js 15+)
  const headerList = await headers();
  const sig = headerList.get("stripe-signature");

  if (!sig) {
    return new Response("Missing stripe-signature", { status: 400 });
  }

  let event: Stripe.Event;

  // 3. Verify that the event actually comes from Stripe
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (_) {
    return new Response("Webhook verification failed", { status: 400 });
  }

  // 4. Handle the successful payment event
  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const userId = intent.metadata.userId;

    if (!userId) {
      return new Response("No userId found in metadata", { status: 400 });
    }

    // Fetch the user's cart items
    const cartItems = await db.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return new Response("Cart is empty", { status: 400 });
    }

    try {
      // 5. ATOMIC TRANSACTION: Everything succeeds or everything rolls back
      await db.$transaction(async (tx) => {

        // A. Create the Order and its items
        await tx.order.create({
          data: {
            userId: userId,
            total: intent.amount,
            status: "PAID", // Ensure this matches your Prisma Enum/String casing
            items: {
              create: cartItems.map((item) => ({
                productId: item.productId,
                price: item.product.price,
                quantity: item.quantity,
              })),
            },
          },
        });

        // B. Decrement stock for each product
        for (const item of cartItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        // C. Clear the user's cart
        await tx.cartItem.deleteMany({
          where: { userId },
        });
      });

      console.log(`Order created and stock updated for user: ${userId}`);
    }
// _ _ _
    // catch (error) {
    //   console.error("Database transaction failed:", error);
    //   return new Response("Internal Server Error", { status: 500 });
    // }
// _ _ _

  catch (error) {
    console.error("POST /api/cart ERROR:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }


  }

  // 6. Return a 200 response to Stripe to acknowledge receipt
  return NextResponse.json({ received: true });
}
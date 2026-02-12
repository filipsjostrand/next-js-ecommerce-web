import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cartItems = await db.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: true },
  });

  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: cartItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.product.name,
        },
        unit_amount: item.product.price,
      },
      quantity: item.quantity,
    })),
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
  });

  return NextResponse.redirect(stripeSession.url!);
}


// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth"; // Or specific auth library
// import { authOptions } from "@/lib/auth";
// import { stripe } from "@/lib/stripe";
// import { db } from "@/lib/db";

// export async function POST(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session || !session.user) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     // 1. Fetch cart items to create Stripe line items
//     const cartItems = await db.cartItem.findMany({
//       where: { userId: session.user.id },
//       include: { product: true },
//     });

//     if (cartItems.length === 0) {
//       return new NextResponse("Cart is empty", { status: 400 });
//     }

//     // 2. Map cart items to Stripe format
//     const line_items = cartItems.map((item) => ({
//       quantity: item.quantity,
//       price_data: {
//         currency: "usd",
//         product_data: {
//           name: item.product.name,
//           images: [item.product.imageUrl], // Use the correct Prisma field name
//         },
//         unit_amount: Math.round(item.product.price * 100), // Stripe expects cents
//       },
//     }));

//     // 3. Create Stripe Checkout Session
//     const checkoutSession = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items,
//       mode: "payment",
//       success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,

//       // IMPORTANT: This is what the Webhook uses!
//       metadata: {
//         userId: session.user.id,
//       },
//     });

//     return NextResponse.json({ url: checkoutSession.url });
//   } catch (error) {
//     console.error("[CHECKOUT_ERROR]", error);
//     return new NextResponse("Internal Error", { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

// Definiera vad ett objekt i korgen innehåller
interface CartItem {
  quantity: number;
  product: {
    name: string;
    price: number; // Pris i ören från databasen
    imageUrl?: string | null;
  };
}

export async function POST(req: Request) {
  try {
    // VI HAR TAGIT BORT NEXT-AUTH KONTROLLEN HÄR FÖR ATT TILLÅTA GÄSTER

    const body = await req.json();
    const { items }: { items: CartItem[] } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Korgen är tom" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const line_items = items.map((item: any) => ({
      quantity: item.quantity,
      price_data: {
        currency: "sek",
        product_data: {
          name: item.product.name,
          images: item.product.imageUrl ? [item.product.imageUrl] : [],
          // Skicka med databasens ID till Stripe
          metadata: {
            productId: item.product.id,
          },
        },
        unit_amount: Math.round(item.product.price),
      },
    }));

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
      // Vi lämnar metadata tom eller tar bort den helt eftersom vi inte har ett userId
      metadata: {
        isGuest: "true",
      },
    });

    return NextResponse.json({ url: stripeSession.url });

  } catch (error) {
    console.error("STRIPE_CHECKOUT_ERROR:", error);
    return NextResponse.json({ error: "Kunde inte skapa betalsession" }, { status: 500 });
  }
}

// _ _ _ (2026-02-23 rev00)

// import { NextResponse } from "next/server";
// import { stripe } from "@/lib/stripe";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";

// // Definiera vad ett objekt i korgen innehåller
// interface CartItem {
//   quantity: number;
//   product: {
//     name: string;
//     price: number; // Pris i ören från databasen
//     imageUrl?: string | null;
//   };
// }

// export async function POST(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user) {
//       return NextResponse.json({ error: "Du måste vara inloggad" }, { status: 401 });
//     }

//     const body = await req.json();
//     const { items }: { items: CartItem[] } = body;

//     if (!items || items.length === 0) {
//       return NextResponse.json({ error: "Korgen är tom" }, { status: 400 });
//     }

//     // Hämta bas-URL och säkerställ att den har http/https
//     const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

//     // 1. Förbered artiklarna för Stripe
//     const line_items = items.map((item) => ({
//       quantity: item.quantity,
//       price_data: {
//         currency: "sek",
//         product_data: {
//           name: item.product.name,
//           images: item.product.imageUrl ? [item.product.imageUrl] : [],
//         },
//         // Eftersom p.price redan är i ören (t.ex. 13300), multiplicera INTE med 100 igen!
//         unit_amount: Math.round(item.product.price),
//       },
//     }));

//     // 2. Skapa Stripe Checkout Session
//     const stripeSession = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items,
//       mode: "payment",
//       billing_address_collection: "required",
//       shipping_address_collection: {
//         allowed_countries: ["SE"],
//       },
//       // Använd baseUrl-variabeln vi skapade ovan
//       success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${baseUrl}/cart`,
//       metadata: {
//         userId: session.user.id,
//       },
//     });

//     return NextResponse.json({ url: stripeSession.url });

//   } catch (error) {
//     console.error("STRIPE_CHECKOUT_ERROR:", error);
//     return NextResponse.json({ error: "Kunde inte skapa betalsession" }, { status: 500 });
//   }
// }

// _ _ _ (före 2026-02-23)

// import { NextResponse } from "next/server";
// import { stripe } from "@/lib/stripe";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";

// export async function POST(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);

//     // Vi kräver att man är inloggad för att checka ut (för att få ett userId)
//     if (!session?.user) {
//       return NextResponse.json({ error: "Du måste vara inloggad" }, { status: 401 });
//     }

//     const body = await req.json();
//     const { items } = body; // Vi behöver inte 'customer' längre, Stripe sköter det!

//     if (!items || items.length === 0) {
//       return NextResponse.json({ error: "Korgen är tom" }, { status: 400 });
//     }

//     // 1. Förbered artiklarna för Stripe
//     const line_items = items.map((item: any) => ({
//       quantity: item.quantity,
//       price_data: {
//         currency: "sek",
//         product_data: {
//           name: item.product.name,
//           images: item.product.imageUrl ? [item.product.imageUrl] : [],
//         },
//         // Stripe vill ha priset i ören!
//         unit_amount: Math.round(item.product.price * 100),
//       },
//     }));

//     // 2. Skapa Stripe Checkout Session
//     const stripeSession = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items,
//       mode: "payment",
//       // Stripe tvingar nu användaren att skriva namn, mail och adress:
//       billing_address_collection: "required",
//       shipping_address_collection: {
//         allowed_countries: ["SE"], // Tillåt endast Sverige
//       },
//       success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
//       metadata: {
//         userId: session.user.id, // Skickas med till webhooken för att koppla ordern
//       },
//     });

//     // 3. Skicka tillbaka URL:en till Stripes betalsida
//     return NextResponse.json({ url: stripeSession.url });

//   } catch (error) {
//     console.error("STRIPE_CHECKOUT_ERROR:", error);
//     return NextResponse.json({ error: "Kunde inte skapa betalsession" }, { status: 500 });
//   }
// }

// _ _ _
// _ _ _

// import { NextResponse } from "next/server";
// import { db } from "@/lib/db";

// // Definiera typer för inkommande data
// interface CartItem {
//   productId: string;
//   quantity: number;
//   product: {
//     price: number;
//   };
// }

// interface CustomerInfo {
//   name: string;
//   email: string;
//   address: string;
// }

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { items, customer }: { items: CartItem[]; customer: CustomerInfo } = body;

//     if (!items || items.length === 0) {
//       return NextResponse.json({ error: "Korgen är tom" }, { status: 400 });
//     }

//     const order = await db.order.create({
//       data: {
//         customerEmail: customer.email,
//         customerName: customer.name,
//         address: customer.address,
//         // Nu är 'i' typad som CartItem istället för any
//         total: items.reduce((sum, i) => sum + (i.product.price * i.quantity), 0),
//         status: "PENDING",
//         items: {
//           create: items.map((item) => ({
//             productId: item.productId,
//             quantity: item.quantity,
//             price: item.product.price,
//           })),
//         },
//       },
//     });

//     return NextResponse.json({ orderId: order.id, success: true });
//   } catch (error) {
//     console.error("CHECKOUT_ERROR:", error);
//     return NextResponse.json({ error: "Kunde inte skapa order" }, { status: 500 });
//   }
// }

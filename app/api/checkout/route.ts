import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 1. Definiera tydliga typer för inkommande data
interface CartItem {
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string | null;
  };
}

export async function POST(req: Request) {
  try {
    // 2. Hämta användarsession (för att koppla ordern till ett userId)
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const body = await req.json();
    const { items }: { items: CartItem[] } = body;

    // Validera att korgen inte är tom
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Korgen är tom" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // 3. Skapa line_items för Stripe
    // Vi lägger productId på TVÅ ställen för att vara 100% säkra på att det når Success-sidan
    const line_items = items.map((item) => {
      // Debug-logg för att se att produkterna vi skickar har ID:n
      console.log(`Förbereder checkout för: ${item.product.name} (ID: ${item.product.id})`);

      return {
        quantity: item.quantity,
        price_data: {
          currency: "sek",
          product_data: {
            name: item.product.name,
            images: item.product.imageUrl ? [item.product.imageUrl] : [],
            // Metadata på produktnivå
            metadata: {
              productId: item.product.id,
            },
          },
          unit_amount: Math.round(item.product.price),
        },
        // Metadata på radnivå (detta läses oftast av enklast i Success-sidan)
        metadata: {
          productId: item.product.id,
        },
      };
    });

    // 4. Skapa Stripe Checkout Session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["SE"],
      },
      // Vi skickar med session_id i URL:en för att hämta den på success-sidan
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,

      // Global metadata för hela ordern
      metadata: {
        userId: userId || "guest",
        isGuest: userId ? "false" : "true",
      },
      // Förifyll e-post om användaren är inloggad
      customer_email: session?.user?.email || undefined,
    });

    // Returnera URL:en som frontend omdirigerar till
    return NextResponse.json({ url: stripeSession.url });

  } catch (error) {
    console.error("STRIPE_CHECKOUT_ERROR:", error);
    return NextResponse.json(
      { error: "Kunde inte skapa betalsession. Kontrollera att alla produkter har giltiga ID:n." },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Kontrollera att nyckeln finns
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("FEL: STRIPE_SECRET_KEY saknas i .env");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-expect-error: Stripe förväntar sig en specifik datumsträng, men vi vill låta biblioteket sköta det
  apiVersion: null,
});

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    // Stripe kräver ett heltal (ören) och minst ca 500 (5 SEK)
    const validAmount = Math.round(amount);

    if (validAmount < 500) {
      return NextResponse.json(
        { error: "Beloppet är för lågt (minst 5 kr)" },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: validAmount,
      currency: "sek",
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: unknown) {
    // Typa om error till en instans av Error för att undvika 'any'
    const errorMessage = error instanceof Error ? error.message : "Ett okänt fel uppstod";

    console.error("STRIPE_ERROR:", errorMessage);

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
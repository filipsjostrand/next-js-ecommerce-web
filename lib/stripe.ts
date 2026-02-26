import Stripe from "stripe";

const STRIPE_API_VERSION: Stripe.LatestApiVersion = "2026-01-28.clover";

const apiKey = process.env.STRIPE_SECRET_KEY;

export const stripe = apiKey
  ? new Stripe(apiKey, { apiVersion: STRIPE_API_VERSION })
  : (null as unknown as Stripe); // Förhindrar krasch vid build

// Hjälpfunktion för att säkert hämta stripe i routes
export const getStripe = () => {
  if (!apiKey) return null;
  return stripe;
};

// import Stripe from "stripe";

// const STRIPE_API_VERSION: Stripe.LatestApiVersion =
//   "2026-01-28.clover";

// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: STRIPE_API_VERSION,
// });

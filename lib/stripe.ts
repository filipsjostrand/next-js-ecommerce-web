import Stripe from "stripe";

const STRIPE_API_VERSION: Stripe.LatestApiVersion =
  "2026-01-28.clover";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: STRIPE_API_VERSION,
});

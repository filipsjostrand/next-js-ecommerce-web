"use client";

import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { useState } from "react";

export default function PaymentForm({ items, customer, onClearCart }: any) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);

    // 1. Bekräfta betalningen hos Stripe
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message || "Något gick fel");
      setLoading(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      // 2. Om betalningen lyckades -> Skapa ordern i din databas
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items, customer }),
        });

        if (res.ok) {
          onClearCart();
          window.location.href = "/success"; // Skapa en enkel tack-sida
        }
      } catch (err) {
        setErrorMessage("Payment ok, but could not pay order. Contact support.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
      <button
        disabled={!stripe || loading}
        className="w-full bg-black text-white py-4 rounded-xl font-bold disabled:opacity-50"
      >
        {loading ? "Processing..." : "Pay for purchases"}
      </button>
    </form>
  );
}
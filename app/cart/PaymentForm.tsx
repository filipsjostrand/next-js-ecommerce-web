"use client";

import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { useState } from "react";

// 1. Definiera exakt hur ett CartItem ser ut
interface CartItem {
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
  };
}

// 2. Definiera kundens information
interface CustomerInfo {
  name: string;
  email: string;
  address: string;
}

// 3. Definiera komponentens Props
interface PaymentFormProps {
  items: CartItem[];
  customer: CustomerInfo;
  onClearCart: () => void;
}

export default function PaymentForm({ items, customer, onClearCart }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Säkerhetskoll så att Stripe är laddat
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMessage("");

    try {
      // 1. Bekräfta betalningen hos Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required", // Hanterar BankID/3D Secure om det behövs
      });

      if (error) {
        setErrorMessage(error.message || "An unexpected error occurred.");
        setLoading(false);
        return;
      }

      // 2. Om betalningen lyckades -> Spara ordern i databasen
      if (paymentIntent && paymentIntent.status === "succeeded") {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items,
            customer,
            paymentIntentId: paymentIntent.id
          }),
        });

        if (res.ok) {
          onClearCart();
          window.location.href = "/success";
        } else {
          // Om betalningen gick igenom men databasen svek
          throw new Error("Payment succeeded but order creation failed.");
        }
      }
    } catch (err) {
      console.error("Payment Error:", err);
      setErrorMessage("Something went wrong. Please contact support if your money was deducted.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-black">
      <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-sm">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-zinc-800 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Processing...</span>
          </div>
        ) : (
          "Complete Purchase"
        )}
      </button>

      <p className="text-center text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
        Secure encryption by Stripe
      </p>
    </form>
  );
}
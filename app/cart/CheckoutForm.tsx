"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "./PaymentForm";

// 1. Definiera typerna (du kan flytta dessa till en gemensam types.ts senare)
interface CartItem {
  productId: string;
  quantity: number;
  product: {
    name: string;
    price: number;
    imageUrl: string;
  };
}

interface CheckoutFormProps {
  items: CartItem[];
  onClearCart: () => void;
}

// Ladda in din public key från .env
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutForm({ items, onClearCart }: CheckoutFormProps) {
  const [clientSecret, setClientSecret] = useState("");
  const [customer, setCustomer] = useState({ name: "", email: "", address: "" });
  const [showPayment, setShowPayment] = useState(false);

  // 'i' har nu automatiskt rätt typ tack vare CheckoutFormProps
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const startPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Hämta clientSecret från din API-route
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });

      if (!res.ok) throw new Error("Kunde inte initiera betalning");

      const data = await res.json();
      setClientSecret(data.clientSecret);
      setShowPayment(true);
    } catch (err) {
      console.error("Payment Error:", err);
      alert("Något gick fel vid kommunikationen med Stripe.");
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-2xl shadow-sm">
      {!showPayment ? (
        <form onSubmit={startPayment} className="space-y-4">
          <h2 className="text-xl font-bold">Delivery details</h2>
          <input
            required
            placeholder="Namn"
            className="w-full p-3 border rounded-lg text-black"
            value={customer.name}
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
          />
          <input
            required
            type="email"
            placeholder="E-post"
            className="w-full p-3 border rounded-lg text-black"
            value={customer.email}
            onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
          />
          <textarea
            required
            placeholder="Adress"
            className="w-full p-3 border rounded-lg text-black"
            value={customer.address}
            onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
          />
          <button className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-zinc-800 transition">
            Continue to payment ({(total / 100).toFixed(2)} kr)
          </button>
        </form>
      ) : (
        clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <h2 className="text-xl font-bold mb-4">Complete payment</h2>
            <PaymentForm
              items={items}
              customer={customer}
              onClearCart={onClearCart}
            />
          </Elements>
        )
      )}
    </div>
  );
}
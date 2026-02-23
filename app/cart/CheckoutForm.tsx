"use client";

import { useState } from "react";
import axios from "axios";

interface CartItem {
  productId: string;
  quantity: number;
  product: {
    id: string; // Prisma ID
    name: string;
    price: number;
    imageUrl: string;
  };
}

interface CheckoutFormProps {
  items: CartItem[];
  onClearCart: () => void;
}

export default function CheckoutForm({ items }: CheckoutFormProps) {
  const [loading, setLoading] = useState(false);
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const onCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Vi skickar datan till vår färdiga API-route
      const response = await axios.post("/api/checkout", {
        items: items.map((item) => ({
          quantity: item.quantity,
          product: {
            id: item.productId, // VIKTIGT: Skickar Prisma-ID
            name: item.product.name,
            price: item.product.price,
            imageUrl: item.product.imageUrl
          }
        }))
      });

      // Skicka användaren till Stripes färdiga betalsida
      window.location = response.data.url;
    } catch (err) {
      console.error("Checkout Error:", err);
      alert("Något gick fel när betalningen skulle startas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-2xl shadow-sm">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>
      <div className="space-y-2 mb-6">
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between text-sm">
            <span>{item.product.name} x {item.quantity}</span>
            <span>{((item.product.price * item.quantity) / 100).toFixed(2)} kr</span>
          </div>
        ))}
        <div className="border-t pt-2 font-bold flex justify-between text-lg">
          <span>Total</span>
          <span>{(total / 100).toFixed(2)} kr</span>
        </div>
      </div>

      <form onSubmit={onCheckout}>
        <button
          disabled={loading}
          className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-zinc-800 transition disabled:bg-gray-400"
        >
          {loading ? "Loading..." : "Go to Payment"}
        </button>
      </form>

      <p className="text-xs text-center text-gray-500 mt-4">
        You will be redirected to Stripe's secure checkout.
      </p>
    </div>
  );
}
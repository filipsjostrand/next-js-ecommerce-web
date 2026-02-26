"use client";

import { useState } from "react";
import axios from "axios";

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

interface CheckoutFormProps {
  items: CartItem[];
  onClearCart: () => void;
}

export default function CheckoutForm({ items }: CheckoutFormProps) {
  const [loading, setLoading] = useState(false);

  const total = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  const onCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);

    try {
      const response = await axios.post("/api/checkout", {
        items: items.map((item) => ({
          productId: item.productId, // ✅ endast ID
          quantity: item.quantity,   // ✅ endast quantity
        })),
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      console.error("Checkout Error:", err);
      alert("Something went wrong when starting the payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm text-black">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>

      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between text-sm">
            <span className="text-zinc-600">
              {item.product.name}{" "}
              <span className="text-zinc-400 font-medium">
                x{item.quantity}
              </span>
            </span>
            <span className="font-medium">
              {((item.product.price * item.quantity) / 100).toFixed(2)} kr
            </span>
          </div>
        ))}

        <div className="border-t border-zinc-100 pt-4 mt-4 font-bold flex justify-between text-xl">
          <span>Total</span>
          <span>{(total / 100).toFixed(2)} kr</span>
        </div>
      </div>

      <form onSubmit={onCheckout}>
        <button
          disabled={loading || items.length === 0}
          className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:bg-zinc-300 disabled:cursor-not-allowed shadow-md"
        >
          {loading ? "Processing..." : "Pay with Stripe"}
        </button>
      </form>
    </div>
  );
}
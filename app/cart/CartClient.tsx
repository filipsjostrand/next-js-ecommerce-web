"use client";

import { useState } from "react";

type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
  };
};

export default function CartClient({
  initialItems,
}: {
  initialItems: CartItem[];
}) {
  const [items, setItems] = useState(initialItems);

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  async function updateQuantity(id: string, quantity: number) {
    if (quantity < 1) return;

    const item = items.find((i) => i.id === id);
    if (!item) return;

    if (quantity > item.product.stock) return;

    // 🔥 optimistic update
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity } : i
      )
    );

    await fetch(`/api/cart/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });

    window.dispatchEvent(new Event("cartUpdated"));
  }

  async function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));

    await fetch(`/api/cart/${id}`, {
      method: "DELETE",
    });

    window.dispatchEvent(new Event("cartUpdated"));
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        <p>Your cart is empty.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      <div className="space-y-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center border-b pb-4"
          >
            <div>
              <p className="font-medium">{item.product.name}</p>

              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() =>
                    updateQuantity(item.id, item.quantity - 1)
                  }
                  className="px-3 py-1 border rounded"
                >
                  -
                </button>

                <span>{item.quantity}</span>

                <button
                  onClick={() =>
                    updateQuantity(item.id, item.quantity + 1)
                  }
                  disabled={
                    item.quantity >= item.product.stock
                  }
                  className="px-3 py-1 border rounded disabled:opacity-40"
                >
                  +
                </button>

                <button
                  onClick={() => removeItem(item.id)}
                  className="ml-4 text-red-500 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>

            <p className="font-semibold">
              $
              {(
                (item.product.price * item.quantity) /
                100
              ).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between font-bold text-lg">
        <span>Total</span>
        <span>${(total / 100).toFixed(2)}</span>
      </div>
    </main>
  );
}

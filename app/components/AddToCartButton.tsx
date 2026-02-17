"use client";

import { useState } from "react";

export default function AddToCartButton({
  productId,
  stock,
}: {
  productId: string;
  stock: number;
}) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  function increase() {
    if (quantity < stock) setQuantity((q) => q + 1);
  }

  function decrease() {
    if (quantity > 1) setQuantity((q) => q - 1);
  }

  async function handleAdd() {
    try {
      setLoading(true);

      // Optimistic UI trigger
      window.dispatchEvent(
        new CustomEvent("cartOptimisticUpdate", {
          detail: { quantity },
        })
      );

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });

      if (!res.ok) throw new Error("Failed");

      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(new Event("showCartDrawer"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center gap-3">
        <button onClick={decrease} className="px-3 py-1 border rounded">
          -
        </button>

        <span>{quantity}</span>

        <button
          onClick={increase}
          className="px-3 py-1 border rounded"
          disabled={quantity >= stock}
        >
          +
        </button>
      </div>

      <button
        onClick={handleAdd}
        disabled={loading || stock === 0}
        className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition disabled:opacity-50"
      >
        {stock === 0
          ? "Out of stock"
          : loading
          ? "Adding..."
          : "Add to Cart"}
      </button>
    </div>
  );
}
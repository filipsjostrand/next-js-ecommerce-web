"use client";

import { useState } from "react";

// 1. Definitioner av typer
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

interface ProductProps {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
  };
}

export default function AddToCartButton({ product }: ProductProps) {
  const [loading, setLoading] = useState(false);

  const handleAdd = () => {
    try {
      setLoading(true);

      // Hämta korgen och berätta för TS att det är en lista av CartItem
      const currentCart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");

      // Nu vet TS vad 'item' är, så vi slipper 'any'
      const existingItemIndex = currentCart.findIndex(
        (item) => item.productId === product.id
      );

      if (existingItemIndex > -1) {
        currentCart[existingItemIndex].quantity += 1;
      } else {
        currentCart.push({
          productId: product.id,
          quantity: 1,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
          },
        });
      }

      localStorage.setItem("cart", JSON.stringify(currentCart));

      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(new Event("showCartDrawer"));

    } catch (error) {
      console.error("Fel vid tillägg i kundvagn:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAdd}
      disabled={loading}
      className="bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-zinc-800 transition active:scale-95 disabled:opacity-50"
    >
      {loading ? "Adding..." : "Add to Cart"}
    </button>
  );
}
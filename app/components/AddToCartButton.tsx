"use client";

import { useState } from "react";

// 1. Defined interfaces for full type-safety
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
    // Safety check for server-side rendering (though this only runs on click)
    if (typeof window === "undefined") return;

    try {
      setLoading(true);

      // Get current cart from localStorage safely
      const rawCart = localStorage.getItem("cart");
      const currentCart: CartItem[] = rawCart ? JSON.parse(rawCart) : [];

      // Check if product already exists in cart
      const existingItemIndex = currentCart.findIndex(
        (item) => item.productId === product.id
      );

      if (existingItemIndex > -1) {
        // Increment quantity
        currentCart[existingItemIndex].quantity += 1;
      } else {
        // Add new item
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

      // Save back to localStorage
      localStorage.setItem("cart", JSON.stringify(currentCart));

      // Trigger custom events to update CartIcon and CartDrawer
      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(new Event("showCartDrawer"));

    } catch (error) {
      console.error("Cart update error:", error);
    } finally {
      // Small timeout to show the "Adding..." state for better UX
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  return (
    <button
      onClick={handleAdd}
      disabled={loading}
      className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-zinc-800 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
    >
      {loading ? "Adding to cart..." : "Add to cart"}
    </button>
  );
}
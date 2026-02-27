"use client";

import { useState, useEffect } from "react";

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
  const [quantity, setQuantity] = useState(0);

  // Funktion för att räkna ut hur många av denna produkt som finns i korgen
  const updateQuantity = () => {
    if (typeof window === "undefined") return;
    const rawCart = localStorage.getItem("cart");
    const currentCart: CartItem[] = rawCart ? JSON.parse(rawCart) : [];
    const item = currentCart.find((i) => i.productId === product.id);
    setQuantity(item ? item.quantity : 0);
  };

  // Körs vid laddning och lyssnar på uppdateringar
  useEffect(() => {
    updateQuantity(); // Initial check

    window.addEventListener("cartUpdated", updateQuantity);
    return () => window.removeEventListener("cartUpdated", updateQuantity);
  }, [product.id]);

  const handleAdd = () => {
    if (typeof window === "undefined") return;

    try {
      setLoading(true);

      const rawCart = localStorage.getItem("cart");
      const currentCart: CartItem[] = rawCart ? JSON.parse(rawCart) : [];

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

      // Trigger events
      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(new Event("showCartDrawer"));
    } catch (error) {
      console.error("Cart update error:", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleAdd}
        disabled={loading}
        className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-zinc-800 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm flex items-center justify-center gap-3"
      >
        <span>{loading ? "Adding..." : "Add to cart"}</span>
        {quantity > 0 && (
          <span className="bg-white text-black w-6 h-6 rounded-full flex items-center justify-center text-sm">
            {quantity}
          </span>
        )}
      </button>

      {quantity > 0 && (
        <p className="text-sm text-zinc-500 text-center sm:text-left">
          {quantity} i varukorgen
        </p>
      )}
    </div>
  );
}
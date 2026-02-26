"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface LocalCartItem {
  quantity: number;
}

export default function CartIcon() {
  // 1. Starta med null för att undvika hydration error
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const updateCount = () => {
      const localData = localStorage.getItem("cart");
      if (localData) {
        try {
          const parsedCart: LocalCartItem[] = JSON.parse(localData);
          const total = parsedCart.reduce((acc, item) => acc + (item.quantity || 0), 0);
          setCount(total);
        } catch (err) {
          console.error("Cart parse error", err);
          setCount(0);
        }
      } else {
        setCount(0);
      }
    };

    // Kör direkt vid mount
    updateCount();

    // Lyssna på dina egna events från useCart.ts
    window.addEventListener("cartUpdated", updateCount);
    // Lyssna på ändringar från andra flikar
    window.addEventListener("storage", updateCount);

    return () => {
      window.removeEventListener("cartUpdated", updateCount);
      window.removeEventListener("storage", updateCount);
    };
  }, []);

  // 2. Om count är null har vi inte hunnit läsa localStorage än
  // Vi returnerar ikonen utan siffra för att matcha server-rendering
  return (
    <Link
      href="/cart"
      className="relative flex items-center hover:scale-110 transition-transform p-2 group"
    >
      <span className="text-2xl group-hover:drop-shadow-sm" role="img" aria-label="cart">
        🛒
      </span>

      {count !== null && count > 0 && (
        <span
          key={`cart-badge-${count}`}
          className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md border-2 border-white animate-in zoom-in duration-200"
          style={{ zIndex: 50, pointerEvents: 'none' }}
        >
          {count > 99 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
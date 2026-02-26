"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface LocalCartItem {
  id?: string | number;
  quantity: number;
}

interface ApiCartResponse {
  count?: number;
}

export default function CartIcon() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const syncCart = async () => {
      // 1. Hämta från localStorage direkt
      const localData = localStorage.getItem("cart");
      let localTotal = 0;

      if (localData) {
        try {
          const parsedCart: LocalCartItem[] = JSON.parse(localData);
          localTotal = parsedCart.reduce((acc, item) => acc + (item.quantity || 0), 0);
        } catch (err) {
          console.error("Cart parse error", err);
        }
      }

      // 2. Försök synka med API
      try {
        const res = await fetch("/api/cart");
        if (res.ok) {
          const data: ApiCartResponse = await res.json();
          const apiCount = data.count ?? 0;

          // FIXEN: Ta det högsta värdet av lokalt och API.
          // Detta förhindrar att cirkeln försvinner om API:et inte hunnit ikapp.
          setCount(Math.max(localTotal, apiCount));
        } else {
          setCount(localTotal);
        }
      } catch (e) {
        setCount(localTotal);
      }
    };

    syncCart();

    const handleUpdate = () => syncCart();
    window.addEventListener("cartUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return (
    <Link
      href="/cart"
      className="relative flex items-center hover:scale-110 transition-transform p-2"
    >
      <span className="text-2xl" role="img" aria-label="cart">🛒</span>

      {count > 0 && (
        <span
          key={`cart-badge-${count}`}
          className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md border border-white"
          style={{ zIndex: 50, pointerEvents: 'none' }}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
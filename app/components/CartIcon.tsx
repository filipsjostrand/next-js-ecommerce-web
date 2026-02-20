"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

// Definiera en enkel typ för cart-objektet
interface SimpleCartItem {
  quantity: number;
}

export default function CartIcon() {
  const [count, setCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false); // För att hantera hydration säkert

  const load = useCallback(async () => {
    // 1. Kolla LocalStorage
    const localCart: SimpleCartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
    const localCount = localCart.reduce((acc, item) => acc + item.quantity, 0);

    setCount(localCount);

    // 2. VALFRITT: Synk med DB
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        if (data.count !== undefined) setCount(data.count);
      }
    } catch (e) {
      // Tyst fel
    }
  }, []);

  useEffect(() => {
    // Markera att vi är på klienten och kör första laddningen
    load();
    setIsLoaded(true);

    function handleUpdate() {
      load();
    }

    window.addEventListener("cartUpdated", handleUpdate);
    return () => window.removeEventListener("cartUpdated", handleUpdate);
  }, [load]);

  // För att undvika att ikonen "hoppar" mellan 0 och rätt antal vid sidladdning (Hydration)
  // kan vi välja att inte rendera siffran förrän isLoaded är true.
  return (
    <Link
      href="/cart"
      className="relative flex items-center hover:scale-110 transition-transform p-2"
    >
      <span className="text-2xl">🛒</span>

      {isLoaded && count > 0 && (
        <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center translate-x-1 -translate-y-1">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
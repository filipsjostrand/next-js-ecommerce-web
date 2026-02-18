"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

export default function CartIcon() {
  const [count, setCount] = useState(0);


const load = useCallback(async () => {
  // 1. Kolla först LocalStorage (för anonyma användare)
  const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
  const localCount = localCart.reduce((acc: number, item: any) => acc + item.quantity, 0);

  // Visa localCount direkt
  setCount(localCount);

  // 2. VALFRITT: Om du vill synka med DB för inloggade, gör fetch här,
  // men omslut den i en try/catch som inte kastar fel
  try {
    const res = await fetch("/api/cart");
    if (res.ok) {
      const data = await res.json();
      // Om användaren är inloggad kan vi prioritera DB-count
      if (data.count !== undefined) setCount(data.count);
    }
  } catch (e) {
    // Vi tystar felet här eftersom vi redan har localCount
  }
}, []);

  useEffect(() => {
    // Initial load
    load();

    function handleUpdate() {
      load();
    }

    // Listen for the custom event
    window.addEventListener("cartUpdated", handleUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleUpdate);
    };
  }, [load]); // 'load' is now a stable dependency

  return (
    <Link
      href="/cart"
      className="relative flex items-center hover:scale-110 transition-transform"
    >
      <span className="text-2xl">🛒</span>

      {count > 0 && (
        <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-semibold rounded-full px-2 py-0.5 animate-pulse">
          {count}
        </span>
      )}
    </Link>
  );
}
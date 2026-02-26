"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// 1. Definiera tydliga typer
interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

interface LocalCartItem {
  id?: string | number;
  quantity: number;
}

interface ApiCartResponse {
  count?: number;
  items?: CartItem[];
}

export default function CartIcon() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    // Vi flyttar logiken inuti useEffect för att undvika cascading renders
    const syncCart = async () => {
      // 1. Kolla LocalStorage först
      const localData = localStorage.getItem("cart");
      let currentCount = 0;

      if (localData) {
        try {
          const parsedCart: LocalCartItem[] = JSON.parse(localData);
          currentCount = parsedCart.reduce((acc, item) => acc + (item.quantity || 0), 0);
        } catch (err) {
          console.error("LocalStorage parsing error", err);
        }
      }

      // Sätt det lokala värdet direkt
      setCount(currentCount);

      // 2. Kolla API:et (Databasen)
      try {
        const res = await fetch("/api/cart");
        if (res.ok) {
          const data: ApiCartResponse = await res.json();
          if (typeof data.count === "number") {
            setCount(data.count);
          }
        }
      } catch (e) {
        // Om API misslyckas behåller vi bara värdet från localStorage
      }
    };

    syncCart();

    const handleUpdate = () => {
      syncCart();
    };

    window.addEventListener("cartUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []); // Tom array = körs bara en gång vid mount

  return (
    <Link
      href="/cart"
      className="relative flex items-center hover:scale-110 transition-transform p-2"
    >
      <span className="text-2xl" role="img" aria-label="cart icon">🛒</span>

      {count > 0 && (
        <span
          key={`badge-${count}`}
          className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md border border-white"
          style={{ zIndex: 50 }}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
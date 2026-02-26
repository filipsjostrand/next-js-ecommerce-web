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

export function useCart() {
  // 1. Initialisera state direkt från localStorage
  // Detta körs bara EN gång vid första renderingen
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        try {
          return JSON.parse(savedCart);
        } catch (e) {
          console.error("Kunde inte tolka kundvagnen:", e);
          return [];
        }
      }
    }
    return [];
  });

  // 2. Synka localStorage när 'items' ändras
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (product: CartItem["product"], quantity: number) => {
    const newItems = [...items];
    const existing = newItems.find((i) => i.productId === product.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      newItems.push({
        productId: product.id,
        quantity,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
        },
      });
    }

    setItems(newItems);
    // Vi behöver inte anropa localStorage.setItem här längre
    // eftersom useEffect ovan sköter det automatiskt när setItems körs.

    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new Event("showCartDrawer"));
  };

  return {
    items,
    addToCart,
    count: items.reduce((a, b) => a + b.quantity, 0),
  };
}
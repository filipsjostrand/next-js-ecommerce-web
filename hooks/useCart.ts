"use client";
import { useState, useEffect } from "react";

export function useCart() {
  const [items, setItems] = useState<any[]>([]);

  // Ladda från LocalStorage vid start
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) setItems(JSON.parse(savedCart));
  }, []);

  const addToCart = (product: any, quantity: number) => {
    const newItems = [...items];
    const existing = newItems.find(i => i.productId === product.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      newItems.push({ productId: product.id, quantity, product });
    }

    setItems(newItems);
    localStorage.setItem("cart", JSON.stringify(newItems));

    // Uppdatera ikonen och låt Drawer veta
    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new Event("showCartDrawer"));
  };

  return { items, addToCart, count: items.reduce((a, b) => a + b.quantity, 0) };
}
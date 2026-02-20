"use client";
import { useState, useEffect } from "react";

// 1. Definiera typerna för att slippa any
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
  // Använd interfacet i state
  const [items, setItems] = useState<CartItem[]>([]);

  // Ladda från LocalStorage vid start
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Kunde inte tolka kundvagnen:", e);
      }
    }
  }, []);

  // Typa 'product' så den matchar vad vi sparar
  const addToCart = (product: CartItem["product"], quantity: number) => {
    // Skapa en kopia av items för att inte mutera state direkt
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
    localStorage.setItem("cart", JSON.stringify(newItems));

    // Uppdatera ikonen och låt Drawer veta
    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new Event("showCartDrawer"));
  };

  return {
    items,
    addToCart,
    // TypeScript fattar nu att 'b.quantity' är ett nummer
    count: items.reduce((a, b) => a + b.quantity, 0),
  };
}
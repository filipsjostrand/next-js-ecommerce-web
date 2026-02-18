"use client"; // Viktigt! Knappar kräver klientsida

import { useState } from "react";

// 1. Definitionen av typer (Interface) ska stå HÖGST UPP, utanför funktionen.
interface ProductProps {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
  };
}

// 2. Export-funktionen börjar här
export default function AddToCartButton({ product }: ProductProps) {
  const [loading, setLoading] = useState(false);

  // 3. handleAdd funktionen placeras inuti komponenten
  const handleAdd = () => {
    try {
      setLoading(true);

      // Hämta befintlig korg från LocalStorage
      const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");

      // Kolla om produkten redan finns i korgen
      const existingItemIndex = currentCart.findIndex(
        (item: any) => item.productId === product.id
      );

      if (existingItemIndex > -1) {
        // Om den finns, öka bara antal
        currentCart[existingItemIndex].quantity += 1;
      } else {
        // Om den inte finns, lägg till hela objektet som Drawern behöver
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

      // Spara tillbaka till LocalStorage
      localStorage.setItem("cart", JSON.stringify(currentCart));

      // 4. Skicka ut event så att CartIcon och CartDrawer fattar att de ska uppdateras
      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(new Event("showCartDrawer"));

    } catch (error) {
      console.error("Fel vid tillägg i kundvagn:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAdd}
      disabled={loading}
      className="bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-zinc-800 transition active:scale-95 disabled:opacity-50"
    >
      {loading ? "Lägger till..." : "Add to Cart"}
    </button>
  );
}
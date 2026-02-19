"use client";

import { useEffect, useState } from "react";
import CheckoutForm from "./CheckoutForm";

// 1. Definiera typer för att slippa "any"
interface CartItem {
  productId: string;
  quantity: number;
  product: {
    name: string;
    price: number;
    imageUrl: string;
  };
}

export default function CartClient() {
  // Använd interfacet här
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");

    // Genom att uppdatera state i ett svep minimerar vi risken för problem
    setItems(savedCart);
    setIsLoaded(true);
  }, []);

  const saveAndSync = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem("cart", JSON.stringify(newItems));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const updateQuantity = (productId: string, delta: number) => {
    const newItems = items.map((item) => {
      if (item.productId === productId) {
        const newQty = item.quantity + delta;
        return { ...item, quantity: newQty < 1 ? 1 : newQty };
      }
      return item;
    });
    saveAndSync(newItems);
  };

  const removeItem = (productId: string) => {
    const newItems = items.filter((item) => item.productId !== productId);
    saveAndSync(newItems);
  };

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Hydration fix: Rendera inget förrän vi vet vad som finns i localStorage
  if (!isLoaded) return <div className="max-w-3xl mx-auto py-10 text-center">Laddar korgen...</div>;

  if (items.length === 0) return <p className="text-center py-10">Korgen är tom.</p>;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between items-center border-b pb-4">
            <div>
              <p className="font-bold text-lg">{item.product.name}</p>
              <p className="text-sm text-gray-500">{(item.product.price / 100).toFixed(2)} kr/st</p>

              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => updateQuantity(item.productId, -1)}
                  className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-100"
                >
                  -
                </button>
                <span className="font-medium w-6 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, 1)}
                  className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-100"
                >
                  +
                </button>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="ml-4 text-red-500 text-sm hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
            <p className="font-bold">{(item.product.price * item.quantity / 100).toFixed(2)} kr</p>
          </div>
        ))}
      </div>

      <div className="text-2xl font-bold flex justify-between px-2">
        <span>Total:</span>
        <span>{(total / 100).toFixed(2)} kr</span>
      </div>

      <div className="mt-4">
        {!showCheckout ? (
          <button
            onClick={() => setShowCheckout(true)}
            className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-zinc-800 transition"
          >
            Go to Checkout
          </button>
        ) : (
          <div className="space-y-4">
            <CheckoutForm items={items} onClearCart={() => {
              localStorage.removeItem("cart");
              setItems([]);
              window.dispatchEvent(new Event("cartUpdated"));
            }} />
            <button
              onClick={() => setShowCheckout(false)}
              className="w-full text-gray-500 text-sm hover:underline"
            >
              Back to cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
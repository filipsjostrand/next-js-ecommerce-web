"use client";

import { useEffect, useState } from "react";
import CheckoutForm from "./CheckoutForm";

interface CartItem {
  productId: string;
  quantity: number;
  product: {
    id: string; // Se till att ID finns här nu för din webhook!
    name: string;
    price: number;
    imageUrl: string;
  };
}

export default function CartClient() {
  // 1. Initiera state direkt från localStorage om möjligt (förhindrar extra render)
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  // 2. Körs bara en gång vid mount
useEffect(() => {
    // 1. Skapa en separat funktion för att läsa data
    const loadCart = () => {
      const savedCart = localStorage.getItem("cart");
      if (!savedCart) {
        setIsLoaded(true);
        return;
      }

      try {
        const parsedCart = JSON.parse(savedCart);
        // Vi sätter items först
        setItems(parsedCart);
      } catch (error) {
        console.error("Fel vid laddning av korg:", error);
      } finally {
        // 2. Vi sätter isLoaded sist, vilket triggar den faktiska renderingen av korgen
        setIsLoaded(true);
      }
    };

    loadCart();
  }, []);

  const saveAndSync = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem("cart", JSON.stringify(newItems));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // ... (behåll updateQuantity och removeItem som de är)

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

  if (!isLoaded) {
    return <div className="max-w-3xl mx-auto py-10 text-center text-zinc-500">Loading cart...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-500">Your cart is empty.</p>
      </div>
    );
  }

  // ... resten av din return-JSX är korrekt
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      {/* ... din existerande map-logik ... */}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between items-center border-b pb-4">
            <div>
              <p className="font-bold text-lg">{item.product.name}</p>
              <p className="text-sm text-gray-500">{(item.product.price / 100).toFixed(2)} kr/st</p>
              <div className="flex items-center gap-3 mt-2">
                <button onClick={() => updateQuantity(item.productId, -1)} className="w-8 h-8 border rounded hover:bg-gray-100">-</button>
                <span className="font-medium w-6 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.productId, 1)} className="w-8 h-8 border rounded hover:bg-gray-100">+</button>
                <button onClick={() => removeItem(item.productId)} className="ml-4 text-red-500 text-sm hover:underline">Remove</button>
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
            <CheckoutForm
              items={items}
              onClearCart={() => {
                localStorage.removeItem("cart");
                setItems([]);
                window.dispatchEvent(new Event("cartUpdated"));
              }}
            />
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
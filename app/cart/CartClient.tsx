"use client";

import { useEffect, useState } from "react";
import CheckoutForm from "./CheckoutForm";
import Image from "next/image"; // ✅ Rekommenderas för produktbilder

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

export default function CartClient() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    const loadCart = () => {
      const savedCart = localStorage.getItem("cart");
      if (!savedCart) {
        setIsLoaded(true);
        return;
      }

      try {
        const parsedCart = JSON.parse(savedCart);
        // Säkerställ att det är en array innan vi sätter state
        setItems(Array.isArray(parsedCart) ? parsedCart : []);
      } catch (error) {
        console.error("Error loading cart:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadCart();
  }, []);

  const saveAndSync = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem("cart", JSON.stringify(newItems));
    // Detta triggar uppdatering i din CartIcon och CartDrawer
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

  if (!isLoaded) {
    return <div className="max-w-3xl mx-auto py-20 text-center text-zinc-500">Loading your cart...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-black">
        <p className="text-xl text-gray-500 mb-6">Your cart is empty.</p>
        <button
          onClick={() => window.location.href = "/"}
          className="bg-black text-white px-6 py-2 rounded-lg font-bold"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 text-black px-4">
      <h1 className="text-2xl font-bold">Shopping Cart</h1>

      <div className="space-y-4">
        {items.map((item: CartItem) => ( // ✅ Explicit typ i map
          <div key={item.productId} className="flex justify-between items-center border-b pb-6 border-gray-100">
            <div className="flex gap-4">
               {/* Produktbild gör korgen mycket trevligare */}
               <div className="relative w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border">
                 <Image
                    src={item.product.imageUrl || "/placeholder.png"}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                 />
               </div>

              <div className="flex flex-col justify-center">
                <p className="font-bold text-lg leading-tight">{item.product.name}</p>
                <p className="text-sm text-gray-500">{(item.product.price / 100).toFixed(2)} kr / each</p>

                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => updateQuantity(item.productId, -1)}
                    className="w-8 h-8 border rounded-lg hover:bg-gray-50 flex items-center justify-center transition"
                  >-</button>
                  <span className="font-bold w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, 1)}
                    className="w-8 h-8 border rounded-lg hover:bg-gray-50 flex items-center justify-center transition"
                  >+</button>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="ml-4 text-red-500 text-xs font-bold uppercase tracking-wider hover:text-red-700 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <p className="font-bold text-lg">
              {( (item.product.price * item.quantity) / 100).toFixed(2)} kr
            </p>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
        <div className="text-2xl font-bold flex justify-between">
          <span>Total:</span>
          <span>{(total / 100).toFixed(2)} kr</span>
        </div>

        <div className="mt-4">
          {!showCheckout ? (
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-zinc-800 transition shadow-lg active:scale-[0.98] cursor-pointer"
            >
              Proceed to Checkout
            </button>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
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
                className="w-full text-gray-500 text-sm font-medium hover:text-black hover:underline transition"
              >
                ← Back to cart summary
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
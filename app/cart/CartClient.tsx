"use client";

import { useEffect, useState } from "react";
import CheckoutForm from "./CheckoutForm";

export default function CartClient() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setItems(savedCart);
    setIsLoaded(true);
  }, []);

  const clearCart = () => {
    localStorage.removeItem("cart");
    setItems([]);
    window.dispatchEvent(new Event("cartUpdated"));
    setShowCheckout(false);
  };

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (!isLoaded) return null;

  if (items.length === 0) {
    return <p className="py-10 text-center text-gray-500">Your cart is empty.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      {/* 1. Produktlistan högst upp */}
      <div className="space-y-4 border-b pb-6">
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between items-center py-2">
            <div>
              <p className="font-bold text-lg">{item.product.name}</p>
              <p className="text-sm text-gray-600">{item.quantity} st x {(item.product.price / 100).toFixed(2)} kr</p>
            </div>
            <p className="font-semibold">{(item.product.price * item.quantity / 100).toFixed(2)} kr</p>
          </div>
        ))}
      </div>

      {/* 2. Totalsumman i mitten */}
      <div className="text-2xl font-bold flex justify-between px-2">
        <span>Total to pay:</span>
        <span>{(total / 100).toFixed(2)} kr</span>
      </div>

      {/* 3. Checkout-sektionen LÄNGST NER */}
      <div className="mt-4 pt-6 border-t border-dashed">
        {!showCheckout ? (
          <button
            onClick={() => setShowCheckout(true)}
            className="w-full bg-black text-white py-5 rounded-2xl text-xl font-bold hover:bg-zinc-800 transition active:scale-[0.98]"
          >
            Go to Checkout
          </button>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <CheckoutForm items={items} onClearCart={clearCart} />
             <button
                onClick={() => setShowCheckout(false)}
                className="w-full mt-4 text-gray-500 text-sm hover:underline"
             >
                Abort and go back to cart
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
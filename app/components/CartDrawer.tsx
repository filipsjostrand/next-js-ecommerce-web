"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ShoppingBag, Trash2 } from "lucide-react";

interface CartItem {
  productId: string;
  quantity: number;
  product: {
    name: string;
    price: number;
    imageUrl: string | null;
  };
}

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CartItem[] | null>(null);

  // 1. Vi använder useCallback för att hålla funktionen stabil
  const refreshCart = useCallback(() => {
    if (typeof window === "undefined") return;
    const savedCart = localStorage.getItem("cart");
    setItems(savedCart ? JSON.parse(savedCart) : []);
  }, []);

  // 2. Denna useEffect körs BARA vid mount och sköter prenumerationen
  useEffect(() => {
    // refreshCart() körs i en requestAnimationFrame (eller setTimeout), för att bryta den synkrona renderings-cykeln.
    
    const timeoutId = setTimeout(refreshCart, 0);

    const openDrawer = () => setOpen(true);

    window.addEventListener("showCartDrawer", openDrawer);
    window.addEventListener("cartUpdated", refreshCart);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("showCartDrawer", openDrawer);
      window.removeEventListener("cartUpdated", refreshCart);
    };
  }, [refreshCart]);

  // 3. Hjälpfunktion för att ta bort varor
  const removeItem = (productId: string) => {
    if (!items) return;
    const updatedCart = items.filter(item => item.productId !== productId);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    refreshCart();
    window.dispatchEvent(new Event("cartUpdated"));
  };

  if (items === null) return null;

  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99]" onClick={() => setOpen(false)} />
      )}

      <div className={`fixed top-0 right-0 h-full w-full max-w-xs bg-white shadow-2xl z-[100] transform transition-transform duration-300 flex flex-col ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-6 border-b flex justify-between items-center text-black">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} />
            <span className="font-bold text-lg">Cart ({totalCount})</span>
          </div>
          <button onClick={() => setOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-10 text-gray-500 italic">Your cart is empty.</div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="flex gap-4 border-b pb-4">
                <div className="relative h-16 w-16 flex-shrink-0">
                  <Image src={item.product.imageUrl || "/placeholder.png"} alt={item.product.name} fill className="object-cover rounded-md" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-bold text-black line-clamp-1">{item.product.name}</h3>
                    <button onClick={() => removeItem(item.productId)} className="text-gray-400 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.quantity} × {(item.product.price / 100).toLocaleString('sv-SE')} SEK
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t bg-gray-50 space-y-4">
            <div className="flex justify-between items-center font-bold text-black">
              <span>Total:</span>
              <span>{(totalPrice / 100).toLocaleString('sv-SE')} SEK</span>
            </div>
            <Link href="/cart" onClick={() => setOpen(false)} className="block w-full bg-black text-white text-center py-3 rounded-xl font-bold">
              Go to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
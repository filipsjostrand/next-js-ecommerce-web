"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import Image from "next/image";
import { X, ShoppingBag } from "lucide-react";

// 1. Define interfaces to make .map() type-safe
interface CartProduct {
  name: string;
  price: number;
  imageUrl: string | null;
}

interface CartItem {
  productId: string;
  quantity: number;
  product: CartProduct;
}

export default function CartDrawer() {
  const [open, setOpen] = useState(false);

  // 2. Cast the hook return values to our interfaces
  const { items, count } = useCart() as { items: CartItem[], count: number };

  useEffect(() => {
    function openDrawer() {
      setOpen(true);
    }

    window.addEventListener("showCartDrawer", openDrawer);
    return () => {
      window.removeEventListener("showCartDrawer", openDrawer);
    };
  }, []);

  return (
    <>
      {/* Overlay: Closes drawer when clicking outside */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-xs bg-white shadow-2xl z-[100] transform transition-transform duration-300 ease-in-out flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center text-black">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} />
            <span className="font-bold text-lg">Cart ({count})</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Your cart is empty.</p>
            </div>
          ) : (
            // 3. The .map() function is now safe because we defined 'CartItem'
            items.map((item: CartItem) => (
              <div key={item.productId} className="flex gap-4 border-b pb-4 border-gray-100">
                <div className="relative h-16 w-16 flex-shrink-0">
                  <Image
                    src={item.product.imageUrl || "/placeholder.png"}
                    alt={item.product.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-black line-clamp-1">
                    {item.product.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {item.quantity} × {(item.product.price / 100).toFixed(2)} SEK
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <Link
            href="/cart"
            onClick={() => setOpen(false)}
            className="block w-full bg-black text-white text-center py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors shadow-sm"
          >
            Go to Checkout
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="w-full text-center mt-4 text-sm text-gray-500 hover:text-black transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </>
  );
}
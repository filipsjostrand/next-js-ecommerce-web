"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CartDrawer() {
  const [open, setOpen] = useState(false);

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
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-6 flex justify-between">
        <h2 className="font-bold text-lg">Your Cart</h2>
        <button onClick={() => setOpen(false)}>✕</button>
      </div>

      <div className="p-6">
        <Link href="/cart" className="text-blue-600 underline">
          Go to cart →
        </Link>
      </div>
    </div>
  );
}

import { Metadata } from "next";
import CartClient from "./CartClient";

// 1. Lägg till Metadata för bättre SEO (valfritt men rekommenderat)
export const metadata: Metadata = {
  title: "Shopping Cart | Sportify",
  description: "Review your items and proceed to checkout.",
};

export default function CartPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12 min-h-[60vh]">
      {/* Vi kan ta bort <h1> här om du redan har en <h1> inuti CartClient.
         Om du vill ha den här, se till att den matchar din övriga stil.
      */}
      <h1 className="text-3xl font-bold mb-10 text-black">Your Shopping Cart</h1>

      <CartClient />
    </main>
  );
}
"use client";

import { useEffect, useState } from "react";

type CartItem = {
  productId: string; // Notera: Vi använder productId som nyckel nu
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
    imageUrl?: string;
  };
};

export default function CartClient() {
  // Vi startar med en tom lista och hämtar från localStorage i useEffect
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setItems(savedCart);
    setIsLoaded(true);
  }, []);

  // Spara till localStorage varje gång 'items' ändras
  const saveAndSync = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem("cart", JSON.stringify(newItems));
    // Berätta för CartIcon att uppdatera sig
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  function updateQuantity(productId: string, quantity: number) {
    if (quantity < 1) return;

    const item = items.find((i) => i.productId === productId);
    if (!item) return;

    // Kontrollera lagersaldo om det finns (valfritt)
    if (item.product.stock && quantity > item.product.stock) return;

    const newItems = items.map((i) =>
      i.productId === productId ? { ...i, quantity } : i
    );

    saveAndSync(newItems);
  }

  function removeItem(productId: string) {
    const newItems = items.filter((i) => i.productId !== productId);
    saveAndSync(newItems);
  }

  // Förhindra "hydration mismatch" genom att vänta tills klienten laddat
  if (!isLoaded) return null;

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500">Din varukorg är tom.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="divide-y border-t border-b">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex justify-between items-center py-6"
          >
            <div>
              <p className="font-medium text-lg">{item.product.name}</p>

              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center border rounded-full hover:bg-gray-50"
                >
                  -
                </button>

                <span className="w-8 text-center font-medium">{item.quantity}</span>

                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center border rounded-full hover:bg-gray-50"
                >
                  +
                </button>

                <button
                  onClick={() => removeItem(item.productId)}
                  className="ml-6 text-red-500 text-sm font-medium hover:underline"
                >
                  Remove item
                </button>
              </div>
            </div>

            <p className="font-semibold text-lg">
              {((item.product.price * item.quantity) / 100).toFixed(2)} kr
            </p>
          </div>
        ))}
      </div>

      <div className="pt-6 flex justify-between items-center font-bold text-2xl">
        <span>Total</span>
        <span>{(total / 100).toFixed(2)} kr</span>
      </div>

      <button className="w-full mt-8 bg-black text-white py-4 rounded-xl text-lg font-bold hover:bg-zinc-800 transition">
        Go to checkout
      </button>
    </div>
  );
}

// "use client";

// import { useState } from "react";

// type CartItem = {
//   id: string;
//   quantity: number;
//   product: {
//     id: string;
//     name: string;
//     price: number;
//     stock: number;
//   };
// };

// export default function CartClient({
//   initialItems,
// }: {
//   initialItems: CartItem[];
// }) {
//   const [items, setItems] = useState(initialItems);

//   const total = items.reduce(
//     (sum, item) => sum + item.product.price * item.quantity,
//     0
//   );

//   async function updateQuantity(id: string, quantity: number) {
//     if (quantity < 1) return;

//     const item = items.find((i) => i.id === id);
//     if (!item) return;

//     if (quantity > item.product.stock) return;

//     // 🔥 optimistic update
//     setItems((prev) =>
//       prev.map((i) =>
//         i.id === id ? { ...i, quantity } : i
//       )
//     );

//     await fetch(`/api/cart/${id}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ quantity }),
//     });

//     window.dispatchEvent(new Event("cartUpdated"));
//   }

//   async function removeItem(id: string) {
//     setItems((prev) => prev.filter((i) => i.id !== id));

//     await fetch(`/api/cart/${id}`, {
//       method: "DELETE",
//     });

//     window.dispatchEvent(new Event("cartUpdated"));
//   }

//   if (items.length === 0) {
//     return (
//       <main className="mx-auto max-w-6xl px-6 py-12">
//         <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
//         <p>Your cart is empty.</p>
//       </main>
//     );
//   }

//   return (
//     <main className="mx-auto max-w-6xl px-6 py-12">
//       <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

//       <div className="space-y-6">
//         {items.map((item) => (
//           <div
//             key={item.id}
//             className="flex justify-between items-center border-b pb-4"
//           >
//             <div>
//               <p className="font-medium">{item.product.name}</p>

//               <div className="flex items-center gap-3 mt-2">
//                 <button
//                   onClick={() =>
//                     updateQuantity(item.id, item.quantity - 1)
//                   }
//                   className="px-3 py-1 border rounded"
//                 >
//                   -
//                 </button>

//                 <span>{item.quantity}</span>

//                 <button
//                   onClick={() =>
//                     updateQuantity(item.id, item.quantity + 1)
//                   }
//                   disabled={
//                     item.quantity >= item.product.stock
//                   }
//                   className="px-3 py-1 border rounded disabled:opacity-40"
//                 >
//                   +
//                 </button>

//                 <button
//                   onClick={() => removeItem(item.id)}
//                   className="ml-4 text-red-500 text-sm"
//                 >
//                   Remove
//                 </button>
//               </div>
//             </div>

//             <p className="font-semibold">
//               $
//               {(
//                 (item.product.price * item.quantity) /
//                 100
//               ).toFixed(2)}
//             </p>
//           </div>
//         ))}
//       </div>

//       <div className="mt-8 flex justify-between font-bold text-lg">
//         <span>Total</span>
//         <span>${(total / 100).toFixed(2)}</span>
//       </div>
//     </main>
//   );
// }

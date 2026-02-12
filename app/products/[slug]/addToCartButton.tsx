// "use client";

// import { useState } from "react";

// export default function AddToCartButton({
//   productId,
// }: {
//   productId: string;
// }) {
//   const [loading, setLoading] = useState(false);

//   async function handleAdd() {
//     setLoading(true);

//     await fetch("/api/cart", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ productId, quantity: 1 }),
//     });

//     setLoading(false);
//     alert("Added to cart");
//   }

//   return (
//     <button
//       onClick={handleAdd}
//       disabled={loading}
//       className="rounded-md bg-black text-white px-6 py-3 hover:bg-gray-800 transition"
//     >
//       {loading ? "Adding..." : "Add to Cart"}
//     </button>
//   );
// }

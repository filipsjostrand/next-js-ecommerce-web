"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

export default function CartIcon() {
  const [count, setCount] = useState(0);

  // Use useCallback so the function is stable and won't trigger effects unnecessarily
  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/cart", {
        cache: "no-store",
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setCount(data.count ?? 0);
    } catch {
      setCount(0);
    }
  }, []);

  useEffect(() => {
    // Initial load
    load();

    function handleUpdate() {
      load();
    }

    // Listen for the custom event
    window.addEventListener("cartUpdated", handleUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleUpdate);
    };
  }, [load]); // 'load' is now a stable dependency

  return (
    <Link
      href="/cart"
      className="relative flex items-center hover:scale-110 transition-transform"
    >
      <span className="text-2xl">🛒</span>

      {count > 0 && (
        <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-semibold rounded-full px-2 py-0.5 animate-pulse">
          {count}
        </span>
      )}
    </Link>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";

// export default function CartIcon() {
//   const [count, setCount] = useState(0);

//   async function load() {
//     try {
//       const res = await fetch("/api/cart", {
//         cache: "no-store",
//       });

//       const data = await res.json();
//       setCount(data.count ?? 0);
//     } catch {
//       setCount(0);
//     }
//   }

//   useEffect(() => {
//     load();

//     function handleUpdate() {
//       load();
//     }

//     window.addEventListener("cartUpdated", handleUpdate);

//     return () => {
//       window.removeEventListener("cartUpdated", handleUpdate);
//     };
//   }, []);

//   return (
//     <Link
//       href="/cart"
//       className="relative flex items-center hover:scale-110 transition-transform"
//     >
//       <span className="text-2xl">🛒</span>

//       {count > 0 && (
//         <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-semibold rounded-full px-2 py-0.5 animate-pulse">
//           {count}
//         </span>
//       )}
//     </Link>
//   );
// }

// // "use client";

// // import { useEffect, useState } from "react";
// // import Link from "next/link";

// // export default function CartIcon() {
// //   const [count, setCount] = useState(0);

// //   useEffect(() => {
// //     async function load() {
// //       try {
// //         const res = await fetch("/api/cart", {
// //           cache: "no-store",
// //         });

// //         if (!res.ok) {
// //           setCount(0);
// //           return;
// //         }

// //         const data = await res.json();
// //         setCount(data.count ?? 0);
// //       } catch {
// //         setCount(0);
// //       }
// //     }

// //     load();

// //     function handleUpdate() {
// //       load();
// //     }

// //     window.addEventListener("cartUpdated", handleUpdate);

// //     return () => {
// //       window.removeEventListener("cartUpdated", handleUpdate);
// //     };
// //   }, []);

// //   return (
// //     <Link
// //       href="/cart"
// //       className="relative flex items-center hover:scale-110 transition-transform"
// //     >
// //       <span className="text-2xl">🛒</span>

// //       {count > 0 && (
// //         <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-semibold rounded-full px-2 py-0.5">
// //           {count}
// //         </span>
// //       )}
// //     </Link>
// //   );
// // }

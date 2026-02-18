import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Om ingen är inloggad, returnera 0 (inga fel!)
    if (!session?.user) {
      return NextResponse.json({ items: [], count: 0 });
    }

    const cartItems = await db.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: true },
    });

    return NextResponse.json({
      items: cartItems,
      count: cartItems.reduce((acc, item) => acc + item.quantity, 0),
    });
  } catch (error) {
    return NextResponse.json({ items: [], count: 0 });
  }
}

// POST och DELETE kan du lämna tomma eller ta bort om du kör LocalStorage

// _ _ _
// _ _ _

// import { NextResponse } from "next/server";
// import { db } from "@/lib/db";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";

// const session = await getServerSession(authOptions);
// console.log("SESSION:", session);

// //
// // GET → Fetch current user's cart
// //
// // export async function GET() {
// //   const session = await getServerSession(authOptions);

// //   if (!session?.user?.id) {
// //     return NextResponse.json({ items: [], count: 0 }, { status: 200 });
// //   }

// //   const cartItems = await db.cartItem.findMany({
// //     where: { userId: session.user.id },
// //     include: { product: true },
// //   });

// //   const totalCount = cartItems.reduce(
// //     (acc, item) => acc + item.quantity,
// //     0
// //   );

// //   return NextResponse.json({
// //     items: cartItems,
// //     count: totalCount,
// //   });
// // }

// // _ _ _

// export async function GET() {
//   try {
//     const session = await getServerSession(authOptions);

//     // Om ingen är inloggad, eller om ID saknas, returnera tom korg direkt
//     // Detta förhindrar att Prisma anropas med undefined
//     if (!session?.user?.id) {
//       return NextResponse.json({ items: [], count: 0 }, { status: 200 });
//     }

//     const cartItems = await db.cartItem.findMany({
//       where: { userId: session.user.id },
//       include: { product: true },
//     });

//     const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

//     return NextResponse.json({
//       items: cartItems,
//       count: totalCount,
//     });
//   } catch (error) {
//     // Detta kommer nu synas i din TERMINAL (där du kör npm run dev)
//     console.error("CART_GET_ERROR:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

// // _ _ _

// //
// // POST → Add / Update cart item
// //
// export async function POST(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { productId, quantity } = await req.json();

//     const body = await req.json();
//     console.log("BODY:", body);


//     if (!productId || !quantity || quantity <= 0) {
//       return NextResponse.json(
//         { error: "Invalid product or quantity" },
//         { status: 400 }
//       );
//     }

//     const product = await db.product.findUnique({
//       where: { id: productId },
//     });

//     if (!product) {
//       return NextResponse.json(
//         { error: "Product not found" },
//         { status: 404 }
//       );
//     }

//     // Check existing item
//     const existing = await db.cartItem.findUnique({
//       where: {
//         userId_productId: {
//           userId: session.user.id,
//           productId,
//         },
//       },
//     });

//     const newQuantity = (existing?.quantity ?? 0) + quantity;

//     // Stock validation
//     if (newQuantity > product.stock) {
//       return NextResponse.json(
//         { error: "Not enough stock available" },
//         { status: 400 }
//       );
//     }

//     const cartItem = await db.cartItem.upsert({
//       where: {
//         userId_productId: {
//           userId: session.user.id,
//           productId,
//         },
//       },
//       update: { quantity: newQuantity },
//       create: {
//         userId: session.user.id,
//         productId,
//         quantity,
//       },
//       include: { product: true },
//     });

//     const total = await db.cartItem.aggregate({
//       where: { userId: session.user.id },
//       _sum: { quantity: true },
//     });

//     return NextResponse.json({
//       item: cartItem,
//       count: total._sum.quantity ?? 0,
//     });

//   } catch (error) {
//     console.error("POST /api/cart error:", error);
//     return NextResponse.json(
//       { error: "Server error" },
//       { status: 500 }
//     );
//   }
// }

// //
// // DELETE → Remove item from cart
// //
// export async function DELETE(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { productId } = await req.json();

//     if (!productId) {
//       return NextResponse.json(
//         { error: "Missing productId" },
//         { status: 400 }
//       );
//     }

//     await db.cartItem.delete({
//       where: {
//         userId_productId: {
//           userId: session.user.id,
//           productId,
//         },
//       },
//     });

//     // 🔥 Return updated count after delete
//     const total = await db.cartItem.aggregate({
//       where: { userId: session.user.id },
//       _sum: { quantity: true },
//     });

//     return NextResponse.json({
//       success: true,
//       count: total._sum.quantity ?? 0,
//     });

//   } catch (error) {
//     console.error("DELETE /api/cart error:", error);
//     return NextResponse.json(
//       { error: "Item not found" },
//       { status: 404 }
//     );
//   }
// }


// _ _ _
// _ _ _

// import { NextResponse } from "next/server";
// import { db } from "@/lib/db";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";

// // GET → Fetch current user's cart (and total count)
// export async function GET() {
//   const session = await getServerSession(authOptions);

//   // Fix: Return 200 with empty data if unauthorized to avoid console errors
//   if (!session?.user) {
//     return NextResponse.json({ items: [], count: 0 }, { status: 200 });
//   }

//   const cartItems = await db.cartItem.findMany({
//     where: { userId: session.user.id },
//     include: { product: true },
//   });

//   // Calculate total sum of all quantities
//   const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

//   return NextResponse.json({
//     items: cartItems,
//     count: totalCount,
//   });
// }

// // // POST → Add or update cart item
// // export async function POST(req: Request) {
// //   const session = await getServerSession(authOptions);

// //   if (!session?.user) {
// //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
// //   }

// //   const { productId, quantity } = await req.json();

// //   if (!productId || !quantity || quantity <= 0) {
// //     return NextResponse.json(
// //       { error: "Invalid product or quantity" },
// //       { status: 400 }
// //     );
// //   }

// //   // Optional: Check if product exists and check stock
// //   const product = await db.product.findUnique({
// //     where: { id: productId },
// //   });

// //   if (!product) {
// //     return NextResponse.json({ error: "Product not found" }, { status: 404 });
// //   }

// //   // Upsert: If item exists for this user, INCREMENT it. If not, CREATE it.
// //   const cartItem = await db.cartItem.upsert({
// //     where: {
// //       userId_productId: {
// //         userId: session.user.id,
// //         productId,
// //       },
// //     },
// //     update: {
// //       quantity: { increment: quantity }, // Better logic: adds to existing total
// //     },
// //     create: {
// //       userId: session.user.id,
// //       productId,
// //       quantity,
// //     },
// //     include: {
// //       product: true,
// //     },
// //   });

// //   return NextResponse.json(cartItem);
// // }

// // _ _ _

// // POST → Add or update cart item
// export async function POST(req: Request) {
//   const session = await getServerSession(authOptions);

//   if (!session?.user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const { productId, quantity } = await req.json();

//   if (!productId || !quantity || quantity <= 0) {
//     return NextResponse.json(
//       { error: "Invalid product or quantity" },
//       { status: 400 }
//     );
//   }

//   const product = await db.product.findUnique({
//     where: { id: productId },
//   });

//   if (!product) {
//     return NextResponse.json({ error: "Product not found" }, { status: 404 });
//   }

//   // 🔥 Get existing cart item first
//   const existing = await db.cartItem.findUnique({
//     where: {
//       userId_productId: {
//         userId: session.user.id,
//         productId,
//       },
//     },
//   });

//   const newQuantity = (existing?.quantity ?? 0) + quantity;

//   // 🔥 STOCK VALIDATION
//   if (newQuantity > product.stock) {
//     return NextResponse.json(
//       { error: "Not enough stock available" },
//       { status: 400 }
//     );
//   }

//   const cartItem = await db.cartItem.upsert({
//     where: {
//       userId_productId: {
//         userId: session.user.id,
//         productId,
//       },
//     },
//     update: {
//       quantity: newQuantity,
//     },
//     create: {
//       userId: session.user.id,
//       productId,
//       quantity,
//     },
//     include: {
//       product: true,
//     },
//   });

//   // 🔥 Return updated cart count for badge
//   const totalCount = await db.cartItem.aggregate({
//     where: { userId: session.user.id },
//     _sum: { quantity: true },
//   });

//   return NextResponse.json({
//     item: cartItem,
//     count: totalCount._sum.quantity ?? 0,
//   });
// }


// // _ _ _

// // DELETE → Remove item from cart
// export async function DELETE(req: Request) {
//   const session = await getServerSession(authOptions);

//   if (!session?.user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const { productId } = await req.json();

//   if (!productId) {
//     return NextResponse.json({ error: "Missing productId" }, { status: 400 });
//   }

//   try {
//     await db.cartItem.delete({
//       where: {
//         userId_productId: {
//           userId: session.user.id,
//           productId,
//         },
//       },
//     });
//     return NextResponse.json({ success: true });
//   } catch (error) {
//     return NextResponse.json({ error: "Item not found" }, { status: 404 });
//   }
// }

// _ _ _
// _ _ _

// await db.cartItem.delete({
//   where: {
//     userId_productId: {
//       userId: session.user.id,
//       productId,
//     },
//   },
// });

// const totalCount = await db.cartItem.aggregate({
//   where: { userId: session.user.id },
//   _sum: { quantity: true },
// });

// return NextResponse.json({
//   success: true,
//   count: totalCount._sum.quantity ?? 0,
// });


// _ _ _

// import { NextResponse } from "next/server";
// import { db } from "@/lib/db";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";

// //
// // GET → Fetch current user's cart
// //
// export async function GET() {
//   const session = await getServerSession(authOptions);

//   if (!session?.user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const cartItems = await db.cartItem.findMany({
//     where: { userId: session.user.id },
//     include: { product: true },
//   });

//   return NextResponse.json(cartItems);
// }

// //
// // POST → Add or update cart item
// //
// export async function POST(req: Request) {
//   const session = await getServerSession(authOptions);

//   if (!session?.user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const { productId, quantity } = await req.json();

//   if (!productId || !quantity || quantity <= 0) {
//     return NextResponse.json(
//       { error: "Invalid product or quantity" },
//       { status: 400 }
//     );
//   }

//   const product = await db.product.findUnique({
//     where: { id: productId },
//   });

//   if (!product) {
//     return NextResponse.json({ error: "Product not found" }, { status: 404 });
//   }

//   // Upsert cart item (update if exists, create if not)
//   const cartItem = await db.cartItem.upsert({
//     where: {
//       userId_productId: {
//         userId: session.user.id,
//         productId,
//       },
//     },
//     update: {
//       quantity,
//     },
//     create: {
//       userId: session.user.id,
//       productId,
//       quantity,
//     },
//     include: {
//       product: true,
//     },
//   });

//   return NextResponse.json(cartItem);
// }

// //
// // DELETE → Remove item from cart
// //
// export async function DELETE(req: Request) {
//   const session = await getServerSession(authOptions);

//   if (!session?.user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const { productId } = await req.json();

//   if (!productId) {
//     return NextResponse.json({ error: "Missing productId" }, { status: 400 });
//   }

//   await db.cartItem.delete({
//     where: {
//       userId_productId: {
//         userId: session.user.id,
//         productId,
//       },
//     },
//   });

//   return NextResponse.json({ success: true });
// }

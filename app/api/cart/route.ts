import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET → Fetch current user's cart (and total count)
export async function GET() {
  const session = await getServerSession(authOptions);

  // Fix: Return 200 with empty data if unauthorized to avoid console errors
  if (!session?.user) {
    return NextResponse.json({ items: [], count: 0 }, { status: 200 });
  }

  const cartItems = await db.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: true },
  });

  // Calculate total sum of all quantities
  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return NextResponse.json({
    items: cartItems,
    count: totalCount,
  });
}

// POST → Add or update cart item
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId, quantity } = await req.json();

  if (!productId || !quantity || quantity <= 0) {
    return NextResponse.json(
      { error: "Invalid product or quantity" },
      { status: 400 }
    );
  }

  // Optional: Check if product exists and check stock
  const product = await db.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Upsert: If item exists for this user, INCREMENT it. If not, CREATE it.
  const cartItem = await db.cartItem.upsert({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId,
      },
    },
    update: {
      quantity: { increment: quantity }, // Better logic: adds to existing total
    },
    create: {
      userId: session.user.id,
      productId,
      quantity,
    },
    include: {
      product: true,
    },
  });

  return NextResponse.json(cartItem);
}

// DELETE → Remove item from cart
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await req.json();

  if (!productId) {
    return NextResponse.json({ error: "Missing productId" }, { status: 400 });
  }

  try {
    await db.cartItem.delete({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }
}

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

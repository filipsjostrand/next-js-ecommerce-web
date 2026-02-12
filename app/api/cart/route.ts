import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

//
// GET → Fetch current user's cart
//
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cartItems = await db.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: true },
  });

  return NextResponse.json(cartItems);
}

//
// POST → Add or update cart item
//
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

  const product = await db.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Upsert cart item (update if exists, create if not)
  const cartItem = await db.cartItem.upsert({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId,
      },
    },
    update: {
      quantity,
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

//
// DELETE → Remove item from cart
//
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await req.json();

  if (!productId) {
    return NextResponse.json({ error: "Missing productId" }, { status: 400 });
  }

  await db.cartItem.delete({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId,
      },
    },
  });

  return NextResponse.json({ success: true });
}

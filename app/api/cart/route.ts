import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ items: [], count: 0 });
    }

    const cartItems = await db.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: true },
    });

    const totalCount = cartItems.reduce(
  (acc: number, item: { quantity: number }) => acc + item.quantity, 0);

    return NextResponse.json({
      items: cartItems,
      count: totalCount,
    });
  } catch (error) {
    return NextResponse.json({ items: [], count: 0 }, { status: 500 });
  }
}
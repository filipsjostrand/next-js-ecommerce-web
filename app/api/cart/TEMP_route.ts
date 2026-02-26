import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Om ingen är inloggad, returnera tom lista och 0 (viktigt för ikonen!)
    if (!session?.user) {
      return NextResponse.json({ items: [], count: 0 });
    }

    const cartItems = await db.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: true },
    });

    // Här räknar vi ut totalen som ikonen använder
    const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return NextResponse.json({
      items: cartItems,
      count: totalCount,
    });
  } catch (error) {
    console.error("Cart GET Error:", error);
    return NextResponse.json({ items: [], count: 0 });
  }
}
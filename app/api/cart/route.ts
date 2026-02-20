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
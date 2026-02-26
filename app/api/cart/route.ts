import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Next.js 15 params -> Promise
type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    // Vi måste "awaita" params även om vi inte använder id just här
    // för att matcha Typescripts förväntningar på en [id] route
    const { id } = await params;

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ items: [], count: 0 });
    }

    // Om du vill hämta en SPECIFIK vara baserat på ID:
    // const cartItem = await db.cartItem.findUnique({ where: { id } });

    // Men om du vill hämta ALLA (som din kod gör nu):
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

// Om du har PATCH eller DELETE i samma fil, gör så här:
export async function PATCH(
  req: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params;
  // Din logik för att uppdatera vara med id...
  return NextResponse.json({ success: true });
}
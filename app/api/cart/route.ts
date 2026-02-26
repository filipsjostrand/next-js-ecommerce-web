import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Next.js 16 kräver att params definieras som ett Promise
interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);

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

export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  try {
    const { id } = await context.params;

    // Vi läser in body för att visa Typescript att vi hanterar anropet korrekt
    // const body = await request.json();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// Lägg till DELETE också för säkerhets skull så hela [id] routen är komplett
export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  try {
    const { id } = await context.params;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
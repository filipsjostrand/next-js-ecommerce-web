import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
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
  req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> { // Lade till explicit returtyp här
  try {
    const { id } = await params;

    // Om du implementering skulle önskas framöver:
    // const body = await req.json();
    // const { quantity } = body;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// Om du har en DELETE liggande någonstans som spökar, lägg till denna också:
export async function DELETE(
  req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await params;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
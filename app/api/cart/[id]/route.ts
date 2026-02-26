import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  const { id } = await context.params;
  // Här kan du lägga till din db.cartItem.update logik sen
  return NextResponse.json({ success: true, id });
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  const { id } = await context.params;
  // Här kan du lägga till din db.cartItem.delete logik sen
  return NextResponse.json({ success: true, id });
}
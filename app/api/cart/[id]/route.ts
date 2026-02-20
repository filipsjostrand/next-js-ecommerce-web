import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { quantity } = await req.json();

  await db.cartItem.update({
    where: { id: params.id },
    data: { quantity },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await db.cartItem.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token saknas" }, { status: 400 });
    }

    // 1. Hitta användaren med matchande token
    const user = await db.user.findFirst({
      where: {
        verificationToken: token,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Ogiltig eller utgången token" }, { status: 400 });
    }

    // 2. Uppdatera användaren: Verifiera e-post och rensa token
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null, // Vi nollar denna så den inte kan användas igen
      },
    });

    // 3. Skicka användaren till login-sidan med en framgångs-parameter
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    return NextResponse.redirect(`${baseUrl}/login?verified=true`);

  } catch (error) {
    console.error("VERIFY_ERROR:", error);
    return NextResponse.json({ error: "Kunde inte verifiera e-post" }, { status: 500 });
  }
}
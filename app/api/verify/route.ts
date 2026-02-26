import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(`${baseUrl}/login?error=missing_token`);
    }

    // 1. Försök hitta och uppdatera användaren direkt
    // Vi använder updateMany för att kunna filtrera på token och ID i ett svep
    // eller findFirst följt av update i en transaktion.
    const user = await db.user.findFirst({
      where: {
        verificationToken: token,
      },
    });

    if (!user) {
      return NextResponse.redirect(`${baseUrl}/login?error=invalid_token`);
    }

    // 2. Verifiera användaren
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null, // Förhindra återanvändning
      },
    });

    // 3. Success! Skicka till login
    return NextResponse.redirect(`${baseUrl}/login?verified=true`);

  } catch (error) {
    console.error("VERIFY_ERROR:", error);
    // Vid serverfel, skicka användaren till login med ett generiskt felmeddelande
    return NextResponse.redirect(`${baseUrl}/login?error=server_error`);
  }
}
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";

// Inaktiverat: const resend = new Resend(process.env.RESEND_API_KEY);
// Resend flyttas till POST

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Resend initieras här
    // Följande körs bara när någon anropar API:et
    const resend = new Resend(process.env.RESEND_API_KEY);

    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ message: "If an account is connected to this email, an email has been sent." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600 * 1000);

    await db.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry }
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

    await resend.emails.send({
      from: "Sportify <onboarding@resend.dev>",
      to: email,
      subject: "Reset your password - Sportify",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
          <h1>Reset Password</h1>
          <p>Vi har tagit emot en förfrågan om att återställa lösenordet för ditt konto.</p>
          <p>Klicka på knappen nedan för att välja ett nytt lösenord. Länken är giltig i en timme.</p>
          <a href="${resetLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Återställ lösenord</a>
        </div>
      `
    });

    return NextResponse.json({ message: "Reset email sent!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // 1. Validera input
    if (!email || !password) {
      return NextResponse.json({ error: "E-post och lösenord krävs" }, { status: 400 });
    }

    // 2. Kontrollera om användaren redan finns
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "E-postadressen är redan registrerad" }, { status: 400 });
    }

    // 3. Förbered användardata
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // 4. Skapa användaren i databasen
    // Notera: emailVerified lämnas som null (standard) tills de klickar på länken
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        verificationToken,
        role: "USER" // Standardroll för nya registreringar
      },
    });

    // 5. Skicka bekräftelsemejl via Resend
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const verificationLink = `${baseUrl}/api/verify?token=${verificationToken}`;

    try {
      await resend.emails.send({
        from: "Sportify <onboarding@resend.dev>",
        to: email,
        subject: "Bekräfta ditt konto på Sportify",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h1 style="color: #333;">Välkommen till Sportify!</h1>
            <p>Tack för att du skapat ett konto. För att kunna logga in måste du först bekräfta din e-postadress.</p>
            <div style="margin: 30px 0;">
              <a href="${verificationLink}"
                 style="background-color: #000; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                Verifiera mitt konto
              </a>
            </div>
            <p style="font-size: 12px; color: #666;">
              Om knappen inte fungerar, kopiera och klistra in denna länk i din webbläsare:<br>
              ${verificationLink}
            </p>
          </div>
        `
      });
    } catch (mailError) {
      // Vi loggar felet men låter användarskapandet bestå
      console.error("MAIL_SEND_ERROR:", mailError);
    }

    return NextResponse.json({
      message: "Användare skapad. Kontrollera din e-post för att verifiera kontot."
    }, { status: 201 });

  } catch (error) {
    console.error("REGISTER_ERROR:", error);
    return NextResponse.json({ error: "Kunde inte skapa konto" }, { status: 500 });
  }
}
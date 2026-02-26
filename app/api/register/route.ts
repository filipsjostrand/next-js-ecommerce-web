import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"; // bcryptjs för bättre kompatibilitet i edge/serverless
import crypto from "crypto";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // 1. Basic validation
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // 2. Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() } // Case-insensitive check
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
    }

    // 3. Prepare data
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // 4. Create user
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        verificationToken,
        role: "USER"
      },
    });

    // 5. Send verification email
    const apiKey = process.env.RESEND_API_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const verificationLink = `${baseUrl}/api/verify?token=${verificationToken}`;

    // Vi initierar och skickar bara om vi har en API-nyckel
    if (apiKey) {
      try {
        const resend = new Resend(apiKey);
        await resend.emails.send({
          from: "Sportify <onboarding@resend.dev>",
          to: email.toLowerCase(),
          subject: "Verify your account - Sportify",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 16px;">
              <h1 style="color: #000; font-size: 24px;">Welcome to Sportify!</h1>
              <p style="color: #666; font-size: 16px; line-height: 24px;">
                Thank you for signing up. Please verify your email address to activate your account and start shopping.
              </p>
              <div style="margin: 32px 0;">
                <a href="${verificationLink}"
                   style="background-color: #000; color: #fff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block;">
                  Verify Email Address
                </a>
              </div>
              <p style="font-size: 12px; color: #999; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <span style="color: #000;">${verificationLink}</span>
              </p>
            </div>
          `
        });
      } catch (mailError) {
        console.error("MAIL_SEND_ERROR:", mailError);
        // Vi låter användaren skapas även om mejlet misslyckas, men loggar det.
      }
    } else {
      console.warn("Skipping email send: RESEND_API_KEY is not set.");
    }

    return NextResponse.json({
      message: "Account created! Please check your email to verify your account."
    }, { status: 201 });

  } catch (error) {
    console.error("REGISTER_ERROR:", error);
    return NextResponse.json({ error: "Could not create account" }, { status: 500 });
  }
}
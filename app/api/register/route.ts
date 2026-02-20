import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Vi tar bara ut email och password eftersom det är vad som finns i ditt schema
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "E-post och lösenord krävs" }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "E-postadressen är redan registrerad" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        // role får automatiskt värdet "user" från @default("user") i schemat
      },
    });

    return NextResponse.json({ message: "Användare skapad", userId: user.id }, { status: 201 });
  } catch (error) {
    console.error("REGISTER_ERROR:", error);
    return NextResponse.json({ error: "Kunde inte skapa konto" }, { status: 500 });
  }
}
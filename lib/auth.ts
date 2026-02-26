import { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// 1. TypeScript-definitioner för Session och JWT
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"]
  }
  interface User {
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("E-post och lösenord krävs");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        console.log("--- INLOGGNINGSFÖRSÖK ---");
        console.log("Användare:", credentials.email);

        if (!user) {
          console.log("Resultat: Användaren hittades inte");
          throw new Error("Fel e-post eller lösenord");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          console.log("Resultat: Fel lösenord");
          throw new Error("Fel e-post eller lösenord");
        }

        // --- SÄKERHETSSPÄRR: NU INAKTIVERAD ---  (pga fake-admin-e-post) - I ett verkligt case bör det finnas en riktig admin-e-post (som kan verifiera konto-innehavaren)
        // if (!user.emailVerified) {
        //   console.log("Resultat: Blockad - Ej verifierad e-post");
        //   // Detta meddelande fångas upp i din LoginPage.tsx
        //   throw new Error("Vänligen bekräfta din e-post innan du loggar in.");
        // }

        console.log("Resultat: Inloggning lyckades!");
        console.log("--------------------------");

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
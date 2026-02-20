// import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
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
          throw new Error("Missing credentials");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        // --- HÄR KLISTRAR DU IN LOGGARNA ---
        console.log("-----------------------------------");
        console.log("LOGIN DEBUG:");
        console.log("Försöker logga in med:", credentials?.email);
        console.log("Lösenord från form:", credentials?.password);

        if (!user) {
          console.log("RESULTAT: Användaren hittades inte i databasen!");
          throw new Error("User not found");
        }

        console.log("Hash från DB:", user.password);

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        console.log("Matchar lösenordet?:", isPasswordValid);
        console.log("-----------------------------------");
        // ------------------------------------------

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

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
        // Vi castar user till User-typen vi nyss utökade
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
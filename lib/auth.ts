import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  // LÄGG TILL DETTA HÄR:
  pages: {
    signIn: "/login",
  },

  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        username: { label: "Användarnamn", type: "text" },
        password: { label: "Lösenord", type: "password" },
      },
      async authorize(credentials) {
        const adminUser = "admin";
        const adminPass = "hemligt123";

        if (
          credentials?.username === adminUser &&
          credentials?.password === adminPass
        ) {
          // Här returnerar vi ett objekt som matchar "User"-interfacet i din d.ts-fil
          return {
            id: "1",
            name: "Admin",
            email: "admin@store.com",
            role: "admin",
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // 'user' finns bara tillgänglig vid inloggningstillfället
      if (user) {
        token.id = user.id;
        token.role = user.role; // TypeScript vet nu att 'role' finns på 'user'
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string; // TypeScript vet att 'role' finns på 'session.user'
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
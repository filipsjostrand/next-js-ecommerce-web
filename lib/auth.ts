import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google"; // or whatever providers you use
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    // ... your existing providers here
  ],
  callbacks: {
    session: ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};

// import type { NextAuthOptions } from "next-auth";
// import Credentials from "next-auth/providers/credentials";
// import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import { db } from "./db";
// import bcrypt from "bcryptjs";

// export const authOptions: NextAuthOptions = {
//   adapter: PrismaAdapter(db),
//   session: { strategy: "jwt" },

//   providers: [
//     Credentials({
//       name: "credentials",
//       credentials: {
//         email: { type: "email" },
//         password: { type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials.password) return null;

//         const user = await db.user.findUnique({
//           where: { email: credentials.email },
//         });

//         if (!user) return null;

//         const valid = await bcrypt.compare(
//           credentials.password,
//           user.password
//         );

//         if (!valid) return null;

//         return {
//           id: user.id,
//           email: user.email,
//           role: user.role,
//         };
//       },
//     }),
//   ],

//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) token.role = user.role;
//       return token;
//     },
//     async session({ session, token }) {
//       if (session.user) {
//         session.user.id = token.sub!;
//         session.user.role = token.role!;
//       }
//       return session;
//     },
//   },
// };
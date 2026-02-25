import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

console.log("NEXTAUTH ROUTE LOADED"); // <--- Denna bör synas när servern startar/laddar om

const handler = NextAuth({
  ...authOptions,
  callbacks: {
    ...authOptions.callbacks,
    async signIn({ user }) {
      console.log("SIGN IN CALLBACK TRIGGERED for user:", user?.email);
      return true;
    }
  }
});

export { handler as GET, handler as POST };
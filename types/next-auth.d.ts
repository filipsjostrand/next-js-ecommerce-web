import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  // Detta definierar vad som returneras från authorize() och finns i JWT
  interface User {
    id: string;
    role?: string;
  }

  // Detta definierar vad som finns tillgängligt i useSession() / getServerSession()
  interface Session {
    user: {
      id: string;
      role?: string;
    } & DefaultSession["user"];
  }

  // Detta krävs för att TypeScript ska förstå token-objektet i callbacks
  interface JWT {
    id: string;
    role?: string;
  }
}
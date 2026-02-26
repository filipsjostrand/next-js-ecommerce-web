import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

// 1. Definiera exakt vad vi förväntar oss från databasen
interface UserProfile {
  id: string;
  email: string | null;
  role: string;
  createdAt: Date;
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  // 2. Hämta användaren och casta till vårt interface för att slippa 'any' eller 'unknown'
  const user = (await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })) as UserProfile | null;

  if (!user) {
    redirect("/");
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8">
        <Link
          href="/account"
          className="text-sm text-gray-500 hover:underline"
        >
          ← Back to orders
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Profile</h1>

      <div className="border rounded-lg p-8 shadow-sm space-y-6 bg-white">
        <div>
          <label className="block text-sm text-gray-500 mb-1">
            Email
          </label>
          <p className="font-medium">{user.email || "No email found"}</p>
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">
            Role
          </label>
          {/* Vi använder en fallback sträng för att vara helt säkra */}
          <p className="font-medium capitalize">{user.role.toLowerCase()}</p>
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">
            Member Since
          </label>
          <p className="font-medium">
            {user.createdAt instanceof Date
              ? user.createdAt.toDateString()
              : "Date not available"}
          </p>
        </div>
      </div>
    </main>
  );
}
"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { User, LogOut, ShieldCheck } from "lucide-react";

// 1. Vi måste tala om för TS att 'role' finns på sessionens user
// Om du redan har gjort detta i en types/next-auth.d.ts kan du hoppa över detta,
// men att casta sessionen här är ett snabbt sätt att lösa build-felet.
interface ExtendedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null; // Här lägger vi till rollen
}

export default function UserMenu() {
  const { data: session, status } = useSession();

  // Casta user för att TS ska förstå att .role existerar
  const user = session?.user as ExtendedUser | undefined;

  if (status === "loading") {
    return <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />;
  }

  // Använd vår typade 'user' istället för session.user direkt
  const isAdmin = user?.role === "ADMIN";
  const profileHref = isAdmin ? "/admin" : "/profile";

  return (
    <div className="flex items-center gap-2">
      {session ? (
        <>
          {/* ADMIN-TAG */}
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden md:flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full hover:bg-amber-100 transition border border-amber-200 mr-1 tracking-wider"
            >
              <ShieldCheck size={12} />
              ADMIN
            </Link>
          )}

          {/* PROFIL-IKON */}
          <Link
            href={profileHref}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-all border border-zinc-200"
            title={isAdmin ? "Admin Dashboard" : "Min profil"}
          >
            <User size={20} className="text-zinc-700" />
          </Link>

          {/* LOG OUT-KNAPP */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all cursor-pointer"
            title="Logga ut"
          >
            <LogOut size={20} />
          </button>
        </>
      ) : (
        /* LOG IN-KNAPP */
        <Link
          href="/login"
          className="text-sm font-bold bg-black text-white px-5 py-2 rounded-full hover:bg-zinc-800 transition shadow-sm"
        >
          Log in
        </Link>
      )}
    </div>
  );
}
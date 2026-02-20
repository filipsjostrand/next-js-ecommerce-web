"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function UserMenu() {
  const { data: session, status } = useSession();

  // Medan vi kollar om användaren är inloggad
  if (status === "loading") return <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />;

  return (
    <div className="flex items-center gap-4">
      {session ? (
        <>
          {/* Om användaren är Admin, visa en länk till instrumentpanelen */}
          {session.user?.role === "admin" && (
            <Link
              href="/admin"
              className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition"
            >
              Admin
            </Link>
          )}

          <button
            onClick={() => signOut()}
            className="text-sm font-semibold text-gray-600 hover:text-black transition"
          >
            Log out
          </button>
        </>
      ) : (
        <button
          onClick={() => signIn()}
          className="text-sm font-bold bg-black text-white px-5 py-2 rounded-full hover:bg-zinc-800 transition shadow-sm"
        >
          Log in
        </button>
      )}
    </div>
  );
}
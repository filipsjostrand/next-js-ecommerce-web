import Link from "next/link";
import { Package } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  // Om användaren är inloggad, skicka dem direkt till profilsidan/account
  // där den riktiga orderhistoriken (som vi precis fixade) finns.
  if (session) {
    redirect("/profile"); // Eller /account beroende på din struktur
  }

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 text-center text-black">
      <div className="flex justify-center mb-6">
        <Package size={64} className="text-gray-300" />
      </div>
      <h1 className="text-2xl font-bold mb-4">My orders</h1>
      <p className="text-gray-600 mb-8">
        If you have placed an order as a guest, you will find your confirmation in your email.
        Currently, an account is required to view order history here.
      </p>

      <div className="flex flex-col gap-4 items-center">
        <Link
          href="/login"
          className="bg-black text-white px-6 py-2 rounded-lg hover:bg-zinc-800 transition"
        >
          Log in to see history
        </Link>

        <Link
          href="/"
          className="text-blue-600 hover:underline font-medium"
        >
          Back to the store
        </Link>
      </div>
    </div>
  );
}
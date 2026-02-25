"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMessage("Kolla din e-post för instruktioner om hur du återställer ditt lösenord.");
    } catch (err) {
      setMessage("Något gick fel, försök igen senare.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md border w-full max-w-md">
        <Link href="/login" className="flex items-center text-sm text-gray-500 hover:text-black mb-6">
          <ArrowLeft size={16} className="mr-2" /> Back to Log in
        </Link>

        <h1 className="text-2xl font-bold mb-2">Forgot your password?</h1>
        <p className="text-gray-600 text-sm mb-6">
          No problem! Enter your email address and we´ll send you a link to restore it.
        </p>

        {message ? (
          <p className="bg-blue-50 text-blue-700 p-4 rounded-lg text-sm">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="din@epost.se"
              className="w-full p-3 border rounded-lg text-black outline-none focus:ring-2 focus:ring-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-zinc-800 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send recovery link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
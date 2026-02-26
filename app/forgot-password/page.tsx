"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // Bra att ha med
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus({
          type: "success",
          message: "Check your email for instructions on how to reset your password.",
        });
      } else {
        // Vi ger ett generellt svar även om e-posten inte finns (av säkerhetsskäl)
        // men här kan du hantera specifika serverfel om du vill.
        setStatus({
          type: "success",
          message: "If an account exists for that email, a link has been sent.",
        });
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: "Something went wrong, please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md border w-full max-w-md">
        <Link href="/login" className="flex items-center text-sm text-gray-500 hover:text-black mb-6 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to Log in
        </Link>

        <h1 className="text-2xl font-bold mb-2 text-black">Forgot your password?</h1>
        <p className="text-gray-600 text-sm mb-6">
          No problem! Enter your email address and we´ll send you a link to restore it.
        </p>

        {status.type === "success" ? (
          <div className="bg-blue-50 border border-blue-100 text-blue-800 p-6 rounded-xl text-center">
            <MailCheck className="mx-auto mb-3 text-blue-500" size={32} />
            <p className="text-sm font-medium">{status.message}</p>
            <Link href="/login" className="mt-4 inline-block text-xs font-bold uppercase tracking-wider hover:underline">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {status.type === "error" && (
              <p className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs">
                {status.message}
              </p>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">Email address</label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full p-3 border rounded-lg text-black outline-none focus:ring-2 focus:ring-black transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-zinc-800 disabled:opacity-50 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
            >
              {loading ? "Sending..." : "Send recovery link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
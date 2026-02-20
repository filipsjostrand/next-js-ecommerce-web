"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false, // Vi hanterar redirect manuellt för att kunna fånga fel
    });

    if (res?.error) {
      setError("Fel e-post eller lösenord");
      setLoading(false);
    } else {
      // Lyckad inloggning!
      // Refresh krävs ofta för att middleware ska fatta att sessionen är uppdaterad
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md space-y-4 border w-full max-w-md">
        <h1 className="text-2xl font-bold text-center">Log in</h1>

        {error && (
          <p className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">E-mail</label>
            <input
              type="email"
              className="w-full p-3 border rounded-lg text-black focus:ring-2 focus:ring-black outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
            <input
              type="password"
              className="w-full p-3 border rounded-lg text-black focus:ring-2 focus:ring-black outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-zinc-800 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            No account?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              Register here
            </Link>
          </p>
          <hr />
          <p className="text-[10px] text-gray-400 uppercase tracking-widest pt-2">
            Admin? Log in with your personal account above.
          </p>
        </div>
      </div>
    </div>
  );
}
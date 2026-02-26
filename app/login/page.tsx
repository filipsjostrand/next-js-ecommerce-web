"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const verified = searchParams.get("verified");
  const reset = searchParams.get("reset");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        // Mappa specifika fel för bättre UX
        setError(res.error === "CredentialsSignin" ? "Invalid email or password" : res.error);
        setLoading(false);
      } else {
        router.refresh();

        // Istället för att bara kolla strängen, låt oss vänta en millisekund
        // och sedan redirecta. Om din auth-config skickar med 'role'
        // kan man styra det där, men din lösning här fungerar för stunden:
        const isAdmin = email.toLowerCase() === "admin@ggadmin.com";
        const targetPath = isAdmin ? "/admin" : "/profile";

        setTimeout(() => {
          router.push(targetPath);
        }, 100);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-md border w-full max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center text-black">Log in</h1>

      {verified && (
        <p className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm text-center border border-green-100">
          Email verified! You can now log in.
        </p>
      )}

      {reset && (
        <p className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm text-center border border-blue-100">
          Password updated!
        </p>
      )}

      {error && (
        <p className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center border border-red-100">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">E-mail</label>
          <input
            type="email"
            className="w-full p-3 border rounded-lg text-black outline-none focus:ring-2 focus:ring-black transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <Link href="/forgot-password" size-xs className="text-xs text-gray-400 hover:text-black transition-colors">
              Forgot your password?
            </Link>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full p-3 border rounded-lg text-black outline-none focus:ring-2 focus:ring-black pr-10 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        No Account?{" "}
        <Link href="/register" className="font-bold text-black hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
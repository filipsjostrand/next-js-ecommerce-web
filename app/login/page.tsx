"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react"; // Importera ögon-ikonerna

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Ny state för lösenordsvisning
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
      redirect: false, // Mycket viktigt: stanna kvar i funktionen
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      // 1. Uppdatera session-datan först
      router.refresh();

      // 2. Kolla e-posten (skiftlägesoberoende)
      const isAdmin = email.toLowerCase() === "admin@ggadmin.com";
      const targetPath = isAdmin ? "/admin" : "/profile";

      console.log("Redirecting to:", targetPath); // För debugging i konsolen

      // 3. Kör redirect med en minimal fördröjning för att låta sessionen landa
      setTimeout(() => {
        router.push(targetPath);
      }, 100);
    }
  } catch (err) {
    setError("Ett oväntat fel uppstod.");
    setLoading(false);
  }
};

  return (
    <div className="bg-white p-8 rounded-xl shadow-md border w-full max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center text-black">Log in</h1>

      {verified && (
        <p className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm text-center">
          E-post verifierad! Du kan nu logga in.
        </p>
      )}

      {reset && (
        <p className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm text-center">
          Lösenordet är uppdaterat!
        </p>
      )}

      {error && (
        <p className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">E-mail</label>
          <input
            type="email"
            className="w-full p-3 border rounded-lg text-black outline-none focus:ring-2 focus:ring-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <Link href="/forgot-password" className="text-xs text-gray-400 hover:text-black">
              Forgot your password?
            </Link>
          </div>

          {/* Behållare för lösenordsfältet */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full p-3 border rounded-lg text-black outline-none focus:ring-2 focus:ring-black pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button" // Förhindrar att knappen submittar formuläret
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors focus:outline-none"
              tabIndex={-1} // Hoppa över vid tab-tangent för snabbare navigering
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-zinc-800 disabled:opacity-50 transition-colors"
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
    <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
      <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
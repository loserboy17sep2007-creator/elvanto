"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin/orders");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">

      <div className="w-full max-w-md">

        <div className="mb-10 text-center">
          <a
            href="/"
            className="text-3xl font-bold tracking-[0.3em]"
          >
            ELVANTO
          </a>

          <p className="mt-4 text-sm uppercase tracking-widest text-gray-500">
            ADMIN PANEL
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">

          <h1 className="text-3xl font-bold">
            Admin Login
          </h1>

          <p className="mt-3 text-gray-400">
            Sign in to manage your Elvanto store.
          </p>

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="mt-8 space-y-5">

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Email Address
              </label>

              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-white/30"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLogin();
                  }
                }}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-white/30"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full rounded-xl bg-white px-6 py-4 font-bold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "SIGNING IN..." : "SIGN IN"}
            </button>

          </div>

          <a
            href="/"
            className="mt-6 block text-center text-sm text-gray-500 hover:text-white"
          >
            ← Back to Store
          </a>

        </div>

      </div>

    </main>
  );
}